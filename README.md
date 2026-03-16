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

## API route overview

### Auth (`/api/auth/`)

- `POST register`
- `POST login`
- `POST token/refresh`
- `POST mfa-enable`
- `POST mfa-verify`
- `POST oauth-login`

### Reports (`/api/reports/`)

- `GET/POST /`
- `GET/PUT/PATCH/DELETE /<id>`
- `GET/POST /<report_id>/sightings`
- `GET/POST /<report_id>/tips`

### Volunteers (`/api/volunteers/`)

- `POST /apply/`
- `GET /status/`
- `GET /partners/`

### Resources (`/api/resources/`)

- `GET/POST /support/`
- `GET /list/`

## WebSocket endpoints

- `ws/reports/live-feed/`
- `ws/reports/<report_id>/updates/`

## Notes for contributors

- Default database is SQLite for local development.
- Global DRF default permission is authenticated access; some views explicitly allow public access.
- If you’re extending background jobs or realtime flows, validate Redis availability first.

## License

No license file is currently included in this repository. Add one if you plan to distribute this project publicly.
