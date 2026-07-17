from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
from . import models, schemas
from .services import ai
import datetime

# --- SEED DATA FUNCTION ---
def seed_database(db: Session):
    # Check if colleges exist
    if db.query(models.College).count() == 0:
        # Create Colleges
        ect = models.College(name="Engineering College of Technology", code="ECT", latitude=37.7749, longitude=-122.4194)
        smb = models.College(name="School of Management & Business", code="SMB", latitude=34.0522, longitude=-118.2437)
        db.add_all([ect, smb])
        db.commit()
        db.refresh(ect)
        db.refresh(smb)

        # Create Users
        users = [
            models.User(
                email="superadmin@campusai.com",
                name="Dr. Sarah Jenkins",
                role="super_admin"
            ),
            models.User(
                email="ectadmin@campusai.com",
                name="Dean Richard Fowler",
                role="college_admin",
                college_id=ect.id
            ),
            models.User(
                email="smbadmin@campusai.com",
                name="Dean Beatrice Vance",
                role="college_admin",
                college_id=smb.id
            ),
            # ECT Staff
            models.User(
                email="hostelofficer@campusai.com",
                name="Prof. Alan Smith (Hostels)",
                role="department_officer",
                department="Facilities & Hostel",
                college_id=ect.id
            ),
            models.User(
                email="academicofficer@campusai.com",
                name="Dr. Helen Carter (Academics)",
                role="department_officer",
                department="Academics",
                college_id=ect.id
            ),
            models.User(
                email="financeofficer@campusai.com",
                name="Mr. James Croft (Accounts)",
                role="department_officer",
                department="Finance",
                college_id=ect.id
            ),
            models.User(
                email="advisor@campusai.com",
                name="Prof. Evelyn Vance (CS Advisor)",
                role="class_advisor",
                department="Computer Science",
                college_id=ect.id
            ),
            # ECT Student
            models.User(
                email="student@campusai.com",
                name="Alex Mercer",
                role="student",
                department="Computer Science",
                college_id=ect.id,
                attendance_rate=92.5,
                gpa=3.6
            ),
            # SMB Student
            models.User(
                email="smbstudent@campusai.com",
                name="Clara Oswald",
                role="student",
                department="Business Administration",
                college_id=smb.id,
                attendance_rate=76.8,
                gpa=1.8
            )
        ]
        db.add_all(users)
        db.commit()

        # Reload Student, Officer, Advisor for mock complaints
        student = db.query(models.User).filter_by(email="student@campusai.com").first()
        advisor = db.query(models.User).filter_by(email="advisor@campusai.com").first()
        hostel_officer = db.query(models.User).filter_by(email="hostelofficer@campusai.com").first()
        academic_officer = db.query(models.User).filter_by(email="academicofficer@campusai.com").first()
        
        # Create seed complaints
        complaints = [
            {
                "title": "Broken water heater in Hostel Block A room 302",
                "description": "The hot water heater is completely broken and leaking water on the floor. It has been cold for 3 days and there's a risk of water damage. Please fix it immediately.",
                "category": "facilities",
                "student_id": student.id,
                "college_id": ect.id,
                "status": "pending",
                "class_advisor_id": advisor.id
            },
            {
                "title": "Grading error on Algorithms Midterm exam",
                "description": "My midterm grade was entered as 45 instead of 85. I have the physical graded paper showing 85/100 signed by the TA. I emailed the professor but haven't got a response.",
                "category": "academic",
                "student_id": student.id,
                "college_id": ect.id,
                "status": "officer_investigating",
                "class_advisor_id": advisor.id,
                "assigned_officer_id": academic_officer.id
            },
            {
                "title": "Scholarship disbursement delay for Semester 2",
                "description": "My merit scholarship credit of $1200 has not been applied to my student invoice yet. The deadline is next week and I am getting late fee notices.",
                "category": "finance",
                "student_id": student.id,
                "college_id": ect.id,
                "status": "resolved",
                "class_advisor_id": advisor.id
            }
        ]

        for comp_data in complaints:
            ai_analysis = ai.analyze_complaint(comp_data["title"], comp_data["description"])
            db_complaint = models.Complaint(
                title=comp_data["title"],
                description=comp_data["description"],
                category=ai_analysis["category"],
                status=comp_data["status"],
                urgency=ai_analysis["urgency"],
                student_id=comp_data["student_id"],
                class_advisor_id=comp_data.get("class_advisor_id"),
                assigned_officer_id=comp_data.get("assigned_officer_id"),
                college_id=comp_data["college_id"],
                ai_summary=ai_analysis["ai_summary"],
                ai_urgency_reason=ai_analysis["ai_urgency_reason"],
                ai_recommendations=ai_analysis["ai_recommendations"]
            )
            db.add(db_complaint)
            db.commit()
            db.refresh(db_complaint)

            # Add Action Logs for history
            log_sub = models.ActionLog(
                complaint_id=db_complaint.id,
                user_id=student.id,
                action="submitted",
                details="Grievance filed via Student portal. AI automatically classified category and urgency status."
            )
            db.add(log_sub)
            
            if db_complaint.status == "officer_investigating":
                log_adv = models.ActionLog(
                    complaint_id=db_complaint.id,
                    user_id=advisor.id,
                    action="advisor_guidance",
                    details="Class Advisor verified and forwarded to Department Officer for action."
                )
                db.add(log_adv)
                log_off = models.ActionLog(
                    complaint_id=db_complaint.id,
                    user_id=academic_officer.id,
                    action="officer_update",
                    details="Academic Department Officer began investigation of student exam paper."
                )
                db.add(log_off)
                
            elif db_complaint.status == "resolved":
                log_adv = models.ActionLog(
                    complaint_id=db_complaint.id,
                    user_id=advisor.id,
                    action="advisor_guidance",
                    details="Class Advisor verified and forwarded to Department Officer."
                )
                db.add(log_adv)
                log_res = models.ActionLog(
                    complaint_id=db_complaint.id,
                    user_id=ect.users[0].id, # College admin or officer
                    action="resolved",
                    details="Finance department resolved. Scholarship applied to invoice and late charges waived."
                )
                db.add(log_res)
            
            db.commit()

