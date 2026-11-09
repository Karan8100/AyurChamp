# Phase 0 backend — setup (no Docker)

## 1. Install Postgres natively

**macOS:**
```bash
brew install postgresql@16
brew services start postgresql@16
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```
(starts automatically as a service)

**Windows:** download the installer from https://www.postgresql.org/download/windows/

## 2. Create the database and user
```bash
psql postgres
```
Then inside the `psql` prompt:
```sql
CREATE USER prakruti WITH PASSWORD 'prakruti_dev_password';
CREATE DATABASE prakruti_db OWNER prakruti;
\q
```

## 3. Install uv (Python package manager)
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

## 4. Environment variables
```bash
cp .env.example .env
```
Matches what you created in step 2 — no changes needed for local dev.

## 5. Install dependencies
```bash
uv sync
```

## 6. Run the server
```bash
uv run uvicorn app.main:app --reload
```

Visit `http://localhost:8000/docs` for interactive API docs.
Visit `http://localhost:8000/health` to confirm the server and DB connection are up.

## What's included at Phase 0 — auth only

- `User` — supports email+password, phone+OTP, and (future) Google login in one table via `auth_provider`
- `OTPVerification` — short-lived OTP records, separate from `User` since a phone can be verified before an account exists

**Endpoints:**
- `POST /auth/signup` — email + password
- `POST /auth/login` — email + password
- `POST /auth/otp/request` — send OTP to a phone (dev mode returns the code directly in the response — replace with Twilio/MSG91 before shipping)
- `POST /auth/otp/verify` — verify OTP, auto-creates the user on first login

Tables auto-create on startup for now. Once the schema stabilizes, switch to Alembic:
```bash
uv run alembic init migrations
uv run alembic revision --autogenerate -m "initial schema"
uv run alembic upgrade head
```
Then remove the `SQLModel.metadata.create_all` call in `app/main.py`'s lifespan.

## Next steps (Phase 1)
- Add `AssessmentSession` and `QuestionResponse` models once the question bank is finalized
- Wire real OTP delivery (Twilio/MSG91 for phone, Resend/SendGrid for email verification)
- Add Google OAuth (`/auth/google`)
- Add a `GET /auth/me` endpoint that reads the JWT and returns the current user
