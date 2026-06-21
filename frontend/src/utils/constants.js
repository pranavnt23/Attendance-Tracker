export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'; // FastAPI default port

export const ATTENDANCE_STATUS = {
  PRESENT: 'P',
  ABSENT: 'A',
  OD: 'OD'
};

export const STATUS_LABELS = {
  [ATTENDANCE_STATUS.PRESENT]: 'Present',
  [ATTENDANCE_STATUS.ABSENT]: 'Absent',
  [ATTENDANCE_STATUS.OD]: 'Official Duty'
};

export const STATUS_COLORS = {
  [ATTENDANCE_STATUS.PRESENT]: {
    bg: 'bg-emerald-500/15 dark:bg-emerald-500/10',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-500/30 dark:border-emerald-500/20',
    accent: 'emerald'
  },
  [ATTENDANCE_STATUS.ABSENT]: {
    bg: 'bg-rose-500/15 dark:bg-rose-500/10',
    text: 'text-rose-600 dark:text-rose-400',
    border: 'border-rose-500/30 dark:border-rose-500/20',
    accent: 'rose'
  },
  [ATTENDANCE_STATUS.OD]: {
    bg: 'bg-amber-500/15 dark:bg-amber-500/10',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-500/30 dark:border-amber-500/20',
    accent: 'amber'
  }
};

export const ROLES = {
  STUDENT: 'student',
  REP: 'attendance_rep'
};
