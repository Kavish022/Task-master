# Production-Grade Node.js + TypeScript + SQL Backend

An interview-ready backend architecture adhering to enterprise standards, Clean Layered Architecture, and modern TypeScript best practices.

---

## 🏛️ Architectural Overview

This backend is organized using **Clean Layered Architecture (Separation of Concerns)**:

```
backend-node/
├── prisma/
│   ├── schema.prisma            # Database schema & relations (MySQL)
│   └── seed.ts                  # Database seeding script (Admin & Demo users)
├── src/
│   ├── config/                  # Environment validation & DB connection singleton
│   │   ├── env.ts               # Type-safe environment variables parsed with Zod
│   │   └── db.ts                # PrismaClient singleton with graceful lifecycle
│   ├── constants/               # HTTP status codes & standard response messages
│   ├── middlewares/             # Cross-cutting concerns
│   │   ├── auth.middleware.ts   # JWT authentication & Role-Based Access Control (RBAC)
│   │   ├── validate.middleware.ts # Zod schema validator (body, query, params)
│   │   ├── errorHandler.middleware.ts # Centralized error handler (Prisma, Zod, ApiError)
│   │   ├── rateLimiter.middleware.ts  # Express rate limiting
│   │   └── notFound.middleware.ts     # 404 handler
│   ├── modules/                 # Feature-based clean architecture modules
│   │   ├── auth/                # Authentication & Token Rotation (JWT + Refresh Tokens)
│   │   ├── user/                # User profile & Admin user management
│   │   ├── item/                # Full CRUD, Search, Pagination, Filtering, Ownership rules
│   │   └── health/              # System health, DB ping, uptime & memory metrics
│   ├── types/                   # Express augmentations, auth & pagination types
│   ├── utils/                   # Standardized ApiError, ApiResponse envelope, JWT & Bcrypt
│   ├── app.ts                   # Express application setup & middleware pipeline
│   └── server.ts                # Server bootstrap & graceful shutdown (SIGTERM/SIGINT)
├── .env                         # Local environment configuration
├── .env.example                 # Template environment variables
├── package.json
└── tsconfig.json
```

---

## 🚀 Key Architectural & Interview Highlights

1. **Clean Layered Architecture**:
   - **Routes**: Handle routing, URL parameters, and apply middlewares.
   - **Controllers**: Parse HTTP requests, delegate to services, and format standardized responses (`ApiResponse`).
   - **Services**: Pure business logic (ownership checks, password hashing, token generation), decoupled from Express.
   - **Repositories**: Data access layer encapsulating Prisma queries.

2. **Security & Production Hardening**:
   - **Helmet**: Adds secure HTTP headers.
   - **CORS**: Configurable allowed origin whitelist.
   - **Rate Limiting**: Protects against brute-force and DoS attacks.
   - **Password Hashing**: `bcryptjs` with salt rounds.
   - **Token Rotation**: Short-lived Access Tokens (15m) + revocable Refresh Tokens (7d) stored in SQL database.
   - **Role-Based Access Control (RBAC)**: Support for `USER` and `ADMIN` roles.

3. **Fail-Fast Environment Validation**:
   - Configuration is validated at boot time with `Zod`. The app will crash with an informative error if mandatory variables are missing.

4. **Centralized Error Handling**:
   - Standardized `ApiError` hierarchy (`BadRequestError`, `UnauthorizedError`, `ForbiddenError`, `NotFoundError`, `ConflictError`).
   - Maps Prisma error codes (e.g., `P2002` duplicate key, `P2025` record not found) to HTTP status codes.
   - Formats Zod validation issues cleanly.

5. **Graceful Shutdown**:
   - Listens to `SIGTERM` and `SIGINT` signals, drains in-flight requests, and cleanly disconnects Prisma before exiting.

---

## ⚙️ Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env` (already created with default MySQL port `3306`):
```bash
DATABASE_URL="mysql://root:1234@localhost:3306/node_app_db"
PORT=5001
```

### 3. Sync Database & Seed Data
```bash
# Push schema to MySQL database
npm run db:push

# Seed default Admin and User accounts
npm run db:seed
```

### 4. Run Development Server
```bash
npm run dev
```
The server will start at `http://localhost:5001`.

---

## 🔑 Default Seed Accounts

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@example.com` | `Admin@12345` |
| **User** | `user@example.com` | `User@12345` |

---

## 📡 API Reference

### Health
- `GET /api/health` - Check service uptime, memory metrics, and MySQL database connection.

### Authentication (`/api/v1/auth`)
- `POST /register` - Register a new user (`email`, `password`, `name`).
- `POST /login` - Login (`email`, `password`) -> Returns `accessToken` + `refreshToken`.
- `POST /refresh` - Rotate tokens with `{ "refreshToken": "..." }`.
- `POST /logout` - Revoke refresh token.
- `GET /me` - Get profile of authenticated user (`Authorization: Bearer <token>`).

### Users (`/api/v1/users`)
- `GET /me` - Current user profile.
- `PATCH /me` - Update profile (`name`, `email`).
- `GET /` - Paginated list of users (**ADMIN only**).
- `PATCH /:id/role` - Update user role (**ADMIN only**).

### Items (`/api/v1/items`)
- `GET /` - Paginated search and filter list:
  - Query params: `page`, `limit`, `search`, `status` (`ACTIVE`/`INACTIVE`/`ARCHIVED`), `sortBy`, `sortOrder`.
- `GET /:id` - Get item by ID.
- `POST /` - Create item (Requires Auth).
- `PATCH /:id` - Update item (Owner or Admin).
- `DELETE /:id` - Delete item (Owner or Admin).

---

## 🛠️ How to Add a New Feature / Service

Follow these 4 steps to keep the architecture clean and consistent:

1. **Model & Schema**:
   - Add model to `prisma/schema.prisma`.
   - Run `npx prisma db push` (or `npx prisma migrate dev`).
2. **Module Directory**:
   - Create `src/modules/<feature_name>/`
   - `<feature>.validation.ts` (Zod schemas for body, query, params)
   - `<feature>.repository.ts` (Prisma queries)
   - `<feature>.service.ts` (Business logic)
   - `<feature>.controller.ts` (Express req/res handling)
   - `<feature>.routes.ts` (Router setup)
3. **Register Route**:
   - Mount your router in `src/app.ts`: `app.use('/api/v1/<feature>', <feature>Routes);`
