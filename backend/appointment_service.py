"""
Appointment Service - Backend API
Simulates Lambda/AppSync with PostgreSQL/Aurora data layer

This module provides CRUD operations for appointment scheduling with:
- Mock data store (simulating Aurora/PostgreSQL)
- Conflict detection for same doctor/date/time
- Status management and filtering
"""

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date, timedelta
import uuid

app = FastAPI(title="Appointment Service", version="1.0.0")

# CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =============================================================================
# DATA MODELS
# =============================================================================

class AppointmentCreate(BaseModel):
    patientName: str
    date: str  # YYYY-MM-DD
    time: str  # HH:MM
    duration: int  # minutes
    doctorName: str
    mode: str  # In-Person, Video, Phone
    status: Optional[str] = "Scheduled"

class AppointmentStatusUpdate(BaseModel):
    status: str

class Appointment(BaseModel):
    id: str
    patientName: str
    date: str
    time: str
    duration: int
    doctorName: str
    status: str
    mode: str

# =============================================================================
# MOCK DATA STORE (Simulating Aurora/PostgreSQL)
# =============================================================================

# Get today's date for realistic mock data
today = date.today()
today_str = today.strftime("%Y-%m-%d")
tomorrow_str = (today + timedelta(days=1)).strftime("%Y-%m-%d")
yesterday_str = (today - timedelta(days=1)).strftime("%Y-%m-%d")

appointments: List[dict] = [
    # Today's appointments
    {"id": "apt-001", "patientName": "John Smith", "date": today_str, "time": "09:00",
     "duration": 30, "doctorName": "Dr. Sarah Johnson", "status": "Confirmed", "mode": "In-Person"},
    {"id": "apt-002", "patientName": "Emily Davis", "date": today_str, "time": "09:30",
     "duration": 45, "doctorName": "Dr. Michael Chen", "status": "Scheduled", "mode": "Video"},
    {"id": "apt-003", "patientName": "Robert Wilson", "date": today_str, "time": "10:30",
     "duration": 30, "doctorName": "Dr. Sarah Johnson", "status": "Confirmed", "mode": "In-Person"},
    {"id": "apt-004", "patientName": "Maria Garcia", "date": today_str, "time": "11:00",
     "duration": 60, "doctorName": "Dr. James Williams", "status": "Scheduled", "mode": "Phone"},

    # Tomorrow's appointments (Upcoming)
    {"id": "apt-005", "patientName": "David Brown", "date": tomorrow_str, "time": "08:00",
     "duration": 30, "doctorName": "Dr. Sarah Johnson", "status": "Scheduled", "mode": "In-Person"},
    {"id": "apt-006", "patientName": "Jennifer Lee", "date": tomorrow_str, "time": "10:00",
     "duration": 45, "doctorName": "Dr. Michael Chen", "status": "Confirmed", "mode": "Video"},
    {"id": "apt-007", "patientName": "William Taylor", "date": tomorrow_str, "time": "14:00",
     "duration": 30, "doctorName": "Dr. James Williams", "status": "Scheduled", "mode": "In-Person"},

    # Yesterday's appointments (Past)
    {"id": "apt-008", "patientName": "Lisa Anderson", "date": yesterday_str, "time": "09:00",
     "duration": 30, "doctorName": "Dr. Sarah Johnson", "status": "Confirmed", "mode": "In-Person"},
    {"id": "apt-009", "patientName": "James Martinez", "date": yesterday_str, "time": "11:00",
     "duration": 45, "doctorName": "Dr. Michael Chen", "status": "Cancelled", "mode": "Video"},
    {"id": "apt-010", "patientName": "Patricia Thompson", "date": yesterday_str, "time": "15:00",
     "duration": 30, "doctorName": "Dr. James Williams", "status": "Confirmed", "mode": "Phone"},

    # Additional appointments for variety
    {"id": "apt-011", "patientName": "Michael White", "date": today_str, "time": "14:00",
     "duration": 30, "doctorName": "Dr. Michael Chen", "status": "Scheduled", "mode": "In-Person"},
    {"id": "apt-012", "patientName": "Susan Harris", "date": today_str, "time": "15:30",
     "duration": 45, "doctorName": "Dr. Sarah Johnson", "status": "Confirmed", "mode": "Video"},
]

# Valid status values
VALID_STATUSES = {"Confirmed", "Scheduled", "Cancelled"}

