# EndoScan AI — Backend

Django REST API backend for EndoScan AI, an endometriosis symptom-checker and patient support platform.

## Stack
- Django + Django REST Framework
- PostgreSQL
- JWT authentication (`rest_framework_simplejwt`)

## Setup

1. Clone the repo and create a virtual environment:

2. Install dependencies: pip install -r requirements.txt

3. Create a `.env` file in the project root:SECRET_KEY=your-secret-key
DB_NAME=endo_db
DB_USER=endo_user
DB_PASSWORD=your-db-password
DB_HOST=localhost
DB_PORT=5432
JWT_SIGNING_KEY=your-jwt-signing-key

4. Run migrations:python manage.py migrate

5. Start the server:python manage.py runserver

## Key Endpoints
- `POST /api/patients/register/` — sign up
- `POST /api/patients/login/` — log in
- `GET /api/patients/me/` — get logged-in patient's profile
- `POST /api/patients/change-password/` — change password
- `GET/POST /api/patients/logs/` — symptom logs
- `GET/POST /api/patients/scans/` — scan uploads
- `GET/POST /api/patients/chat/` — chat messages
- `GET/POST /api/patients/questionnaire-submissions/` — questionnaire submissions
