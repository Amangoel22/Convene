# Deployment

## Render services

Convene is a two-service deployment:

| Part | Render service | Root directory | Build | Start/publish |
|---|---|---|---|---|
| React/Vite frontend | Static Site | `frontend` | `npm install && npm run build` | Publish `dist` |
| Express API | Web Service | `backend` | `npm install && npx prisma generate` | `node src/server.js` |

Render Web Services must listen on the provided `PORT` and `0.0.0.0`; the backend already reads `process.env.PORT`.

## Frontend variables

Set this on the Render Static Site before building:

```env
VITE_API_URL
```

The frontend must not contain database credentials, JWT secrets, Supabase service-role keys, or private API keys.

## Backend variables

Set these on the Render Web Service:

```env
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

Render provides `PORT`; it normally does not need to be added manually.

## React Router rewrite

On the frontend Static Site, add a rewrite rule:

```text
Source:      /*
Destination: /index.html
Action:      Rewrite
```

This lets client-side routes such as `/dashboard`, `/tasks`, and `/settings` resolve after a refresh.

## Storage

Create the `event-resources` bucket in Supabase Storage. The backend uses the service-role key server-side to upload files and create short-lived signed download URLs. Never expose that key in the frontend or commit it to Git.

## Deployment checks

1. Confirm the frontend API URL points to the deployed backend.
2. Confirm backend `CLIENT_URL` exactly matches the frontend origin.
3. Confirm database migrations have run.
4. Confirm Supabase bucket and service-role variables are configured.
5. Confirm the frontend rewrite exists.
6. Test login, event loading, task loading, and resource upload after deployment.
