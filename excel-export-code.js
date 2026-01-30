// =============== Excel Export Functions - FIXED VERSION ===============

/**
 * Export team approval status to Excel
 * Creates a workbook with 3 sheets:
 * 1. Approval Status Summary
 * 2. Detailed Records
 * 3. Hours Summary
 */
async function exportTeamApprovalToExcel() {
  try {
    showAlert('מכין קובץ Excel...', 'info');

    const team = localStorage.getItem('team');
    const currentMonth = new Date().toISOString().slice(0, 7); // "2026-01"
    const monthName = getHebrewMonthName(currentMonth);

    // Get records from cache (teamRecordsCache is populated by loadTeamRecords)
    const records = typeof teamRecordsCache !== 'undefined' ? teamRecordsCache : [];

    // Calculate approval data FROM records
    const approvalEmployees = calculateApprovalDataFromRecords(records);

    // Create workbook
    const wb = XLSX.utils.book_new();

    // Sheet 1: Approval Status (only if we have approvals)
    if (approvalEmployees.length > 0) {
      const approvalSheet = createApprovalSheet(approvalEmployees, monthName);
      XLSX.utils.book_append_sheet(wb, approvalSheet, 'סטטוס אישורים');
    }

    // Sheet 2: Detailed Records (only if we have records)
    if (records.length > 0) {
      const recordsSheet = createRecordsSheet(records);
      XLSX.utils.book_append_sheet(wb, recordsSheet, 'רשומות מפורטות');

      // Sheet 3: Hours Summary
      const summarySheet = createSummarySheet(records);
      XLSX.utils.book_append_sheet(wb, summarySheet, 'סיכום שעות');
    }

    if (wb.SheetNames.length === 0) {
      showAlert('אין נתונים לייצוא', 'error');
      return;
    }

    // Generate filename
    const filename = `דוח_נוכחות_צוות_${team}_${monthName}_${new Date().toISOString().slice(0, 10)}.xlsx`;

    // Download
    XLSX.writeFile(wb, filename);

    showAlert('הקובץ הורד בהצלחה!', 'success');

  } catch (error) {
    console.error('Excel export error:', error);
    showAlert('שגיאה ביצירת קובץ Excel', 'error');
  }
}

/**
 * Calculate approval data from records (since it doesn't come from API)
 */
function calculateApprovalDataFromRecords(records) {
  const employeeMap = {};
  
  records.forEach(rec => {
    const empId = rec.employeeId;
    if (!employeeMap[empId]) {
      employeeMap[empId] = {
        employeeName: rec.employeeName,
        employeeId: rec.employeeId,
        approvalDate: rec.ApprovalDate || rec.approvalDate || null,
        totalHours: 0,
        recordCount: 0
      };
    }
    
    employeeMap[empId].totalHours += Number(rec.workHours) || 0;
    employeeMap[empId].recordCount += 1;
    
    // Take the latest approval date if exists
    if (rec.ApprovalDate || rec.approvalDate) {
      const currentDate = rec.ApprovalDate || rec.approvalDate;
      if (!employeeMap[empId].approvalDate || new Date(currentDate) > new Date(employeeMap[empId].approvalDate)) {
        employeeMap[empId].approvalDate = currentDate;
      }
    }
  });
  
  return Object.values(employeeMap);
}

/**
 * Create approval status sheet
 */
function createApprovalSheet(employees, monthName) {
  const data = [];
  
  // Header
  data.push(['דוח סטטוס אישורים - ' + monthName]);
  data.push(['צוות: ' + localStorage.getItem('team')]);
  data.push(['תאריך הפקה: ' + formatDate(new Date())]);
  data.push([]); // Empty row
  
  // Column headers
  data.push([
    'שם עובד',
    'תעודת זהות',
    'תאריך אישור',
    'סטטוס',
    'סה״כ שעות',
    'סה״כ רשומות'
  ]);
  
  // Data rows
  let totalApproved = 0;
  let totalHours = 0;
  let totalRecords = 0;
  
  employees.forEach(emp => {
    const approved = emp.approvalDate ? 'אושר' : 'ממתין';
    if (emp.approvalDate) totalApproved++;
    totalHours += emp.totalHours || 0;
    totalRecords += emp.recordCount || 0;
    
    data.push([
      emp.employeeName || '',
      emp.employeeId || '',
      emp.approvalDate ? formatDate(emp.approvalDate) : '—',
      approved,
      emp.totalHours ? emp.totalHours.toFixed(1) : '0.0',
      emp.recordCount || 0
    ]);
  });
  
  // Summary row
  data.push([]); // Empty row
  data.push([
    'סה״כ',
    '',
    '',
    `${totalApproved}/${employees.length} אישרו`,
    totalHours.toFixed(1),
    totalRecords
  ]);
  
  // Create sheet
  const ws = XLSX.utils.aoa_to_sheet(data);
  
  // Set column widths
  ws['!cols'] = [
    { wch: 20 }, // שם עובד
    { wch: 15 }, // ת.ז.
    { wch: 15 }, // תאריך אישור
    { wch: 10 }, // סטטוס
    { wch: 12 }, // שעות
    { wch: 12 }  // רשומות
  ];
  
  return ws;
}

/**
 * Create detailed records sheet
 */
