# Associate Registration Portal — Full Stack

React + Vite + Tailwind frontend · Express + MongoDB backend · JWT auth · Role-based access

## Role Hierarchy

| Role        | Can Create       | Can See                          |
|-------------|-----------------|----------------------------------|
| head_admin  | admin, associate | Everything — all users & associates |
| admin       | associate only   | Own profile + associates they created |
| associate   | nothing          | Own profile only                 |

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB running locally (`mongod`)

### Run both servers

```bash
npm run install:all   # installs all deps (root + backend + frontend)
npm run dev           # starts API on :5000 and UI on :5173
```

### First Login (Head Admin)
```
Email:    admin@portal.com
Password: Admin@1234
```
Change this in `backend/.env` before production.

## Screens by Role

**Head Admin:**
- Dashboard with stats
- Associates list — view all, update status, delete
- Users list — all admins and associates, tree view
- Create user (admin or associate)
- Register new associate (7-step form)
- My Profile

**Admin:**
- Dashboard
- Associates list — only ones they created
- My Team — tree of their associates
- Create associate
- Register new associate
- My Profile

**Associate:**
- Dashboard
- My Associates — only ones they registered
- My Profile

## API Endpoints

### Auth
| Method | Endpoint        | Description     |
|--------|-----------------|-----------------|
| POST   | /api/auth/login | Login           |
| GET    | /api/auth/me    | Get current user|

### Users
| Method | Endpoint              | Access                  |
|--------|-----------------------|-------------------------|
| POST   | /api/users            | head_admin, admin       |
| GET    | /api/users            | head_admin (all), admin (own team) |
| GET    | /api/users/:id        | scoped                  |
| GET    | /api/users/:id/tree   | scoped                  |
| PATCH  | /api/users/:id        | self or creator         |
| DELETE | /api/users/:id        | head_admin only         |

### Associates
| Method | Endpoint                      | Access          |
|--------|-------------------------------|-----------------|
| POST   | /api/associates               | head_admin, admin |
| GET    | /api/associates               | scoped by role  |
| GET    | /api/associates/:id           | scoped          |
| PATCH  | /api/associates/:id/status    | head_admin only |
| DELETE | /api/associates/:id           | head_admin only |

## Environment

### backend/.env
```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/associate_portal
FRONTEND_URL=http://localhost:5173
JWT_SECRET=change_this_in_production_use_a_long_random_string
JWT_EXPIRES_IN=7d
HEAD_ADMIN_EMAIL=admin@portal.com
HEAD_ADMIN_PASSWORD=Admin@1234
MAX_FILE_SIZE_MB=5
```
