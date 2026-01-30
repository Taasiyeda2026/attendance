// =============== Updated Permissions System ===============

/**
 * Permission levels for different roles
 */
const PERMISSIONS = {
  // מדריך - רק הנתונים שלו
  instructor: {
    viewOwn: true,
    viewTeam: false,
    viewAll: false,
    editOwn: true,
    editTeam: false,
    editAll: false,
    approveOwn: true,
    approveTeam: false,
    resetMonth: false,
    reports: false,
    manageEmployees: false,
    exportExcel: false
  },
  
  // מנהל צוות - הצוות שלו בלבד
  manager: {
    viewOwn: true,
    viewTeam: true,  // רק הצוות שלו
    viewAll: false,
    editOwn: true,
    editTeam: true,  // רק הצוות שלו
    editAll: false,
    approveOwn: true,
    approveTeam: false,
    resetMonth: true,  // רק לצוות שלו
    reports: true,     // רק הצוות שלו
    manageEmployees: false,
    exportExcel: true  // רק הצוות שלו
  },
  
  // אחראית שכר - צפייה ודוחות בלבד, כל הצוותים
  payroll_officer: {
    viewOwn: true,
    viewTeam: false,
    viewAll: true,   // ✅ רואה הכל
    editOwn: false,
    editTeam: false,
    editAll: false,  // ❌ לא יכולה לערוך
    approveOwn: false,
    approveTeam: false,
    resetMonth: false,
    reports: true,   // ✅ כל הדוחות
    manageEmployees: false,
    exportExcel: true  // ✅ כל הצוותים
  },
  
  // מבקרת תפעול - צפייה ודוחות בלבד, כל הצוותים
  operations_controller: {
    viewOwn: true,
    viewTeam: false,
    viewAll: true,   // ✅ רואה הכל
    editOwn: false,
    editTeam: false,
    editAll: false,  // ❌ לא יכולה לערוך
    approveOwn: false,
    approveTeam: false,
    resetMonth: false,
    reports: true,   // ✅ כל הדוחות
    manageEmployees: false,
    exportExcel: true  // ✅ כל הצוותים
  },
  
  // אדמין מערכת - הכל
  system_admin: {
    viewOwn: true,
    viewTeam: false,
    viewAll: true,
    editOwn: true,
    editTeam: false,
    editAll: true,
    approveOwn: true,
    approveTeam: false,
    resetMonth: true,
    reports: true,
    manageEmployees: true,  // ✅ רק אדמין
    exportExcel: true
  }
};

/**
 * Check if user has permission for specific action
 */
function hasPermission(permission) {
  const user = getCurrentUser();
  if (!user || !user.role) return false;
  
  const userPermissions = PERMISSIONS[user.role];
  if (!userPermissions) return false;
  
  return userPermissions[permission] || false;
}

/**
 * Get current user object
 */
function getCurrentUser() {
  return {
    employeeId: localStorage.getItem('employeeId'),
    name: localStorage.getItem('employeeName'),
    role: localStorage.getItem('role'),
    team: localStorage.getItem('team')
  };
}

/**
 * Check if user can view specific team's data
 */
function canViewTeam(targetTeam) {
  const user = getCurrentUser();
  
  // אדמין, אחראית שכר, מבקרת - רואים הכל
  if (hasPermission('viewAll')) {
    return true;
  }
  
  // מנהל צוות - רק הצוות שלו
  if (hasPermission('viewTeam')) {
    return user.team === targetTeam;
  }
  
  return false;
}

/**
 * Check if user can edit specific employee's records
 */
function canEditEmployee(targetEmployeeId, targetTeam) {
  const user = getCurrentUser();
  
  // עצמו - כולם יכולים
  if (user.employeeId === targetEmployeeId && hasPermission('editOwn')) {
    return true;
  }
  
  // אדמין - יכולים לערוך הכל
  if (hasPermission('editAll')) {
    return true;
  }
  
  // מנהל צוות - רק הצוות שלו
  if (hasPermission('editTeam')) {
    return user.team === targetTeam;
  }
  
  return false;
}

/**
 * Check if user can reset month for specific team
 */
