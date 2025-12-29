# GPT52high Detailed Plan — Appointment Scheduling & Queue Management (Feature B)

## Inputs Used (Authoritative)
- **Project Plan.md** (authoritative requirements; treated as the single source of truth)
- **Reference 1.jpg** (UI styling/layout inspiration; broader dashboard context)
- **Reference 2.jpg** (calendar scheduling layout + “new event” side panel interaction pattern)

---

# A) Executive Summary

## What is being built
A functional **Appointment Management View** that supports **Appointment Scheduling and Queue Management (Feature B)** end-to-end by:
- Defining a clear **data contract** (query + mutations) that resembles an AppSync/GraphQL interaction pattern.
- Implementing the **backend service logic** in Python (`appointment_service.py`) using an in-memory mock “PostgreSQL/Aurora” dataset.
- Integrating the backend logic into a **React + Tailwind** UI so the view supports:
  - Initial appointment loading
  - Filtering by calendar date
  - Filtering via tabs (**Upcoming / Today / Past**)
  - Updating appointment status
  - Creating appointments via backend logic (no frontend-only state mutation)
  - (Optional) deleting appointments

## Scope boundaries
### In scope
- Backend service file `appointment_service.py` containing:
  - At least 10 mock appointments
  - `get_appointments(filters)`
  - `create_appointment(payload)`
  - `update_appointment_status(id, new_status)`
  - Optional `delete_appointment(id)`
  - Concrete explanation of consistency enforcement in a real system (transactions, constraints, idempotency)
- Frontend integration in the provided React component file (per Project Plan.md):
  - Hook-based initial data load
  - Calendar click filtering
  - Tab filtering
  - Status update interactions
  - “New Appointment” form calling backend create
- Documentation deliverable: brief README explaining the designed GraphQL-like query structure and consistency.

### Out of scope (explicit exclusions)
- Any features not listed in **Project Plan.md**, even if visible in reference images:
  - Reference 1.jpg shows broader EMR dashboard modules (Revenue, Pharmacy, etc.) — **out of scope**.
  - Reference 2.jpg form includes phone/email/Aadhaar/purpose fields — **out of scope** unless explicitly added as optional fields.
- Operational infrastructure and build/release process work.

## Success criteria (measurable)
- **SC-001**: On UI load, the Appointment Management View renders a list of appointments retrieved via `get_appointments()`.
- **SC-002**: Clicking a date in the calendar updates the list to only show matching appointments (date filter applied).
- **SC-003**: Switching between **Upcoming / Today / Past** updates the displayed list based on defined rules.
- **SC-004**: Updating status from the UI calls `update_appointment_status()` and the UI reflects the new status without manual refresh.
- **SC-005**: Creating an appointment from the UI calls `create_appointment()`; the new appointment appears in the list after refresh.
- **SC-006**: Time-conflict prevention works: creating overlapping appointments for the same doctor on the same date fails with a clear error.

## High-level risks and constraints
- **RISK-001 (runtime integration constraint)**: Project Plan.md suggests React directly imports/calls Python functions. In a standard browser build this is not possible without a bridge (e.g., local API, Pyodide, or evaluation harness). This plan includes a concrete integration approach plus alternatives (see Section E + Open Questions).
- **RISK-002 (ambiguous “Upcoming” meaning)**: Status enum includes `Upcoming`, and tabs include **Upcoming**. Must define whether tab is date-based, status-based, or hybrid.
- **RISK-003 (time parsing / format)**: Date/time formats are not explicitly defined; inconsistent formats can break filtering and overlap detection.
- **Constraint-001**: **Project Plan.md is authoritative**. If UI cues from images imply additional functionality, treat them as visual inspiration only.

---

# B) Requirements Traceability

## Requirement IDs (REQ-###)
The following requirements are derived directly from Project Plan.md.

