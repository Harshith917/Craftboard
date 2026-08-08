# CanvazzFlow

A real-time collaborative design canvas — multiple users editing the same board simultaneously, with live cursors, presence, shape tools, and instant sync. Think a lightweight Figma.

![React](https://img.shields.io/badge/React-19.2-61DAFB)
![Vite](https://img.shields.io/badge/Vite-6.4-646CFF)
![Express](https://img.shields.io/badge/Express-5-000000)
![Prisma](https://img.shields.io/badge/Prisma-7.9-2D3748)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-database-336791)
![License](https://img.shields.io/badge/license-MIT-green)

---

## Features

- **Real-time collaborative editing** — live cursors, presence, and instant sync across users
- **18 shape types** — rectangles, circles, lines, arrows, text, images, stars, diamonds, sticky notes, code blocks, and more
- **Layer management** — hierarchical parent-child layers with drag-and-drop reordering
- **Undo/redo** — full history stack per session with save points
- **Alignment & distribution** — align and distribute shapes precisely
- **Grid snapping & smart guides**
- **Role-based access control** — owner / editor / viewer per project
- **Access management** — invite by email or user ID, request access, approve/deny workflow
- **Real-time notifications** — access requests, invitations, project changes
- **Multi-page projects** with role inheritance
- **Project management** — create, archive, favorite, pin, transfer ownership
- **Global search** across projects
- **Dashboard** — aggregated view of projects, collaborators, recent activity

---

## Demo

https://github.com/user-attachments/assets/78d1b036-f6f5-41ca-bda3-30fe8a04db5c

---

## Architecture

```mermaid
graph TD
    subgraph Client["Browser — React (Vite) SPA"]
        LC[Liveblocks Client]
        SC[Socket.IO Client]
        AX[Axios HTTP Client]
    end

    subgraph LB["Liveblocks Cloud"]
        CRDT[CRDT Sync / Storage]
    end

    subgraph Backend["Express 5 API"]
        API[Routers / Services]
        PR[Prisma ORM]
        DB[(PostgreSQL)]
        CG[Clerk Backend — JWT Verify]
    end

    subgraph Auth["Clerk Cloud"]
        CA[Auth UI + JWT Issuer]
    end

    LC -- WebSocket sync --> CRDT
    CRDT -- webhook: storageUpdated --> API
    SC -- WebSocket events --> API
    AX -- REST + JWT --> API
    API --> PR --> DB
    API --> CG
    LC -. auth request .-> CA
    AX -. session / JWT .-> CA
```

### Real-time edit flow

What happens the instant a user drags a shape:

```mermaid
sequenceDiagram
    participant U as User
    participant LB as Liveblocks Storage
    participant OC as Other clients
    participant WH as Express webhook
    participant DB as PostgreSQL

    U->>LB: Drag shape (useMutation)
    LB-->>OC: Broadcast update over WebSocket (instant)
    LB-->>WH: storageUpdated event (async)
    WH->>DB: Persist node change
```

Liveblocks holds the live, authoritative state — the database is never in the critical path of a live edit.

### Core stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19.2, TypeScript, Vite 6 |
| Canvas rendering | Konva 10 + react-konva 19 |
| Styling / UI | Tailwind CSS v4, Radix UI, shadcn/ui |
| Backend | Express 5 + TypeScript |
| ORM / DB | Prisma 7.9 + PostgreSQL |
| Auth | Clerk (JWT) |
| Real-time canvas sync | Liveblocks 3.18 (CRDT) |
| Real-time events | Socket.IO 4.8 |
| Data fetching | SWR, Axios |

---

## Project structure

```
CanvaColab/
├── server/          # Express API server
│   ├── prisma/        # Database schema + migrations
│   └── src/
│       ├── routes/        # 13 routers (project, page, nodes, users, ...)
│       ├── services/      # Business logic
│       ├── middleware/    # Clerk JWT auth + project role guard
│       └── lib/           # Prisma, Socket.IO gateway, errors
├── client/          # React (Vite) application
│   └── src/
│       ├── pages/         # Routes (dashboard, projects, access, editor, ...)
│       ├── components/    # Canvas, panels, shared UI
│       ├── hooks/         # 25+ custom hooks
│       ├── layouts/       # Main + editor shells (Clerk-guarded)
│       └── lib/           # API client, utilities
```

---

## Getting started

### Prerequisites

- Node.js 20+
- PostgreSQL 15+ (or the bundled Docker container)
- A [Clerk](https://clerk.com) account (for auth)
- A [Liveblocks](https://liveblocks.io) account (for canvas sync)

### 1. Install dependencies

```bash
cd server
npm install

cd ../client
npm install
```

### 2. Environment variables

**`server/.env`**

```env
DATABASE_URL="postgresql://user:password@localhost:5432/canvasflow"
CLERK_SECRET_KEY="sk_test_..."
LIVEBLOCKS_SECRET_KEY="sk_..."
LIVEBLOCKS_WEBHOOK_SECRET="whsec_..."
FRONTEND_URL="http://localhost:5173"
FRONTEND_URLS="http://localhost:5173,http://localhost:5174"
PORT=4001
```

**`client/.env.local`**

```env
VITE_CLERK_PUBLISHABLE_KEY="pk_test_..."
VITE_API_URL="http://localhost:4001"
VITE_LIVEBLOCKS_PUBLIC_KEY="pk_..."
```

### 3. Set up the database

```bash
cd server
npx prisma migrate deploy
npx prisma generate
```

### 4. Run it

```bash
# Terminal 1 — API (http://localhost:4001)
cd server
npm run build
npm start

# Terminal 2 — client (http://localhost:5173)
cd client
npm run dev
```

Visit `http://localhost:5173` and sign in via Clerk to get started.

---

## API documentation

The server exposes Swagger docs at:

```
http://localhost:4001/api
```

Key endpoint groups: `/project`, `/pages`, `/nodes`, `/notifications`, `/access-requests`, `/invitations`, `/access`, `/dashboard`, `/search`, `/liveblocks`, `/project-members`.

---

## Database schema

PostgreSQL via Prisma, 10 models: `User`, `Project`, `Page`, `Node`, `ProjectMember`, `PageVisit`, `Notification`, `ProjectInvitation`, `AccessRequest`, `AccessRequestEvent`.

---

## Design decisions

A few notable choices:

- **Konva (HTML5 Canvas) over SVG** — scales better with hundreds of nodes; built-in transform handles
- **Liveblocks + Socket.IO as two separate real-time channels** — canvas sync is never blocked by notification traffic, and vice versa
- **Async persistence via webhook** — Liveblocks holds live authoritative state; a `storageUpdated` webhook persists to Postgres out of the critical path
- **Express middleware pipeline** — `requireAuth` + `requireProjectRole` cleanly separate authentication from authorization
- **Route-level code splitting** — the canvas editor (Konva) is lazy-loaded so the app shell stays lean

---

## Roadmap

- [ ] Redis caching layer as concurrent room count grows
- [ ] Message queue for webhook/notification delivery
- [ ] Shared types package between client and server
- [ ] Deeper test coverage on business logic

---

## Contributing

Contributions are welcome. Please open an issue to discuss significant changes before submitting a PR.

## License

[MIT](LICENSE)
