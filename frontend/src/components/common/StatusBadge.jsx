import React from 'react';
import { STATUS_COLORS, STATUS_LABELS } from '../../utils/constants';

const StatusBadge = ({ status }) => {
  const normStatus = status?.toUpperCase() === 'PRESENT' ? 'P' : (status?.toUpperCase() === 'ABSENT' ? 'A' : status);
  const config = STATUS_COLORS[normStatus] || {
    bg: 'bg-slate-100 dark:bg-slate-800',
    text: 'text-slate-600 dark:text-slate-400',
    border: 'border-slate-200 dark:border-slate-700'
  };

  const label = STATUS_LABELS[normStatus] || status || 'Unknown';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border}`}>
      {label}
    </span>
  );
};

export default StatusBadge;
