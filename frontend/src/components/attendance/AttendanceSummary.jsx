import React from 'react';

const AttendanceSummary = ({ subjectWiseRecords = [] }) => {
  return (
    <div className="glass-panel border rounded-3xl shadow-sm overflow-hidden animate-fade-in">
      <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-900/20">
        <h3 className="text-md font-display font-bold text-slate-900 dark:text-white">
          Subject-Wise Attendance Summary
        </h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/10 dark:bg-slate-900/10 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-6">Subject Code</th>
              <th className="py-3.5 px-6">Subject Name</th>
              <th className="py-3.5 px-6 text-center">Conducted</th>
              <th className="py-3.5 px-6 text-center text-emerald-600 dark:text-emerald-400">Present</th>
              <th className="py-3.5 px-6 text-center text-rose-600 dark:text-rose-400">Absent</th>
              <th className="py-3.5 px-6 text-center text-amber-600 dark:text-amber-400">OD</th>
              <th className="py-3.5 px-6 text-right">OD as Present</th>
              <th className="py-3.5 px-6 text-right">OD as Absent</th>
            </tr>
          </thead>
          <tbody>
            {subjectWiseRecords.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 px-6 text-center text-slate-400 text-sm font-medium">
                  No subject records found.
                </td>
              </tr>
            ) : (
              subjectWiseRecords.map((item) => {
                const isShortage = item.attendance_percentage < 75;
                const isCritical = item.attendance_percentage < 50;

                const isShortageOD = item.attendance_percentage_od < 75;
                const isCriticalOD = item.attendance_percentage_od < 50;

                return (
                  <tr 
                    key={item.subject_id}
                    className="border-b last:border-0 border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/30 dark:hover:bg-slate-900/10 transition-colors"
                  >
                    <td className="py-4 px-6 font-display font-semibold text-slate-500 dark:text-slate-400">
                      {item.subject_code}
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[220px]">
                      {item.subject_name}
                    </td>
                    <td className="py-4 px-6 text-center font-bold text-slate-600 dark:text-slate-400">
                      {item.conducted_hours} hrs
                    </td>
                    <td className="py-4 px-6 text-center font-bold text-emerald-600 dark:text-emerald-400">
                      {item.present_hours} hrs
                    </td>
                    <td className="py-4 px-6 text-center font-bold text-rose-600 dark:text-rose-400">
                      {item.absent_hours} hrs
                    </td>
                    <td className="py-4 px-6 text-center font-bold text-amber-600 dark:text-amber-400">
                      {item.od_hours} hrs
                    </td>
                    <td className="py-4 px-6 text-right font-display">
                      <span className={`font-extrabold text-md px-2 py-0.5 rounded-lg border ${
                        isCriticalOD
                          ? 'text-rose-600 dark:text-rose-400 border-rose-200/50 bg-rose-500/5'
                          : isShortageOD
                            ? 'text-amber-600 dark:text-amber-400 border-amber-200/50 bg-amber-500/5'
                            : 'text-emerald-600 dark:text-emerald-400 border-emerald-200/50 bg-emerald-500/5'
                      }`}>
                        {item.attendance_percentage_od}%
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right font-display">
                      <span className={`font-extrabold text-md px-2 py-0.5 rounded-lg border ${
                        isCritical
                          ? 'text-rose-600 dark:text-rose-400 border-rose-200/50 bg-rose-500/5'
                          : isShortage
                            ? 'text-amber-600 dark:text-amber-400 border-amber-200/50 bg-amber-500/5'
                            : 'text-emerald-600 dark:text-emerald-400 border-emerald-200/50 bg-emerald-500/5'
                      }`}>
                        {item.attendance_percentage}%
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceSummary;