# =============================================================================
# UTILITY FUNCTIONS
# =============================================================================

def time_to_minutes(time_str: str) -> int:
    """Convert HH:MM to minutes from midnight"""
    hours, minutes = map(int, time_str.split(":"))
    return hours * 60 + minutes

def check_overlap(doctor: str, date_str: str, time_str: str, duration: int, exclude_id: str = None) -> bool:
    """
    Check if new appointment overlaps with existing ones for same doctor/date.
    Overlap occurs when: new_start < existing_end AND new_end > existing_start

    In a real system, this would be enforced via:
    - PostgreSQL exclusion constraint on (doctor, date, time_range)
    - Transaction isolation to prevent race conditions
    """
    new_start = time_to_minutes(time_str)
    new_end = new_start + duration

    for apt in appointments:
        # Skip cancelled appointments - they don't block time slots
        if apt["status"] == "Cancelled":
            continue
        # Skip the appointment being updated (for edit scenarios)
        if apt["id"] == exclude_id:
            continue
        # Check same doctor and date
        if apt["doctorName"] == doctor and apt["date"] == date_str:
            existing_start = time_to_minutes(apt["time"])
            existing_end = existing_start + apt["duration"]
            # Check overlap
            if new_start < existing_end and new_end > existing_start:
                return True
    return False

def sort_appointments(apts: List[dict]) -> List[dict]:
    """Sort appointments by date and time"""
    return sorted(apts, key=lambda x: (x["date"], x["time"]))

# =============================================================================
# API ENDPOINTS
# =============================================================================

@app.get("/appointments", response_model=List[Appointment])
def get_appointments(
    date: Optional[str] = Query(None, description="Filter by date (YYYY-MM-DD)"),
    status: Optional[str] = Query(None, description="Filter by status"),
    doctorName: Optional[str] = Query(None, description="Filter by doctor name")
):
    """
    Query appointments with optional filters.

    GraphQL equivalent:
    query GetAppointments($date: String, $status: String, $doctorName: String) {
        getAppointments(date: $date, status: $status, doctorName: $doctorName) {
            id, patientName, date, time, duration, doctorName, status, mode
        }
    }

    In production, this would:
    - Execute parameterized SQL against Aurora PostgreSQL
    - Use connection pooling for efficiency
    - Apply row-level security based on user context
    """
    result = appointments.copy()

    if date:
        result = [a for a in result if a["date"] == date]
    if status:
        result = [a for a in result if a["status"].lower() == status.lower()]
    if doctorName:
        result = [a for a in result if a["doctorName"].lower() == doctorName.lower()]

    return sort_appointments(result)


