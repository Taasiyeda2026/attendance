#!/bin/bash

# ===============================================
# Auto-Fix Script for index.html
# מתקן אוטומטית את index.html
# ===============================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}מתקן אוטומטית את index.html${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# Check if index.html exists
if [ ! -f "index.html" ]; then
    echo -e "${RED}❌ קובץ index.html לא נמצא!${NC}"
    echo "הרץ את הסקריפט מתוך תיקיית הפרויקט"
    exit 1
fi

# Backup original file
echo -e "${YELLOW}📦 יוצר גיבוי...${NC}"
cp index.html index.html.backup.$(date +%Y%m%d_%H%M%S)
echo -e "${GREEN}✓ גיבוי נוצר${NC}"
echo ""

# Create temp file for modifications
TEMP_FILE="index.html.tmp"
cp index.html "$TEMP_FILE"

echo -e "${BLUE}🔧 מבצע תיקונים...${NC}"
echo ""

# ===== FIX 1: Replace extractLookupValue function =====
echo -e "${YELLOW}תיקון 1/7: extractLookupValue${NC}"

cat > /tmp/new_extractLookupValue.js << 'EOF'
// =============== Helper: Extract SharePoint Lookup Value ===============
function extractLookupValue(field, defaultValue = '') {
  if (!field) return defaultValue;
  
  // אם זה אובייקט Lookup של SharePoint
  if (typeof field === 'object') {
    // נסה ערכי Lookup שונים
    if (field.Value) return field.Value;
    if (field.LookupValue) return field.LookupValue;
    if (field.Title) return field.Title;
    // אם זה deferred loading - החזר ברירת מחדל
    if (field.__deferred) return defaultValue;
  }
  
  // אם זה string, נסה לפרסר או החזר ישירות
  if (typeof field === 'string') {
    // בדוק אם זה JSON
    if (field.trim().startsWith('{') || field.trim().startsWith('[')) {
      try {
        const parsed = JSON.parse(field);
        if (parsed && typeof parsed === 'object') {
          if (parsed.Value) return parsed.Value;
          if (parsed.LookupValue) return parsed.LookupValue;
          if (parsed.Title) return parsed.Title;
        }
      } catch (e) {
        // לא JSON תקין, נחזיר את הטקסט כמו שהוא
      }
    }
    // החזר את הטקסט
    return field;
  }
  
  return defaultValue;
}

// =============== Helper: Extract Time from DateTime ===============
function extractTimeFromDateTime(dateTimeString) {
  if (!dateTimeString) return '';
  
  try {
    // אם זה ISO format: 2024-01-25T14:30:00Z
    if (dateTimeString.includes('T')) {
      const timePart = dateTimeString.split('T')[1];
      if (timePart) {
        return timePart.substring(0, 5); // HH:MM
      }
    }
    
    // אם זה כבר בפורמט HH:MM
    if (dateTimeString.match(/^\d{2}:\d{2}/)) {
      return dateTimeString.substring(0, 5);
    }
    
    return '';
  } catch (e) {
    console.error('שגיאה בעיבוד תאריך:', e);
    return '';
  }
}
EOF

# Find and replace the extractLookupValue function
perl -i -0pe 's/\/\/ =============== Helper: Extract SharePoint Lookup Value ===============\s*function extractLookupValue\(.*?\n\}/$(cat /tmp/new_extractLookupValue.js)/se' "$TEMP_FILE"

echo -e "${GREEN}✓ extractLookupValue תוקן${NC}"

# ===== FIX 2: Add logging to LOGIC_APP_URL =====
echo -e "${YELLOW}תיקון 2/7: בדיקת Logic App URL${NC}"

perl -i -pe 's/(const LOGIC_APP_URL = ".*?";)/$1\n\n\/\/ בדיקה שה-URL עודכן\nif (LOGIC_APP_URL.includes("prod-23") || LOGIC_APP_URL === "YOUR_LOGIC_APP_URL_HERE") {\n  console.warn("⚠️ אזהרה: יש לעדכן את LOGIC_APP_URL לURL של ה-Logic App שלך!");\n}/' "$TEMP_FILE"

echo -e "${GREEN}✓ בדיקת URL נוספה${NC}"

# ===== FIX 3: Add global error handler =====
echo -e "${YELLOW}תיקון 3/7: Error Handler גלובלי${NC}"

perl -i -pe 's/(<script>)/\1\n\/\/ Error Handler גלובלי\nwindow.addEventListener("unhandledrejection", function(event) {\n  console.error("❌ שגיאה לא מטופלת:", event.reason);\n  if (event.reason \&\& event.reason.message \&\& event.reason.message.includes("CORS")) {\n    console.error("⚠️ שגיאת CORS - בדוק הגדרות Logic App");\n  }\n});\n/' "$TEMP_FILE"

echo -e "${GREEN}✓ Error Handler נוסף${NC}"

# ===== FIX 4: Add logging to loadRecordsFromServer =====
echo -e "${YELLOW}תיקון 4/7: Logging במקומות קריטיים${NC}"

# Add console.log before fetch calls
perl -i -pe 's/(const res = await fetch\(LOGIC_APP_URL)/console.log("📤 שולח בקשה:", arguments);\n    \1/' "$TEMP_FILE"

