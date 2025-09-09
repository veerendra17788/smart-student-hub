import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SubjectAttendance } from "@/services/studentApi";
import AttendanceCalendar from "./AttendanceCalendar";

interface AttendanceCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: SubjectAttendance[];
  rollNumber: string;
  studentName?: string;
}

const AttendanceCalendarModal: React.FC<AttendanceCalendarModalProps> = ({
  isOpen,
  onClose,
  subjects,
  rollNumber,
  studentName = "Student"
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Attendance Calendar View</DialogTitle>
          <DialogDescription>
            Monthly calendar view of {studentName}'s class attendance
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <AttendanceCalendar subjects={subjects} rollNumber={rollNumber} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AttendanceCalendarModal;
