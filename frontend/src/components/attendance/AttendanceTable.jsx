import React from 'react';
import StatusBadge from '../common/StatusBadge';

const AttendanceTable = ({ 
  students = [], 
  mode = 'view', // 'view' | 'mark' | 'edit'
  onChange, // Callback when status changes (studentId, status, odReason)
  onMarkAllPresent,
  onReset
}) => {

  const handleStatusChange = (studentId, newStatus) => {
    const student = students.find(s => s.student_id === studentId);
    onChange?.(studentId, newStatus, newStatus === 'OD' ? (student?.od_reason || 'On Duty') : null);
  };

  const handleReasonChange = (studentId, reason) => {
    const student = students.find(s => s.student_id === studentId);
    onChange?.(studentId, student?.status || 'OD', reason);
  };

  return (
    <div className="glass-panel border rounded-3xl shadow-sm overflow-hidden animate-fade-in">
      
      {/* Bulk action headers */}
      {mode !== 'view' && (
        <div className="p-4 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 flex flex-wrap gap-3 items-center justify-between">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Roster: <span className="font-bold text-slate-800 dark:text-slate-200">{students.length}</span> students
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onMarkAllPresent}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-500 text-white hover:bg-emerald-600 transition-colors shadow-sm"
            >
              Mark All Present
            </button>
            <button
              type="button"
              onClick={onReset}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      )}

      {/* Desktop Table View - Hidden on Mobile */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-900/20">
              <th className="py-4 px-6 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Roll No / Register No
              </th>
              <th className="py-4 px-6 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Student Name
              </th>
              <th className="py-4 px-6 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-center w-60">
                Attendance Status
              </th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-8 px-6 text-center text-slate-400 text-sm font-medium">
                  No student records loaded.
                </td>
              </tr>
            ) : (
              students.map((student) => (
                <tr 
                  key={student.student_id} 
                  className="border-b last:border-0 border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/30 dark:hover:bg-slate-900/10 transition-colors"
                >
                  <td className="py-4 px-6 font-display font-semibold text-sm text-slate-950 dark:text-white">
                    {student.register_no}
                  </td>
                  <td className="py-4 px-6 font-medium text-sm text-slate-700 dark:text-slate-300">
                    {student.student_name}
                  </td>
                  <td className="py-3 px-6">
                    {mode === 'view' ? (
                      <div className="flex flex-col items-center justify-center gap-1">
                        <StatusBadge status={student.status} />
                        {student.status === 'OD' && student.od_reason && (
                          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold tracking-wide">
                            Reason: {student.od_reason}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2 max-w-xs mx-auto">
                        <div className="flex rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-100/50 dark:bg-slate-800/40">
                          {/* Present Button */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.student_id, 'P')}
                            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                              student.status === 'P'
                                ? 'bg-emerald-500 text-white shadow-sm'
                                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                            }`}
                          >
                            P
                          </button>
                          
                          {/* Absent Button */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.student_id, 'A')}
                            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                              student.status === 'A'
                                ? 'bg-rose-500 text-white shadow-sm'
                                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                            }`}
                          >
                            A
                          </button>

                          {/* OD Button */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.student_id, 'OD')}
                            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                              student.status === 'OD'
                                ? 'bg-amber-500 text-white shadow-sm'
                                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                            }`}
                          >
                            OD
                          </button>
                        </div>

                        {/* OD Reason text field */}
                        {student.status === 'OD' && (
                          <input
                            type="text"
                            placeholder="OD Reason (required)"
                            value={student.od_reason || ''}
                            onChange={(e) => handleReasonChange(student.student_id, e.target.value)}
                            className="px-3 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-amber-500 dark:focus:border-amber-500 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                            required
                          />
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile List View - No Horizontal Scroll */}
      <div className="lg:hidden divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
        {students.length === 0 ? (
          <div className="py-8 px-6 text-center text-slate-400 text-sm font-medium">
            No student records loaded.
          </div>
        ) : (
          students.map((student) => (
            <div key={student.student_id} className="p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase mb-0.5">
                    {student.register_no}
                  </p>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                    {student.student_name}
                  </h4>
                </div>

                <div className="shrink-0">
                  {mode === 'view' ? (
                    <div className="flex flex-col items-end gap-1">
                      <StatusBadge status={student.status} />
                    </div>
                  ) : (
                    <div className="flex rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-100/50 dark:bg-slate-800/40 w-36">
                      {/* Present Button */}
                      <button
                        type="button"
                        onClick={() => handleStatusChange(student.student_id, 'P')}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all border-0 cursor-pointer ${
                          student.status === 'P'
                            ? 'bg-emerald-500 text-white shadow-sm'
                            : 'text-slate-505 hover:text-slate-800 dark:text-slate-400'
                        }`}
                      >
                        P
                      </button>
                      
                      {/* Absent Button */}
                      <button
                        type="button"
                        onClick={() => handleStatusChange(student.student_id, 'A')}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all border-0 cursor-pointer ${
                          student.status === 'A'
                            ? 'bg-rose-500 text-white shadow-sm'
                            : 'text-slate-550 hover:text-slate-800 dark:text-slate-400'
                        }`}
                      >
                        A
                      </button>

                      {/* OD Button */}
                      <button
                        type="button"
                        onClick={() => handleStatusChange(student.student_id, 'OD')}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all border-0 cursor-pointer ${
                          student.status === 'OD'
                            ? 'bg-amber-500 text-white shadow-sm'
                            : 'text-slate-550 hover:text-slate-800 dark:text-slate-400'
                        }`}
                      >
                        OD
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* OD Reason text field or static status subtext */}
              {student.status === 'OD' && (
                <div className="mt-1">
                  {mode === 'view' ? (
                    student.od_reason && (
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold bg-amber-500/5 px-2.5 py-1 rounded-lg border border-amber-500/10">
                        Reason: {student.od_reason}
                      </span>
                    )
                  ) : (
                    <input
                      type="text"
                      placeholder="OD Reason (required)"
                      value={student.od_reason || ''}
                      onChange={(e) => handleReasonChange(student.student_id, e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-amber-500 dark:focus:border-amber-500 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                      required
                    />
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

    </div>
  );
};

export default AttendanceTable;