| REQ ID | Source (Project Plan.md) | Requirement | Key Design Decisions | Implementation Tasks | Tests |
|---|---|---|---|---|---|
| REQ-001 | Objective (lines 4–9) | Provide functional end-to-end Appointment Scheduling & Queue Management view backed by backend data layer (no frontend-only creation). | Use a single in-memory source of truth in Python; frontend calls backend contract for reads/writes. | TASK-001, TASK-020, TASK-021, TASK-024 | TEST-020, TEST-022, TEST-026, TEST-027 |
| REQ-002 | Task 1 (lines 16–18) | Implement backend logic in `appointment_service.py`. | Keep service state in module-level list; expose functions matching contract. | TASK-010 | TEST-001 |
| REQ-003 | Task 1.1 (lines 19–22) | Mock >=10 appointments with required fields (patient name, date, time, duration, doctorName, status, mode). | Standardize formats: date `YYYY-MM-DD`, time `HH:MM` 24h; `duration` minutes int. | TASK-011 | TEST-002 |
| REQ-004 | Task 1.2 + contract (lines 23–25, 46–52) | `get_appointments(filters)` filters by optional `date`, `status`, and (per example) `doctorName`. | Filter is AND-combined; case-insensitive enum matching; stable sort by date/time. | TASK-012 | TEST-003, TEST-004 |
| REQ-005 | Task 1.3 (lines 26–30) | `update_appointment_status(id, new_status)` updates mock data; include comments for AppSync subscription + transactional write. | Validate status enum; return updated object; keep mutation atomic in function. | TASK-013 | TEST-005, TEST-006 |
| REQ-006 | Task 1.4 (lines 31–39) | `create_appointment(payload)` validates required fields, generates id, default status Scheduled, prevents overlaps, returns created appointment. | Use UUID for ids; ignore cancelled appts when checking conflicts; overlap: `(start < existing_end) AND (end > existing_start)`. | TASK-014, TASK-015 | TEST-007…TEST-012 |
| REQ-007 | Task 1.5 (lines 40–41) | Optional `delete_appointment(id)` deletes appointment. | Soft delete vs hard delete: choose hard delete for simplicity in mock; return boolean. | TASK-016 | TEST-013 |
| REQ-008 | Task 1.6 (lines 42–44) | Explain consistency enforcement for real system (transactions, constraints, idempotency keys). | Put explanation in Python comments + README; propose DB constraints + idempotency key. | TASK-017, TASK-041 | TEST-014 |
| REQ-009 | Task 2.1 (lines 57–60) | Frontend loads initial data via `get_appointments()` using hooks. | Single source of truth is backend service; frontend state is derived from service results. | TASK-020 | TEST-020 |
| REQ-010 | Task 2.2 (lines 61–66) | Calendar click sets selectedDate and refreshes list via backend filter. | Use `selectedDate` in state; call get_appointments({date}). | TASK-021 | TEST-022 |
| REQ-011 | Task 2.3 (lines 67–69) | Tabs Upcoming/Today/Past filter based on status and/or date relative to today. | Define deterministic rules (Section C); keep filtering logic isolated for testability. | TASK-022 | TEST-023…TEST-025 |
| REQ-012 | Task 2.4 (lines 70–73) | UI updates appointment status via backend mutation and refreshes local state. | Optimistic UI optional; default: await mutation then refetch filtered list. | TASK-023 | TEST-026 |
| REQ-013 | Task 2.5 (lines 74–79) | New Appointment form calls backend create; refresh list; no direct array mutation without backend call. | Form validates required fields; submit disabled while saving; on success refetch. | TASK-024, TASK-031 | TEST-027…TEST-030 |
| REQ-014 | Submission (lines 89–91) | README explains GraphQL query structure and how consistency is ensured. | Provide concrete query examples and mapping to python functions. | TASK-041 | TEST-031 |
| REQ-015 | Core stack (lines 10–14) | Use React + Tailwind; backend Python 3.x; data layer simulated. | Keep UI Tailwind-only; backend pure Python; no real DB dependency. | TASK-020, TASK-010 | TEST-020 |

---

# C) Architecture & Design Planning

