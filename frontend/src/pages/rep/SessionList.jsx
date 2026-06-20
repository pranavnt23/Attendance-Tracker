import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import PageHeader from '../../components/common/PageHeader';
import AttendanceFilters from '../../components/attendance/AttendanceFilters';
import SessionCard from '../../components/cards/SessionCard';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import attendanceService from '../../services/attendanceService';
import { PlusCircle, ListTodo } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SessionList = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    date: '',
    subject: '',
    slot: '',
    faculty: ''
  });

  // Query sessions from cache/localStorage with filters
  const sessionsQuery = useQuery({
    queryKey: ['sessions', 'list', filters],
    queryFn: () => attendanceService.getSessionsList(filters),
  });

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const sessions = sessionsQuery.data || [];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Attendance Sessions"
        description="Review, search, and edit recorded attendance sheets for conducted lectures."
        actions={
          <button
            onClick={() => navigate('/rep/mark')}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-indigo-600 text-white font-bold text-xs shadow-md hover:bg-indigo-700 hover:shadow-indigo-500/25 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            Mark New Session
          </button>
        }
      />

      {/* Horizontal filter header */}
      <AttendanceFilters 
        filters={filters}
        onFilterChange={handleFilterChange}
        showStatusFilter={false}
      />

      {sessionsQuery.isLoading ? (
        <Loader message="Loading conducted sessions log..." size="large" />
      ) : sessions.length === 0 ? (
        <EmptyState 
          icon={ListTodo}
          title="No Sessions Recorded"
          description={
            Object.values(filters).some(x => x !== '')
              ? "No session entries match your current search filter parameters."
              : "No attendance sessions have been logged for this class semester yet."
          }
          action={
            Object.values(filters).some(x => x !== '') ? (
              <button 
                onClick={() => setFilters({ date: '', subject: '', slot: '', faculty: '' })}
                className="px-4 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 rounded-xl"
              >
                Clear Search Filters
              </button>
            ) : (
              <button 
                onClick={() => navigate('/rep/mark')}
                className="px-4 py-2.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm"
              >
                Create First Session
              </button>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map((session) => (
            <SessionCard key={session.session_id} session={session} />
          ))}
        </div>
      )}
    </div>
  );
};

export default SessionList;
