# Taasiyeda Attendance System (מערכת נוכחות - תעשיידע)

## Overview

Hebrew-language PWA for attendance tracking. Designed for RTL display, mobile-optimized, with SharePoint Lists as the data backend via Azure Logic Apps.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (January 2026)

- **Approval Workflow**: Approve/reject buttons for managers and above; status badges (pending/approved/rejected); reject modal with comment field
- **Reports Page Enhanced**: Filters for team, EmploymentType, activity type; stats for hours, km, expenses
- **Excel Export Options**: All rows (detailed) or grouped by employee (summary) via export modal
- **RBAC Permissions**: Edit allowed for manager/ops_controller/admin; Delete only for ops_controller/admin; Approve for non-instructors
- **EmploymentType**: Stored in localStorage on login, sent in submit/update payloads
- **Mobile Responsive**: Horizontal table scroll, sticky first column (RTL), mobile-optimized headers/buttons
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
3. **getHistory**: Fetch all records (or filter by employeeId)
4. **updateRecord**: Update by SharePoint recordId
5. **deleteRecord**: Delete by SharePoint recordId

### RBAC Roles
- `instructor`: View/submit own records only (מדריך/ה)
- `manager`: View team records, edit all records (מנהל/ת פעילויות)
- `payroll_officer`: Full access, delete permission - same as operations_controller (אחראית שכר)
- `operations_controller`: Full access, delete permission (מבקרת תפעול)
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
