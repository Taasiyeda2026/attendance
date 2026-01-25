# הגדרת Logic App למערכת נוכחות

## רשימות SharePoint נדרשות

### 1. רשימת Employees (עובדים)
| שם עמודה | סוג | תיאור |
|----------|-----|-------|
| EmployeeId | Text | מספר עובד (ייחודי) |
| PersonalCode | Text | קוד אישי להתחברות |
| EmployeeName | Text | שם העובד |
| Role | Choice | תפקיד: instructor, manager, payroll_officer, operations_controller, system_admin |
| Team | Text | שם הצוות |
| EmploymentType | Text | סוג העסקה (תעשיידע וכו') |

### 2. רשימת Attendance (נוכחות)
| שם עמודה | סוג | תיאור |
|----------|-----|-------|
| ID | Auto | מזהה ייחודי (אוטומטי) |
| EmployeeId | Text | מספר עובד |
| EmployeeName | Text | שם העובד |
| AttendanceDate | Date | תאריך |
| StartTime | Text | שעת התחלה (HH:MM) |
| EndTime | Text | שעת סיום (HH:MM) |
| WorkHours | Number | שעות עבודה |
| ActivityType | Text | סוג פעילות |
| SchoolName | Text | בית ספר |
| Municipality | Text | רשות |
| ProgramName | Text | תוכנית |
| SessionNumber | Number | מספר מפגש |
| Kilometers | Number | קילומטרים |
| TotalExpenses | Number | סה"כ הוצאות |
| ExpensesDetails | Text | פירוט הוצאות |
| Notes | Text | הערות |
| EmploymentType | Text | סוג העסקה |
| Team | Text | צוות |

---

## פעולות API

### 1. auth - התחברות
**בקשה:**
```json
{
  "action": "auth",
  "employeeId": "12345",
  "personalCode": "1234"
}
```

**תגובה (הצלחה):**
```json
{
  "success": true,
  "employeeName": "ישראל ישראלי",
  "role": "instructor",
  "team": "צוות א",
  "employmentType": "תעשיידע"
}
```

**תגובה (כישלון):**
```json
{
  "success": false,
  "message": "מספר עובד או קוד אישי שגויים"
}
```

---

### 2. submit - הוספת רשומה
**בקשה:**
```json
{
  "action": "submit",
  "employeeId": "12345",
  "employeeName": "ישראל ישראלי",
  "attendanceDate": "2026-01-25",
  "startTime": "08:00",
  "endTime": "12:00",
  "workHours": 4,
  "activityType": "הדרכה",
  "schoolName": "בית ספר א",
  "municipality": "תל אביב",
  "programName": "תוכנית א",
  "sessionNumber": 1,
  "kilometers": 25,
  "totalExpenses": 50,
  "expensesDetails": "נסיעות",
  "notes": "",
  "employmentType": "תעשיידע",
  "team": "צוות א"
}
```

**תגובה:**
```json
{
  "success": true,
  "recordId": 123
}
```

---

### 3. getHistory - קבלת רשומות
**בקשה:**
```json
{
  "action": "getHistory",
  "employeeId": "12345",
  "role": "instructor",
  "team": "צוות א"
}
```

**סינון לפי תפקיד:**
- `instructor` - רק רשומות של העובד עצמו
- `manager` - רשומות של הצוות
- `operations_controller` / `system_admin` / `payroll_officer` - כל הרשומות

**תגובה:**
```json
{
  "success": true,
  "records": [
    {
      "ID": 123,
      "employeeId": "12345",
      "employeeName": "ישראל ישראלי",
      "attendanceDate": "2026-01-25",
      "startTime": "08:00",
      "endTime": "12:00",
      "workHours": 4,
      "activityType": "הדרכה",
      "schoolName": "בית ספר א",
      "municipality": "תל אביב",
      "programName": "תוכנית א",
      "sessionNumber": 1,
      "kilometers": 25,
      "totalExpenses": 50,
      "expensesDetails": "נסיעות",
      "notes": "",
      "employmentType": "תעשיידע",
      "team": "צוות א"
    }
  ]
}
```

---

### 4. updateRecord - עדכון רשומה
**בקשה:**
```json
{
  "action": "updateRecord",
  "recordId": 123,
  "employeeId": "12345",
  "employeeName": "ישראל ישראלי",
  "attendanceDate": "2026-01-25",
  "startTime": "08:00",
  "endTime": "13:00",
  "workHours": 5,
  "activityType": "הדרכה",
  "schoolName": "בית ספר א",
  "municipality": "תל אביב",
  "programName": "תוכנית א",
  "sessionNumber": 1,
  "kilometers": 25,
  "totalExpenses": 50,
  "expensesDetails": "נסיעות",
  "notes": "עודכן",
  "employmentType": "תעשיידע",
  "team": "צוות א"
}
```

**תגובה:**
```json
{
  "success": true
}
```

---

### 5. deleteRecord - מחיקת רשומה
**בקשה:**
```json
{
  "action": "deleteRecord",
  "recordId": 123
}
```

**תגובה:**
```json
{
  "success": true
}
```

---

## הגדרה ב-Azure Portal

1. צור Logic App חדש באזור `israelcentral`
2. הוסף Trigger: "When an HTTP request is received"
3. הוסף Switch על `action`
4. לכל case הוסף את הפעולות המתאימות
5. חבר ל-SharePoint עם Connection
6. עדכן את URL ב-index.html

## חשוב!
- החלף `https://yoursite.sharepoint.com/sites/yoursite` בכתובת האתר שלך
- החלף `Employees` ו-`Attendance` בשמות הרשימות שלך
- ודא שכל Headers כוללים `Access-Control-Allow-Origin: *`