## High-level system structure (text description)
- **Frontend UI (React + Tailwind)** renders Appointment Management View and triggers user actions.
- **Backend Service Module (Python)** holds in-memory appointment records and exposes query/mutation functions.
- **Integration Layer** bridges the frontend to the backend contract.
  - Primary approach must follow Project Plan.md: “simulate by importing and calling function directly”.
  - Because standard React builds can’t execute Python, this plan provides two implementation paths (see Section E):
    - Path A: Evaluation-friendly “direct import” simulation (if the environment supports it).
    - Path B: Minimal local API adapter (GraphQL-like) while preserving the exact python contract.

## Major components and responsibilities
### Backend: `appointment_service.py`
- **Mock Data Store**: module-level list of appointment dicts.
- **Query**: `get_appointments(filters)` returns filtered list.
- **Mutations**:
  - `create_appointment(payload)` validates and inserts.
  - `update_appointment_status(id, new_status)` validates and updates.
  - Optional `delete_appointment(id)`.
- **Validation + Time Utilities**:
  - Parse/normalize date/time.
  - Compute start/end times for overlap detection.

### Frontend: Appointment Management View
- **State**:
  - `appointments`: current list for display
  - `selectedDate`: calendar selection
  - `activeTab`: Upcoming/Today/Past
  - `loading`, `error`
  - `newAppointmentForm`: controlled inputs
- **Actions**:
  - Fetch on mount
  - Fetch on calendar click
  - Filter by tab (client-side or via query filters)
  - Update status via backend mutation then refresh
  - Create via backend mutation then refresh

## Key user flows (from Project Plan.md + inferred from images)

### Flow 1 — View appointments (initial load)
1. UI mounts AppointmentManagementView.
2. UI calls `get_appointments({})`.
3. UI renders appointment cards list (sorted).

### Flow 2 — Filter by calendar date
1. User clicks a date in the calendar widget.
2. UI sets `selectedDate`.
3. UI calls `get_appointments({ date: selectedDate })`.
4. UI list updates.

### Flow 3 — Filter via tabs (Upcoming / Today / Past)
1. User clicks a tab.
2. UI sets `activeTab`.
3. UI filters appointments:
   - Option A: client-side filter from already-fetched dataset.
   - Option B: call backend with filters + client-side derived filters.

### Flow 4 — Update appointment status
1. User clicks status action (e.g., Confirm / Cancel) on an appointment card.
2. UI calls `update_appointment_status(id, new_status)`.
3. UI refreshes list (refetch or update local state using returned object).

### Flow 5 — Create new appointment
(Reference 2.jpg inspires a right-side “New Event” form panel.)
1. User clicks “New Appointment”.
2. UI opens a form (modal or side panel).
3. On submit, UI calls `create_appointment(payload)`.
4. If success: UI refreshes list.
5. If conflict/validation error: UI shows error and does not mutate list.

## Data structures / entities and relationships

### Entity: Appointment
**Appointment** (stored as dict/object)
- `id`: string (UUID recommended)
- `patientName`: string
- `date`: string (`YYYY-MM-DD`)
- `time`: string (`HH:MM` 24-hour)
- `duration`: integer (minutes)
- `doctorName`: string
- `status`: string enum
  - Allowed: `Confirmed`, `Scheduled`, `Upcoming`, `Cancelled`
- `mode`: string enum
  - Recommended: `InPerson`, `Telehealth` (exact values must be confirmed)

Derived fields (computed, not stored unless helpful):
- `startDateTime`, `endDateTime` for sorting/conflict checks.

### Relationships
- Appointments relate to a “Doctor” only by `doctorName` string in this assignment.
- If expanded later, replace with `doctorId` foreign key.

## API interactions / internal interfaces (conceptual)
Even though the implementation is simulated, define a GraphQL-like contract:

### Query: `getAppointments`
Input (filters):
- `date?: string`
- `status?: string`
- `doctorName?: string`

Output:
- `Appointment[]`

