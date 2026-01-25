# CLAUDE.md - AI Assistant Guide for Taasiyeda Attendance System

## Project Overview

**Taasiyeda Attendance System** (מערכת נוכחות - תעשיידע) is a Hebrew-language Progressive Web Application (PWA) for attendance tracking. It is designed for RTL display, mobile-first responsive design, with SharePoint Lists as the data backend via Azure Logic Apps.

**Key Characteristics:**
- Primary language: Hebrew (RTL)
- Platform: PWA (installable, offline-capable)
- Backend: Azure Logic Apps + SharePoint Lists (no traditional database)
- Deployment: Single `index.html` file containing all frontend code

## Quick Start

```bash
# Install dependencies
npm install

# Development mode (Vite + Express server on port 5000)
npm run dev

# Type checking
npm run check

# Production build
npm run build

# Start production server
npm start
```

## Architecture

### Two Deployment Modes

1. **Production (PWA):** Self-contained `index.html` (4,600+ lines) with embedded CSS/JS that calls Azure Logic Apps directly
2. **Development:** React components in `/client/src` + Express development server with Vite HMR

### Technology Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | Vanilla JS (production), React 18 (dev), Tailwind CSS 3.4, Radix UI |
| **Backend** | Express 5, Drizzle ORM (dev only) |
| **Data Storage** | Azure SharePoint Lists via Logic Apps |
| **Build Tools** | Vite 7, esbuild, TypeScript 5.6, PostCSS |
| **PWA** | Service Worker, Web App Manifest |

### Azure Logic App Integration

**Endpoint:** Hardcoded in `index.html` (search for `logic.azure.com`)

**Actions:**
| Action | Purpose |
|--------|---------|
| `auth` | Login (empNum, password) → returns role, team, employmentType |
| `submit` | Create new attendance record |
| `getHistory` | Fetch records (role-filtered) |
| `updateRecord` | Update record by recordId |
| `deleteRecord` | Delete record by recordId |

## File Structure

```
/home/user/attendance/
├── index.html              # MAIN: Production PWA (4,600+ lines of HTML/CSS/JS)
├── manifest.json           # PWA manifest (Hebrew, RTL)
├── sw.js                   # Service Worker (caching, offline support)
├── logo.png, icon-*.png    # App icons
├── package.json            # Dependencies & scripts
├── vite.config.ts          # Vite build configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
├── client/
│   └── src/
│       ├── App.tsx         # React root component (dev)
│       ├── main.tsx        # React DOM mount
│       └── index.css       # Base Tailwind imports
├── server/
│   ├── index.ts            # Express server entry
│   ├── routes.ts           # API routes (proxy to Logic App)
│   ├── db.ts               # Drizzle ORM setup
│   ├── storage.ts          # In-memory storage
│   └── static.ts           # Static file serving
├── shared/
│   └── schema.ts           # Zod schemas & TypeScript types
└── public/
    └── manifest.json       # Duplicate PWA manifest
```

## Important Conventions

### Code Organization in index.html

The main `index.html` follows this organization pattern:

```
1. HTML Structure (RTL, Hebrew metadata)
2. <style> block - All CSS styles
3. <script> block containing:
   - Global state variables (records, currentUser, editingIndex)
   - Helper functions (formatHoursDisplay, extractLookupValue, etc.)
   - Authentication functions (doLogin, logout, initInactivityTimer)
   - RBAC functions (updateMenuByRole, hasPermission, canEditRecord)
   - Data management (loadMyRecordsFromServer, submitRecord, etc.)
   - UI/Navigation (showPage, renderRecordsTable, updateStats)
```

### State Management

**Production (index.html):**
- Global variables: `records`, `currentUser`, `editingIndex`
- localStorage keys: `currentUser`, `employeeId`, `role`, `team`, `employmentType`

**Development (React):**
- React useState hooks
- TanStack React Query for data fetching

### CSS/Styling Conventions

