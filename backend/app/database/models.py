from uuid import uuid4

from sqlalchemy import (
    Column,
    String,
    Integer,
    Boolean,
    Date,
    Time,
    DateTime,
    ForeignKey,
    Text
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.db import Base


# =========================
# Colleges
# =========================

class College(Base):
    __tablename__ = "colleges"

    college_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    college_name = Column(String(255), nullable=False)
    college_code = Column(String(50), unique=True, nullable=False)

    # Relationships
    departments = relationship(
        "Department",
        back_populates="college",
        cascade="all, delete-orphan",
        passive_deletes=True
    )


# =========================
# Departments
# =========================

class Department(Base):
    __tablename__ = "departments"

    department_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)

    college_id = Column(
        UUID(as_uuid=True),
        ForeignKey("colleges.college_id", ondelete="CASCADE"),
        nullable=False
    )

    department_name = Column(String(255), nullable=False)

    # Relationships
    college = relationship("College", back_populates="departments")
    courses = relationship(
        "Course",
        back_populates="department",
        cascade="all, delete-orphan",
        passive_deletes=True
    )


# =========================
# Courses
# =========================

class Course(Base):
    __tablename__ = "courses"

    course_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)

    department_id = Column(
        UUID(as_uuid=True),
        ForeignKey("departments.department_id", ondelete="CASCADE"),
        nullable=False
    )

    course_name = Column(String(255), nullable=False)
    duration_years = Column(Integer, nullable=False)

    # Relationships
    department = relationship("Department", back_populates="courses")
    batches = relationship(
        "Batch",
        back_populates="course",
        cascade="all, delete-orphan",
        passive_deletes=True
    )


# =========================
# Batches
# =========================

class Batch(Base):
    __tablename__ = "batches"

    batch_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)

    course_id = Column(
        UUID(as_uuid=True),
        ForeignKey("courses.course_id", ondelete="CASCADE"),
        nullable=False
    )

    batch_start_year = Column(Integer, nullable=False)
    batch_end_year = Column(Integer, nullable=False)

    # Relationships
    course = relationship("Course", back_populates="batches")
    classes = relationship(
        "Class",
        back_populates="batch",
        cascade="all, delete-orphan",
        passive_deletes=True
    )


# =========================
# Classes
# =========================

class Class(Base):
    __tablename__ = "classes"

    class_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)

    batch_id = Column(
        UUID(as_uuid=True),
        ForeignKey("batches.batch_id", ondelete="CASCADE"),
        nullable=False
    )

    class_name = Column(String(100), nullable=False)
    section = Column(String(20), nullable=True)
    current_semester = Column(Integer, nullable=False)

    # Relationships
    batch = relationship("Batch", back_populates="classes")
    students = relationship(
        "Student",
        back_populates="class_ref",
        cascade="all, delete-orphan",
        passive_deletes=True
    )
    subjects = relationship(
        "Subject",
        back_populates="class_ref",
        cascade="all, delete-orphan",
        passive_deletes=True
    )
    timetable = relationship(
        "Timetable",
        back_populates="class_ref",
        cascade="all, delete-orphan",
        passive_deletes=True
    )
    sessions = relationship(
        "AttendanceSession",
        back_populates="class_ref",
        cascade="all, delete-orphan",
        passive_deletes=True
    )


# =========================
# Staff
# =========================

class Staff(Base):
    __tablename__ = "staff"

    staff_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)

    staff_code = Column(String(50), unique=True, nullable=False)
    staff_name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=True)

    # Relationships
    subject_staff = relationship(
        "SubjectStaff",
        back_populates="staff",
        cascade="all, delete-orphan",
        passive_deletes=True
    )
    sessions = relationship(
        "AttendanceSession",
        back_populates="staff",
        cascade="all, delete-orphan",
        passive_deletes=True
    )


# =========================
# Students
# =========================

class Student(Base):
    __tablename__ = "students"

    student_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)

    register_no = Column(String(50), unique=True, nullable=False)
    student_name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(30), nullable=False)

    class_id = Column(
        UUID(as_uuid=True),
        ForeignKey("classes.class_id", ondelete="CASCADE"),
        nullable=False
    )

    # Relationships
    class_ref = relationship("Class", back_populates="students")
    attendance = relationship(
        "Attendance",
        back_populates="student",
        cascade="all, delete-orphan",
        passive_deletes=True
    )
    created_sessions = relationship(
        "AttendanceSession",
        back_populates="creator",
        cascade="all, delete-orphan",
        passive_deletes=True
    )


# =========================
# Subjects
# =========================

