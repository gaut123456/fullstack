# Fullstack Contacts App

Beautiful, minimal full‑stack app to manage contacts with authentication.

- Backend: Node.js/Express + MongoDB + JWT + Swagger
- Frontend: React (Vite) with simple auth flow and CRUD UI

---

## Features

- Email/password registration and login (JWT auth)
- Protected contacts API: list, create, update, delete
- React UI with login/register and contacts management
- Swagger UI available at `/api-docs`
- Jest + Supertest tests for backend controllers and middleware

## Tech Stack

- Backend: `express`, `mongoose`, `jsonwebtoken`, `bcryptjs`, `cors`, `dotenv`, `swagger-ui-express`
- Frontend: `react`, `react-router-dom`, `vite`
- Testing: `jest`, `supertest`

## Monorepo Structure

```
.
├── backdend/           # Node.js/Express API (auth + contacts)
│   ├── app.js
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── tests/
│   └── swagger.json
└── frontend/           # React app (Vite)
    ├── src/
    └── vite.config.js
```

Note: The backend folder is named `backdend` (intentional per project).

## Quick Start

Prerequisites:

- Node.js 18+ and npm (or Bun for the frontend if preferred)
- A MongoDB database (Atlas or local)

### 1) Configure environment (backend)

Create `backdend/.env` with your values (do NOT commit real secrets):

```
PORT=3000
MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>/<db>?retryWrites=true&w=majority
BCRYPT_SECRET=<random_pepper_string>
JWT_SECRET=<random_jwt_secret>
JWT_EXPIRES_IN=1d
```

Security tip: add `.env` to `.gitignore` and avoid committing secrets.

### 2) Install & run backend

```
cd backdend
npm install
node app.js
```

The API runs at `http://localhost:3000` and Swagger UI at `http://localhost:3000/api-docs`.

### 3) Install & run frontend

```
cd frontend
npm install
npm run dev
```

Open the printed local URL (usually `http://localhost:5173`). The frontend expects the backend at `http://localhost:3000`.

## Using the App

1) Visit the frontend and register a new account.
2) Log in to receive a JWT stored in `localStorage`.
3) Navigate to Contacts to add, edit, and remove contacts.

## API Overview

Base URL: `http://localhost:3000`

- `POST /api/auth/register` → `{ email, password }`
- `POST /api/auth/login` → `{ email, password }` → returns `{ token, user }`
- `GET /api/contacts` → Bearer token required
- `POST /api/contacts` → `{ firstName, lastName, phone }` (Bearer)
- `PATCH /api/contacts/:id` → partial `{ firstName?, lastName?, phone? }` (Bearer)
- `DELETE /api/contacts/:id` (Bearer)

Swagger: `http://localhost:3000/api-docs`

### Example requests (cURL)

```
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"user@example.com","password":"secret123"}'

# Login → get token
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"user@example.com","password":"secret123"}' | jq -r .token)

# List contacts
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/contacts

# Create a contact
curl -X POST http://localhost:3000/api/contacts \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"firstName":"Ada","lastName":"Lovelace","phone":"0123456789"}'
```

## Testing (Backend)

The tests mock the DB layer for fast, deterministic runs.

```
cd backdend
npm test
```

## Common Scripts

- Backend
  - `npm test` → run Jest tests
  - `node app.js` → start API server
- Frontend
  - `npm run dev` → start Vite dev server
  - `npm run build` → build for production
  - `npm run preview` → preview the production build locally

## Configuration Notes

- The frontend uses `localStorage` for the JWT and points to `http://localhost:3000` for APIs.
- The API validates inputs (email format, password length, phone length) and returns localized messages.
- MongoDB indexes are defined on the models; ensure the connected user has permission to create indexes.

## Roadmap / Ideas

- Add Docker setup for one‑command dev
- Add `npm start` script in backend with nodemon
- Centralize API base URL via environment variable in frontend (e.g., Vite env)
- Improve UI design and form validation
- Add e2e tests and CI workflow

## Badges

![Status](https://img.shields.io/badge/status-active-brightgreen)
![Backend](https://img.shields.io/badge/backend-Express-blue)
![Frontend](https://img.shields.io/badge/frontend-React-blueviolet)
![License](https://img.shields.io/badge/license-MIT-informational)

---

Questions or improvements? Feel free to open an issue or PR.