### Mutations
- `createAppointment(input: CreateAppointmentInput) -> Appointment`
- `updateAppointmentStatus(id: string, newStatus: string) -> Appointment`
- `deleteAppointment(id: string) -> boolean` (optional)

## Non-functional considerations
### Performance
- Dataset is small (>=10 items), but implement efficient filtering and sorting:
  - Single pass filter + sort by datetime.
- Avoid unnecessary re-renders by keeping derived filtering functions memoized where appropriate.

### Reliability
- Handle all validation errors predictably.
- Avoid partial updates in mutation functions.

### Usability
- Clear loading and error states.
- Disable submit while creating/updating.
- Provide inline validation messages for missing fields.

### Accessibility
- Keyboard navigable tabs and form.
- Visible focus states (Tailwind focus rings).
- Form labels associated with inputs.
- Ensure sufficient contrast for status badges.

---

# D) Detailed Implementation Plan (Core Section)

## Phase 1 — Contract, data model, and rules
### Objectives
- Lock the contract and business rules so backend + frontend implement the same behavior.

### In scope
- Define enums, formats, overlap rules, tab filtering rules.

### Out of scope
- Adding new data fields not required by Project Plan.md.

### Tasks
- **TASK-001**: Define canonical appointment schema (fields + types + allowed enums).
- **TASK-002**: Define canonical date/time formats and parsing rules.
- **TASK-003**: Define overlap detection rule (same doctor + same date; cancelled appointments ignored).
- **TASK-004**: Define tab filtering rules:
  - **Today**: `appointment.date == today`.
  - **Past**: `appointment.date < today`.
  - **Upcoming**: `appointment.date > today`.
  - Note: Status is displayed but tab classification is date-based (unless stakeholders require status-based).

### Dependencies / assumptions
- Assumes `today` is derived from local system date in frontend.

### Complexity
- Low

### Acceptance criteria
- Rules are explicitly documented and unambiguous.

### Deliverables
- This planning document sections C/D + a short contract summary in README (later).

---

## Phase 2 — Backend service implementation (`appointment_service.py`)
### Objectives
- Implement the core scheduling and queue management logic with mock persistence.

### In scope
- Mock dataset, query, create, update, optional delete, and consistency explanation.

### Out of scope
- Real database, real AppSync subscriptions, real authentication.

### Tasks
- **TASK-010**: Create `appointment_service.py` with module structure and exported functions.
- **TASK-011**: Implement mock dataset with **>=10** diverse appointments:
  - Multiple doctors
  - Multiple dates (past/today/future)
  - Mixed statuses and modes
- **TASK-012**: Implement `get_appointments(filters)`:
  - Accept dict/object `filters` with optional `date`, `status`, `doctorName`
  - Apply AND logic
  - Return sorted list by date+time
  - Define behavior for unknown filter keys (ignore or error; recommended: ignore unknown keys)
- **TASK-013**: Implement `update_appointment_status(id, new_status)`:
  - Validate `id` exists
  - Validate `new_status` in allowed enum
  - Update in mock store
  - Return updated appointment
  - Include comments describing where AppSync subscription + Aurora transaction would occur
- **TASK-014**: Implement `create_appointment(payload)`:
  - Validate required fields: `patientName`, `date`, `time`, `duration`, `doctorName`, `mode`
  - Validate formats and types (duration int > 0)
  - Generate backend id (UUID)
  - Default `status = Scheduled` unless explicitly provided
  - Run overlap detection
  - Append to mock store and return created appointment
- **TASK-015**: Implement overlap detection utility:
  - Convert `time` + `duration` to `[start, end)` minutes from midnight
  - For same doctor/date: conflict if `new_start < existing_end` and `new_end > existing_start`
- **TASK-016** (optional): Implement `delete_appointment(id)`:
  - Remove from list
  - Return `True` if removed else `False`
- **TASK-017**: Add consistency explanation (in comments):
  - Transactions for create/update
  - Unique/exclusion constraints
  - Idempotency key for create
  - Optimistic locking/versioning for updates

