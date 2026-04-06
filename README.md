# Reunite Hub

Reunite Hub is a Django REST backend for coordinating missing-person cases, community sightings/tips, volunteer applications, and family support resources.

## What this project includes

- **Authentication & account management**
  - Email/password registration and login
  - JWT access/refresh tokens
  - MFA enable/verify flow (email-based simulation)
  - OAuth login endpoint scaffold (Google/Facebook)
- **Missing-person reporting**
  - Create/list/update reports
  - Add sightings and tips to a report
  - Filtering support for report queries
- **Volunteer management**
  - Volunteer application submission
  - Logged-in volunteer status retrieval
  - Public verified partner listing
- **Family support & resources**
  - Family support ticket creation/listing
  - Public resource listing
- **Async + real-time foundations**
  - Celery task for critical alert notifications
  - Django Channels WebSocket consumers for report/sighting feed

## Tech stack

- Python 3
- Django 5
- Django REST Framework
- SimpleJWT
- Celery + Redis
- Django Channels + channels-redis
- SQLite (default dev DB)

## Project structure

```text
reunitehub_backend/
├── accounts/      # custom user model, auth, MFA, OAuth scaffolding
├── reports/       # missing-person reports, sightings, tips, websocket + celery hooks
├── volunteers/    # volunteer applications and partners
├── resources/     # family support requests and public resources
├── reunitehub/    # Django settings, URL config, ASGI/WSGI, Celery app
└── manage.py
```

## Quick start

### 1) Clone and enter project

```bash
git clone <your-repo-url>
cd Reunite_Hub/reunitehub_backend
```

### 2) Create and activate virtual environment

```bash
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\\Scripts\\activate
```

### 3) Install dependencies

```bash
pip install -r requirements.txt
```

### 4) Run migrations

```bash
python manage.py migrate
```

### 5) Start development server

```bash
python manage.py runserver
```

API base URL (local): `http://127.0.0.1:8000/`

## Optional services (for async + websockets)

The project is configured to use Redis at `redis://127.0.0.1:6379/0` for both Celery and Channels.

Start Redis, then run:

```bash
# Terminal 1 (Django)
python manage.py runserver

# Terminal 2 (Celery worker)
celery -A reunitehub worker -l info
```

## Complete endpoint list + JSON examples

> **Auth:** use `Authorization: Bearer <access_token>` for protected endpoints.

### System/admin

#### `GET /admin/`
Django admin page (HTML), not JSON API.

---

### Auth endpoints (`/api/auth/`)

#### `POST /api/auth/register`
Creates a new user and returns JWT tokens.

**Example request JSON**
```json
{
  "email": "newuser@example.com",
  "phone": "+251911234567",
  "first_name": "Alem",
  "last_name": "Bekele",
  "password": "StrongPass123!",
  "role": "Regular",
  "language": "en"
}
```

#### `POST /api/auth/login`
Email/password login.

**Example request JSON**
```json
{
  "email": "newuser@example.com",
  "password": "StrongPass123!"
}
```

#### `POST /api/auth/token/refresh`
Refreshes access token.

**Example request JSON**
```json
{
  "refresh": "<refresh_token>"
}
```

#### `POST /api/auth/mfa-enable`
Generates and sends MFA code (simulated).

**Example request JSON**
```json
{}
```

#### `POST /api/auth/mfa-verify`
Verifies MFA code.

**Example request JSON**
```json
{
  "code": "123456"
}
```

#### `POST /api/auth/oauth-login`
OAuth login/registration bridge.

**Example request JSON**
```json
{
  "provider": "google",
  "access_token": "<oauth_access_token>"
}
```

---

### Report endpoints (`/api/reports/`)

#### `GET /api/reports/`
Lists active reports (`pending` / `verified`). Public.

**Optional query params**
- `gender`
- `age_range`
- `status`
- `last_seen_after` (ISO datetime)
- `location_search`
- `min_age`
- `max_age`

**Example URL**
```text
/api/reports/?location_search=Addis&min_age=10&max_age=18
```

#### `POST /api/reports/`
Creates missing-person report. Auth required.

**Example request JSON**
```json
{
  "full_name": "Kidus Tadesse",
  "age": 13,
  "age_range": "minor",
  "gender": "male",
  "last_seen_date": "2026-04-01T14:30:00Z",
  "last_seen_location": "Meskel Square, Addis Ababa",
  "description": "Wearing blue hoodie and black jeans.",
  "latitude": 8.9806,
  "longitude": 38.7578
}
```

