# Attendance

## Notes
- Excel exports are handled through the Azure Logic App workflow; the legacy `excel-export-code.js` script has been removed.

## Submit Field Mapping (Attendance List)
| Field | Type | JSON Format (Submit) |
| --- | --- | --- |
| employeeId | Text | `"employeeId": "12345"` |
| employeeName | Text | `"employeeName": "ישראל ישראלי"` |
| attendanceDate | Date | `"attendanceDate": "YYYY-MM-DD"` |
| startTime | Text | `"startTime": "HH:MM"` |
| endTime | Text | `"endTime": "HH:MM"` |
| workHours | Number | `"workHours": 7.5` |
| kilometers | Number | `"kilometers": 12` |
| role | Choice | `"role": { "Value": "Instructor" }` |
| activityType | Choice | `"activityType": { "Value": "סדנה" }` |
| programName | Choice | `"programName": { "Value": "תמיר" }` |
| employmentType | Choice | `"employmentType": { "Value": "תעשיידע" }` |
| team | Choice | `"team": { "Value": "גיל" }` |
| schoolName | Text | `"schoolName": "בית ספר לדוגמה"` |
| municipality | Text | `"municipality": "חיפה"` |
| sessionNumber | Number | `"sessionNumber": 3` |
| totalExpenses | Number | `"totalExpenses": 45.5` |
| expensesDetails | Text | `"expensesDetails": "נסיעה + חומרים"` |
| notes | Text | `"notes": "הערות"` |
| attachmentsNames | Text | `"attachmentsNames": "file.pdf (120 KB)"` |

Notes:
- Choice fields must be sent as `{ "Value": "<choice>" }`.
- Do not send management fields (`status`, `approvedBy`, `approvedDate`) in `submit`.