class Subject(Base):
    __tablename__ = "subjects"

    subject_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)

    class_id = Column(
        UUID(as_uuid=True),
        ForeignKey("classes.class_id", ondelete="CASCADE"),
        nullable=False
    )

    subject_code = Column(String(50), nullable=False)
    subject_name = Column(String(255), nullable=False)
    subject_type = Column(String(50), nullable=False)

    attendance_required = Column(
        Boolean,
        nullable=False,
        default=True
    )

    # Relationships
    class_ref = relationship("Class", back_populates="subjects")
    subject_staff = relationship(
        "SubjectStaff",
        back_populates="subject",
        cascade="all, delete-orphan",
        passive_deletes=True
    )
    timetable = relationship(
        "Timetable",
        back_populates="subject",
        cascade="all, delete-orphan",
        passive_deletes=True
    )
    sessions = relationship(
        "AttendanceSession",
        back_populates="subject",
        cascade="all, delete-orphan",
        passive_deletes=True
    )


# =========================
# Subject Staff Mapping
# =========================

class SubjectStaff(Base):
    __tablename__ = "subject_staff"

    mapping_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)

    subject_id = Column(
        UUID(as_uuid=True),
        ForeignKey("subjects.subject_id", ondelete="CASCADE"),
        nullable=False
    )

    staff_id = Column(
        UUID(as_uuid=True),
        ForeignKey("staff.staff_id", ondelete="CASCADE"),
        nullable=False
    )

    is_incharge = Column(Boolean, default=False)

    # Relationships
    subject = relationship("Subject", back_populates="subject_staff")
    staff = relationship("Staff", back_populates="subject_staff")


# =========================
# Slots
# =========================

class Slot(Base):
    __tablename__ = "slots"

    slot_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)

    slot_no = Column(Integer, nullable=False)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)

    # Relationships
    timetable = relationship(
        "Timetable",
        back_populates="slot",
        cascade="all, delete-orphan",
        passive_deletes=True
    )
    sessions = relationship(
        "AttendanceSession",
        back_populates="slot",
        cascade="all, delete-orphan",
        passive_deletes=True
    )


# =========================
# Timetable
# =========================

class Timetable(Base):
    __tablename__ = "timetable"

    timetable_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)

    class_id = Column(
        UUID(as_uuid=True),
        ForeignKey("classes.class_id", ondelete="CASCADE"),
        nullable=False
    )

    day_of_week = Column(Integer, nullable=False)

    slot_id = Column(
        UUID(as_uuid=True),
        ForeignKey("slots.slot_id", ondelete="CASCADE"),
        nullable=False
    )

    subject_id = Column(
        UUID(as_uuid=True),
        ForeignKey("subjects.subject_id", ondelete="CASCADE"),
        nullable=False
    )

    # Relationships
    class_ref = relationship("Class", back_populates="timetable")
    slot = relationship("Slot", back_populates="timetable")
    subject = relationship("Subject", back_populates="timetable")


# =========================
# Attendance Sessions
# =========================

class AttendanceSession(Base):
    __tablename__ = "attendance_sessions"

    session_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)

    class_id = Column(
        UUID(as_uuid=True),
        ForeignKey("classes.class_id", ondelete="CASCADE"),
        nullable=False
    )

    session_date = Column(Date, nullable=False)

    slot_id = Column(
        UUID(as_uuid=True),
        ForeignKey("slots.slot_id", ondelete="CASCADE"),
        nullable=False
    )

    subject_id = Column(
        UUID(as_uuid=True),
        ForeignKey("subjects.subject_id", ondelete="CASCADE"),
        nullable=False
    )

    staff_id = Column(
        UUID(as_uuid=True),
        ForeignKey("staff.staff_id", ondelete="CASCADE"),
        nullable=False
    )

    created_by_student_id = Column(
        UUID(as_uuid=True),
        ForeignKey("students.student_id", ondelete="CASCADE"),
        nullable=False
    )

    remarks = Column(Text, nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    # Relationships
    class_ref = relationship("Class", back_populates="sessions")
    slot = relationship("Slot", back_populates="sessions")
    subject = relationship("Subject", back_populates="sessions")
    staff = relationship("Staff", back_populates="sessions")
    creator = relationship("Student", back_populates="created_sessions")
    attendance_records = relationship(
        "Attendance",
        back_populates="session",
        cascade="all, delete-orphan",
        passive_deletes=True
    )


# =========================
# Attendance
# =========================

class Attendance(Base):
    __tablename__ = "attendance"

    attendance_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)

    session_id = Column(
        UUID(as_uuid=True),
        ForeignKey("attendance_sessions.session_id", ondelete="CASCADE"),
        nullable=False
    )

    student_id = Column(
        UUID(as_uuid=True),
        ForeignKey("students.student_id", ondelete="CASCADE"),
        nullable=False
    )

    status = Column(String(10), nullable=False)
    od_reason = Column(String(50), nullable=True)

    # Relationships
    session = relationship("AttendanceSession", back_populates="attendance_records")
    student = relationship("Student", back_populates="attendance")


# =========================
# Password Resets (OTPs)
# =========================

class PasswordReset(Base):
    __tablename__ = "password_resets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    email = Column(String(255), nullable=False)
    otp = Column(String(6), nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    is_used = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())