- **Font:** Heebo (Hebrew-optimized)
- **Direction:** RTL throughout
- **Approach:** Tailwind-like utility classes + custom CSS
- **Mobile-first:** Responsive breakpoints at 768px (tablet) and 480px (mobile)
- **Color scheme:** Gradient backgrounds, soft shadows, indigo accent color (#6366f1)

### Role-Based Access Control (RBAC)

**5 User Roles:**

| Role Key | Hebrew Name | Capabilities |
|----------|-------------|--------------|
| `instructor` | מדריך/ה | Own records only, limited UI |
| `manager` | מנהל/ת פעילויות | Team records, edit all |
| `payroll_officer` | אחראית שכר | Dashboard only, no navigation |
| `operations_controller` | מבקרת תפעול | Full access, edit/delete all |
| `system_admin` | מנהל מערכת | Full system access |

**Role Normalization:** The codebase handles multiple naming variations (English/Hebrew) via `normalizeRole()` function.

**Permission Checks:**
- `hasPermission(action)` - Check action permission
- `canEditRecord(record)` - Edit permission for specific record
- `canDeleteRecord(record)` - Delete permission for specific record
- `canAddRecord()` - Add permission

### Data Model (Attendance Record)

```javascript
{
  recordId,           // SharePoint ID (required for update/delete)
  empNum,             // Employee number
  empName,            // Employee name
  date,               // YYYY-MM-DD
  start,              // HH:MM
  end,                // HH:MM
  hours,              // Decimal (e.g., 2.5)
  activity,           // Activity type
  school,             // School/location
  municipality,       // Municipality
  program,            // Program name
  session,            // Session number
  km,                 // Kilometers traveled
  totalExpenses,      // Total expenses
  expensesDetails,    // Expense breakdown
  notes,              // Additional notes
  employmentType      // Contract type
}
```

## Development Workflow

### Making Changes to the PWA

1. **Edit `index.html`** directly for production changes
2. **Search for function names** to find relevant code sections
3. **Test locally** using `npm run dev`
4. **Check types** with `npm run check`

### Path Aliases (TypeScript/Vite)

```typescript
@ → client/src/
@shared → shared/
@assets → attached_assets/
```

### Common Development Tasks

| Task | Command/Location |
|------|------------------|
| Add new page | Add to `showPage()` function in index.html |
| Add new API action | Update Logic App call in index.html |
| Modify RBAC | Edit `updateMenuByRole()` and permission functions |
| Change styling | Edit `<style>` block in index.html |
| Update PWA manifest | Edit `manifest.json` |
| Modify caching | Edit `sw.js` |

## AI Assistant Guidelines

### When Modifying index.html

1. **Understand the structure first** - The file is 4,600+ lines; search for specific functions
2. **Preserve RTL/Hebrew** - All UI text should be in Hebrew
3. **Test RBAC** - Changes may need different behavior per role
4. **Check mobile** - Ensure changes work on mobile breakpoints
5. **Update Service Worker** - If adding new assets, update `sw.js` cache

### Key Functions to Know

| Function | Purpose |
|----------|---------|
| `doLogin()` | Handle login authentication |
| `showPage(pageId)` | Navigate between pages |
| `loadMyRecordsFromServer()` | Fetch records from Logic App |
| `submitRecord()` | Create new attendance record |
| `updateRecordOnServer()` | Update existing record |
| `deleteRecordOnServer()` | Delete record |
| `renderRecordsTable()` | Render the records data table |
| `updateMenuByRole()` | Update UI based on user role |
| `normalizeRole()` | Standardize role strings |

### Common Patterns

**API Call Pattern:**
```javascript
const response = await fetch(LOGIC_APP_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ action: 'actionName', ...params })
});
const data = await response.json();
```

**Role Check Pattern:**
```javascript
const role = normalizeRole(localStorage.getItem('role'));
if (role === 'instructor') {
  // instructor-specific behavior
}
```

**Page Navigation Pattern:**
```javascript
showPage('page-id');  // e.g., 'dashboard', 'add-record', 'records'
```

### Things to Avoid

1. **Don't break RTL layout** - Text direction must remain right-to-left
2. **Don't hardcode new Azure URLs** - Use the existing Logic App endpoint
3. **Don't add English UI text** - All user-facing text should be Hebrew
4. **Don't remove mobile responsiveness** - Always test mobile breakpoints
5. **Don't bypass RBAC** - Respect role-based permissions
6. **Don't modify localStorage keys** - These are used across the app

### Security Considerations

- Logic App URL is public (shared with client)
- localStorage contains user data (role, team, employeeId)
- 30-minute inactivity auto-logout is implemented
- File uploads have 5MB client-side validation

## Recent Features (January 2026)

- Role-based navigation (instructors vs other roles)
- Payroll officer dedicated dashboard with Excel export
- 4-card Add Record page design
- Enhanced reports with team/employment type filters
- Mobile-optimized table with sticky columns
- Drag-and-drop file upload UI (backend pending)

## Known Limitations

1. **File Upload:** UI complete, SharePoint upload pending Logic App config
2. **Database:** Uses in-memory storage (PostgreSQL present but unused)
3. **Sessions:** Memory-based (not persistent across restarts)

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection (dev/testing only) |
| `NODE_ENV` | development/production |

The Azure Logic App URL is hardcoded in `index.html` for PWA portability.

## Useful Commands

```bash
npm run dev          # Start development server
npm run check        # TypeScript type checking
npm run build        # Production build
npm start            # Run production server
npm run db:push      # Push Drizzle schema (dev only)
```
