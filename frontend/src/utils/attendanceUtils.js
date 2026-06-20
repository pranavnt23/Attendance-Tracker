/**
 * Attendance utilities for the Attendance Portal
 */

// Calculate attendance percentage safely
export const calculatePercentage = (present, conducted) => {
  if (!conducted || conducted === 0) return 100.0;
  return parseFloat(((present / conducted) * 100).toFixed(2));
};

// Check if a percentage falls below a specific threshold (shortage warning)
export const getShortageCategory = (percentage) => {
  if (percentage < 50.0) return 'critical'; // Below 50%
  if (percentage < 65.0) return 'warning';  // Below 65%
  if (percentage < 75.0) return 'caution';  // Below 75%
  return 'good';                            // 75% and above
};

// Helper to check if student is in shortage criteria
export const isInShortage = (percentage, threshold = 75.0) => {
  return percentage < threshold;
};

// Get stats summary from a list of attendance records
export const getAttendanceSummaryFromRecords = (records = []) => {
  const conducted = records.length;
  const present = records.filter(r => r.status === 'P').length;
  const absent = records.filter(r => r.status === 'A').length;
  const od = records.filter(r => r.status === 'OD').length;
  const percentage = calculatePercentage(present, conducted);

  return {
    conducted,
    present,
    absent,
    od,
    percentage
  };
};
