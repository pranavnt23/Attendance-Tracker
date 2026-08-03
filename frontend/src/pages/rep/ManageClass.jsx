import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PageHeader from '../../components/common/PageHeader';
import Loader from '../../components/common/Loader';
import { useAuth } from '../../hooks/useAuth';
import studentService from '../../services/studentService';
import InputField from '../../components/common/InputField';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Tabs from '../../components/common/Tabs';
import { useDialog } from '../../context/DialogContext';
import { 
  Users, 
  UserPlus, 
  Trash2, 
  ShieldAlert, 
  UserCheck, 
  Plus, 
  Upload, 
  X, 
  GraduationCap, 
  Briefcase,
  AlertCircle,
  ShieldCheck,
  Search
} from 'lucide-react';

const RepManageClass = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { alert, confirm } = useDialog();
  const [activeTab, setActiveTab] = useState('students'); // 'students' | 'staff'

  // Student Search & Modal states
  const [studentSearch, setStudentSearch] = useState('');
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showBulkAddStudent, setShowBulkAddStudent] = useState(false);

  // Staff Search & Modal states
  const [staffSearch, setStaffSearch] = useState('');
  const [showAddStaff, setShowAddStaff] = useState(false);

  // Form states for Single Student
  const [newStudent, setNewStudent] = useState({
    register_no: '',
    student_name: '',
    email: '',
    password: '',
    role: 'student'
  });

  // Form states for Bulk Student
  const [bulkStudentText, setBulkStudentText] = useState('');
  const [bulkError, setBulkError] = useState('');

  // Form states for Single Staff
  const [newStaff, setNewStaff] = useState({
    staff_code: '',
    staff_name: '',
    email: ''
  });

  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // 1. Fetch Students
  const studentsQuery = useQuery({
    queryKey: ['students', 'class', user?.class_id],
    queryFn: () => studentService.getClassStudents(user.class_id),
    enabled: !!user?.class_id,
  });

  // 2. Fetch Staff List
  const staffQuery = useQuery({
    queryKey: ['staff'],
    queryFn: studentService.getStaffList,
  });

  const isLoading = studentsQuery.isLoading || staffQuery.isLoading;

  // Query Invalidation
  const invalidateStudents = () => queryClient.invalidateQueries({ queryKey: ['students', 'class', user?.class_id] });
  const invalidateStaff = () => queryClient.invalidateQueries({ queryKey: ['staff'] });

  // Promote / Demote Student mutation
  const toggleRoleMutation = useMutation({
    mutationFn: ({ studentId, newRole }) => studentService.updateStudentRole(studentId, newRole),
    onSuccess: () => {
      invalidateStudents();
      showNotification('Student role updated successfully!');
    },
    onError: (err) => {
      showNotification(err.response?.data?.detail || 'Failed to update student role.', true);
    }
  });

  // Delete Student mutation
  const deleteStudentMutation = useMutation({
    mutationFn: (studentId) => studentService.deleteStudent(studentId),
    onSuccess: () => {
      invalidateStudents();
      showNotification('Student account removed successfully!');
    },
    onError: (err) => {
      showNotification(err.response?.data?.detail || 'Failed to delete student.', true);
    }
  });

  // Add Student mutation
  const addStudentMutation = useMutation({
    mutationFn: (studentData) => studentService.createStudent(studentData),
    onSuccess: () => {
      invalidateStudents();
      setShowAddStudent(false);
      setNewStudent({ register_no: '', student_name: '', email: '', password: '', role: 'student' });
      showNotification('Student account created successfully!');
    },
    onError: (err) => {
      setFormError(err.response?.data?.detail || 'Failed to register student. Check if Register Number or Email already exists.');
    }
  });

  // Bulk Register Student mutation
  const bulkRegisterMutation = useMutation({
    mutationFn: (studentsList) => studentService.bulkRegisterStudents(studentsList),
    onSuccess: (data) => {
      invalidateStudents();
      setShowBulkAddStudent(false);
      setBulkStudentText('');
      setBulkError('');
      showNotification(`Registered ${data.inserted_count} student(s) successfully! ${data.skipped_count} skipped.`);
    },
    onError: (err) => {
      setBulkError(err.response?.data?.detail || 'Bulk registration failed. Ensure JSON structure and required fields are correct.');
    }
  });

  // Add Staff mutation
  const addStaffMutation = useMutation({
    mutationFn: (staffData) => studentService.createStaff(staffData),
    onSuccess: () => {
      invalidateStaff();
      setShowAddStaff(false);
      setNewStaff({ staff_code: '', staff_name: '', email: '' });
      showNotification('Staff conductor added successfully!');
    },
    onError: (err) => {
      setFormError(err.response?.data?.detail || 'Failed to create staff record. Check code/email uniqueness.');
    }
  });

  // Delete Staff mutation
  const deleteStaffMutation = useMutation({
    mutationFn: (staffId) => studentService.deleteStaff(staffId),
    onSuccess: () => {
      invalidateStaff();
      showNotification('Staff conductor deleted successfully!');
    },
    onError: (err) => {
      showNotification(err.response?.data?.detail || 'Failed to delete staff member.', true);
    }
  });

  // Notification Helper
  const showNotification = (msg, isError = false) => {
    if (isError) {
      setFormError(msg);
      setTimeout(() => setFormError(''), 5000);
    } else {
      setSuccessMessage(msg);
      setTimeout(() => setSuccessMessage(''), 5000);
    }
  };

  const handleRoleToggle = async (student) => {
    if (student.student_id === user.student_id) {
      await alert(
        'For security reasons, you cannot demote yourself. Please have another Representative perform this action.',
        { title: 'Action Restricted', variant: 'warning', confirmLabel: 'Understood' }
      );
      return;
    }
    
    const targetRole = student.role === 'student' ? 'attendance_rep' : 'student';
    const actionLabel = targetRole === 'attendance_rep' ? 'promote' : 'demote';
    
    const ok = await confirm(
      `Are you sure you want to ${actionLabel} ${student.student_name} to the ${targetRole === 'attendance_rep' ? 'Attendance Representative' : 'Student'} role?`,
      {
        title: `${actionLabel.charAt(0).toUpperCase() + actionLabel.slice(1)} Student`,
        variant: 'warning',
        confirmLabel: `Yes, ${actionLabel.charAt(0).toUpperCase() + actionLabel.slice(1)}`,
        cancelLabel: 'Cancel',
      }
    );
    if (ok) {
      toggleRoleMutation.mutate({ studentId: student.student_id, newRole: targetRole });
    }
  };

  const handleDeleteStudent = async (student) => {
    if (student.student_id === user.student_id) {
      await alert(
        'You cannot delete your own account. Please contact an administrator if needed.',
        { title: 'Action Not Allowed', variant: 'warning', confirmLabel: 'OK' }
      );
      return;
    }

    const ok = await confirm(
      `Deleting "${student.student_name}" (${student.register_no}) will permanently remove their profile and ALL linked attendance records. This action cannot be undone.`,
      {
        title: 'Delete Student Account',
        variant: 'danger',
        confirmLabel: 'Delete Permanently',
        cancelLabel: 'Cancel',
      }
    );
    if (ok) {
      deleteStudentMutation.mutate(student.student_id);
    }
  };

  const handleAddStudentSubmit = (e) => {
    e.preventDefault();
    setFormError('');
    if (!user?.class_id) return;
    
    addStudentMutation.mutate({
      ...newStudent,
      class_id: user.class_id
    });
  };

  const handleBulkAddSubmit = (e) => {
    e.preventDefault();
    setBulkError('');
    if (!user?.class_id) return;

    try {
      // Expect JSON list or comma separated
      let data = [];
      const parsedText = bulkStudentText.trim();
      
      if (parsedText.startsWith('[') && parsedText.endsWith(']')) {
        // Try parsing JSON list
        const rawJson = JSON.parse(parsedText);
        data = rawJson.map(item => ({
          register_no: String(item.register_no || ''),
          student_name: String(item.student_name || ''),
          email: String(item.email || ''),
          password: String(item.password || 'password123'),
          role: String(item.role || 'student'),
          class_id: user.class_id
        }));
      } else {
        // Try parsing CSV: register_no, student_name, email, password, role
        const lines = parsedText.split('\n');
        data = lines.map(line => {
          const parts = line.split(',').map(p => p.trim());
          if (parts.length < 3) return null;
          return {
            register_no: parts[0],
            student_name: parts[1],
            email: parts[2],
            password: parts[3] || 'password123',
            role: parts[4] || 'student',
            class_id: user.class_id
          };
        }).filter(Boolean);
      }

      if (data.length === 0) {
        setBulkError("Invalid input format. Paste valid comma-separated lines (reg_no, name, email) or a JSON array.");
        return;
      }

      bulkRegisterMutation.mutate(data);
    } catch (err) {
      setBulkError("JSON parsing failed. Ensure JSON lists use proper quotes and syntax: " + err.message);
    }
  };

  const handleAddStaffSubmit = (e) => {
    e.preventDefault();
    setFormError('');
    addStaffMutation.mutate(newStaff);
  };

  const handleDeleteStaff = async (staff) => {
    const ok = await confirm(
      `Are you sure you want to remove staff conductor "${staff.staff_name}" from this class? Their name will no longer appear in session records.`,
      {
        title: 'Remove Staff Conductor',
        variant: 'danger',
        confirmLabel: 'Remove Staff',
        cancelLabel: 'Cancel',
      }
    );
    if (ok) {
      deleteStaffMutation.mutate(staff.staff_id);
    }
  };

  const studentsList = studentsQuery.data || [];
  const staffList = staffQuery.data || [];

  const filteredStudents = studentsList.filter(s => 
    s.student_name.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.register_no.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const filteredStaff = staffList.filter(st => 
    st.staff_name.toLowerCase().includes(staffSearch.toLowerCase()) ||
    st.staff_code.toLowerCase().includes(staffSearch.toLowerCase())
  );

  if (isLoading) {
    return <Loader message="Loading class management logs..." size="large" />;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-8">
      <PageHeader 
        title="Class Administration"
        description="Add students, register staff conducting faculty, promote representatives, or manage rosters."
      />

      {/* Notifications banner */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2 max-w-2xl mx-auto animate-fade-in">
          <ShieldCheck className="w-5 h-5 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}
      {formError && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-2 max-w-2xl mx-auto animate-fade-in">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      {/* Tabs Menu */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 pb-3.5 mb-6">
        <Tabs
          options={[
            { id: 'students', label: `Students (${studentsList.length})` },
            { id: 'staff', label: `Faculty Conductor List (${staffList.length})` }
          ]}
          activeId={activeTab}
          onChange={setActiveTab}
        />
      </div>

      {/* Tab Contents: Students */}
      {activeTab === 'students' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-wrap items-center justify-between gap-4">
            
            {/* Search filter */}
            <InputField
              type="text"
              placeholder="Search name or roll no..."
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              leftIcon={Search}
              className="w-full sm:w-80 space-y-0"
              inputClassName="py-2.5 text-xs rounded-xl"
            />

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                onClick={() => setShowBulkAddStudent(true)}
                variant="outline"
                size="sm"
                leftIcon={Upload}
                className="text-xs min-h-[38px] px-3.5"
              >
                Bulk Add
              </Button>
              <Button
                onClick={() => setShowAddStudent(true)}
                variant="primary"
                size="sm"
                leftIcon={UserPlus}
                className="text-xs min-h-[38px] px-3.5"
              >
                Register Student
              </Button>
            </div>

          </div>

          {/* Student list grid layout */}
          {/* Desktop Table View */}
          <div className="hidden sm:block glass-panel border border-slate-200/60 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm overflow-x-auto">
            <table className="w-full min-w-[700px] border-collapse text-left text-xs font-medium">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-900/20 font-bold">
                  <th className="p-4 uppercase tracking-wider text-slate-400">Roll No</th>
                  <th className="p-4 uppercase tracking-wider text-slate-400">Student Name</th>
                  <th className="p-4 uppercase tracking-wider text-slate-400">Email Address</th>
                  <th className="p-4 uppercase tracking-wider text-slate-400">Role</th>
                  <th className="p-4 uppercase tracking-wider text-slate-400 text-right w-60">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400 font-semibold italic">
                      No student records match your query.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => (
                    <tr key={student.student_id} className="hover:bg-slate-50/20 dark:hover:bg-slate-900/10 transition-colors">
                      <td className="p-4 font-display font-bold text-slate-955 dark:text-white">{student.register_no}</td>
                      <td className="p-4 text-slate-700 dark:text-slate-300 font-semibold">{student.student_name}</td>
                      <td className="p-4 text-slate-500 dark:text-slate-400">{student.email}</td>
                      <td className="p-4">
                        {student.role === 'attendance_rep' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-indigo-500/15 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                            <ShieldCheck className="w-3 h-3" />
                            Representative
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                            Student
                          </span>
                        )}
                      </td>
                      <td className="p-4 flex justify-end gap-2 shrink-0">
                        {/* Promote/Demote control */}
                        <Button
                          onClick={() => handleRoleToggle(student)}
                          disabled={student.student_id === user.student_id}
                          variant={student.role === 'attendance_rep' ? 'secondary' : 'outline'}
                          size="sm"
                          leftIcon={UserCheck}
                          className="text-[10px] py-1.5 px-3 min-h-[36px]"
                          title={student.role === 'attendance_rep' ? 'Revoke representative controls' : 'Grant representative control'}
                        >
                          {student.role === 'attendance_rep' ? 'Make Student' : 'Make Rep'}
                        </Button>
 
                        {/* Delete Student */}
                        <Button
                          onClick={() => handleDeleteStudent(student)}
                          disabled={student.student_id === user.student_id}
                          variant="outline"
                          size="sm"
                          className="text-rose-500 hover:text-white hover:bg-rose-500 border-rose-500/30 hover:border-transparent p-2 min-h-[36px]"
                          title="Delete student from database"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Stacked Card View */}
          <div className="block sm:hidden space-y-4">
            {filteredStudents.length === 0 ? (
              <div className="text-center py-8 text-slate-400 font-semibold italic">
                No student records match your query.
              </div>
            ) : (
              filteredStudents.map((student) => (
                <Card 
                  key={student.student_id} 
                  className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 space-y-3 p-4"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-display font-extrabold text-slate-900 dark:text-white text-sm">
                        {student.student_name}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">{student.register_no}</p>
                    </div>
                    {student.role === 'attendance_rep' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold bg-indigo-500/15 border border-indigo-500/20 text-indigo-650 dark:text-indigo-400">
                        <ShieldCheck className="w-3 h-3" />
                        Rep
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                        Student
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 truncate">{student.email}</div>
                  <div className="flex gap-2 pt-2.5 border-t border-slate-100 dark:border-slate-850 justify-between items-center">
                    <Button
                      onClick={() => handleRoleToggle(student)}
                      disabled={student.student_id === user.student_id}
                      variant={student.role === 'attendance_rep' ? 'secondary' : 'outline'}
                      size="sm"
                      leftIcon={UserCheck}
                      className="text-[10px] py-1 px-2.5 min-h-[36px]"
                    >
                      {student.role === 'attendance_rep' ? 'Make Student' : 'Make Rep'}
                    </Button>
                    <Button
                      onClick={() => handleDeleteStudent(student)}
                      disabled={student.student_id === user.student_id}
                      variant="outline"
                      size="sm"
                      className="text-rose-500 hover:text-white hover:bg-rose-500 border-rose-500/30 hover:border-transparent p-2 min-h-[36px]"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab Contents: Faculty (Staff) */}
      {activeTab === 'staff' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-wrap items-center justify-between gap-4">
            
            {/* Search filter */}
            <InputField
              type="text"
              placeholder="Search staff name or code..."
              value={staffSearch}
              onChange={(e) => setStaffSearch(e.target.value)}
              leftIcon={Search}
              className="w-full sm:w-80 space-y-0"
              inputClassName="py-2.5 text-xs rounded-xl"
            />

            {/* Add Conductor Action */}
            <Button
              onClick={() => setShowAddStaff(true)}
              variant="primary"
              size="sm"
              leftIcon={UserPlus}
              className="text-xs min-h-[38px] px-3.5"
            >
              Add Conducting Staff
            </Button>

          </div>

          {/* Staff list grid */}
          {/* Desktop Table View */}
          <div className="hidden sm:block glass-panel border border-slate-200/60 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm overflow-x-auto">
            <table className="w-full min-w-[700px] border-collapse text-left text-xs font-medium">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-900/20 font-bold">
                  <th className="p-4 uppercase tracking-wider text-slate-400">Staff Code</th>
                  <th className="p-4 uppercase tracking-wider text-slate-400">Conductor Name</th>
                  <th className="p-4 uppercase tracking-wider text-slate-400">Email Address</th>
                  <th className="p-4 uppercase tracking-wider text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredStaff.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-400 font-semibold italic">
                      No staff records match your query.
                    </td>
                  </tr>
                ) : (
                  filteredStaff.map((staff) => (
                    <tr key={staff.staff_id} className="hover:bg-slate-50/20 dark:hover:bg-slate-900/10 transition-colors">
                      <td className="p-4 font-display font-bold text-slate-955 dark:text-white">{staff.staff_code}</td>
                      <td className="p-4 text-slate-700 dark:text-slate-300 font-semibold">{staff.staff_name}</td>
                      <td className="p-4 text-slate-500 dark:text-slate-400">{staff.email}</td>
                      <td className="p-4 text-right">
                        {/* Delete Staff Conductor */}
                        <Button
                          onClick={() => handleDeleteStaff(staff)}
                          variant="outline"
                          size="sm"
                          className="text-rose-500 hover:text-white hover:bg-rose-500 border-rose-500/30 hover:border-transparent p-2 min-h-[36px]"
                          title="Delete staff conductor"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Stacked Card View */}
          <div className="block sm:hidden space-y-4">
            {filteredStaff.length === 0 ? (
              <div className="text-center py-8 text-slate-400 font-semibold italic">
                No staff records match your query.
              </div>
            ) : (
              filteredStaff.map((staff) => (
                <Card 
                  key={staff.staff_id} 
                  className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 space-y-3 p-4"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-display font-extrabold text-slate-900 dark:text-white text-sm">
                        {staff.staff_name}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">Code: {staff.staff_code}</p>
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 truncate">{staff.email}</div>
                  <div className="flex pt-2.5 border-t border-slate-100 dark:border-slate-850 justify-end">
                    <Button
                      onClick={() => handleDeleteStaff(staff)}
                      variant="outline"
                      size="sm"
                      className="text-rose-500 hover:text-white hover:bg-rose-500 border-rose-500/30 hover:border-transparent p-2 min-h-[36px]"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {/* --- Overlay Modals --- */}

      {/* 1. Add Single Student Modal */}
      {showAddStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="glass-panel border rounded-3xl max-w-md w-full bg-white dark:bg-slate-900 p-6 space-y-6 shadow-xl relative">
            <button 
              onClick={() => setShowAddStudent(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 cursor-pointer border-0 bg-transparent"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-md font-display font-bold text-slate-955 dark:text-white flex items-center gap-1.5">
                <UserPlus className="w-5 h-5 text-indigo-500" />
                Register Student
              </h3>
              <p className="text-xs text-slate-400 mt-1">Create a student login account for this class.</p>
            </div>

            <form onSubmit={handleAddStudentSubmit} className="space-y-4 text-xs font-semibold">
              <InputField
                label="Register Number / Roll No"
                type="text"
                required
                value={newStudent.register_no}
                onChange={(e) => setNewStudent({...newStudent, register_no: e.target.value})}
                placeholder="e.g. 22CSR005"
              />

              <InputField
                label="Full Name"
                type="text"
                required
                value={newStudent.student_name}
                onChange={(e) => setNewStudent({...newStudent, student_name: e.target.value})}
                placeholder="e.g. John Doe"
              />

              <InputField
                label="Email Address"
                type="email"
                required
                value={newStudent.email}
                onChange={(e) => setNewStudent({...newStudent, email: e.target.value})}
                placeholder="e.g. john@student.cit.edu.in"
              />

              <InputField
                label="Password"
                type="password"
                required
                minLength={6}
                value={newStudent.password}
                onChange={(e) => setNewStudent({...newStudent, password: e.target.value})}
                placeholder="Minimum 6 characters"
              />

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Initial System Role</label>
                <select
                  value={newStudent.role}
                  onChange={(e) => setNewStudent({...newStudent, role: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-100/50 hover:bg-slate-100 focus:bg-white dark:bg-slate-900/60 dark:hover:bg-slate-900 dark:focus:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 text-sm rounded-2xl focus:outline-none transition-all text-slate-855 dark:text-white"
                >
                  <option value="student">Student</option>
                  <option value="attendance_rep">Representative</option>
                </select>
              </div>

              <Button
                type="submit"
                disabled={addStudentMutation.isPending}
                loading={addStudentMutation.isPending}
                variant="primary"
                className="w-full mt-2"
              >
                Register Student
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* 2. Bulk Add Student Modal */}
      {showBulkAddStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="glass-panel border rounded-3xl max-w-lg w-full bg-white dark:bg-slate-900 p-6 space-y-6 shadow-xl relative">
            <button 
              onClick={() => setShowBulkAddStudent(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 cursor-pointer border-0 bg-transparent"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-md font-display font-bold text-slate-950 dark:text-white flex items-center gap-1.5">
                <Upload className="w-5 h-5 text-indigo-500" />
                Bulk Upload Class Students
              </h3>
              <p className="text-xs text-slate-400 mt-1">Paste CSV rows or a JSON array mapping to register numbers.</p>
            </div>

            <form onSubmit={handleBulkAddSubmit} className="space-y-4 text-xs font-semibold">
              
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1.5 leading-relaxed text-slate-500 font-medium">
                <p className="font-bold text-slate-800 dark:text-slate-200">Supported Formats:</p>
                <ul className="list-disc pl-4 space-y-1 text-[10px]">
                  <li><strong>CSV Rows</strong>: One student per line:<br/><code className="bg-slate-100 dark:bg-slate-850 px-1 py-0.5 rounded">register_no, student_name, email, password, role</code></li>
                  <li><strong>JSON List</strong>: Standard array containing student keys:<br/><code className="bg-slate-100 dark:bg-slate-850 px-1 py-0.5 rounded">[{`{"register_no":"22CSR005", "student_name":"Name", "email":"..."}`}]</code></li>
                </ul>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Class Data List</label>
                <textarea
                  required
                  rows={8}
                  placeholder="Paste student CSV lines or JSON array here..."
                  value={bulkStudentText}
                  onChange={(e) => setBulkStudentText(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-100/50 hover:bg-slate-100 focus:bg-white dark:bg-slate-900/60 dark:hover:bg-slate-900 dark:focus:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 text-xs rounded-2xl focus:outline-none transition-all text-slate-855 dark:text-white resize-none font-mono"
                />
              </div>

              {bulkError && (
                <div className="p-3.5 bg-rose-500/10 border border-rose-500/25 text-rose-600 dark:text-rose-400 text-[10px] rounded-xl flex items-start gap-1.5 leading-normal">
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{bulkError}</span>
                </div>
              )}

              <Button
                type="submit"
                disabled={bulkRegisterMutation.isPending}
                loading={bulkRegisterMutation.isPending}
                variant="primary"
                className="w-full"
              >
                Upload Student Roster
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* 3. Add Staff Modal */}
      {showAddStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="glass-panel border rounded-3xl max-w-md w-full bg-white dark:bg-slate-900 p-6 space-y-6 shadow-xl relative">
            <button 
              onClick={() => setShowAddStaff(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 cursor-pointer border-0 bg-transparent"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-md font-display font-bold text-slate-955 dark:text-white flex items-center gap-1.5">
                <UserPlus className="w-5 h-5 text-indigo-500" />
                Register Staff Conductor
              </h3>
              <p className="text-xs text-slate-400 mt-1">Add a staff member conducting subjects in the institution.</p>
            </div>

            <form onSubmit={handleAddStaffSubmit} className="space-y-4 text-xs font-semibold">
              <InputField
                label="Staff Code"
                type="text"
                required
                value={newStaff.staff_code}
                onChange={(e) => setNewStaff({...newStaff, staff_code: e.target.value})}
                placeholder="e.g. ST005"
              />

              <InputField
                label="Full Name"
                type="text"
                required
                value={newStaff.staff_name}
                onChange={(e) => setNewStaff({...newStaff, staff_name: e.target.value})}
                placeholder="e.g. Dr. E. Ramesh"
              />

              <InputField
                label="Email Address"
                type="email"
                required
                value={newStaff.email}
                onChange={(e) => setNewStaff({...newStaff, email: e.target.value})}
                placeholder="e.g. ramesh@cit.edu.in"
              />

              <Button
                type="submit"
                disabled={addStaffMutation.isPending}
                loading={addStaffMutation.isPending}
                variant="primary"
                className="w-full mt-2"
              >
                Register Staff Conductor
              </Button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default RepManageClass;