### Dependencies / assumptions
- Assumes in-memory list is acceptable as “simulated Aurora/Postgres”.

### Complexity
- Medium

### Acceptance criteria
- All functions work with deterministic outputs.
- Overlap prevention blocks conflicts.
- Filtering works for all supported filters.

### Deliverables
- `appointment_service.py`

---

## Phase 3 — Frontend integration (Appointment Management View)
### Objectives
- Make the view functionally complete: list, filters, create, update.

### In scope
- Implement required handlers and state updates.

### Out of scope
- Rebuilding the entire EMR dashboard from reference images.

### Tasks
- **TASK-020**: Implement initial data fetch in `AppointmentManagementView` using `useEffect` and `useState`.
- **TASK-021**: Implement calendar date click handler:
  - Update `selectedDate`
  - Fetch `get_appointments({ date: selectedDate })`
- **TASK-022**: Implement tab filtering:
  - Store `activeTab`
  - Apply date-based classification rules (TASK-004)
  - Ensure Cancelled appointments are still visible unless explicitly excluded
- **TASK-023**: Implement status update UI:
  - Add action(s) per appointment card (e.g., Confirm / Cancel)
  - Call `update_appointment_status(id, new_status)`
  - Refresh list (recommended: refetch with current filters)
- **TASK-024**: Implement New Appointment form and button:
  - Open/close panel or modal (Reference 2.jpg suggests right-side panel)
  - Controlled inputs for required fields
  - On submit call `create_appointment(payload)`
  - On success: refetch list
  - On error: show message, keep form state

### Dependencies / assumptions
- Assumes the provided component file exists (not present in current workspace). If missing, it must be added before implementation.

### Complexity
- Medium

### Acceptance criteria
- UI performs all required flows without direct state mutation bypassing backend.

### Deliverables
- Updated React component file (per Project Plan.md requirement)

---

## Phase 4 — UX, validation, and error handling polish
### Objectives
- Make the feature robust and pleasant to use.

### In scope
- Client-side validation, loading states, accessibility basics.

### Tasks
- **TASK-030**: Add inline client validation:
  - Required fields present
  - Duration numeric and > 0
  - Date/time format validation
- **TASK-031**: Add loading states and disable buttons during operations.
- **TASK-032**: Add error surface for backend validation/conflict failures.
- **TASK-033**: Ensure accessibility for tabs + form controls (labels, focus states).

### Complexity
- Low/Medium

### Acceptance criteria
- Errors are actionable; UI never silently fails.

### Deliverables
- UI polish updates

---

## Phase 5 — Testing, validation, and documentation
### Objectives
- Ensure correctness and provide required explanation.

### Tasks
- **TASK-040**: Backend unit tests for query/mutations and conflict logic.
- **TASK-041**: Write README section:
  - GraphQL-like query/mutation examples
  - Consistency explanation (idempotency, transactions, constraints)
  - Any assumptions made
- **TASK-042**: Manual UI validation script (step-by-step checklist) aligned with success criteria.

### Complexity
- Medium

### Acceptance criteria
- All P0 tests pass; README is concrete and maps to code.

### Deliverables
- Test cases (documented) + README

---

# E) What Will Work / What Will Not Work

## What will work (aligned approaches)
- **In-memory Python service as authoritative source**: Meets the requirement to “simulate Aurora/Postgres” while keeping logic centralized.
- **Refetch-after-mutation strategy**: Simplifies correctness and avoids state drift. Especially important because the requirement forbids frontend-only state changes for create.
- **Deterministic overlap detection**: Clear, testable, and maps to real DB exclusion constraints.
- **Using reference images as UX inspiration only**: Keeps scope aligned with Project Plan.md.

## What will not work (or is risky)
- **Directly mutating `appointments` array on create without calling backend**: Explicitly forbidden by Project Plan.md.
- **Relying on ambiguous status semantics for tab filtering without defining rules**: Will create inconsistent behavior and flaky tests.
- **Assuming React can import Python in a normal browser environment**:
  - This only works if an evaluation harness exists.
  - Without a bridge, the UI will not run.

