# CLAUDE.md - AI Assistant Guide for Attendance System

## Project Overview

This is **מערכת נוכחות - תעשיידע** (Tasiyeda Attendance System), a Hebrew-language Progressive Web App (PWA) for managing employee attendance records. Built for educational programs and team management with support for instructors, team managers, and administrative staff.

**Key Characteristics:**
- Single-page HTML application (~6,500 lines) with embedded JavaScript and CSS
- RTL (Right-to-Left) Hebrew interface
- Mobile-first responsive design with PWA capabilities
- Role-based access control (6 user roles)
- Azure Logic Apps backend integration
- Offline support via Service Workers

## File Structure

```
/home/user/attendance/
├── index.html              # Main application (HTML + CSS + JS)
├── manifest.json           # PWA manifest configuration
├── sw.js                   # Service Worker for offline support
├── permissions-system.js   # Role-based permission definitions
├── excel-export-code.js    # Excel export utilities (SheetJS)
├── logo.png                # Application logo
├── icons/                  # PWA icons (72px to 512px)
│   ├── icon-72x72.png
│   ├── icon-96x96.png
│   ├── icon-128x128.png
│   ├── icon-144x144.png
│   ├── icon-152x152.png
│   ├── icon-192x192.png
│   ├── icon-384x384.png
│   └── icon-512x512.png
└── screenshots/            # PWA store screenshots
    ├── dashboard.png
    ├── attendance.png
    ├── records.png
    └── reports.png
```

## Technology Stack

| Category | Technology |
|----------|------------|
| Frontend | Vanilla HTML5, CSS3, JavaScript (ES6+) |
| Styling | Embedded CSS with CSS Variables, Flexbox, Grid |
| Fonts | Google Fonts (Heebo - Hebrew optimized) |
| Icons | Font Awesome 6.4.0 |
| Excel Export | SheetJS (XLSX) via CDN |
| Backend | Azure Logic Apps (REST API) |
| Storage | localStorage for client-side session |
| PWA | Service Worker, Web App Manifest |

## Architecture

### Application Structure

The application is a **single-page application (SPA)** contained entirely within `index.html`:

1. **HTML Structure**: Login screen, main app container with sidebar navigation, page sections
2. **Embedded CSS**: All styles in `<style>` tags (~2,000 lines)
3. **Embedded JavaScript**: Application logic in `<script>` tags (~4,000 lines)
4. **External Modules**: Permission system and Excel export in separate JS files

### State Management

- **User Session**: Stored in `localStorage` (`employeeId`, `employeeName`, `role`, `team`)
- **Current Records**: Global JavaScript variables for active data
- **UI State**: DOM manipulation for showing/hiding pages and elements

### API Communication

```javascript
// Configuration in index.html
const CONFIG = {
  LOGIC_APP_URL: "https://prod-23.israelcentral.logic.azure.com:...",
  MAX_RETRY: 3,
  RETRY_DELAY: 1000
};

// API request pattern
async function apiRequest(action, payload) {
  // Retry logic with exponential backoff
  // Payload normalization between table formats
  // Error handling with toast notifications
}
```

**API Actions Include:**
- `login` - User authentication
- `getRecords` / `getMyRecords` - Fetch attendance records
- `addRecord` / `updateRecord` / `deleteRecord` - CRUD operations
- `getTeamApprovals` - Team approval status
- `approveMonth` / `resetApprovals` - Monthly approval workflow
- `getAllTeams` / `getEmployees` - Admin functions

## Role-Based Access Control (RBAC)

### Roles (defined in `permissions-system.js`)

| Role | Hebrew Name | Permissions |
|------|-------------|-------------|
| `instructor` | מדריך | View/edit own records only |
| `manager` | מנהל צוות | Manage own team, team reports, export |
| `payroll_officer` | אחראית שכר | View all (read-only), reports, export |
| `operations_controller` | מבקרת תפעול | View all (read-only), reports, export |
| `admin_assistant` | עוזרת אדמין | Edit all, approve, reset months (no employee management) |
| `system_admin` | אדמין מערכת | Full access including employee management |

### Permission Flags

```javascript
const PERMISSIONS = {
  role_name: {
    viewOwn: boolean,      // View own records
    viewTeam: boolean,     // View team records
    viewAll: boolean,      // View all records
    editOwn: boolean,      // Edit own records
    editTeam: boolean,     // Edit team records
    editAll: boolean,      // Edit all records
    approveOwn: boolean,   // Approve own month
    approveTeam: boolean,  // Approve team members
    resetMonth: boolean,   // Reset month approvals
    reports: boolean,      // Access reports
    manageEmployees: boolean, // Manage employee records
    exportExcel: boolean   // Export to Excel
  }
};
```

### Permission Helper Functions

```javascript
hasPermission(permission)      // Check single permission
canViewTeam(targetTeam)        // Check team view access
canEditEmployee(employeeId, team) // Check edit access for employee
canResetMonth(targetTeam)      // Check month reset access
isManagerLevel()               // Manager/admin_assistant/system_admin
isReadOnly()                   // payroll_officer/operations_controller
```

## Code Conventions

### Naming

