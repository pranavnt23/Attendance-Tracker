from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from uuid import UUID
from datetime import date, time
from typing import List, Dict, Any

from app.database.models import (
    Student, Class, Batch, Course, Department,
    Subject, Attendance, AttendanceSession, Timetable, Slot, SubjectStaff, Staff, StudentSubject
)
from app.schemas.dashboard import (
    StudentProfileResponse,
    SubjectWiseAttendanceResponse,
    AttendanceHistoryResponse,
    StaticTimetableResponse,
    StaticTimetableSlot,
    ActualTimetableSlot,
    SubjectDetailsResponse,
    LastUpdatedResponse
)


class DashboardService:
    @staticmethod
    def get_profile(db: Session, student_id: UUID) -> StudentProfileResponse:
        student = db.query(Student).filter(Student.student_id == student_id).first()
        if not student:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Student profile not found."
            )

        class_obj = db.query(Class).filter(Class.class_id == student.class_id).first()
        if not class_obj:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Associated class not found."
            )

        batch = db.query(Batch).filter(Batch.batch_id == class_obj.batch_id).first()
        course = db.query(Course).filter(Course.course_id == batch.course_id).first() if batch else None
        department = db.query(Department).filter(
            Department.department_id == course.department_id
        ).first() if course else None

        return StudentProfileResponse(
            student_id=student.student_id,
            register_no=student.register_no,
            student_name=student.student_name,
            email=student.email,
            role=student.role,
            class_name=class_obj.class_name,
            semester=class_obj.current_semester,
            course_name=course.course_name if course else "Unknown Course",
            department_name=department.department_name if department else "Unknown Department"
        )

    @staticmethod
    def get_subject_wise_attendance(
        db: Session,
        student_id: UUID
    ) -> List[SubjectWiseAttendanceResponse]:
        student = db.query(Student).filter(Student.student_id == student_id).first()
        if not student:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Student not found."
            )

        # Get all subjects belonging to the student's class (either compulsory OR mapped elective)
        subjects = db.query(Subject).outerjoin(
            StudentSubject, (StudentSubject.subject_id == Subject.subject_id) & (StudentSubject.student_id == student_id)
        ).filter(
            Subject.class_id == student.class_id,
            ((Subject.attendance_required == True) & (Subject.subject_type.in_(["Theory", "Lab", "Activity"]))) |
            (StudentSubject.mapping_id.isnot(None))
        ).all()

        results = []
        for sub in subjects:
            # Query all attendance records for this student and this subject
            records = db.query(Attendance).join(
                AttendanceSession, Attendance.session_id == AttendanceSession.session_id
            ).filter(
                Attendance.student_id == student_id,
                AttendanceSession.subject_id == sub.subject_id
            ).all()

            conducted = len(records)
            present = sum(1 for r in records if r.status == "P")
            absent = sum(1 for r in records if r.status == "A")
            od = sum(1 for r in records if r.status == "OD")

            # Calculate percentage, treating OD as absent (only status "P" counts as present)
            percentage = 100.0
            percentage_od = 100.0
            if conducted > 0:
                percentage = round((present / conducted) * 100, 2)
                percentage_od = round(((present + od) / conducted) * 100, 2)

            results.append(SubjectWiseAttendanceResponse(
                subject_id=sub.subject_id,
                subject_code=sub.subject_code,
                subject_name=sub.subject_name,
                subject_type=sub.subject_type,
                conducted_hours=conducted,
                present_hours=present,
                absent_hours=absent,
                od_hours=od,
                attendance_percentage=percentage,
                attendance_percentage_od=percentage_od
            ))

        return results

    @staticmethod
    def get_attendance_history(
        db: Session,
        student_id: UUID
    ) -> List[AttendanceHistoryResponse]:
        # Fetch student attendance joined with session details where the subject is compulsory or mapped
        records = db.query(Attendance).join(
            AttendanceSession, Attendance.session_id == AttendanceSession.session_id
        ).join(
            Subject, AttendanceSession.subject_id == Subject.subject_id
        ).outerjoin(
            StudentSubject, (StudentSubject.subject_id == Subject.subject_id) & (StudentSubject.student_id == student_id)
        ).filter(
            Attendance.student_id == student_id,
            ((Subject.attendance_required == True) & (Subject.subject_type.in_(["Theory", "Lab", "Activity"]))) |
            (StudentSubject.mapping_id.isnot(None))
        ).order_by(
            AttendanceSession.session_date.desc(),
            AttendanceSession.created_at.desc()
        ).all()

        results = []
        for r in records:
            session = db.query(AttendanceSession).filter(
                AttendanceSession.session_id == r.session_id
            ).first()
            if not session:
                continue

            sub = db.query(Subject).filter(Subject.subject_id == session.subject_id).first()
            slot = db.query(Slot).filter(Slot.slot_id == session.slot_id).first()

            # Derive day name dynamically
            day_name = session.session_date.strftime("%A")

            results.append(AttendanceHistoryResponse(
                date=session.session_date,
                day=day_name,
                slot_no=slot.slot_no if slot else 0,
                subject_name=sub.subject_name if sub else "Unknown Subject",
                status=r.status,
                od_reason=r.od_reason
            ))
        return results

    @staticmethod
    def get_static_timetable(db: Session, student_id: UUID) -> StaticTimetableResponse:
        student = db.query(Student).filter(Student.student_id == student_id).first()
        if not student:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Student not found."
            )

        # Filter timetable entries based on compulsory or mapped elective subjects
        raw_entries = db.query(Timetable).join(
            Subject, Timetable.subject_id == Subject.subject_id
        ).outerjoin(
            StudentSubject, (StudentSubject.subject_id == Subject.subject_id) & (StudentSubject.student_id == student_id)
        ).filter(
            Timetable.class_id == student.class_id,
            (Subject.subject_type.in_(["Theory", "Lab", "Activity"])) |
            (StudentSubject.mapping_id.isnot(None))
        ).all()

        mapped_subject_ids = {ms.subject_id for ms in student.student_subjects}
        
        # Group entries by (day_of_week, slot_id)
        from collections import defaultdict
        entries_by_day_slot = defaultdict(list)
        for entry in raw_entries:
            entries_by_day_slot[(entry.day_of_week, entry.slot_id)].append(entry)
            
        entries = []
        for day_slot, slot_entries in entries_by_day_slot.items():
            if len(slot_entries) > 1:
                mapped_entries = [e for e in slot_entries if e.subject_id in mapped_subject_ids]
                if mapped_entries:
                    entries.extend(mapped_entries)
                else:
                    entries.extend(slot_entries)
            else:
                entries.extend(slot_entries)

        day_timetable = {str(d): [] for d in range(1, 7)}

        for entry in entries:
            slot = db.query(Slot).filter(Slot.slot_id == entry.slot_id).first()
            sub = db.query(Subject).filter(Subject.subject_id == entry.subject_id).first()

            # Determine faculty name from subject staff mapping
            mapping = db.query(SubjectStaff).filter(
                SubjectStaff.subject_id == entry.subject_id,
                SubjectStaff.is_incharge == True
            ).first()

            faculty_name = "TBD"
            if mapping:
                staff = db.query(Staff).filter(Staff.staff_id == mapping.staff_id).first()
                if staff:
                    faculty_name = staff.staff_name
            else:
                # Fallback to any assigned staff if no incharge is set
                any_mapping = db.query(SubjectStaff).filter(
                    SubjectStaff.subject_id == entry.subject_id
                ).first()
                if any_mapping:
                    staff = db.query(Staff).filter(Staff.staff_id == any_mapping.staff_id).first()
                    if staff:
                        faculty_name = staff.staff_name

            day_timetable[str(entry.day_of_week)].append(StaticTimetableSlot(
                slot_no=slot.slot_no if slot else 0,
                start_time=slot.start_time if slot else time(0, 0),
                end_time=slot.end_time if slot else time(0, 0),
                subject_code=sub.subject_code if sub else "TBD",
                subject_name=sub.subject_name if sub else "Unknown Subject",
                faculty_name=faculty_name
            ))

        # Sort each day's list by slot number
        for day in day_timetable:
            day_timetable[day].sort(key=lambda x: x.slot_no)

        return StaticTimetableResponse(day_timetable=day_timetable)

    @staticmethod
    def get_actual_timetable(
        db: Session,
        student_id: UUID,
        date_val: date
    ) -> List[ActualTimetableSlot]:
        student = db.query(Student).filter(Student.student_id == student_id).first()
        if not student:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Student not found."
            )

        day_of_week = date_val.isoweekday()
        if day_of_week > 6:
            # Sunday or invalid day, return empty
            return []

        # Get planned timetable entries (compulsory or mapped elective)
        raw_entries = db.query(Timetable).join(
            Subject, Timetable.subject_id == Subject.subject_id
        ).outerjoin(
            StudentSubject, (StudentSubject.subject_id == Subject.subject_id) & (StudentSubject.student_id == student_id)
        ).filter(
            Timetable.class_id == student.class_id,
            Timetable.day_of_week == day_of_week,
            (Subject.subject_type.in_(["Theory", "Lab", "Activity"])) |
            (StudentSubject.mapping_id.isnot(None))
        ).all()

        mapped_subject_ids = {ms.subject_id for ms in student.student_subjects}
        
        # Group entries by slot_id
        from collections import defaultdict
        entries_by_slot = defaultdict(list)
        for entry in raw_entries:
            entries_by_slot[entry.slot_id].append(entry)
            
        entries = []
        for slot_id, slot_entries in entries_by_slot.items():
            if len(slot_entries) > 1:
                mapped_entries = [e for e in slot_entries if e.subject_id in mapped_subject_ids]
                if mapped_entries:
                    entries.extend(mapped_entries)
                else:
                    entries.extend(slot_entries)
            else:
                entries.extend(slot_entries)

        # Bulk preloading to prevent N+1 query overhead over Neon DB network latency
        slots = db.query(Slot).all()
        slot_map = {s.slot_id: s for s in slots}

        # Resolve slot and sort
        slots_mapped = []
        for entry in entries:
            slot = slot_map.get(entry.slot_id)
            if slot:
                slots_mapped.append((slot, entry))
        slots_mapped.sort(key=lambda x: x[0].slot_no)

        # Bulk query subjects, sessions, attendances, staff
        subject_ids = {entry.subject_id for entry in entries}
        subjects = []
        if subject_ids:
            subjects = db.query(Subject).filter(Subject.subject_id.in_(list(subject_ids))).all()
        subject_map = {sub.subject_id: sub for sub in subjects}

        sessions = db.query(AttendanceSession).filter(
            AttendanceSession.class_id == student.class_id,
            AttendanceSession.session_date == date_val
        ).all()
        
        sessions_by_slot = defaultdict(list)
        for s in sessions:
            sessions_by_slot[s.slot_id].append(s)

        session_ids = [s.session_id for s in sessions]
        attendances = []
        if session_ids:
            attendances = db.query(Attendance).filter(
                Attendance.session_id.in_(session_ids),
                Attendance.student_id == student_id
            ).all()
        attendance_by_session = {a.session_id: a for a in attendances}

        subject_staff_mappings = []
        if subject_ids:
            subject_staff_mappings = db.query(SubjectStaff).filter(
                SubjectStaff.subject_id.in_(list(subject_ids))
            ).all()
        
        staff_ids = {m.staff_id for m in subject_staff_mappings}
        if sessions:
            staff_ids.update({s.staff_id for s in sessions})
        
        staff_members = []
        if staff_ids:
            staff_members = db.query(Staff).filter(Staff.staff_id.in_(list(staff_ids))).all()
        staff_map = {st.staff_id: st for st in staff_members}

        results = []
        for slot, entry in slots_mapped:
            slot_sessions = sessions_by_slot[slot.slot_id]
            
            session = None
            # 1. First, look for a session matching the planned subject
            for s in slot_sessions:
                if s.subject_id == entry.subject_id:
                    session = s
                    break

            # 2. If not found, look for any substitution session the student is eligible for
            if not session:
                for s in slot_sessions:
                    sub = db.query(Subject).filter(Subject.subject_id == s.subject_id).first()
                    if sub:
                        if sub.subject_type in ["Theory", "Lab", "Activity"]:
                            session = s
                            break
                        elif sub.subject_type in ["Elective Theory", "Elective Lab"]:
                            mapping = db.query(StudentSubject).filter(
                                StudentSubject.student_id == student_id,
                                StudentSubject.subject_id == sub.subject_id
                            ).first()
                            if mapping:
                                session = s
                                break

            att = None
            if session:
                att = attendance_by_session.get(session.session_id)

            subject_name = ""
            faculty_name = ""
            status_val = "NOT_MARKED"

            if session and att:
                # Attendance is updated: show the conducted session's subject and faculty
                sub = db.query(Subject).filter(Subject.subject_id == session.subject_id).first()
                subject_name = sub.subject_name if sub else "Unknown Subject"
                staff = staff_map.get(session.staff_id)
                faculty_name = staff.staff_name if staff else "Unknown Faculty"
                status_val = att.status
            else:
                # Attendance is not updated yet: show the planned static details
                sub = subject_map.get(entry.subject_id)
                subject_name = sub.subject_name if sub else "Unknown Subject"

                # Find planned faculty
                mappings = [m for m in subject_staff_mappings if m.subject_id == entry.subject_id]
                incharge_mapping = next((m for m in mappings if m.is_incharge), None)
                faculty_name = "TBD"
                if incharge_mapping:
                    staff = staff_map.get(incharge_mapping.staff_id)
                    if staff:
                        faculty_name = staff.staff_name
                elif mappings:
                    staff = staff_map.get(mappings[0].staff_id)
                    if staff:
                        faculty_name = staff.staff_name
                status_val = "NOT_MARKED"

            results.append(ActualTimetableSlot(
                slot_no=slot.slot_no,
                start_time=slot.start_time,
                end_time=slot.end_time,
                subject_name=subject_name,
                faculty=faculty_name,
                attendance_status=status_val
            ))
        return results

    @staticmethod
    def get_subject_details(
        db: Session,
        student_id: UUID,
        subject_id: UUID
    ) -> SubjectDetailsResponse:
        sub = db.query(Subject).filter(Subject.subject_id == subject_id).first()
        if not sub:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Subject with ID '{subject_id}' not found."
            )

        # Validate that student is mapped to the elective subject
        if sub.subject_type in ["Elective Theory", "Elective Lab"]:
            mapping = db.query(StudentSubject).filter(
                StudentSubject.student_id == student_id,
                StudentSubject.subject_id == subject_id
            ).first()
            if not mapping:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Student is not mapped to this elective subject."
                )

        # Get attendance records
        records = db.query(Attendance).join(
            AttendanceSession, Attendance.session_id == AttendanceSession.session_id
        ).filter(
            Attendance.student_id == student_id,
            AttendanceSession.subject_id == subject_id
        ).all()

        conducted = len(records)
        present = sum(1 for r in records if r.status == "P")
        absent = sum(1 for r in records if r.status == "A")
        od = sum(1 for r in records if r.status == "OD")

        # Treating OD exactly like A (absent) while calculating percentage
        percentage = 100.0
        percentage_od = 100.0
        if conducted > 0:
            percentage = round((present / conducted) * 100, 2)
            percentage_od = round(((present + od) / conducted) * 100, 2)

        return SubjectDetailsResponse(
            subject_name=sub.subject_name,
            subject_code=sub.subject_code,
            subject_type=sub.subject_type,
            present_hours=present,
            absent_hours=absent,
            od_hours=od,
            conducted_hours=conducted,
            attendance_percentage=percentage,
            attendance_percentage_od=percentage_od
        )

    @staticmethod
    def get_last_updated_date(db: Session, student_id: UUID) -> LastUpdatedResponse:
        student = db.query(Student).filter(Student.student_id == student_id).first()
        if not student:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Student not found."
            )

        # Get the latest marked session joining Slot to sort by date and slot_no descending
        latest_session = db.query(AttendanceSession).join(
            Slot, AttendanceSession.slot_id == Slot.slot_id
        ).filter(
            AttendanceSession.class_id == student.class_id,
            AttendanceSession.attendance_records.any()
        ).order_by(
            AttendanceSession.session_date.desc(),
            Slot.slot_no.desc()
        ).first()

        if latest_session:
            slot = db.query(Slot).filter(Slot.slot_id == latest_session.slot_id).first()
            return LastUpdatedResponse(
                last_updated_date=latest_session.session_date,
                last_updated_slot=slot.slot_no if slot else None
            )

        return LastUpdatedResponse(
            last_updated_date=None,
            last_updated_slot=None
        )