#### `GET /api/reports/<id>`
Fetch single report by ID.

#### `PUT /api/reports/<id>`
Replaces report fields (owner-only).

**Example request JSON**
```json
{
  "full_name": "Kidus Tadesse",
  "age": 13,
  "age_range": "minor",
  "gender": "male",
  "last_seen_date": "2026-04-01T14:30:00Z",
  "last_seen_location": "Kazanchis, Addis Ababa",
  "description": "Updated details.",
  "latitude": 8.991,
  "longitude": 38.76
}
```

#### `PATCH /api/reports/<id>`
Partial update (owner-only).

**Example request JSON**
```json
{
  "last_seen_location": "Bole, Addis Ababa",
  "description": "Possible sighting near Bole Medhanialem."
}
```

#### `DELETE /api/reports/<id>`
Deletes report (owner-only). No request JSON.

#### `GET /api/reports/<report_id>/sightings`
Lists sightings for one report. Public.

#### `POST /api/reports/<report_id>/sightings`
Creates sighting for report. Anonymous or authenticated.

**Example request JSON**
```json
{
  "sighting_date": "2026-04-02T09:15:00Z",
  "location_description": "Piassa bus terminal",
  "latitude": 9.0343,
  "longitude": 38.7469,
  "clothing_description": "Blue hoodie, carrying a red bag"
}
```

#### `GET /api/reports/<report_id>/tips`
Lists tips for one report.

#### `POST /api/reports/<report_id>/tips`
Creates tip for report. Anonymous or authenticated.

**Example request JSON**
```json
{
  "content": "I saw someone matching this description near Arat Kilo around 6 PM.",
  "contact_phone": "+251912345678"
}
```

---

### Volunteer endpoints (`/api/volunteers/`)

#### `POST /api/volunteers/apply/`
Submit volunteer application (auth required).

**Example request JSON**
```json
{
  "skill_set": "search",
  "availability": "Weekends and weekday evenings"
}
```

#### `GET /api/volunteers/status/`
Fetch current user's application status (auth required).

#### `GET /api/volunteers/partners/`
List verified partners (public).

---

### Resource endpoints (`/api/resources/`)

#### `GET /api/resources/support/`
List logged-in user's support requests.

#### `POST /api/resources/support/`
Create family support request (auth required).

**Example request JSON**
```json
{
  "report": 1,
  "subject": "Need legal and counseling support",
  "support_message": "Our family needs help with filing and emotional support services."
}
```

#### `GET /api/resources/list/`
List public resources.

---

### WebSocket endpoints

#### `ws://127.0.0.1:8000/ws/reports/live-feed/`
Live report/sighting feed group.

#### `ws://127.0.0.1:8000/ws/reports/<report_id>/updates/`
Updates for one report room.

**Example server event payload**
```json
{
  "type": "sighting_added",
  "data": {
    "id": 12,
    "missing_person_name": "Kidus Tadesse",
    "sighting_date": "2026-04-02T09:15:00Z",
    "location_description": "Piassa bus terminal",
    "latitude": "9.034300",
    "longitude": "38.746900",
    "clothing_description": "Blue hoodie, carrying a red bag",
    "photo": null,
    "is_verified": false,
    "created_at": "2026-04-02T09:16:10.000000Z"
  }
}
```

## Quick cURL smoke tests

```bash
# 1) Register
curl -X POST http://127.0.0.1:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"newuser@example.com","phone":"+251911234567","password":"StrongPass123!"}'

# 2) Login
curl -X POST http://127.0.0.1:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"newuser@example.com","password":"StrongPass123!"}'

# 3) Create report (replace ACCESS_TOKEN)
curl -X POST http://127.0.0.1:8000/api/reports/ \
  -H "Authorization: Bearer ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"full_name":"Kidus Tadesse","age":13,"age_range":"minor","gender":"male","last_seen_date":"2026-04-01T14:30:00Z","last_seen_location":"Meskel Square, Addis Ababa","description":"Wearing blue hoodie and black jeans."}'
```

## Notes for contributors

- Default database is SQLite for local development.
- Global DRF default permission is authenticated access; some views explicitly allow public access.
- If you’re extending background jobs or realtime flows, validate Redis availability first.

## License

No license file is currently included in this repository. Add one if you plan to distribute this project publicly.
