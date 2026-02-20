# Task Manager Assessment

A full-stack task manager app with:

- Backend: Django + Django REST Framework
- Frontend: React + Vite + shadcn/ui

## Prerequisites

- Python 3.10+
- Node.js 18+
- pnpm 10+

## Backend Setup (Django)

From project root:

```bash
cd backend

# If needed, create a virtual environment
python3 -m venv venv
source venv/bin/activate

# pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Start backend server
python manage.py runserver
```

Backend runs at:

- `http://127.0.0.1:8000`

## Frontend Setup (React + Vite)

From project root:

```bash
cd frontend
pnpm install
pnpm dev
```

Frontend runs at:

- `http://127.0.0.1:5173`

Optional environment variable (frontend):

- `VITE_API_BASE_URL` (defaults to `http://127.0.0.1:8000`)

Example `.env` in `frontend/`:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

## Run From Root (After Initial Setup)

If both backend and frontend are already set up, you can use the root scripts:

```bash
pnpm run dev:backend
pnpm run dev:frontend
```

Build frontend from root:

```bash
pnpm run build:frontend
```

## API Endpoint Summary

Base URL:

- `http://127.0.0.1:8000`

Endpoints:

1. `GET /tasks/`

- List all tasks (ordered by newest first)

1. `POST /tasks/`

- Create a task
- Request body:

```json
{
  "title": "My task",
  "description": "Optional description",
  "completed": false
}
```

1. `GET /tasks/{id}/`

- Retrieve a single task

1. `PUT /tasks/{id}/`

- Update full task
- Request body should include:

```json
{
  "title": "Updated title",
  "description": "Updated description",
  "completed": true
}
```

1. `PATCH /tasks/{id}/`

- Toggle/set completion only
- Request body:

```json
{
  "completed": true
}
```

- If `completed` is missing, API returns `400` with detail message.

1. `DELETE /tasks/{id}/`

- Delete task
- Returns `204 No Content`

## Additional Notes / Assumptions

- CORS is configured for frontend dev URLs:
  - `http://localhost:5173`
  - `http://127.0.0.1:5173`
- Database is SQLite (`backend/db.sqlite3`).
- Frontend uses Axios for API calls and `react-hook-form` + `zod` for form validation.
- The backend exposes task routes at root (no `/api/` prefix).
