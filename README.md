# Holy Chalupa — starter source code

A runnable starter for the Holy Chalupa company website using:
- Frontend: React + Vite + TypeScript
- Backend: FastAPI
- Database: PostgreSQL
- Admin: HTTP Basic authentication for the starter admin API (change credentials before deployment)

## 1. Requirements
- Node.js 20+
- Python 3.11+
- PostgreSQL 15+

## 2. Configure the backend
Create a PostgreSQL database, for example `holy_chalupa`.
Copy `backend/.env.example` to `backend/.env` and set the database URL and strong admin credentials.

## 3. Start the backend (PowerShell)
```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload
```
API docs: http://127.0.0.1:8000/docs

## 4. Start the frontend (second PowerShell window)
```powershell
cd frontend
npm install
npm run dev
```
Open the local URL Vite prints (usually http://localhost:5173).

## 5. Before production
- Use HTTPS.
- Replace the starter HTTP Basic admin authentication with a proper session/OAuth login.
- Set unique strong credentials and store secrets in the hosting provider's secret manager.
- Add email delivery for inquiry notifications and backups/monitoring.
- Review privacy wording, portfolio claims, and contact details.
- The portfolio entries in this starter are illustrative examples; replace them with verified work before publishing.
