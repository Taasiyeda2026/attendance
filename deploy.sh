#!/bin/bash

# ========================================
# Attendance System - Deployment Script
# ========================================

set -e

echo "🚀 מתחיל תהליך פריסה למערכת נוכחות תעשיידע"
echo "================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if running in correct directory
if [ ! -f "index.html" ]; then
    echo -e "${RED}❌ שגיאה: לא נמצא קובץ index.html${NC}"
    echo "הרץ את הסקריפט מתוך תיקיית הפרויקט"
    exit 1
fi

echo -e "${BLUE}📋 שלב 1: בדיקת קבצים נדרשים${NC}"
echo "----------------------------------------"

REQUIRED_FILES=("index.html" "manifest.json" "sw.js" "logo.png" "icon-192.png" "icon-512.png")
MISSING_FILES=()

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file"
    else
        echo -e "${RED}✗${NC} $file - חסר!"
        MISSING_FILES+=("$file")
    fi
done

if [ ${#MISSING_FILES[@]} -gt 0 ]; then
    echo -e "${YELLOW}⚠️  חסרים קבצים: ${MISSING_FILES[*]}${NC}"
    echo "האם להמשיך בכל זאת? (y/n)"
    read -r response
    if [ "$response" != "y" ]; then
        exit 1
    fi
fi

echo ""
echo -e "${BLUE}📋 שלב 2: בדיקת הגדרות Logic App${NC}"
echo "----------------------------------------"

# Extract Logic App URL from index.html
LOGIC_APP_URL=$(grep -oP 'const LOGIC_APP_URL = "\K[^"]+' index.html | head -1)

if [ -z "$LOGIC_APP_URL" ]; then
    echo -e "${RED}❌ לא נמצא Logic App URL בקובץ index.html${NC}"
    echo "הוסף את ה-URL בשורה:"
    echo 'const LOGIC_APP_URL = "YOUR_LOGIC_APP_URL";'
    exit 1
fi

echo -e "${GREEN}✓${NC} Logic App URL נמצא:"
echo "  $LOGIC_APP_URL"

# Test Logic App connectivity
echo ""
echo "בודק חיבור ל-Logic App..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
    -X POST \
    -H "Content-Type: application/json" \
    -d '{"action":"ping"}' \
    "$LOGIC_APP_URL" 2>/dev/null || echo "000")

if [ "$RESPONSE" = "200" ] || [ "$RESPONSE" = "400" ]; then
    echo -e "${GREEN}✓${NC} Logic App מגיב (HTTP $RESPONSE)"
else
    echo -e "${YELLOW}⚠️  Logic App לא מגיב או לא זמין (HTTP $RESPONSE)${NC}"
    echo "ודא ש-Logic App פעיל ב-Azure"
fi

echo ""
echo -e "${BLUE}📋 שלב 3: בחירת שיטת פריסה${NC}"
echo "----------------------------------------"
echo "1) Azure Static Web Apps"
echo "2) GitHub Pages"
echo "3) Netlify"
echo "4) יצירת ZIP לפריסה ידנית"
echo "5) שרת מקומי לבדיקה"
echo ""
echo -n "בחר אופציה (1-5): "
read -r DEPLOY_OPTION

case $DEPLOY_OPTION in
    1)
        echo ""
        echo -e "${BLUE}🔵 Azure Static Web Apps${NC}"
        echo "----------------------------------------"
        
        # Check if Azure CLI is installed
        if ! command -v az &> /dev/null; then
            echo -e "${RED}❌ Azure CLI לא מותקן${NC}"
            echo "התקן מ: https://docs.microsoft.com/cli/azure/install-azure-cli"
            exit 1
        fi
        
        # Login check
        if ! az account show &> /dev/null; then
            echo "מתחבר ל-Azure..."
            az login
        fi
        
        echo ""
        echo "שם האפליקציה (attendance-app):"
        read -r APP_NAME
        APP_NAME=${APP_NAME:-attendance-app}
        
        echo "Resource Group (attendance-rg):"
        read -r RG_NAME
        RG_NAME=${RG_NAME:-attendance-rg}
        
        echo ""
        echo "יוצר Static Web App..."
        az staticwebapp create \
            --name "$APP_NAME" \
            --resource-group "$RG_NAME" \
            --source . \
            --location "Central US" \
            --branch main || {
            echo -e "${YELLOW}⚠️  יצירה נכשלה. צור ידנית דרך Azure Portal${NC}"
        }
        ;;
        
    2)
        echo ""
        echo -e "${BLUE}🔵 GitHub Pages${NC}"
        echo "----------------------------------------"
        echo ""
        echo "שלבים:"
        echo "1. צור repository חדש ב-GitHub"
        echo "2. העלה את הקבצים:"
        echo "   git init"
        echo "   git add ."
        echo "   git commit -m 'Initial commit'"
        echo "   git remote add origin <your-repo-url>"
        echo "   git push -u origin main"
        echo ""
        echo "3. ב-GitHub: Settings → Pages → Source: main branch"
        echo ""
        echo "האם ליצור git repository עכשיו? (y/n)"
        read -r response
        
        if [ "$response" = "y" ]; then
            if [ ! -d ".git" ]; then
                git init
                git add .
                git commit -m "Initial commit - Attendance System"
                echo -e "${GREEN}✓${NC} Git repository נוצר"
                echo "הוסף remote והעלה:"
                echo "git remote add origin <your-repo-url>"
                echo "git push -u origin main"
            else
                echo "Git repository כבר קיים"
            fi
        fi
        ;;
        
    3)
        echo ""
        echo -e "${BLUE}🔵 Netlify${NC}"
        echo "----------------------------------------"
        
        # Check if Netlify CLI is installed
        if ! command -v netlify &> /dev/null; then
            echo "מתקין Netlify CLI..."
            npm install -g netlify-cli
        fi
        
        echo ""
        echo "מפרסם ל-Netlify..."
        netlify deploy --prod
        ;;
        
    4)
        echo ""
        echo -e "${BLUE}🔵 יצירת ZIP${NC}"
        echo "----------------------------------------"
        
        ZIP_NAME="attendance-system-$(date +%Y%m%d-%H%M%S).zip"
        
        echo "יוצר קובץ ZIP: $ZIP_NAME"
        zip -r "$ZIP_NAME" \
            index.html \
            manifest.json \
            sw.js \
            logo.png \
            icon-192.png \
            icon-512.png \
            favicon.png \
            2>/dev/null || {
            echo -e "${YELLOW}⚠️  כמה קבצים לא נמצאו, ממשיך...${NC}"
        }
        
        echo -e "${GREEN}✓${NC} נוצר: $ZIP_NAME"
        echo ""
        echo "העלה את הקובץ לשרת האירוח שלך"
        ;;
        
    5)
        echo ""
        echo -e "${BLUE}🔵 שרת מקומי${NC}"
        echo "----------------------------------------"
        
        # Try different methods to start local server
        if command -v python3 &> /dev/null; then
            echo "מפעיל שרת Python..."
            echo -e "${GREEN}✓${NC} פתח בדפדפן: http://localhost:8000"
            python3 -m http.server 8000
        elif command -v python &> /dev/null; then
            echo "מפעיל שרת Python..."
            echo -e "${GREEN}✓${NC} פתח בדפדפן: http://localhost:8000"
            python -m SimpleHTTPServer 8000
        elif command -v npx &> /dev/null; then
            echo "מפעיל שרת Node..."
            echo -e "${GREEN}✓${NC} פתח בדפדפן: http://localhost:5000"
            npx serve . -p 5000
        else
            echo -e "${RED}❌ לא נמצא שרת זמין${NC}"
            echo "התקן Python או Node.js"
            exit 1
        fi
        ;;
        
    *)
        echo -e "${RED}❌ אופציה לא תקינה${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}✅ תהליך הפריסה הושלם!${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo "צעדים נוספים:"
echo "1. ודא ש-Logic App מוגדר ופעיל ב-Azure"
echo "2. הוסף משתמשים לרשימת Employees ב-SharePoint"
echo "3. בדוק את המערכת במכשירים שונים"
echo "4. הגדר HTTPS (אם נדרש)"
echo ""
echo "לבעיות ושאלות - עיין ב-deployment-guide.md"
echo ""
