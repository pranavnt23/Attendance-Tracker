import React, { useState } from 'react';
import { Search, UserMinus } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import { useDialog } from '../../context/DialogContext';

const AttendanceTable = ({ 
  students = [], 
  mode = 'view', // 'view' | 'mark' | 'edit'
  onChange, // Callback when status changes (studentId, status, odReason)
  onMarkAllPresent,
  onReset
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [bulkInput, setBulkInput] = useState('');
  const { toast } = useDialog();

  const handleStatusChange = (studentId, newStatus) => {
    const student = students.find(s => s.student_id === studentId);
    onChange?.(studentId, newStatus, newStatus === 'OD' ? (student?.od_reason || 'On Duty') : null);
  };

  const handleReasonChange = (studentId, reason) => {
    const student = students.find(s => s.student_id === studentId);
    onChange?.(studentId, student?.status || 'OD', reason);
  };

  const handleApplyBulkAbsentees = () => {
    if (!bulkInput.trim()) return;

    const tokens = bulkInput
      .split(/[\s,;\n]+/)
      .map(t => t.trim().toLowerCase())
      .filter(t => t.length > 0);

    if (tokens.length === 0) return;

    let matchCount = 0;
    const absenteesIds = [];
    const restIds = [];

    students.forEach(student => {
      const regNoLower = student.register_no.toLowerCase();
      const isMatched = tokens.some(token => 
        regNoLower === token || 
        regNoLower.endsWith(token)
      );

      if (isMatched) {
        absenteesIds.push(student.student_id);
        matchCount++;
      } else {
        restIds.push(student.student_id);
      }
    });

    if (matchCount === 0) {
      toast('No students matched the entered Roll/Register numbers. Please check your input.', 'warning');
      return;
    }

    // Apply absentees: mark matched as 'A'
    absenteesIds.forEach(id => {
      onChange?.(id, 'A', null);
    });

    // Mark rest as 'P' if they were 'A'
    restIds.forEach(id => {
      const student = students.find(s => s.student_id === id);
      if (student && student.status === 'A') {
        onChange?.(id, 'P', null);
      }
    });

    setBulkInput('');
    toast(`Successfully marked ${matchCount} student(s) as Absent. All others set as Present.`, 'success');
  };

  const handleBulkKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleApplyBulkAbsentees();
    }
  };

  const filteredStudents = students.filter(student => 
    student.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.register_no.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="glass-panel border rounded-3xl shadow-sm overflow-hidden animate-fade-in">
      
      {/* Search & Bulk entry header block */}
      <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-205 dark:border-slate-805 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-450 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Search student name or register number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 hover:bg-slate-100/50 focus:bg-white dark:bg-slate-800 dark:hover:bg-slate-800/80 dark:focus:bg-slate-850 border border-slate-250 dark:border-slate-750 focus:border-indigo-500 dark:focus:border-indigo-500 rounded-xl focus:outline-none text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500"
          />
        </div>

        {/* Bulk entry input - show only in mark/edit modes */}
        {mode !== 'view' && (
          <div className="flex gap-2 items-center">
            <div className="relative flex-1">
              <UserMinus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-455 dark:text-slate-500" />
              <input
                type="text"
                placeholder="Bulk mark absent: e.g. 5, 12, 18, 42"
                value={bulkInput}
                onChange={(e) => setBulkInput(e.target.value)}
                onKeyDown={handleBulkKeyDown}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 hover:bg-slate-100/50 focus:bg-white dark:bg-slate-800 dark:hover:bg-slate-800/80 dark:focus:bg-slate-850 border border-slate-250 dark:border-slate-750 focus:border-indigo-500 dark:focus:border-indigo-500 rounded-xl focus:outline-none text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500"
              />
            </div>
            <button
              type="button"
              onClick={handleApplyBulkAbsentees}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-sm shrink-0 border-0"
            >
              Apply
            </button>
          </div>
        )}
      </div>
      
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
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-8 px-6 text-center text-slate-400 text-sm font-medium">
                  {students.length === 0 ? "No student records loaded." : "No student records match your search."}
                </td>
              </tr>
            ) : (
              filteredStudents.map((student) => (
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
        {filteredStudents.length === 0 ? (
          <div className="py-8 px-6 text-center text-slate-400 text-sm font-medium">
            {students.length === 0 ? "No student records loaded." : "No student records match your search."}
          </div>
        ) : (
          filteredStudents.map((student) => (
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
