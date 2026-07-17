from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional

from .database import engine, Base, get_db
from . import models, schemas, crud
from .services import ai

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="CampusAI API", version="1.0.0")

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For dev ease, restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup event to seed database
@app.on_event("startup")
def startup_event():
    db = next(get_db())
    crud.seed_database(db)

@app.get("/")
def read_root():
    return {"message": "Welcome to CampusAI API"}

# --- AUTH ENDPOINTS ---
@app.post("/api/auth/login", response_model=schemas.UserResponse)
def login(login_req: schemas.UserLoginRequest, db: Session = Depends(get_db)):
    user = crud.get_user_by_email(db, login_req.email)
    if user and user.status == "suspended":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your administrative session has been suspended by the Super Admin."
        )
    if not user:
        # Auto-create user for development sandbox if email is not found
        user_name = login_req.email.split("@")[0].replace(".", " ").title()
        role = login_req.role
        college = db.query(models.College).first()
        
        new_user = schemas.UserCreate(
            email=login_req.email,
            name=user_name,
            role=role,
            department="Computer Science" if role in ["student", "class_advisor"] else "Facilities & Hostel",
            college_id=college.id if college and role != "super_admin" else None
        )
        user = crud.create_user(db, new_user)
    return user

# --- COLLEGE ENDPOINTS ---
@app.get("/api/colleges", response_model=List[schemas.CollegeResponse])
def get_colleges(db: Session = Depends(get_db)):
    return crud.get_colleges(db)

@app.post("/api/colleges", response_model=schemas.CollegeResponse)
def create_college(college: schemas.CollegeCreate, db: Session = Depends(get_db)):
    return crud.create_college(db, college)

# --- USER ENDPOINTS ---
@app.get("/api/users", response_model=List[schemas.UserResponse])
def get_users(role: Optional[str] = None, college_id: Optional[int] = None, db: Session = Depends(get_db)):
    if role:
        return crud.get_users_by_role(db, role, college_id)
    return db.query(models.User).all()

@app.post("/api/users", response_model=schemas.UserResponse)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    existing_user = crud.get_user_by_email(db, user.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="User with this email already exists")
    return crud.create_user(db, user)


# --- COMPLAINT ENDPOINTS ---
@app.get("/api/complaints", response_model=List[schemas.ComplaintResponse])
def get_complaints(
    role: str, 
    user_id: int, 
    college_id: Optional[int] = None, 
    category: Optional[str] = None, 
    db: Session = Depends(get_db)
):
    return crud.get_complaints(db, role, user_id, college_id, category)

@app.post("/api/complaints", response_model=schemas.ComplaintResponse)
def create_complaint(complaint: schemas.ComplaintCreate, db: Session = Depends(get_db)):
    return crud.create_complaint(db, complaint)

@app.get("/api/complaints/{complaint_id}", response_model=schemas.ComplaintResponse)
def get_complaint(complaint_id: int, db: Session = Depends(get_db)):
    db_complaint = crud.get_complaint_by_id(db, complaint_id)
    if not db_complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    return db_complaint

@app.put("/api/complaints/{complaint_id}/status", response_model=schemas.ComplaintResponse)
def update_status(
    complaint_id: int, 
    status_update: schemas.ComplaintStatusUpdate, 
    user_id: int, # Pass user ID initiating the change
    db: Session = Depends(get_db)
):
    db_complaint = crud.update_complaint_status(db, complaint_id, status_update.status, user_id)
    if not db_complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    return db_complaint

@app.post("/api/complaints/{complaint_id}/forward", response_model=schemas.ComplaintResponse)
def forward_complaint(
    complaint_id: int, 
    forward: schemas.ComplaintForward, 
    user_id: int, # Pass user ID initiating forward
    db: Session = Depends(get_db)
):
    db_complaint = crud.forward_complaint(db, complaint_id, forward.officer_id, user_id, forward.remarks)
    if not db_complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    return db_complaint

# --- CHAT & MESSAGES ENDPOINTS ---
@app.get("/api/complaints/{complaint_id}/messages", response_model=List[schemas.MessageResponse])
def get_messages(complaint_id: int, db: Session = Depends(get_db)):
    return crud.get_complaint_messages(db, complaint_id)

@app.post("/api/complaints/{complaint_id}/messages", response_model=schemas.MessageResponse)
def send_message(
    complaint_id: int, 
    msg: schemas.MessageCreate, 
    sender_id: int, 
    db: Session = Depends(get_db)
):
    # Create the user message
    user_msg = crud.create_message(db, complaint_id, sender_id, msg.content, is_ai=False)
    
    # Check if the complaint has an AI chat active or if the student was chatting with the system
    # If the user message is directed to AI or we want to trigger a mock automated response:
    complaint = crud.get_complaint_by_id(db, complaint_id)
    if complaint and (sender_id == complaint.student_id):
        # Trigger an AI message response in parallel
        ai_resp_text, _ = ai.get_ai_chat_response(msg.content)
        # Create AI message after a tiny delay
        crud.create_message(db, complaint_id, None, ai_resp_text, is_ai=True)

    return user_msg

@app.get("/api/complaints/{complaint_id}/logs", response_model=List[schemas.ActionLogResponse])
def get_logs(complaint_id: int, db: Session = Depends(get_db)):
    return crud.get_complaint_action_logs(db, complaint_id)

@app.get("/api/action-logs", response_model=List[schemas.ActionLogResponse])
def get_all_logs(limit: int = 50, db: Session = Depends(get_db)):
    return crud.get_all_action_logs(db, limit)


# --- CENTRAL AI ENDPOINT ---
@app.post("/api/ai/chat", response_model=schemas.AIChatResponse)
def general_ai_chat(req: schemas.AIChatRequest):
    response, suggestions = ai.get_ai_chat_response(req.message, req.history)
    return schemas.AIChatResponse(response=response, suggestions=suggestions)

# --- ANALYTICS ---
@app.get("/api/analytics", response_model=schemas.DashboardMetrics)
def get_analytics(college_id: Optional[int] = None, db: Session = Depends(get_db)):
    return crud.get_dashboard_metrics(db, college_id)

# --- USER MANAGEMENT ENDPOINTS ---
@app.put("/api/users/{user_id}", response_model=schemas.UserResponse)
def edit_user(user_id: int, user_update: schemas.UserUpdate, db: Session = Depends(get_db)):
    db_user = crud.update_user(db, user_id, user_update)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@app.put("/api/users/{user_id}/status", response_model=schemas.UserResponse)
def change_user_status(user_id: int, status_update: schemas.UserStatusUpdate, db: Session = Depends(get_db)):
    db_user = crud.update_user_status(db, user_id, status_update)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@app.delete("/api/users/{user_id}")
def remove_user(user_id: int, db: Session = Depends(get_db)):
    success = crud.delete_user(db, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted successfully"}

# --- COLLEGE MANAGEMENT ENDPOINTS ---
@app.put("/api/colleges/{college_id}", response_model=schemas.CollegeResponse)
def edit_college(college_id: int, college_update: schemas.CollegeUpdate, db: Session = Depends(get_db)):
    db_college = crud.update_college(db, college_id, college_update)
    if not db_college:
        raise HTTPException(status_code=404, detail="College not found")
    return db_college

@app.delete("/api/colleges/{college_id}")
def remove_college(college_id: int, db: Session = Depends(get_db)):
    success = crud.delete_college(db, college_id)
    if not success:
        raise HTTPException(status_code=404, detail="College not found")
    return {"message": "College deleted successfully"}
