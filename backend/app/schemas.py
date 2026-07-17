from pydantic import BaseModel, EmailStr
from typing import List, Optional, Any
from datetime import datetime

# --- College Schemas ---
class CollegeBase(BaseModel):
    name: str
    code: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class CollegeCreate(CollegeBase):
    pass

class CollegeResponse(CollegeBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# --- User Schemas ---
class UserBase(BaseModel):
    email: EmailStr
    name: str
    role: str # super_admin, college_admin, department_officer, class_advisor, student
    department: Optional[str] = None
    college_id: Optional[int] = None
    status: Optional[str] = "active"
    attendance_rate: Optional[float] = None
    gpa: Optional[float] = None

class UserCreate(UserBase):
    pass

class UserResponse(UserBase):
    id: int
    created_at: datetime
    college: Optional[CollegeResponse] = None

    class Config:
        from_attributes = True

class UserLoginRequest(BaseModel):
    email: str
    role: str

# --- Message Schemas ---
class MessageBase(BaseModel):
    content: str

class MessageCreate(MessageBase):
    pass

class MessageResponse(BaseModel):
    id: int
    complaint_id: int
    sender_id: Optional[int] = None
    sender: Optional[UserResponse] = None
    content: str
    is_ai: bool
    created_at: datetime

    class Config:
        from_attributes = True

# --- ActionLog Schemas ---
class ActionLogResponse(BaseModel):
    id: int
    complaint_id: int
    user_id: int
    user: UserResponse
    action: str
    details: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# --- Complaint Schemas ---
class ComplaintBase(BaseModel):
    title: str
    description: str
    category: str # hostel, academic, finance, facilities, other
    urgency: str # low, medium, high

class ComplaintCreate(ComplaintBase):
    student_id: int
    college_id: int

class ComplaintStatusUpdate(BaseModel):
    status: str # pending, advisor_reviewed, officer_investigating, resolved, closed
    officer_id: Optional[int] = None

class ComplaintForward(BaseModel):
    officer_id: int
    remarks: Optional[str] = None

class ComplaintResponse(BaseModel):
    id: int
    title: str
    description: str
    category: str
    status: str
    urgency: str
    student_id: int
    student: UserResponse
    class_advisor_id: Optional[int] = None
    class_advisor: Optional[UserResponse] = None
    assigned_officer_id: Optional[int] = None
    assigned_officer: Optional[UserResponse] = None
    college_id: int
    ai_summary: Optional[str] = None
    ai_urgency_reason: Optional[str] = None
    ai_recommendations: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# --- AI Schemas ---
class AIChatRequest(BaseModel):
    message: str
    history: Optional[List[dict]] = []

class AIChatResponse(BaseModel):
    response: str
    suggestions: List[str]

# --- Analytics / Dashboard ---
class DashboardMetrics(BaseModel):
    total_complaints: int
    pending_complaints: int
    in_progress_complaints: int
    resolved_complaints: int
    category_counts: dict
    status_counts: dict
    avg_resolution_time_days: float

# --- Management Updates ---
class UserUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    department: Optional[str] = None
    college_id: Optional[int] = None

class UserStatusUpdate(BaseModel):
    status: str # active, suspended

class CollegeUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
