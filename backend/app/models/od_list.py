from uuid import uuid4
from sqlalchemy import Column, ForeignKey, DateTime, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.db import Base


class ODList(Base):
    __tablename__ = "od_list"

    od_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)

    college_id = Column(
        UUID(as_uuid=True),
        ForeignKey("colleges.college_id", ondelete="CASCADE"),
        nullable=False
    )

    department_id = Column(
        UUID(as_uuid=True),
        ForeignKey("departments.department_id", ondelete="CASCADE"),
        nullable=False
    )

    class_id = Column(
        UUID(as_uuid=True),
        ForeignKey("classes.class_id", ondelete="CASCADE"),
        nullable=False
    )

    student_id = Column(
        UUID(as_uuid=True),
        ForeignKey("students.student_id", ondelete="CASCADE"),
        nullable=False
    )

    created_at = Column(DateTime, server_default=func.now(), nullable=True)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=True)

    # Relationships
    college = relationship("College")
    department = relationship("Department")
    class_ref = relationship("Class")
    student = relationship("Student")

    __table_args__ = (
        UniqueConstraint("class_id", "student_id", name="uq_od_list_class_student"),
    )
