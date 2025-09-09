import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import AcademicCalendar from '@/components/student/AcademicCalendar';

const StudentAcademicCalendar: React.FC = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Academic Calendar</h1>
          <p className="text-muted-foreground">
            Stay updated with important academic events, exams, holidays, and deadlines
          </p>
        </div>
        
        <AcademicCalendar />
      </div>
    </AppLayout>
  );
};

export default StudentAcademicCalendar;
