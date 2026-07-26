# QR Entry Pass — Backend

Express + MongoDB (Mongoose) + JWT.

## Setup

```bash
cd server
cp .env.example .env      # edit MONGO_URI / JWT_SECRET
npm install
npm run seed              # optional: seed users + demo passes
npm run dev               # http://localhost:5000
```

Seeded credentials:
- Admin — `admin@example.com` / `admin123`
- Security — `security@example.com` / `security123`

## Endpoints

Auth: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
Passes: `GET/POST /api/passes`, `GET/PUT/DELETE /api/passes/:id`, `POST /api/passes/:id/approve|reject`
Scanner: `POST /api/scanner/verify|entry|exit`, `GET /api/scanner/history`
Analytics: `GET /api/analytics/dashboard`

## Client

Set `VITE_API_URL=http://localhost:5000` in the client `.env` (root of repo).