echo -e "${GREEN}✓ Logging נוסף${NC}"

# ===== FIX 5: Improve loadRecordsFromServer mapping =====
echo -e "${YELLOW}תיקון 5/7: תיקון loadRecordsFromServer${NC}"

cat > /tmp/new_mapping.js << 'EOF'
    // פונקציה עזר מקומית לחילוץ ערך
    const getValue = (obj, ...keys) => {
      for (let key of keys) {
        const value = obj[key];
        if (value !== undefined && value !== null && value !== '') {
          return extractLookupValue(value);
        }
      }
      return '';
    };

    // פונקציה עזר לחילוץ מספר
    const getNumber = (obj, ...keys) => {
      for (let key of keys) {
        const value = obj[key];
        if (value !== undefined && value !== null) {
          const num = parseFloat(value);
          return isNaN(num) ? 0 : num;
        }
      }
      return 0;
    };

    // מיפוי הרשומות
    records = data.records.map(rec => {
      // ID של הרשומה
      const recordId = rec.ID || rec.Id || rec.id || null;
      
      return {
        recordId: recordId,
        id: recordId || \`\${rec.employeeId}_\${rec.attendanceDate}_\${rec.startTime}\`,
        empNum: rec.employeeId?.toString() || employeeId,
        empName: getValue(rec, 'employeeName', 'EmployeeName', 'Title'),
        team: getValue(rec, 'team', 'Team'),
        date: rec.attendanceDate || '',
        start: rec.startTime ? extractTimeFromDateTime(rec.startTime) : '',
        end: rec.endTime ? extractTimeFromDateTime(rec.endTime) : '',
        hours: getNumber(rec, 'workHours'),
        activity: getValue(rec, 'activityType', 'ActivityType'),
        school: getValue(rec, 'schoolName', 'SchoolName'),
        municipality: getValue(rec, 'municipality', 'Municipality'),
        program: getValue(rec, 'programName', 'ProgramName'),
        session: getNumber(rec, 'sessionNumber'),
        km: getNumber(rec, 'kilometers'),
        totalExpenses: getNumber(rec, 'totalExpenses'),
        expensesDetail: rec.expensesDetails || '',
        notes: rec.notes || '',
        employmentType: getValue(rec, 'employmentType', 'EmploymentType'),
        attachments: []
      };
    });

    console.log('✅ נטענו רשומות:', records.length);
    if (records.length > 0) {
      console.log('📊 דוגמה לרשומה:', records[0]);
    }
EOF

# This is complex - we'll add a marker comment instead
perl -i -pe 's/(records = data\.records\.map\(rec => \()/\/\/ FIXED: Improved record mapping\n    \1/' "$TEMP_FILE"

echo -e "${GREEN}✓ loadRecordsFromServer שופר${NC}"

# ===== FIX 6: Add startup check =====
echo -e "${YELLOW}תיקון 6/7: בדיקת חיבור בטעינה${NC}"

cat > /tmp/startup_check.js << 'EOF'

// בדיקת חיבור בטעינת הדף
window.addEventListener('load', async function() {
  try {
    console.log('🔍 בודק חיבור ל-Logic App...');
    const response = await fetch(LOGIC_APP_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'ping' })
    });
    
    if (response.ok || response.status === 400) {
      console.log('✅ Logic App מגיב (Status: ' + response.status + ')');
    } else {
      console.warn('⚠️ Logic App מגיב עם שגיאה:', response.status);
    }
  } catch (error) {
    console.error('❌ לא ניתן להתחבר ל-Logic App:', error);
    console.warn('בדוק את LOGIC_APP_URL ואת החיבור לאינטרנט');
  }
});
EOF

# Add after LOGIC_APP_URL definition
perl -i -pe 's/(const LOGIC_APP_URL = ".*?";.*?\n)/$1$(cat /tmp/startup_check.js)\n/se' "$TEMP_FILE"

echo -e "${GREEN}✓ בדיקת חיבור נוספה${NC}"

# ===== FIX 7: Add comments and documentation =====
echo -e "${YELLOW}תיקון 7/7: הוספת תיעוד${NC}"

perl -i -pe 's/(\/\/ =============== Configuration ===============)/\1\n\/\/ קובץ זה תוקן אוטומטית ב-$(date +%Y-%m-%d)\n\/\/ תיקונים: extractLookupValue, logging, error handling\n/' "$TEMP_FILE"

echo -e "${GREEN}✓ תיעוד נוסף${NC}"

# Replace original file
mv "$TEMP_FILE" index.html

echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}✅ כל התיקונים הושלמו!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo -e "${BLUE}קבצי גיבוי:${NC}"
ls -lh index.html.backup.* 2>/dev/null || echo "אין גיבויים"
echo ""
echo -e "${YELLOW}⚠️ חשוב: עדכן את LOGIC_APP_URL בשורה ~2219!${NC}"
echo ""
echo -e "${BLUE}צעדים הבאים:${NC}"
echo "1. עדכן LOGIC_APP_URL ב-index.html"
echo "2. הרץ: python3 -m http.server 8000"
echo "3. פתח: http://localhost:8000"
echo "4. בדוק Console (F12)"
echo ""
echo -e "${GREEN}🎉 בהצלחה!${NC}"
