import re
from typing import List, Dict, Tuple

def analyze_complaint(title: str, description: str) -> Dict[str, str]:
    """
    Analyzes complaint title and description to return:
    - category (hostel, academic, finance, facilities, other)
    - urgency (low, medium, high)
    - ai_summary (1-sentence summary)
    - ai_urgency_reason (reason for urgency classification)
    - ai_recommendations (comma separated list of recommendation items)
    """
    text = (title + " " + description).lower()
    
    # 1. Determine Category
    category = "general"
    if any(k in text for k in ["hostel", "room", "mess", "food", "warden", "bed", "bathroom", "shower"]):
        category = "hostel"
    elif any(k in text for k in ["exam", "grade", "professor", "teacher", "class", "lecture", "marks", "attendance", "syllabus"]):
        category = "academic"
    elif any(k in text for k in ["fee", "payment", "scholarship", "fine", "refund", "billing", "dues"]):
        category = "finance"
    elif any(k in text for k in ["water", "leak", "wifi", "internet", "fan", "light", "lift", "parking", "canteen", "library", "ac", "air conditioner"]):
        category = "facilities"
    
    # 2. Determine Urgency
    urgency = "low"
    urgency_reason = "No critical emergency triggers detected. Standard response SLA is 5 days."
    
    high_keywords = ["urgent", "emergency", "broke", "hazard", "stolen", "harass", "abuse", "injury", "medical", "shattered", "fire", "leakage"]
    medium_keywords = ["delay", "broken", "wifi down", "not working", "unable to", "missing", "error", "request"]
    
    if any(k in text for k in high_keywords):
        urgency = "high"
        urgency_reason = "Classified as HIGH urgency due to mention of critical indicators (e.g. security, safety, or severe operational disruption)."
    elif any(k in text for k in medium_keywords) or category in ["finance"]:
        urgency = "medium"
        urgency_reason = "Classified as MEDIUM urgency. Affects student daily activities, target resolution within 48 hours."
        
    # 3. Generate Summary
    cleaned_desc = re.sub(r'\s+', ' ', description).strip()
    sentences = cleaned_desc.split('.')
    first_sentence = sentences[0] if sentences else "No description provided."
    if len(first_sentence) > 100:
        ai_summary = first_sentence[:100] + "..."
    else:
        ai_summary = f"Student reports {title.lower()}: {first_sentence}."

    # 4. Generate Recommendations
    recommendations_map = {
        "hostel": "Inspect room immediately, Contact Hostel Warden, Review mess contractor logs, Schedule maintenance",
        "academic": "Consult Department Head, Verify student attendance/grades records, Setup advisor meeting",
        "finance": "Check Account Officer records, Cross-reference bank transaction ID, Apply waiver checklist",
        "facilities": "Dispatch IT technician / plumber, Check router log status, Order replacement parts",
        "general": "Request student details, Direct to student welfare cell, Check standard college bylaws"
    }
    ai_recommendations = recommendations_map.get(category, recommendations_map["general"])
    
    return {
        "category": category,
        "urgency": urgency,
        "ai_summary": ai_summary,
        "ai_urgency_reason": urgency_reason,
        "ai_recommendations": ai_recommendations
    }

def get_ai_chat_response(message: str, history: List[dict] = []) -> Tuple[str, List[str]]:
    """
    Simulates a helpful AI chat assistant responding to queries.
    """
    msg = message.lower()
    
    # Default fallback
    response = (
        "I'm CampusAI, your digital helpdesk assistant. I can help you file a grievance, "
        "check the status of your existing complaint, or answer general campus questions. "
        "Could you please elaborate on your query?"
    )
    suggestions = [
        "How do I submit a complaint?",
        "Check status of my hostel complaint",
        "Who is my Class Advisor?",
        "What are the mess timings?"
    ]
    
    if any(k in msg for k in ["hi", "hello", "hey", "start"]):
        response = (
            "Hello! I am CampusAI, your academic helpdesk support bot. "
            "How can I assist you today? You can write a description of your issue, "
            "and I will help classify it and direct it to the right department."
        )
        suggestions = [
            "Submit a hostel issue",
            "Help with academic grading error",
            "How does the grievance workflow work?",
            "Talk to admin"
        ]
    elif any(k in msg for k in ["submit", "file", "lodge", "report"]):
        response = (
            "To submit a new complaint, head over to the **Submit Complaint** page or tell me details "
            "about the issue right here! Please specify: 1) The Category (Hostel, Academics, Facilities, Finance), "
            "2) A detailed description. I will summarize it and draft it for you."
        )
        suggestions = [
            "Report broken bathroom tap in Hostel Block B",
            "Report WiFi connection issues in Library",
            "Report exam registration portal error",
            "Go to Submit Complaint Form"
        ]
    elif any(k in msg for k in ["hostel", "broken", "tap", "bathroom", "water"]):
        response = (
            "I've drafted a draft for you:\n\n"
            "**Category:** Facilities / Hostel\n"
            "**Title:** Facility Repair Request\n"
            "**Description:** " + (message if len(message) > 10 else "Water tap in bathroom is broken/leaking.") + "\n\n"
            "You can submit this grievance directly in the Complaints tab. The assigned Department Officer "
            "will be notified immediately."
        )
        suggestions = [
            "Submit this draft now",
            "Edit draft details",
            "Go back to main menu"
        ]
    elif any(k in msg for k in ["status", "track", "my complaint", "check"]):
        response = (
            "You can track the progress of your submitted tickets on the **Complaint Tracking** page. "
            "A standard workflow moves from Class Advisor -> Department Officer -> College Admin. "
            "Most grievances are resolved within 3-5 working days. Can I look up a specific Complaint ID for you?"
        )
        suggestions = [
            "Track Complaint #1021",
            "View recent complaint list",
            "Contact Class Advisor"
        ]
    elif any(k in msg for k in ["workflow", "how it works", "steps"]):
        response = (
            "The CampusAI Grievance Resolution Workflow follows these phases:\n"
            "1. **Student Submission**: Automatically analyzed by AI for category and urgency.\n"
            "2. **Advisor Review**: Your Class Advisor guides you and verifies the ticket.\n"
            "3. **Department Action**: The relevant Department Officer is assigned to resolve the issue.\n"
            "4. **Admin Resolution**: The College Admin oversees the final resolution, ensuring compliance."
        )
        suggestions = [
            "Who resolves Hostel complaints?",
            "What if my issue is not resolved?",
            "Submit a new ticket"
        ]
    elif any(k in msg for k in ["advisor", "who is", "class advisor"]):
        response = (
            "Your Class Advisor is assigned based on your department. They are responsible for reviewing "
            "your initial grievance submissions, guiding you on academy rules, and forwarding cases to Department Officers."
        )
        suggestions = [
            "Message my advisor",
            "Track my complaint",
            "Main Menu"
        ]
        
    return response, suggestions
