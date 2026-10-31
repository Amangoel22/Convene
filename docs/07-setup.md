# Local Setup

## Requirements

- Node.js 22 or newer
- npm
- PostgreSQL, preferably through Supabase
- A Supabase Storage bucket named `event-resources` when resource uploads are needed

## Install

Run from the repository root:

```bash
npm install
cp backend/.env.example backend/.env
npx prisma generate --schema backend/prisma/schema.prisma
npx prisma migrate deploy --schema backend/prisma/schema.prisma
```

For development, start both workspaces in separate terminals:

```bash
npm run dev:backend
npm run dev:frontend
```

## Environment configuration

Backend: `backend/.env`

```env
PORT
NODE_ENV
CLIENT_URL
DATABASE_URL
JWT_SECRET
JWT_EXPIRES_IN
BCRYPT_SALT_ROUNDS
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_STORAGE_BUCKET
```

Frontend: `frontend/.env`

```env
VITE_API_URL
```

Only `VITE_API_URL` belongs in the frontend. Do not copy backend secrets into `frontend/.env`.

## Optional seed data

```bash
npm run seed --workspace convene-backend
npm run seed:demo --workspace convene-backend
```

Use seed scripts only against a development database.

## Verification

```bash
npm run build
npm run lint
```
