import React from 'react';
import PageHeader from '../../components/common/PageHeader';
import SubjectCard from '../../components/cards/SubjectCard';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import { useAttendance } from '../../hooks/useAttendance';
import { BookOpen } from 'lucide-react';

const Attendance = () => {
  const { useSubjectWiseStats } = useAttendance();
  const { data: subjects = [], isLoading, error } = useSubjectWiseStats();

  if (isLoading) {
    return <Loader message="Fetching class subjects list..." size="large" />;
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Subject Attendance"
        description="Select a subject below to view detailed hourly logs, session dates, and attendance records."
      />

      {subjects.length === 0 ? (
        <EmptyState 
          icon={BookOpen}
          title="No Subjects Enrolled"
          description="It looks like there are no subjects mapped to your current class semester."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((sub) => (
            <SubjectCard key={sub.subject_id} subject={sub} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Attendance;
