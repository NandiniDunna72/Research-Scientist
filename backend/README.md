# AI Research Scientist - FastAPI Backend

Production-ready REST API backend for the **AI Research Scientist** platform powered by **FastAPI**, **PostgreSQL**, **SQLAlchemy**, **Alembic**, and **JWT Authentication**.

---

## 🛠 Tech Stack

- **Framework**: FastAPI (Python 3.12+ / 3.14+)
- **Server**: Uvicorn
- **Database**: PostgreSQL
- **ORM**: SQLAlchemy 2.0+
- **Driver**: psycopg (v3)
- **Migrations**: Alembic
- **Validation**: Pydantic v2
- **Authentication**: JWT (PyJWT) with bcrypt password hashing

---

## 📁 Project Architecture

```
backend/
├── app/
│   ├── main.py              # FastAPI application, CORS, exception handlers & routes
│   ├── core/
│   │   ├── config.py        # Environment settings (Pydantic Settings)
│   │   ├── security.py      # bcrypt password hashing & JWT token operations
│   │   └── dependencies.py  # Reusable get_current_user authentication dependency
│   ├── database/
│   │   ├── database.py      # SQLAlchemy engine, session maker & get_db generator
│   │   └── models.py        # Database models aggregator
│   ├── models/
│   │   └── user.py          # SQLAlchemy User model (PostgreSQL users table)
│   ├── schemas/
│   │   ├── user.py          # User request/response Pydantic models
│   │   └── auth.py          # Register, Login, Token, and Auth schemas
│   ├── routers/
│   │   ├── auth.py          # /api/auth/register, /api/auth/login, /api/auth/me, /api/auth/logout
│   │   └── users.py         # /api/users/me, /api/users/profile
│   └── services/
│       └── auth_service.py  # User registration, password verification & token service
├── alembic/                 # Alembic migration environment and versions
│   ├── env.py
│   ├── script.py.mako
│   └── versions/
│       └── 11d56c728318_create_users_table.py
├── alembic.ini
├── .env
├── .env.example
├── requirements.txt
└── README.md
```

---

## 🚀 Setup & Installation Instructions

### 1. Create PostgreSQL Database

If the database is not already created in PostgreSQL:
```sql
CREATE DATABASE ai_research_scientist;
```

### 2. Configure Environment (`.env`)

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Configure your PostgreSQL credentials in `.env`:
```env
DATABASE_URL=postgresql+psycopg://postgres:YOUR_PASSWORD@localhost:5432/ai_research_scientist
JWT_SECRET_KEY=your_secure_random_jwt_secret_key_minimum_32_characters
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
FRONTEND_URL=http://localhost:5173
```
*(Note: If your password contains special characters like `@`, URL-encode them, e.g., `%40` for `@`)*

### 3. Create Python Virtual Environment & Install Dependencies

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# On Windows (CMD):
.\venv\Scripts\activate.bat
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 4. Run Database Migrations

Apply database migrations using Alembic:
```bash
alembic upgrade head
```

To create new migrations in the future:
```bash
alembic revision --autogenerate -m "describe changes"
alembic upgrade head
```

### 5. Start the FastAPI Backend Server

Run the development server with Uvicorn:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

The API will be live at:
- **API Base URL**: `http://localhost:8000`
- **Health Check**: `http://localhost:8000/api/health`

### 6. Interactive API Documentation (Swagger & ReDoc)

Explore and test all endpoints interactively:
- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## 🧪 Testing the Authentication Flow

### 7. User Registration
**POST** `http://localhost:8000/api/auth/register` (or `/api/auth/signup`)
```json
{
  "full_name": "Dr. Marie Curie",
  "email": "marie.curie@research.org",
  "password": "SecurePassword123"
}
```
**Response (201 Created):**
```json
{
  "message": "Account created successfully",
  "token": "eyJhbGciOi...",
  "access_token": "eyJhbGciOi...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "full_name": "Dr. Marie Curie",
    "email": "marie.curie@research.org",
    "created_at": "2026-10-07T13:00:00Z"
  }
}
```

*Duplicate registration with the same email returns **409 Conflict**.*

---

### 8. User Login
**POST** `http://localhost:8000/api/auth/login` (or `/api/auth/signin`)
```json
{
  "email": "marie.curie@research.org",
  "password": "SecurePassword123"
}
```
**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOi...",
  "token": "eyJhbGciOi...",
  "token_type": "bearer",
  "message": "Signed in successfully.",
  "user": {
    "id": 1,
    "full_name": "Dr. Marie Curie",
    "email": "marie.curie@research.org",
    "created_at": "2026-10-07T13:00:00Z"
  }
}
```

*Invalid credentials return **401 Unauthorized**.*

---

### 9. Get Current User (`/api/auth/me`)
**GET** `http://localhost:8000/api/auth/me`  
**Header**: `Authorization: Bearer <access_token>`

**Response (200 OK):**
```json
{
  "id": 1,
  "full_name": "Dr. Marie Curie",
  "email": "marie.curie@research.org",
  "created_at": "2026-10-07T13:00:00Z",
  "user": {
    "id": 1,
    "full_name": "Dr. Marie Curie",
    "email": "marie.curie@research.org",
    "created_at": "2026-10-07T13:00:00Z"
  }
}
```

*Requests without a valid token return **401 Unauthorized**.*

---

### 10. User Logout
**POST** `http://localhost:8000/api/auth/logout`

**Response (200 OK):**
```json
{
  "message": "Logged out successfully."
}
```

---

## 🔒 Security Best Practices Implemented

1. **Password Protection**: Passwords are securely hashed with `bcrypt` (12 rounds) and never stored in plain text.
2. **Safe Responses**: `password` and `password_hash` fields are strictly excluded from all schemas and API responses.
3. **Normalized Emails**: Emails are converted to lowercase and trimmed before DB lookup/insert to avoid duplicate case collisions.
4. **JWT Bearer Claims**: Tokens include `sub`, `user_id`, and standard UTC expiration `exp`.
5. **CORS Configuration**: Restricts origins specifically to configured frontend URLs (`http://localhost:5173`).
6. **SQL Injection Defense**: Uses SQLAlchemy ORM and parameterized queries for all database operations.