@app.post("/appointments", response_model=Appointment)
def create_appointment(payload: AppointmentCreate):
    """
    Create a new appointment with validation and conflict detection.

    GraphQL equivalent:
    mutation CreateAppointment($input: AppointmentInput!) {
        createAppointment(input: $input) {
            id, patientName, date, time, duration, doctorName, status, mode
        }
    }

    In production, this would:
    - BEGIN TRANSACTION
    - Check for conflicts using SELECT FOR UPDATE (pessimistic locking)
    - INSERT with idempotency key to prevent duplicates on retry
    - Trigger AppSync subscription for real-time updates
    - COMMIT TRANSACTION
    """
    # Validate required fields
    if not all([payload.patientName, payload.date, payload.time,
                payload.duration, payload.doctorName, payload.mode]):
        raise HTTPException(status_code=400, detail="Missing required fields")

    # Validate duration is positive
    if payload.duration <= 0:
        raise HTTPException(status_code=400, detail="Duration must be positive")

    # Validate date format
    try:
        datetime.strptime(payload.date, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")

    # Validate time format
    try:
        datetime.strptime(payload.time, "%H:%M")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid time format. Use HH:MM")

    # Validate status if provided
    status = payload.status or "Scheduled"
    if status not in VALID_STATUSES:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {VALID_STATUSES}")

    # Check for time conflicts
    if check_overlap(payload.doctorName, payload.date, payload.time, payload.duration):
        raise HTTPException(
            status_code=409,
            detail=f"Time conflict: {payload.doctorName} already has an appointment at this time"
        )

    # Generate unique ID (in production, this would be a DB-generated UUID)
    new_id = f"apt-{uuid.uuid4().hex[:8]}"

    # Create appointment
    new_appointment = {
        "id": new_id,
        "patientName": payload.patientName,
        "date": payload.date,
        "time": payload.time,
        "duration": payload.duration,
        "doctorName": payload.doctorName,
        "status": status,
        "mode": payload.mode
    }

    # Add to store
    # In production: INSERT INTO appointments VALUES (...) with transaction
    appointments.append(new_appointment)

    # In production: Trigger AppSync subscription here
    # await publish_to_subscription("onAppointmentCreated", new_appointment)

    return new_appointment


@app.patch("/appointments/{appointment_id}/status", response_model=Appointment)
def update_appointment_status(appointment_id: str, payload: AppointmentStatusUpdate):
    """
    Update appointment status.

    GraphQL equivalent:
    mutation UpdateAppointmentStatus($id: ID!, $status: String!) {
        updateAppointmentStatus(id: $id, status: $status) {
            id, patientName, date, time, duration, doctorName, status, mode
        }
    }

    In production, this would:
    - BEGIN TRANSACTION
    - SELECT FOR UPDATE to lock the row (optimistic locking with version check)
    - UPDATE appointments SET status = $1, updated_at = NOW() WHERE id = $2
    - Trigger AppSync subscription: onAppointmentUpdated
    - COMMIT TRANSACTION

    AppSync Subscription trigger point:
    After successful commit, publish to 'onAppointmentStatusChanged' subscription
    so all connected clients receive real-time update.
    """
    # Validate status
    if payload.status not in VALID_STATUSES:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {VALID_STATUSES}")

    # Find appointment
    for apt in appointments:
        if apt["id"] == appointment_id:
            apt["status"] = payload.status

            # In production: Trigger AppSync subscription here
            # await publish_to_subscription("onAppointmentStatusChanged", apt)

            return apt

    raise HTTPException(status_code=404, detail="Appointment not found")


@app.delete("/appointments/{appointment_id}")
def delete_appointment(appointment_id: str):
    """
    Delete an appointment.

    GraphQL equivalent:
    mutation DeleteAppointment($id: ID!) {
        deleteAppointment(id: $id)
    }

    In production, this would:
    - BEGIN TRANSACTION
    - Soft delete: UPDATE appointments SET deleted_at = NOW() WHERE id = $1
    - Or hard delete: DELETE FROM appointments WHERE id = $1
    - Trigger AppSync subscription: onAppointmentDeleted
    - COMMIT TRANSACTION
    """
    global appointments

    original_length = len(appointments)
    appointments = [a for a in appointments if a["id"] != appointment_id]

    if len(appointments) == original_length:
        raise HTTPException(status_code=404, detail="Appointment not found")

    # In production: Trigger AppSync subscription here
    # await publish_to_subscription("onAppointmentDeleted", {"id": appointment_id})

    return {"success": True, "message": f"Appointment {appointment_id} deleted"}


@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "appointments_count": len(appointments)}


# =============================================================================
# DATA CONSISTENCY NOTES
# =============================================================================
"""
DATA CONSISTENCY ENFORCEMENT (Production Implementation)

1. TRANSACTIONS
   - All mutations wrapped in BEGIN/COMMIT blocks
   - Use SERIALIZABLE isolation for conflict detection
   - Rollback on any validation failure

2. UNIQUE CONSTRAINTS
   - Primary key on appointments.id (UUID)
   - Unique constraint on idempotency_key for duplicate prevention

3. EXCLUSION CONSTRAINTS (PostgreSQL)
   - CREATE EXTENSION btree_gist;
   - ALTER TABLE appointments ADD CONSTRAINT no_overlap
     EXCLUDE USING gist (
       doctor_id WITH =,
       appointment_date WITH =,
       tsrange(start_time, end_time) WITH &&
     ) WHERE (status != 'Cancelled');

4. IDEMPOTENCY KEYS
   - Client sends X-Idempotency-Key header
   - Server stores key with request hash
   - On retry, return cached response instead of re-processing

5. OPTIMISTIC LOCKING
   - Add 'version' column to appointments
   - UPDATE ... WHERE id = $1 AND version = $2
   - If no rows affected, concurrent modification detected

6. REAL-TIME SYNC (AppSync)
   - Subscriptions for: onAppointmentCreated, onAppointmentUpdated, onAppointmentDeleted
   - Clients subscribe and receive push updates
   - No polling required
"""
