import datetime
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Text, Float
from sqlalchemy.orm import relationship
from .database import Base

class College(Base):
    __tablename__ = "colleges"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    code = Column(String, unique=True, index=True, nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    users = relationship("User", back_populates="college")
    complaints = relationship("Complaint", back_populates="college")

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    role = Column(String, nullable=False)  # 'super_admin', 'college_admin', 'department_officer', 'class_advisor', 'student'
    department = Column(String, nullable=True) # Applicable to student, advisor, officer
    college_id = Column(Integer, ForeignKey("colleges.id"), nullable=True)
    status = Column(String, default="active") # active, suspended
    attendance_rate = Column(Float, nullable=True)
    gpa = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    college = relationship("College", back_populates="users")
    
    # Complaints submitted by student
    student_complaints = relationship(
        "Complaint", 
        foreign_keys="Complaint.student_id", 
        back_populates="student"
    )
    
    # Complaints assigned to department officer
    officer_complaints = relationship(
        "Complaint", 
        foreign_keys="Complaint.assigned_officer_id", 
        back_populates="assigned_officer"
    )

    # Complaints monitored by class advisor
    advisor_complaints = relationship(
        "Complaint", 
        foreign_keys="Complaint.class_advisor_id", 
        back_populates="class_advisor"
    )

    messages = relationship("Message", back_populates="sender")
    action_logs = relationship("ActionLog", back_populates="user")

class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String, default="general") # hostel, academic, finance, facilities, other
    status = Column(String, default="pending")  # pending, advisor_reviewed, officer_investigating, resolved, closed
    urgency = Column(String, default="medium")  # low, medium, high
    
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    class_advisor_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    assigned_officer_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    college_id = Column(Integer, ForeignKey("colleges.id"), nullable=False)

    # AI Assisted Analysis fields
    ai_summary = Column(Text, nullable=True)
    ai_urgency_reason = Column(Text, nullable=True)
    ai_recommendations = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    college = relationship("College", back_populates="complaints")
    student = relationship("User", foreign_keys=[student_id], back_populates="student_complaints")
    class_advisor = relationship("User", foreign_keys=[class_advisor_id], back_populates="advisor_complaints")
    assigned_officer = relationship("User", foreign_keys=[assigned_officer_id], back_populates="officer_complaints")
    
    messages = relationship("Message", back_populates="complaint", cascade="all, delete-orphan")
    action_logs = relationship("ActionLog", back_populates="complaint", cascade="all, delete-orphan")

class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    complaint_id = Column(Integer, ForeignKey("complaints.id"), nullable=False)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=True) # Null if sent by System AI
    content = Column(Text, nullable=False)
    is_ai = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    complaint = relationship("Complaint", back_populates="messages")
    sender = relationship("User", back_populates="messages")

class ActionLog(Base):
    __tablename__ = "action_logs"

    id = Column(Integer, primary_key=True, index=True)
    complaint_id = Column(Integer, ForeignKey("complaints.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    action = Column(String, nullable=False) # 'submitted', 'advisor_guidance', 'officer_update', 'forwarded', 'resolved'
    details = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    complaint = relationship("Complaint", back_populates="action_logs")
    user = relationship("User", back_populates="action_logs")
