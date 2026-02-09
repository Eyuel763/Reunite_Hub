# Reunite Hub (Backend)

Backend services for the Reunite Hub project, built with Django REST Framework and JWT authentication. This service provides user registration and login endpoints backed by a custom user model.

## Tech Stack

- Python / Django 5
- Django REST Framework
- Simple JWT for authentication
- SQLite (default)

## Project Structure

```
reunitehub_backend/
├── accounts/          # Custom user model, auth views, serializers
├── reunitehub/        # Django project settings/urls
├── manage.py
└── requirements.txt
```

## Local Development

1. Create and activate a virtual environment.
2. Install dependencies.
3. Run database migrations.
4. Start the development server.

```bash
cd reunitehub_backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

The API will be available at `http://127.0.0.1:8000/`.

## Authentication Endpoints

Base path: `/api/auth/`

| Method | Endpoint                  | Description                                |
| ---    |          ---              |                 ---                        |
| POST   | `/api/auth/register`      | Register a new user and receive JWT tokens |
| POST   | `/api/auth/login`         | Login and receive JWT tokens               |
| POST   | `/api/auth/token/refresh` | Refresh access token                       |

### Example Register Request

```bash
curl -X POST http://127.0.0.1:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "phone": "+251911234567",
    "password": "secure-password",
    "first_name": "Demo",
    "last_name": "User"
  }'
```

### Example Login Request

```bash
curl -X POST http://127.0.0.1:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "secure-password"
  }'
```

## Notes

- The default database is SQLite (`db.sqlite3`).
- JWT access tokens are valid for 60 minutes; refresh tokens are valid for 7 days.
- The custom user model uses `email` as the username and requires a phone number in the `+251XXXXXXXXX` format.