function canResetMonth(targetTeam) {
  const user = getCurrentUser();
  
  if (!hasPermission('resetMonth')) {
    return false;
  }
  
  // אדמין - כל צוות
  if (user.role === 'system_admin') {
    return true;
  }
  
  // מנהל צוות - רק הצוות שלו
  if (user.role === 'manager') {
    return user.team === targetTeam;
  }
  
  return false;
}

/**
 * Get list of teams user can access
 */
async function getAccessibleTeams() {
  const user = getCurrentUser();
  
  // viewAll - מקבל את כל הצוותים
  if (hasPermission('viewAll')) {
    try {
      const data = await apiRequest('getAllTeams', {});
      return data.teams || [];
    } catch (error) {
      console.error('Failed to get teams:', error);
      return [];
    }
  }
  
  // viewTeam - רק הצוות שלו
  if (hasPermission('viewTeam')) {
    return [user.team];
  }
  
  // instructor - אין גישה לצוותים
  return [];
}

/**
 * Show/hide UI elements based on permissions
 */
function updateUIBasedOnPermissions() {
  const user = getCurrentUser();
  
  // Navigation items
  document.getElementById('navTeamReports')?.style.setProperty(
    'display', 
    hasPermission('reports') ? 'flex' : 'none'
  );
  
  document.getElementById('navAdminReports')?.style.setProperty(
    'display', 
    hasPermission('reports') ? 'flex' : 'none'
  );
  
  document.getElementById('navManageEmployees')?.style.setProperty(
    'display', 
    hasPermission('manageEmployees') ? 'flex' : 'none'
  );
  
  // Excel export buttons
  const excelButtons = document.querySelectorAll('.btn-excel, .btn-excel-quick');
  excelButtons.forEach(btn => {
    btn.style.display = hasPermission('exportExcel') ? 'inline-flex' : 'none';
  });
  
  // Month reset button
  const resetButton = document.getElementById('resetMonthBtn');
  if (resetButton) {
    resetButton.style.display = hasPermission('resetMonth') ? 'block' : 'none';
  }
  
  // Role indicator
  updateRoleIndicator();
}

/**
 * Update role indicator in header
 */
function updateRoleIndicator() {
  const user = getCurrentUser();
  const roleNames = {
    instructor: 'מדריך',
    manager: 'מנהל צוות',
    payroll_officer: 'אחראית שכר',
    operations_controller: 'מבקרת תפעול',
    system_admin: 'אדמין מערכת'
  };
  
  const roleIndicator = document.getElementById('roleIndicator');
  if (roleIndicator) {
    roleIndicator.textContent = roleNames[user.role] || 'משתמש';
    
    // צבעים לפי תפקיד
    const roleColors = {
      instructor: '#3b82f6',        // כחול
      manager: '#8b5cf6',           // סגול
      payroll_officer: '#10b981',   // ירוק
      operations_controller: '#f59e0b', // כתום
      system_admin: '#ef4444'       // אדום
    };
    
    roleIndicator.style.backgroundColor = roleColors[user.role] || '#64748b';
  }
}

/**
 * Get role display name in Hebrew
 */
function getRoleDisplayName(role) {
  const names = {
    instructor: 'מדריך',
    manager: 'מנהל צוות',
    payroll_officer: 'אחראית שכר',
    operations_controller: 'מבקרת תפעול',
    system_admin: 'אדמין מערכת'
  };
  return names[role] || 'משתמש';
}

/**
 * Check if user is manager-level (can manage teams)
 */
function isManagerLevel() {
  const user = getCurrentUser();
  return ['manager', 'system_admin'].includes(user.role);
}

/**
 * Check if user is read-only (payroll/controller)
 */
function isReadOnly() {
  const user = getCurrentUser();
  return ['payroll_officer', 'operations_controller'].includes(user.role);
}

/**
 * Show permission denied message
 */
function showPermissionDenied(action = 'פעולה זו') {
  showAlert(`❌ אין לך הרשאה לבצע ${action}`, 'error');
}

// Initialize permissions on page load
document.addEventListener('DOMContentLoaded', () => {
  if (currentUser) {
    updateUIBasedOnPermissions();
  }
});
