# Environment Switch Guide (Windows UI -> Linux Backend/DB)

## 1) Correct API URL format
Use this format for frontend API:

- `http://57.154.241.153:8080/api`

Do NOT use:

- `http://57.154.241.153:5173:8080/api` (invalid URL)

`5173` is frontend port, `8080` is backend port.

## 2) Current frontend file to change
Frontend reads API base URL from:

- `frontend/.env`

This file now includes a commented "Server push profile" block so you can uncomment/update it later.

Set:

- `VITE_API_BASE_URL=http://57.154.241.153:8080/api`

## 3) Backend file to keep stable in code
Backend uses env placeholders in:

- `backend/src/main/resources/application.yml`

Keep this file generic (already done). Supply real values at runtime using environment variables:

- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USERNAME`
- `DB_PASSWORD`
- `JWT_SECRET`

## 4) Runtime requirement
Yes, backend must be running continuously while you test UI. Frontend calls backend APIs for login and data.

## 5) What to edit before final server push
For one-time final switch after UI changes are complete:

1. `frontend/.env`:
- Set final server API URL

2. Server runtime env (Linux shell, systemd, or container env):
- Set backend DB/JWT env variables
- Use `backend/.env.server.example` as your copy template

3. Optional CORS update (only if frontend origin changes from localhost):
- `backend/src/main/java/com/company/projectmanagement/config/WebConfig.java`

## 6) Recommended values for your current setup
Frontend local (Windows dev server):
- UI URL: `http://localhost:5173`
- API URL in frontend env: `http://57.154.241.153:8080/api`

Backend (Linux):
- Run app on `8080`
- Ensure PostgreSQL is reachable from backend host

## 7) Quick smoke check
1. Start backend on Linux
2. Start frontend on Windows (`npm --prefix frontend run dev`)
3. Open `http://localhost:5173`
4. Login with seeded admin account
5. Verify dashboard and navigation load without CORS errors

## 8) Push-later helper files added
- `frontend/.env`: contains active dev values plus commented server profile block
- `backend/.env.server.example`: copy template for server runtime variables