# --- COLLEGE CRUD ---
def get_colleges(db: Session):
    return db.query(models.College).all()

def create_college(db: Session, college: schemas.CollegeCreate):
    db_college = models.College(name=college.name, code=college.code)
    db.add(db_college)
    db.commit()
    db.refresh(db_college)
    return db_college

# --- USER CRUD ---
def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_users_by_role(db: Session, role: str, college_id: Optional[int] = None):
    query = db.query(models.User).filter(models.User.role == role)
    if college_id:
        query = query.filter(models.User.college_id == college_id)
    return query.all()

def create_user(db: Session, user: schemas.UserCreate):
    db_user = models.User(
        email=user.email,
        name=user.name,
        role=user.role,
        department=user.department,
        college_id=user.college_id
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# --- COMPLAINT CRUD ---
def get_complaints(
    db: Session, 
    role: str, 
    user_id: int, 
    college_id: Optional[int] = None, 
    category: Optional[str] = None
):
    query = db.query(models.Complaint)
    
    if role == "student":
        query = query.filter(models.Complaint.student_id == user_id)
    elif role == "class_advisor":
        # Show complaints belonging to advisor's college/department, or specifically assigned
        query = query.filter(models.Complaint.class_advisor_id == user_id)
    elif role == "department_officer":
        # Show complaints assigned or matching department
        officer = db.query(models.User).filter_by(id=user_id).first()
        query = query.filter(
            (models.Complaint.assigned_officer_id == user_id) | 
            ((models.Complaint.college_id == officer.college_id) & (models.Complaint.category == get_category_by_dept(officer.department)))
        )
    elif role == "college_admin":
        query = query.filter(models.Complaint.college_id == college_id)
    # super_admin sees all
    
    if category:
        query = query.filter(models.Complaint.category == category)
        
    return query.order_by(models.Complaint.created_at.desc()).all()

def get_complaint_by_id(db: Session, complaint_id: int):
    return db.query(models.Complaint).filter(models.Complaint.id == complaint_id).first()

def create_complaint(db: Session, complaint: schemas.ComplaintCreate):
    # Perform AI analysis
    ai_analysis = ai.analyze_complaint(complaint.title, complaint.description)
    
    # Locate advisor automatically based on student's department/college
    student = db.query(models.User).filter_by(id=complaint.student_id).first()
    advisor = db.query(models.User).filter(
        models.User.role == "class_advisor",
        models.User.college_id == complaint.college_id,
        models.User.department == student.department
    ).first()
    
    db_complaint = models.Complaint(
        title=complaint.title,
        description=complaint.description,
        category=ai_analysis["category"],
        status="pending",
        urgency=ai_analysis["urgency"],
        student_id=complaint.student_id,
        college_id=complaint.college_id,
        class_advisor_id=advisor.id if advisor else None,
        ai_summary=ai_analysis["ai_summary"],
        ai_urgency_reason=ai_analysis["ai_urgency_reason"],
        ai_recommendations=ai_analysis["ai_recommendations"]
    )
    db.add(db_complaint)
    db.commit()
    db.refresh(db_complaint)

    # Log action
    log = models.ActionLog(
        complaint_id=db_complaint.id,
        user_id=complaint.student_id,
        action="submitted",
        details=f"Grievance submitted by {student.name}. AI generated summary and routed to advisor."
    )
    db.add(log)
    db.commit()
    
    return db_complaint

def update_complaint_status(db: Session, complaint_id: int, status: str, user_id: int):
    complaint = get_complaint_by_id(db, complaint_id)
    if not complaint:
        return None
    
    old_status = complaint.status
    complaint.status = status
    
    # Auto-assign officer if resolving/investigating
    user = db.query(models.User).filter_by(id=user_id).first()
    if user.role == "department_officer":
        complaint.assigned_officer_id = user_id
    
    log = models.ActionLog(
        complaint_id=complaint.id,
        user_id=user_id,
        action="status_updated" if status != "resolved" else "resolved",
        details=f"Status changed from '{old_status}' to '{status}' by {user.name}."
    )
    db.add(log)
    db.commit()
    db.refresh(complaint)
    return complaint

def forward_complaint(db: Session, complaint_id: int, officer_id: int, user_id: int, remarks: str = None):
    complaint = get_complaint_by_id(db, complaint_id)
    if not complaint:
        return None
        
    old_officer = complaint.assigned_officer
    complaint.assigned_officer_id = officer_id
    
    # Update status to reflect tracking progress
    if complaint.status == "pending":
        complaint.status = "advisor_reviewed"
        
    sender = db.query(models.User).filter_by(id=user_id).first()
    receiver = db.query(models.User).filter_by(id=officer_id).first()
    
    details = f"Complaint forwarded by {sender.name} to {receiver.name}."
    if remarks:
        details += f" Remarks: {remarks}"
        
    log = models.ActionLog(
        complaint_id=complaint.id,
        user_id=user_id,
        action="forwarded",
        details=details
    )
    db.add(log)
    db.commit()
    db.refresh(complaint)
    return complaint

# --- MESSAGING ---
def get_complaint_messages(db: Session, complaint_id: int):
    return db.query(models.Message).filter(models.Message.complaint_id == complaint_id).order_by(models.Message.created_at.ascii()).all()

def create_message(db: Session, complaint_id: int, sender_id: Optional[int], content: str, is_ai: bool = False):
    db_message = models.Message(
        complaint_id=complaint_id,
        sender_id=sender_id,
        content=content,
        is_ai=is_ai
    )
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message

# --- ACTION LOGS ---
def get_complaint_action_logs(db: Session, complaint_id: int):
    return db.query(models.ActionLog).filter(models.ActionLog.complaint_id == complaint_id).order_by(models.ActionLog.created_at.desc()).all()

def get_all_action_logs(db: Session, limit: int = 50):
    return db.query(models.ActionLog).order_by(models.ActionLog.created_at.desc()).limit(limit).all()


# --- ANALYTICS ---
def get_dashboard_metrics(db: Session, college_id: Optional[int] = None) -> schemas.DashboardMetrics:
    comp_query = db.query(models.Complaint)
    if college_id:
        comp_query = comp_query.filter(models.Complaint.college_id == college_id)
        
    complaints = comp_query.all()
    total = len(complaints)
    
    pending = sum(1 for c in complaints if c.status == "pending")
    in_progress = sum(1 for c in complaints if c.status in ["advisor_reviewed", "officer_investigating"])
    resolved = sum(1 for c in complaints if c.status in ["resolved", "closed"])
    
    # Category mapping
    category_counts = {"hostel": 0, "academic": 0, "finance": 0, "facilities": 0, "general": 0}
    for c in complaints:
        cat = c.category if c.category in category_counts else "general"
        category_counts[cat] += 1
        
    status_counts = {"pending": pending, "in_progress": in_progress, "resolved": resolved}
    
    return schemas.DashboardMetrics(
        total_complaints=total,
        pending_complaints=pending,
        in_progress_complaints=in_progress,
        resolved_complaints=resolved,
        category_counts=category_counts,
        status_counts=status_counts,
        avg_resolution_time_days=2.4 # Mock average metric
    )

# --- UTILS ---
def get_category_by_dept(department: str) -> str:
    if not department:
        return "general"
    dept = department.lower()
    if "hostel" in dept or "facility" in dept:
        return "facilities"
    elif "academic" in dept:
        return "academic"
    elif "finance" in dept or "account" in dept:
        return "finance"
    return "general"

# --- ADVANCED CRUD METHODS ---
def update_user(db: Session, user_id: int, user_update: schemas.UserUpdate):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        return None
    for key, value in user_update.model_dump(exclude_unset=True).items():
        setattr(db_user, key, value)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user_status(db: Session, user_id: int, status_update: schemas.UserStatusUpdate):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        return None
    db_user.status = status_update.status
    db.commit()
    db.refresh(db_user)
    return db_user

def delete_user(db: Session, user_id: int):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        return False
    db.delete(db_user)
    db.commit()
    return True

def update_college(db: Session, college_id: int, college_update: schemas.CollegeUpdate):
    db_college = db.query(models.College).filter(models.College.id == college_id).first()
    if not db_college:
        return None
    for key, value in college_update.model_dump(exclude_unset=True).items():
        setattr(db_college, key, value)
    db.commit()
    db.refresh(db_college)
    return db_college

def delete_college(db: Session, college_id: int):
    db_college = db.query(models.College).filter(models.College.id == college_id).first()
    if not db_college:
        return False
    db.delete(db_college)
    db.commit()
    return True