- **Functions**: `verbNoun()` pattern - `showPage()`, `loadRecords()`, `submitRecord()`
- **Variables**: camelCase - `currentUser`, `recordsList`, `selectedMonth`
- **Constants**: UPPER_SNAKE_CASE - `TEAMS_LIST`, `ACTIVITY_TYPES`, `CONFIG`
- **DOM IDs**: camelCase - `mainApp`, `loginScreen`, `recordsTable`

### Function Patterns

```javascript
// Async API calls
async function loadData() {
  try {
    showLoading();
    const result = await apiRequest('action', payload);
    if (result.success) {
      // Handle success
    } else {
      showAlert('Error message', 'error');
    }
  } catch (error) {
    console.error('Operation failed:', error);
    showAlert('Error message', 'error');
  } finally {
    hideLoading();
  }
}

// UI handlers
function handleButtonClick() {
  // Validate inputs
  // Perform action
  // Update UI
}
```

### Data Normalization

The codebase handles SharePoint field format variations:

```javascript
// Field name normalization (PascalCase <-> camelCase)
normalizePayload(data)         // Convert for API requests
extractLookupValue(field)      // Parse SharePoint lookup fields
normalizeEmploymentType(value) // Handle string/object/JSON formats
normalizeRole(role)            // Map role variations to canonical names
```

### UI Patterns

- **Toast Notifications**: `showAlert(message, type)` - types: 'success', 'error', 'info', 'warning'
- **Loading States**: `showLoading()` / `hideLoading()` functions
- **Page Navigation**: `showPage(pageName)` function
- **Form Validation**: Inline validation with visual feedback

## Key Features

### 1. Authentication
- Employee ID + Personal Code login
- Session stored in localStorage
- Inactivity timeout with auto-logout

### 2. Attendance Recording
Fields: date, start/end time, calculated hours, activity type, school, program, session number, kilometers, expenses, notes

### 3. Monthly Approval Workflow
- Employees approve their monthly records
- Managers can view team approval status
- Admins can reset approvals for corrections

### 4. Reporting & Export
- Dashboard with statistics cards
- Team approval status reports
- Excel export with multiple sheets (approval status, detailed records, hours summary)

### 5. Mobile Experience
- Responsive breakpoints: 768px, 1024px, 1200px
- Bottom navigation on mobile
- Floating action buttons
- Safe area padding for notched devices
- Touch-optimized targets (min 44px)

## Development Guidelines

### When Modifying Code

1. **Understand the Context**: Read relevant sections before making changes
2. **Maintain RTL Support**: All UI elements must support right-to-left text
3. **Preserve Hebrew Text**: Keep all Hebrew labels and messages intact
4. **Test Permissions**: Verify changes work across all 6 user roles
5. **Mobile First**: Test responsive behavior on small screens

### Common Modification Points

| Task | Location |
|------|----------|
| Add new page | `index.html` - add page section, nav item, `showPage()` case |
| Add permission | `permissions-system.js` - add to each role object |
| Add API action | `index.html` - modify `apiRequest()` or create handler |
| Add form field | `index.html` - form HTML + JavaScript handler |
| Style changes | `index.html` - embedded `<style>` section |

### Data Lists (Fixed Values)

```javascript
// Teams
TEAMS_LIST: ['גיל', 'לינוי', 'הכל']

// Employment Types
EMPLOYMENT_TYPES: ['תעשיידע', 'מעוף', 'מנפאואר', 'עצמאי']

// Activity Types (6 types)
'הדרכה', 'סדנה', 'סיור', 'קורס', 'תפעול', 'אחר'

// Programs (14 educational programs)
// Schools (140+ schools organized by municipality)
```

### Service Worker Updates

When updating cached assets, increment the cache version in `sw.js`:
```javascript
const CACHE_NAME = 'attendance-v2';  // Increment for updates
```

## Important Considerations for AI Assistants

### Do

- Preserve Hebrew text and RTL layout
- Maintain existing code style and patterns
- Test changes across different user roles
- Consider mobile responsiveness
- Use existing helper functions (normalization, permissions)
- Keep the single-file architecture intact (unless specifically asked to refactor)

### Don't

- Remove or modify Hebrew labels without explicit instruction
- Break permission checks or bypass RBAC
- Change API endpoint or payload structure without backend coordination
- Add external dependencies without justification
- Create separate CSS/JS files (keep inline unless restructuring)

### Testing Checklist

- [ ] Login works for all role types
- [ ] Permission-based UI elements show/hide correctly
- [ ] Forms validate and submit properly
- [ ] Mobile layout is usable
- [ ] Excel export generates correctly
- [ ] Service Worker caches properly

## Git Workflow

- Feature branches: `codex/*` pattern
- PR-based merging to main
- Recent focus areas: mobile UI, employment type normalization, approval mechanisms

## Quick Reference

### Show a Page
```javascript
showPage('dashboard');  // 'records', 'add', 'reports', 'employees', etc.
```

### Check Permission
```javascript
if (hasPermission('exportExcel')) {
  // Show export button
}
```

### Make API Request
```javascript
const result = await apiRequest('getRecords', { month: '2026-01' });
```

### Show Notification
```javascript
showAlert('Record saved successfully', 'success');
showAlert('Error occurred', 'error');
```

### Get Current User
```javascript
const user = getCurrentUser();
// { employeeId, name, role, team }
```