function createRecordsSheet(records) {
  const data = [];
  
  // Header
  data.push(['רשומות נוכחות מפורטות']);
  data.push([]); // Empty row
  
  // Column headers
  data.push([
    'שם עובד',
    'תאריך',
    'שעת התחלה',
    'שעת סיום',
    'שעות עבודה',
    'סוג פעילות',
    'שם בית ספר',
    'רשות',
    'שם תכנית',
    'קילומטרים',
    'הוצאות',
    'הערות'
  ]);
  
  // Data rows
  records.forEach(rec => {
    data.push([
      rec.employeeName || '',
      formatDate(rec.attendanceDate),
      rec.startTime || '',
      rec.endTime || '',
      rec.workHours ? Number(rec.workHours).toFixed(1) : '0.0',
      rec.activityType || '',
      rec.schoolName || '',
      rec.municipality || '',
      rec.programName || '',
      rec.kilometers || 0,
      rec.totalExpenses || 0,
      rec.notes || ''
    ]);
  });
  
  // Create sheet
  const ws = XLSX.utils.aoa_to_sheet(data);
  
  // Set column widths
  ws['!cols'] = [
    { wch: 20 }, // שם
    { wch: 12 }, // תאריך
    { wch: 10 }, // התחלה
    { wch: 10 }, // סיום
    { wch: 10 }, // שעות
    { wch: 15 }, // סוג
    { wch: 20 }, // בית ספר
    { wch: 15 }, // רשות
    { wch: 20 }, // תכנית
    { wch: 10 }, // ק״מ
    { wch: 10 }, // הוצאות
    { wch: 30 }  // הערות
  ];
  
  return ws;
}

/**
 * Create hours summary sheet
 */
function createSummarySheet(records) {
  const data = [];
  
  // Header
  data.push(['סיכום שעות ופעילות']);
  data.push([]); // Empty row
  
  // Column headers
  data.push([
    'שם עובד',
    'שעות עבודה',
    'קילומטרים',
    'הוצאות',
    'מספר מפגשים',
    'ממוצע שעות למפגש'
  ]);
  
  // Calculate summaries
  const summaries = {};
  
  records.forEach(rec => {
    const empId = rec.employeeId;
    if (!summaries[empId]) {
      summaries[empId] = {
        name: rec.employeeName,
        hours: 0,
        km: 0,
        expenses: 0,
        sessions: 0
      };
    }
    
    summaries[empId].hours += Number(rec.workHours) || 0;
    summaries[empId].km += Number(rec.kilometers) || 0;
    summaries[empId].expenses += Number(rec.totalExpenses) || 0;
    summaries[empId].sessions += 1;
  });
  
  // Data rows
  let totalHours = 0;
  let totalKm = 0;
  let totalExpenses = 0;
  let totalSessions = 0;
  
  Object.values(summaries).forEach(sum => {
    const avgHours = sum.sessions > 0 ? sum.hours / sum.sessions : 0;
    
    data.push([
      sum.name,
      sum.hours.toFixed(1),
      sum.km,
      sum.expenses,
      sum.sessions,
      avgHours.toFixed(1)
    ]);
    
    totalHours += sum.hours;
    totalKm += sum.km;
    totalExpenses += sum.expenses;
    totalSessions += sum.sessions;
  });
  
  // Summary row
  data.push([]); // Empty row
  const avgTotal = totalSessions > 0 ? totalHours / totalSessions : 0;
  data.push([
    'סה״כ',
    totalHours.toFixed(1),
    totalKm,
    totalExpenses,
    totalSessions,
    avgTotal.toFixed(1)
  ]);
  
  // Create sheet
  const ws = XLSX.utils.aoa_to_sheet(data);
  
  // Set column widths
  ws['!cols'] = [
    { wch: 20 }, // שם
    { wch: 12 }, // שעות
    { wch: 12 }, // ק״מ
    { wch: 12 }, // הוצאות
    { wch: 15 }, // מפגשים
    { wch: 15 }  // ממוצע
  ];
  
  return ws;
}

/**
 * Get Hebrew month name from YYYY-MM format
 */
function getHebrewMonthName(monthStr) {
  const months = {
    '01': 'ינואר', '02': 'פברואר', '03': 'מרץ',
    '04': 'אפריל', '05': 'מאי', '06': 'יוני',
    '07': 'יולי', '08': 'אוגוסט', '09': 'ספטמבר',
    '10': 'אוקטובר', '11': 'נובמבר', '12': 'דצמבר'
  };
  
  const [year, month] = monthStr.split('-');
  return `${months[month]} ${year}`;
}

/**
 * Quick export - just approval status (faster)
 */
async function exportApprovalStatusOnly() {
  try {
    showAlert('מכין קובץ...', 'info');

    const team = localStorage.getItem('team');
    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthName = getHebrewMonthName(currentMonth);

    const records = typeof teamRecordsCache !== 'undefined' ? teamRecordsCache : [];
    const approvalEmployees = calculateApprovalDataFromRecords(records);

    if (approvalEmployees.length === 0) {
      showAlert('אין נתוני אישורים לייצוא', 'error');
      return;
    }

    const wb = XLSX.utils.book_new();
    const ws = createApprovalSheet(approvalEmployees, monthName);
    XLSX.utils.book_append_sheet(wb, ws, 'סטטוס אישורים');

    const filename = `סטטוס_אישורים_${team}_${monthName}.xlsx`;
    XLSX.writeFile(wb, filename);

    showAlert('הקובץ הורד בהצלחה!', 'success');

  } catch (error) {
    console.error('Excel export error:', error);
    showAlert('שגיאה ביצירת קובץ', 'error');
  }
}