## Resolution options for Python↔React integration (choose 1)
- **Option 1 (best for requirement literalism)**: Environment supports direct import/call (e.g., bundled runtime that executes Python). Proceed with direct invocation as specified.
  - Trade-off: Depends on non-standard setup.
- **Option 2 (best for runnable app)**: Add a thin local API adapter that exposes endpoints mirroring GraphQL operations and calls `appointment_service.py` server-side.
  - Trade-off: Slightly diverges from “import directly” wording but preserves contract and end-to-end behavior.
- **Option 3 (hybrid)**: Keep `appointment_service.py` for evaluation and implement a JS mirror (`appointment_service_mock.js`) for browser runtime.
  - Trade-off: Risk of logic drift; must keep parity via shared test vectors.

---

# F) Detailed Testing & Validation Plan

## Overall testing strategy
- Validate backend functions first (pure logic, deterministic).
- Validate frontend behaviors against the backend contract.
- Validate key end-to-end flows against Success Criteria SC-001…SC-006.

## Coverage categories
- **Functional**: core flows (load/filter/create/update).
- **Edge cases**: boundary times, last slot of day, duration extremes.
- **Negative scenarios**: missing fields, invalid status, invalid id.
- **Security-relevant**: input sanitization assumptions, PII handling in logs.
- **Performance-related**: repeated filtering/refetching; ensure no UI lockups for small dataset.
- **Accessibility**: keyboard navigation and form labels.

## Detailed test cases

### Backend (Unit-level)
- **TEST-001** (P0, Unit) — Module loads and exposes contract
  - **Links**: REQ-002, TASK-010
  - **Preconditions**: `appointment_service.py` present
  - **Steps**:
    1. Import module
    2. Assert functions exist: `get_appointments`, `create_appointment`, `update_appointment_status` (and `delete_appointment` if implemented)
  - **Expected**: Functions callable

- **TEST-002** (P0, Unit) — Mock dataset contains >=10 items and required fields
  - **Links**: REQ-003, TASK-011
  - **Steps**:
    1. Call `get_appointments({})`
    2. Assert length >= 10
    3. For each item, assert keys: `id`, `patientName`, `date`, `time`, `duration`, `doctorName`, `status`, `mode`
  - **Expected**: All records conform

- **TEST-003** (P0, Unit) — Filter by date
  - **Links**: REQ-004, TASK-012
  - **Steps**:
    1. Pick a known date present in mock data
    2. Call `get_appointments({date})`
  - **Expected**: All returned have that date

- **TEST-004** (P0, Unit) — Filter by status and doctorName (AND)
  - **Links**: REQ-004, TASK-012
  - **Steps**:
    1. Call `get_appointments({status:'Scheduled', doctorName:'Dr. X'})`
  - **Expected**: All returned match both constraints

- **TEST-005** (P0, Unit) — Update status success
  - **Links**: REQ-005, TASK-013
  - **Preconditions**: known appointment id exists
  - **Steps**:
    1. Call `update_appointment_status(id, 'Cancelled')`
    2. Call `get_appointments({})` and find same id
  - **Expected**: status updated and persisted in mock store

- **TEST-006** (P0, Unit) — Update status invalid status rejected
  - **Links**: REQ-005, TASK-013
  - **Steps**:
    1. Call `update_appointment_status(id, 'INVALID')`
  - **Expected**: Raises/returns validation error; no data change

- **TEST-007** (P0, Unit) — Create appointment success with default status
  - **Links**: REQ-006, TASK-014
  - **Steps**:
    1. Call `create_appointment({patientName, date, time, duration, doctorName, mode})` without status
  - **Expected**: Returns appointment with unique id and `status == 'Scheduled'`

