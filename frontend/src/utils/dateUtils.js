/**
 * Date utilities for the Attendance Portal
 */

// Format date to YYYY-MM-DD
export const formatDateString = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const month = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  const year = d.getFullYear();
  return [year, month, day].join('-');
};

// Format date for readable display (e.g., "June 19, 2026")
export const formatReadableDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Format date for short readable display (e.g., "19 Jun 2026")
export const formatShortDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

// Convert YYYY-MM-DD or Date object to Day Name (e.g., "Monday")
export const getDayName = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { weekday: 'long' });
};

// Get the dates of the current week (Monday to Saturday) based on a pivot date
export const getWeekDays = (pivotDate = new Date()) => {
  const current = new Date(pivotDate);
  const day = current.getDay();
  // Adjust to Monday (1 = Monday, 0 = Sunday, etc.)
  const diff = current.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(current.setDate(diff));
  
  const week = [];
  for (let i = 0; i < 6; i++) {
    const nextDay = new Date(monday);
    nextDay.setDate(monday.getDate() + i);
    week.push(nextDay);
  }
  return week;
};

// Get start and end dates of a week containing pivotDate
export const getWeekRangeString = (pivotDate = new Date(), showSaturday = true) => {
  const week = getWeekDays(pivotDate);
  const start = week[0];
  const end = showSaturday ? week[5] : week[4]; // Saturday or Friday
  return `${formatShortDate(start)} - ${formatShortDate(end)}`;
};

// Get the days of a month grouped by weeks for calendar view
export const getMonthDays = (pivotDate = new Date()) => {
  const year = pivotDate.getFullYear();
  const month = pivotDate.getMonth();
  
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  
  const daysInMonth = lastDayOfMonth.getDate();
  const startDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  const calendarDays = [];
  
  // Backfill previous month days to align with Monday start (1=Monday...7=Sunday)
  // Shift Sunday (0) to 7
  const startOffset = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;
  
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startOffset - 1; i >= 0; i--) {
    calendarDays.push({
      date: new Date(year, month - 1, prevMonthLastDay - i),
      isCurrentMonth: false,
      key: `prev-${prevMonthLastDay - i}`
    });
  }
  
  // Add current month days
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push({
      date: new Date(year, month, i),
      isCurrentMonth: true,
      key: `curr-${i}`
    });
  }
  
  // Forward fill next month days to complete grid (usually 42 boxes)
  const remaining = 42 - calendarDays.length;
  for (let i = 1; i <= remaining; i++) {
    calendarDays.push({
      date: new Date(year, month + 1, i),
      isCurrentMonth: false,
      key: `next-${i}`
    });
  }
  
  return calendarDays;
};
