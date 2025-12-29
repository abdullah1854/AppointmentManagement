# Appointment Management System

A full-stack appointment scheduling and queue management feature built with React/Tailwind (frontend) and Python FastAPI (backend).

## Features

- View appointments with calendar and tab filtering
- Create new appointments with conflict detection
- Update appointment status (Confirm/Cancel)
- Delete appointments
- Filter by date, status, or doctor
- Real-time UI updates after mutations

---

## Quick Start

### Prerequisites

- Python 3.8+
- Node.js 18+
- npm or yarn

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
uvicorn appointment_service:app --reload --host 0.0.0.0 --port 8000
```

Backend runs at: http://localhost:8000
API docs at: http://localhost:8000/docs

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: http://localhost:3000

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/appointments` | List appointments (with optional filters) |
| POST | `/appointments` | Create new appointment |
| PATCH | `/appointments/{id}/status` | Update appointment status |
| DELETE | `/appointments/{id}` | Delete appointment |

### Query Parameters (GET /appointments)

- `date` - Filter by date (YYYY-MM-DD)
- `status` - Filter by status (Confirmed, Scheduled, Cancelled)
- `doctorName` - Filter by doctor name

---

## GraphQL-like Query Structure

While this implementation uses REST, here's the equivalent GraphQL schema that would be used with AppSync:

```graphql
type Appointment {
  id: ID!
  patientName: String!
  date: String!        # YYYY-MM-DD
  time: String!        # HH:MM (24-hour)
  duration: Int!       # minutes
  doctorName: String!
  status: AppointmentStatus!
  mode: AppointmentMode!
}

enum AppointmentStatus {
  Confirmed
  Scheduled
  Cancelled
}

enum AppointmentMode {
  InPerson
  Video
  Phone
}

type Query {
  getAppointments(
    date: String
    status: AppointmentStatus
    doctorName: String
  ): [Appointment!]!
}

type Mutation {
  createAppointment(input: CreateAppointmentInput!): Appointment!
  updateAppointmentStatus(id: ID!, status: AppointmentStatus!): Appointment!
  deleteAppointment(id: ID!): Boolean!
}

input CreateAppointmentInput {
  patientName: String!
  date: String!
  time: String!
  duration: Int!
  doctorName: String!
  mode: AppointmentMode!
}

type Subscription {
  onAppointmentCreated: Appointment
  onAppointmentUpdated: Appointment
  onAppointmentDeleted: ID
}
```

### Mapping to Python Functions

| GraphQL Operation | Python Function |
|-------------------|-----------------|
| `getAppointments(filters)` | `get_appointments(date?, status?, doctorName?)` |
| `createAppointment(input)` | `create_appointment(payload)` |
| `updateAppointmentStatus(id, status)` | `update_appointment_status(id, new_status)` |
| `deleteAppointment(id)` | `delete_appointment(id)` |

---

## Data Consistency

### How Consistency is Enforced

#### 1. Database Transactions
All mutations (create, update, delete) would be wrapped in database transactions:

```sql
BEGIN TRANSACTION;
-- Check constraints
-- Perform operation
-- Trigger subscriptions
COMMIT;
```

#### 2. Unique Constraints

```sql
-- Primary key ensures unique appointment IDs
ALTER TABLE appointments ADD PRIMARY KEY (id);

-- Idempotency key prevents duplicate creates on retry
ALTER TABLE appointments ADD UNIQUE (idempotency_key);
```

#### 3. Exclusion Constraints (Conflict Prevention)

PostgreSQL exclusion constraint prevents overlapping appointments:

```sql
CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE appointments ADD CONSTRAINT no_doctor_overlap
EXCLUDE USING gist (
  doctor_id WITH =,
  appointment_date WITH =,
  tsrange(start_time, end_time) WITH &&
) WHERE (status != 'Cancelled');
```

#### 4. Idempotency Keys

For safe retries, clients send an `X-Idempotency-Key` header:

```
POST /appointments
X-Idempotency-Key: client-generated-uuid

# Server stores key -> response mapping
# On retry with same key, returns cached response
```

#### 5. Optimistic Locking

Prevent lost updates with version tracking:

```sql
UPDATE appointments
SET status = 'Confirmed', version = version + 1
WHERE id = 'apt-001' AND version = 5;

-- If 0 rows affected, concurrent modification detected
```

#### 6. Real-time Sync (AppSync Subscriptions)

After each mutation, trigger a subscription event:

```javascript
// After successful commit
await publishToSubscription('onAppointmentCreated', newAppointment);
await publishToSubscription('onAppointmentUpdated', updatedAppointment);
await publishToSubscription('onAppointmentDeleted', { id });
```

Connected clients receive push updates without polling.

---

## Project Structure

```
Appointment Management/
├── backend/
│   ├── appointment_service.py   # FastAPI app with all endpoints
│   └── requirements.txt         # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── EMR_Frontend__Assignment.jsx  # Main React component
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── index.html
├── README.md                    # This file
├── Project Plan.md              # Original requirements
└── ClaudeOpus45Plan.md          # Implementation plan
```

---

## Key Implementation Details

### Conflict Detection Algorithm

```python
def check_overlap(doctor, date, time, duration):
    new_start = time_to_minutes(time)
    new_end = new_start + duration

    for existing in appointments:
        if existing.doctor == doctor and existing.date == date:
            existing_start = time_to_minutes(existing.time)
            existing_end = existing_start + existing.duration

            # Overlap if: new_start < existing_end AND new_end > existing_start
            if new_start < existing_end and new_end > existing_start:
                return True  # Conflict!

    return False
```

### Tab Filtering Logic

- **Today**: `appointment.date === today`
- **Upcoming**: `appointment.date > today`
- **Past**: `appointment.date < today`

### Status Enum

- `Confirmed` - Appointment confirmed by patient/staff
- `Scheduled` - Default status on creation
- `Cancelled` - Appointment cancelled

---

## Testing

### Backend (curl examples)

```bash
# Get all appointments
curl http://localhost:8000/appointments

# Filter by date
curl "http://localhost:8000/appointments?date=2024-12-29"

# Create appointment
curl -X POST http://localhost:8000/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "patientName": "Test Patient",
    "date": "2024-12-30",
    "time": "10:00",
    "duration": 30,
    "doctorName": "Dr. Sarah Johnson",
    "mode": "In-Person"
  }'

# Update status
curl -X PATCH http://localhost:8000/appointments/apt-001/status \
  -H "Content-Type: application/json" \
  -d '{"status": "Confirmed"}'

# Delete
curl -X DELETE http://localhost:8000/appointments/apt-001
```

---

## Deployment

### Backend (Render/Railway)

1. Push `backend/` to a repository
2. Connect to Render/Railway
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `uvicorn appointment_service:app --host 0.0.0.0 --port $PORT`

### Frontend (Vercel/Netlify)

1. Push `frontend/` to a repository
2. Connect to Vercel/Netlify
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Update `API_BASE` in code to point to deployed backend URL

---

## License

MIT