- **TEST-008** (P0, Unit) — Create appointment missing required field rejected
  - **Links**: REQ-006, TASK-014
  - **Steps**:
    1. Call create without `doctorName`
  - **Expected**: Validation error

- **TEST-009** (P0, Unit) — Create appointment overlap detected
  - **Links**: REQ-006, TASK-015
  - **Preconditions**: existing appointment for same doctor/date 09:00 duration 30
  - **Steps**:
    1. Create new at 09:15 duration 30 for same doctor/date
  - **Expected**: Conflict error

- **TEST-010** (P1, Unit) — Create appointment adjacent times allowed
  - **Links**: REQ-006, TASK-015
  - **Steps**:
    1. Existing: 09:00–09:30
    2. Create: 09:30–10:00
  - **Expected**: Allowed (no overlap)

- **TEST-011** (P1, Unit) — Cancelled appointments do not block overlap
  - **Links**: REQ-006, TASK-015
  - **Steps**:
    1. Existing conflicting appointment is Cancelled
    2. Create overlapping time
  - **Expected**: Allowed (if rule chosen); otherwise flagged under open questions

- **TEST-012** (P1, Unit) — Sorting by date/time
  - **Links**: REQ-004, TASK-012
  - **Steps**:
    1. Call get_appointments({})
  - **Expected**: Returned list sorted ascending by date then time

- **TEST-013** (P1, Unit) — Delete appointment (if implemented)
  - **Links**: REQ-007, TASK-016
  - **Steps**:
    1. Create appointment
    2. Delete by id
    3. Verify not returned by get_appointments
  - **Expected**: Deleted and returns True

- **TEST-014** (P2, Manual/Doc) — Consistency explanation present
  - **Links**: REQ-008, TASK-017, TASK-041
  - **Steps**:
    1. Review python comments and README
  - **Expected**: Mentions transactionality, constraints, idempotency key, optimistic locking

### Frontend (Integration/E2E-level)
- **TEST-020** (P0, Integration) — Initial render loads appointments
  - **Links**: REQ-009, TASK-020
  - **Preconditions**: backend contract available
  - **Steps**:
    1. Load page
  - **Expected**: appointments list renders non-empty; no console errors

- **TEST-022** (P0, Integration) — Calendar click filters appointments
  - **Links**: REQ-010, TASK-021
  - **Steps**:
    1. Click date with known appointments
  - **Expected**: list shows only that date

- **TEST-023** (P0, Integration) — Today tab shows only today
  - **Links**: REQ-011, TASK-022
  - **Steps**:
    1. Click Today tab
  - **Expected**: all items date == today

- **TEST-024** (P0, Integration) — Past tab shows only past
  - **Links**: REQ-011, TASK-022
  - **Steps**:
    1. Click Past tab
  - **Expected**: all items date < today

- **TEST-025** (P0, Integration) — Upcoming tab shows only future
  - **Links**: REQ-011, TASK-022
  - **Steps**:
    1. Click Upcoming tab
  - **Expected**: all items date > today

- **TEST-026** (P0, Integration) — Status update updates UI
  - **Links**: REQ-012, TASK-023
  - **Steps**:
    1. Click Cancel/Confirm on an appointment
  - **Expected**: status badge changes; list refreshes consistently

- **TEST-027** (P0, E2E) — Create appointment success appears in list
  - **Links**: REQ-013, TASK-024
  - **Steps**:
    1. Open New Appointment form
    2. Fill required fields with non-conflicting slot
    3. Submit
  - **Expected**: appointment appears after refresh; form closes or resets

- **TEST-028** (P0, E2E) — Create appointment conflict shows error
  - **Links**: REQ-013, TASK-032
  - **Steps**:
    1. Create appointment overlapping existing
  - **Expected**: visible error message; no appointment added

- **TEST-029** (P1, Accessibility) — Tabs are keyboard navigable
  - **Links**: TASK-033
  - **Steps**:
    1. Use Tab/Arrow keys to navigate tabs
  - **Expected**: focus visible; selection changes without mouse

