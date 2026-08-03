import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PageHeader from '../../components/common/PageHeader';
import Loader from '../../components/common/Loader';
import odListService from '../../services/odListService';
import { 
  Search, 
  UserPlus, 
  Trash2, 
  X, 
  UserCheck, 
  AlertCircle, 
  CheckCircle,
  Plus,
  CheckSquare,
  Square
} from 'lucide-react';

const ManageODList = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Table Multi-select state (Student IDs selected for deletion)
  const [selectedODStudentIds, setSelectedODStudentIds] = useState([]);

  // Modal Search state & Multi-select state (Student IDs selected for adding)
  const [modalSearchQuery, setModalSearchQuery] = useState('');
  const [selectedModalStudentIds, setSelectedModalStudentIds] = useState([]);

  const [actionMessage, setActionMessage] = useState({ type: '', text: '' });

  // 1. Fetch Complete OD List for Representative's Class
  const odListQuery = useQuery({
    queryKey: ['odList'],
    queryFn: () => odListService.getODList(),
  });

  // 2. Fetch Class Students for Add Modal
  const classStudentsQuery = useQuery({
    queryKey: ['classStudentsSearch', modalSearchQuery],
    queryFn: () => odListService.searchClassStudents(modalSearchQuery),
    enabled: isAddModalOpen,
  });

  // 3. Single Add Mutation
  const addStudentMutation = useMutation({
    mutationFn: (studentId) => odListService.addStudentToODList(studentId),
    onSuccess: () => {
      queryClient.invalidateQueries(['odList']);
      setActionMessage({ type: 'success', text: 'Student added to OD list successfully!' });
      setTimeout(() => setActionMessage({ type: '', text: '' }), 3000);
    },
    onError: (err) => {
      const errorMsg = err.response?.data?.detail || 'Failed to add student to OD list.';
      setActionMessage({ type: 'error', text: errorMsg });
    }
  });

  // 4. Bulk Add Mutation
  const bulkAddMutation = useMutation({
    mutationFn: (studentIds) => odListService.bulkAddStudents(studentIds),
    onSuccess: (data) => {
      queryClient.invalidateQueries(['odList']);
      setSelectedModalStudentIds([]);
      setActionMessage({ type: 'success', text: data.message || 'Students added successfully!' });
      setTimeout(() => setActionMessage({ type: '', text: '' }), 3000);
    },
    onError: (err) => {
      const errorMsg = err.response?.data?.detail || 'Failed to add students to OD list.';
      setActionMessage({ type: 'error', text: errorMsg });
    }
  });

  // 5. Single Remove Mutation
  const removeStudentMutation = useMutation({
    mutationFn: (studentId) => odListService.removeStudentFromODList(studentId),
    onSuccess: () => {
      queryClient.invalidateQueries(['odList']);
      setSelectedODStudentIds(prev => prev.filter(id => id !== removeStudentMutation.variables));
      setActionMessage({ type: 'success', text: 'Student removed from OD list successfully!' });
      setTimeout(() => setActionMessage({ type: '', text: '' }), 3000);
    },
    onError: (err) => {
      const errorMsg = err.response?.data?.detail || 'Failed to remove student from OD list.';
      setActionMessage({ type: 'error', text: errorMsg });
    }
  });

  // 6. Bulk Remove Mutation
  const bulkRemoveMutation = useMutation({
    mutationFn: (studentIds) => odListService.bulkRemoveStudents(studentIds),
    onSuccess: (data) => {
      queryClient.invalidateQueries(['odList']);
      setSelectedODStudentIds([]);
      setActionMessage({ type: 'success', text: data.message || 'Students removed successfully!' });
      setTimeout(() => setActionMessage({ type: '', text: '' }), 3000);
    },
    onError: (err) => {
      const errorMsg = err.response?.data?.detail || 'Failed to remove students from OD list.';
      setActionMessage({ type: 'error', text: errorMsg });
    }
  });

  const odStudents = odListQuery.data || [];
  const classStudents = classStudentsQuery.data || [];

  // Client-side filter for OD table search
  const filteredODStudents = odStudents.filter(student => 
    student.register_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.student_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Table selection logic
  const isAllODSelected = filteredODStudents.length > 0 && filteredODStudents.every(s => selectedODStudentIds.includes(s.student_id));
  
  const handleToggleSelectAllOD = () => {
    if (isAllODSelected) {
      const filteredIds = new Set(filteredODStudents.map(s => s.student_id));
      setSelectedODStudentIds(prev => prev.filter(id => !filteredIds.has(id)));
    } else {
      const allFilteredIds = filteredODStudents.map(s => s.student_id);
      setSelectedODStudentIds(prev => Array.from(new Set([...prev, ...allFilteredIds])));
    }
  };

  const handleToggleODStudent = (studentId) => {
    setSelectedODStudentIds(prev => 
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleBulkRemove = () => {
    if (selectedODStudentIds.length === 0) return;
    if (window.confirm(`Are you sure you want to remove ${selectedODStudentIds.length} selected student(s) from the OD list?`)) {
      setActionMessage({ type: '', text: '' });
      bulkRemoveMutation.mutate(selectedODStudentIds);
    }
  };

  // Modal selection logic
  const addableClassStudents = classStudents.filter(student => !odStudents.some(s => s.student_id === student.student_id));
  const isAllModalSelected = addableClassStudents.length > 0 && addableClassStudents.every(s => selectedModalStudentIds.includes(s.student_id));

  const handleToggleSelectAllModal = () => {
    if (isAllModalSelected) {
      const addableIds = new Set(addableClassStudents.map(s => s.student_id));
      setSelectedModalStudentIds(prev => prev.filter(id => !addableIds.has(id)));
    } else {
      const allAddableIds = addableClassStudents.map(s => s.student_id);
      setSelectedModalStudentIds(prev => Array.from(new Set([...prev, ...allAddableIds])));
    }
  };

  const handleToggleModalStudent = (studentId) => {
    setSelectedModalStudentIds(prev => 
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleBulkAdd = () => {
    if (selectedModalStudentIds.length === 0) return;
    setActionMessage({ type: '', text: '' });
    bulkAddMutation.mutate(selectedModalStudentIds);
  };

  const handleOpenModal = () => {
    setModalSearchQuery('');
    setSelectedModalStudentIds([]);
    setActionMessage({ type: '', text: '' });
    setIsAddModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
  };

  const handleAddStudent = (studentId) => {
    setActionMessage({ type: '', text: '' });
    addStudentMutation.mutate(studentId);
  };

  const handleRemoveStudent = (studentId, studentName) => {
    if (window.confirm(`Are you sure you want to remove ${studentName} from the OD list?`)) {
      setActionMessage({ type: '', text: '' });
      removeStudentMutation.mutate(studentId);
    }
  };

  if (odListQuery.isLoading) {
    return <Loader message="Loading OD list..." size="large" />;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Header */}
      <PageHeader
        title="OD List Management"
        description="Manage the On Duty (OD) roster for your class to automate attendance marking."
      />

      {/* Action Notification Banner */}
      {actionMessage.text && (
        <div className={`p-4 rounded-2xl flex items-center justify-between text-xs font-semibold shadow-sm transition-all animate-fade-in ${
          actionMessage.type === 'success'
            ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
            : 'bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400'
        }`}>
          <div className="flex items-center gap-2">
            {actionMessage.type === 'success' ? (
              <CheckCircle className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{actionMessage.text}</span>
          </div>
          <button 
            onClick={() => setActionMessage({ type: '', text: '' })}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Controls Bar: Search & Add Button */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        
        {/* Search Bar */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Register Number or Student Name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:border-brand-primary text-slate-800 dark:text-slate-100 placeholder-slate-400 shadow-sm"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={handleOpenModal}
            className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md hover:shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Student(s)</span>
          </button>
        </div>
      </div>

      {/* Bulk Selection Action Bar for Table */}
      {selectedODStudentIds.length > 0 && (
        <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex flex-wrap items-center justify-between gap-3 animate-fade-in shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 dark:text-indigo-300">
            <CheckSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>{selectedODStudentIds.length} student(s) selected</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkRemove}
              disabled={bulkRemoveMutation.isPending}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove Selected ({selectedODStudentIds.length})</span>
            </button>
            <button
              onClick={() => setSelectedODStudentIds([])}
              className="px-3 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-xs hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* OD List Table */}
      <div className="glass-panel border border-slate-200/80 dark:border-slate-800/80 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-indigo-500" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Active OD Roster
            </span>
          </div>
          <span className="text-[11px] font-semibold text-slate-400 bg-slate-200/50 dark:bg-slate-800 px-2.5 py-1 rounded-full">
            {filteredODStudents.length} {filteredODStudents.length === 1 ? 'Student' : 'Students'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-900/20">
                <th className="py-3.5 px-4 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={isAllODSelected}
                    onChange={handleToggleSelectAllOD}
                    disabled={filteredODStudents.length === 0}
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    title="Select All"
                  />
                </th>
                <th className="py-3.5 px-6 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Register Number
                </th>
                <th className="py-3.5 px-6 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Student Name
                </th>
                <th className="py-3.5 px-6 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredODStudents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 px-6 text-center text-slate-400 text-xs font-medium">
                    {searchTerm ? 'No students found matching your search.' : 'No students currently in the OD list.'}
                  </td>
                </tr>
              ) : (
                filteredODStudents.map((student) => {
                  const isSelected = selectedODStudentIds.includes(student.student_id);

                  return (
                    <tr 
                      key={student.student_id}
                      className={`border-b last:border-0 border-slate-100 dark:border-slate-800/50 transition-colors ${
                        isSelected ? 'bg-indigo-500/5 dark:bg-indigo-500/10' : 'hover:bg-slate-50/30 dark:hover:bg-slate-900/10'
                      }`}
                    >
                      <td className="py-4 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleODStudent(student.student_id)}
                          className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                      </td>
                      <td className="py-4 px-6 font-display font-semibold text-xs text-slate-950 dark:text-white">
                        {student.register_no}
                      </td>
                      <td className="py-4 px-6 font-medium text-xs text-slate-700 dark:text-slate-300">
                        {student.student_name}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handleRemoveStudent(student.student_id, student.student_name)}
                          disabled={removeStudentMutation.isPending}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20 transition-all cursor-pointer"
                          title="Remove from OD list"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Student Dialog Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl space-y-4 p-6 flex flex-col max-h-[85vh]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm text-slate-950 dark:text-white">
                    Add Student(s) to OD List
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Search and select multiple students from your class roster.
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative shrink-0">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by Register Number or Student Name"
                value={modalSearchQuery}
                onChange={(e) => setModalSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-100"
                autoFocus
              />
            </div>

            {/* Multi-select Header / Controls in Modal */}
            {addableClassStudents.length > 0 && (
              <div className="flex items-center justify-between px-2 py-1 text-xs shrink-0">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-300 font-semibold select-none">
                  <input
                    type="checkbox"
                    checked={isAllModalSelected}
                    onChange={handleToggleSelectAllModal}
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <span>Select All Available ({addableClassStudents.length})</span>
                </label>

                {selectedModalStudentIds.length > 0 && (
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                    {selectedModalStudentIds.length} selected
                  </span>
                )}
              </div>
            )}

            {/* Class Students Roster List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200/60 dark:border-slate-800 rounded-2xl">
              {classStudentsQuery.isLoading ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  Loading class roster...
                </div>
              ) : classStudents.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  No matching students found in class.
                </div>
              ) : (
                classStudents.map((student) => {
                  const isInODList = odStudents.some(s => s.student_id === student.student_id);
                  const isChecked = selectedModalStudentIds.includes(student.student_id);

                  return (
                    <div 
                      key={student.student_id}
                      className={`p-3 flex items-center justify-between transition-colors ${
                        isInODList 
                          ? 'opacity-60 bg-slate-50/50 dark:bg-slate-900/30' 
                          : isChecked 
                            ? 'bg-indigo-500/10 dark:bg-indigo-500/15'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-850/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {!isInODList && (
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleModalStudent(student.student_id)}
                            className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          />
                        )}
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 block tracking-wider uppercase">
                            {student.register_no}
                          </span>
                          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                            {student.student_name}
                          </span>
                        </div>
                      </div>

                      {isInODList ? (
                        <span className="px-3 py-1 rounded-xl text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          Already Added
                        </span>
                      ) : (
                        <button
                          onClick={() => handleAddStudent(student.student_id)}
                          disabled={addStudentMutation.isPending}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-sm flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add</span>
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-2 shrink-0 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={handleCloseModal}
                className="px-5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 transition-colors"
              >
                Close
              </button>

              {selectedModalStudentIds.length > 0 && (
                <button
                  onClick={handleBulkAdd}
                  disabled={bulkAddMutation.isPending}
                  className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Selected ({selectedModalStudentIds.length})</span>
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default ManageODList;
