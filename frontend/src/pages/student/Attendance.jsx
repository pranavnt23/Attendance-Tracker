import React, { useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import SubjectCard from '../../components/cards/SubjectCard';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import { useAttendance } from '../../hooks/useAttendance';
import { BookOpen, Search, X } from 'lucide-react';

const Attendance = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { useSubjectWiseStats } = useAttendance();
  const { data: subjects = [], isLoading, error } = useSubjectWiseStats();

  if (isLoading) {
    return <Loader message="Fetching class subjects list..." size="large" />;
  }

  // Filter subjects by name or code
  const filteredSubjects = subjects.filter(
    sub => sub.subject_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           sub.subject_code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader 
        title="Subjectwise Attendance"
        description="Select a subject below to view detailed hourly logs, session dates, and attendance records."
      />

      {subjects.length > 0 && (
        <div className="glass-panel border rounded-3xl p-4 shadow-sm bg-white dark:bg-slate-900">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search subject name or subject code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-50/50 hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:border-brand-primary text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-colors"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 border-0 bg-transparent cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {subjects.length === 0 ? (
        <EmptyState 
          icon={BookOpen}
          title="No Subjects Enrolled"
          description="It looks like there are no subjects mapped to your current class semester."
        />
      ) : filteredSubjects.length === 0 ? (
        <EmptyState 
          icon={Search}
          title="No Matching Subjects"
          description={`We couldn't find any subjects matching "${searchQuery}".`}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSubjects.map((sub) => (
            <SubjectCard key={sub.subject_id} subject={sub} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Attendance;