- **TEST-030** (P1, Accessibility) — Form labels and focus
  - **Links**: TASK-033
  - **Steps**:
    1. Tab through form inputs
  - **Expected**: each input has label; focus ring visible

- **TEST-031** (P2, Manual/Doc) — README contains GraphQL examples
  - **Links**: REQ-014, TASK-041
  - **Expected**: README shows query/mutation shapes and how they map to python functions

---

# G) Security & Data Considerations

## Authentication and authorization expectations
- The assignment does not require auth, but the design should anticipate:
  - **AuthN**: user identity (staff member)
  - **AuthZ**: role-based permissions (receptionist vs doctor vs admin)
  - Example rule: only authorized roles can cancel or create appointments.

## Data access rules
- Appointment data contains patient identifiers (name). Treat as sensitive.
- UI should avoid exposing data beyond what’s needed for the view.

## Sensitive data handling
- Do not log full appointment payloads in production.
- If adding optional fields (phone/email), classify as sensitive and protect similarly.

## Common threat scenarios and mitigations (conceptual)
- **Input tampering**: Validate enums and formats server-side (Python).
- **ID guessing**: Use UUIDs to reduce predictability.
- **Unauthorized changes**: Require authorization checks in real system.
- **Race conditions double-booking**: Use DB-level exclusion constraints + transactions.
- **Replay / retry duplicates**: Use idempotency keys for `createAppointment`.

---

# H) Assumptions, Constraints & Open Questions

## Assumptions (made due to missing details)
- **A-001**: Date format is `YYYY-MM-DD` and time format is `HH:MM` 24-hour.
- **A-002**: `duration` is an integer in minutes.
- **A-003**: Cancelled appointments do not block scheduling conflicts (recommended).
- **A-004**: Tab filtering is primarily date-based (Upcoming=future, Today=today, Past=past).

## Constraints imposed by Project Plan.md
- **C-001**: Must include `appointment_service.py` with specified functions.
- **C-002**: Must support creating appointments via backend API; frontend must not “just push into array.”
- **C-003**: Must integrate into provided frontend component file and implement calendar/tab/status/create flows.

## Open Questions / Required Decisions
- **Q-001 (critical)**: How should React call Python?
  - Option A: evaluation harness supports direct python execution.
  - Option B: implement a minimal API bridge.
  - Option C: JS mirror for runtime.
- **Q-002**: Should `Upcoming` tab be status-based (status==Upcoming) or date-based (future dates)?
  - Recommended: date-based for determinism.
- **Q-003**: Exact allowed values for `mode`?
  - Recommended: `InPerson` and `Telehealth`.
- **Q-004**: Should cancelled appointments be excluded from certain tabs by default?
  - Recommended: keep visible but visually de-emphasize; optionally add a status filter.
- **Q-005**: Should `get_appointments()` return copies (immutable) or references?
  - Recommended: return copies to avoid accidental mutation.

---

# I) Final Planning Checklist

## Readiness checklist (before implementation starts)
- [ ] Confirm location/name of the provided frontend file (e.g., `EMR_Frontend__Assignment.jsx`).
- [ ] Decide the Python↔React integration approach (Q-001).
- [ ] Confirm date/time format assumptions (A-001).
- [ ] Confirm mode enum values (Q-003).
- [ ] Confirm tab filtering semantics (Q-002).

## Validation checklist (alignment with Project Plan.md)
- [ ] `appointment_service.py` exists and contains mock data >=10 items.
- [ ] `get_appointments(filters)` supports optional `date`, `status`, `doctorName`.
- [ ] `create_appointment(payload)` validates required fields, generates id, defaults status, blocks overlaps.
- [ ] `update_appointment_status(id, new_status)` updates and documents subscription/transaction points.
- [ ] Frontend uses hooks to load appointments and calls backend functions for create/update.
- [ ] Calendar filtering works and updates displayed list.
- [ ] Tabs Upcoming/Today/Past filter consistently.
- [ ] README explains GraphQL-like query structure and consistency.
