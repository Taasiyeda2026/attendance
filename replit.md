# Taasiyeda Attendance System (מערכת נוכחות - תעשיידע)

## Overview

Hebrew-language PWA for attendance tracking. Designed for RTL display, mobile-optimized, with SharePoint Lists as the data backend via Azure Logic Apps.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (January 2026)

- **Role-Based Navigation**: "רשומות נוכחות" page visible only to instructors; non-instructors redirected to "רשומות הצוות"
- **getHistory with Role Filtering**: Now sends role+team to Logic App for proper role-based record retrieval
- **Mobile Bottom Nav**: "הוספה" and "רשומות" buttons hidden for non-instructors
- **payroll_officer Dashboard**: Dedicated single-page experience with monthly summary table grouped by instructor (work days, hours by type, km, expenses), export to Excel, no sidebar/menu access
- **Add Record Page Redesign**: Reorganized into 4 colored cards:
  - Card 1 (blue): Date, Start Time, End Time, Total Hours
  - Card 2 (green): Activity Type, School, Municipality, Program, Session, Kilometers
  - Card 3 (yellow): Total Expenses, Expenses Detail, Attach Documents
  - Card 4 (purple): Notes
- **Time Dropdown Fix**: Limited height with scroll to prevent overflow
- **Employee Info Display**: Now shows employee number and name in header when adding record
- **Hours Field**: Smaller, centered, bold display; formatted as simple numbers for SharePoint
- **Reports Page Enhanced**: Filters for team, EmploymentType, activity type; stats for hours, km, expenses
- **Excel Export Options**: All rows (detailed) or grouped by employee (summary) via export modal
- **RBAC Permissions**: Edit allowed for manager/ops_controller/admin; Delete only for ops_controller/admin
- **EmploymentType**: Stored in localStorage on login, sent in submit/update payloads
- **Mobile Responsive**: Horizontal table scroll, sticky first column (RTL), mobile-optimized headers/buttons, cards grid adapts to 1 column on mobile
- **File Upload UI**: Drag-and-drop support, 5MB validation (actual SharePoint upload pending Logic App config)

## System Architecture

### Frontend (Standalone PWA)
- **Location**: `index.html` (single file, self-contained)
- **Styling**: CSS with Tailwind-like utilities, Heebo Hebrew font
- **PWA**: `sw.js` service worker, `manifest.json` for installability
- **Data**: Direct calls to Azure Logic Apps (no backend server needed for production)

### Logic App Actions
1. **auth**: Login with empNum/password → returns role, team, employmentType
2. **submit**: Create attendance record with employmentType
3. **getHistory**: Role-based filtering (admin/controller/payroll=all, manager=team, instructor=own)
4. **updateRecord**: Update by SharePoint recordId
5. **deleteRecord**: Delete by SharePoint recordId

### RBAC Roles
- `instructor`: View/submit own records only, sees "רשומות נוכחות" (מדריך/ה)
- `manager`: View team records, edit all records (מנהל/ת פעילויות)
- `payroll_officer`: Isolated dashboard only - sees monthly summary table grouped by instructor with export to Excel, no access to other pages (אחראית שכר)
- `operations_controller`: Full access, edit/delete permissions (מבקרת תפעול)
- `system_admin`: Full access, all permissions (מנהל מערכת)

### Data Flow
- All records stored in SharePoint Lists
- On login: syncFromSharePoint() loads records to local state
- recordId (SharePoint ID field) used for update/delete operations

## File Structure
```
/
├── index.html          # Main PWA application
├── manifest.json       # PWA manifest
├── sw.js              # Service worker
├── logo.png           # App logo/icon
├── client/            # React source (dev reference)
├── server/            # Express proxy (dev only)
└── replit.md          # This file
```

## Environment Variables
- `DATABASE_URL` - PostgreSQL (for dev/testing)
- Logic App URL is hardcoded in index.html

## Known Pending Items
- File upload to SharePoint: UI complete, backend integration pending Logic App configuration
