# Craftboard

**A real-time collaborative design canvas — a lightweight, self-hostable Figma.**

Multiple people edit the same board at once: live cursors, presence avatars, shape tools, and instant CRDT sync, backed by projects with role-based sharing, an access workflow, and an on-canvas AI assistant that turns plain English into ready-to-place layouts.

![React](https://img.shields.io/badge/React-19-61DAFB)
![Vite](https://img.shields.io/badge/Vite-6-646CFF)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6)
![Express](https://img.shields.io/badge/Express-5-000000)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791)
![Liveblocks](https://img.shields.io/badge/Liveblocks-3.23-8B5CF6)
![License](https://img.shields.io/badge/license-MIT-green)

---

## Table of contents

- [About the application](#about-the-application)
- [Highlights](#highlights)
- [Features](#features)
- [Application flow](#application-flow)
- [Tech stack](#tech-stack)
- [Architecture](#architecture)
- [Getting started](#getting-started)
- [Testing with two users](#testing-with-two-users)
- [AI assistant](#ai-assistant)
- [API overview](#api-overview)
- [Database schema](#database-schema)
- [Project structure](#project-structure)
- [Design decisions](#design-decisions)
- [Security notes](#security-notes)
- [Troubleshooting](#troubleshooting)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## About the application

Craftboard is a **self-hostable, real-time collaborative design canvas** — a lightweight, open, run-it-yourself alternative to tools like Figma. Teams and individuals use it to sketch ideas, whiteboard, wireframe, draw diagrams, and mock up interfaces together in the browser, with no desktop software to install and no design data locked into a proprietary cloud.

**What problem it solves.** Traditional design tools are either single-player or force you onto a hosted SaaS platform. Craftboard gives you the collaboration experience — multiple people editing the same canvas at the same time, seeing each other's cursors, and converging on the same document without conflict — while keeping the entire platform deployable on infrastructure you control.

**Who it's for**

- **Design & product teams** — UI mockups, wireframes, user-flow diagrams, and sticky-note brainstorming sessions.
- **Educators & classrooms** — shared whiteboards where every student sees edits live.
- **Individuals** — quick idea capture with a persistent, searchable, per-page canvas.
- **Self-hosters** — full ownership of user data, canvas content, and AI inference.

**Core value proposition**

- **Real-time by default** — CRDT-based canvas sync (Liveblocks) with live cursors and presence; the database is never in the critical path of an edit.
- **Structured collaboration** — projects with owner/editor/viewer roles, email and link invitations, and an access-request workflow with notifications.
- **Private by design** — the AI assistant runs on your machine via Ollama; there is no third-party model API in the loop.
- **Portable data** — every canvas is persisted to PostgreSQL and rehydrated on load, so your work survives sessions and reboots.

---

## Highlights

- **Real-time, conflict-free canvas** — edits sync instantly through Liveblocks CRDT rooms with live cursors and presence. The database never sits in the critical path of an edit.
- **18 shape types** — from rectangles and stars to text, images, frames, sticky notes, code blocks, and dividers, all with transform handles, snapping, smart guides, and a full undo/redo history.
- **Complete collaboration model** — projects, multi-page documents, owner/editor/viewer roles, email and link invitations, access requests, and real-time notifications.
- **Local AI assistant** — describe a design in plain English and get a validated layout of shapes, generated on your machine by [Ollama](https://ollama.com) — no cloud dependency.
- **Self-hostable** — the entire platform runs on an Express + PostgreSQL backend and a Vite SPA; Clerk handles auth, Liveblocks handles canvas sync.

---

## Features

**Canvas editor**

- 18 shape types: `rect`, `roundedRect`, `circle`, `ellipse`, `triangle`, `diamond`, `pentagon`, `hexagon`, `star`, `line`, `arrow`, `polyline`, `text`, `image`, `frame`, `stickyNote`, `codeBlock`, `divider`
- Real-time collaboration via Liveblocks CRDT — every change syncs across clients instantly
- Live cursors, presence avatars, and idle detection
- Undo/redo with a full history stack
- Alignment & distribution tools, grid snapping, smart guides
- Hierarchical layers with parent–child grouping and reordering
- Konva-powered transform handles — move, resize, rotate, and edit in place

**Projects & access control**

- Multi-page projects with per-project roles: **owner**, **editor**, **viewer**
- Invitations by email, by user ID, or via shareable link (with expiry and one-time options)
- Access requests with an approval/denial audit trail
- Real-time notifications over Socket.IO — invitations, requests, role changes, project events
- Project management: create, rename, archive, favorite, pin, transfer ownership, delete

**Dashboards & discovery**

- Command-center dashboard: recent pages, projects table, workspace stats, pinned/favorited projects, pending requests, quick actions
- Global search across projects and users
- Public profile pages with activity and public projects
- Access Center for managing requests, invitations, and memberships

**AI assistant**

- Natural-language → canvas: prompt the editor's AI panel and it proposes a placed layout
- Runs locally via Ollama (structured JSON output, validated server-side)

**Landing page**

- Full marketing site with hero, features, workflow, an architecture diagram, and engineering notes

---

## Application flow

The product is organized as a natural journey from discovery to real-time creation. Here is how a user moves through it:

```mermaid
flowchart LR
    A[Landing page] --> B[Sign in · Clerk]
    B --> C[Dashboard]
    C --> D[Create or join a project]
    D --> E[Open a page in the Editor]
    E --> F[Real-time collaboration · Liveblocks]
    E --> G[AI assistant · Ollama]
    E --> H[Save · webhook → PostgreSQL]
    D --> I[Invite members · roles]
    I --> J[Access requests & notifications]
    D --> K[Project settings · ownership]
    B --> L[Discover · search & public profiles]
```

1. **Landing page.** First-time visitors arrive on a marketing site that explains the product, shows the feature set and workflow, and points them to sign in or sign up.

2. **Authentication.** Clerk handles identity — email/password, social login, and OAuth. The signed-in user receives a JWT that the API verifies on every request; their identity determines what they own and what they can access.

3. **Dashboard (command center).** Once signed in, users land on a dashboard that aggregates their workspace: recently edited pages, their projects table (owned and shared), pinned and favorited projects, pending access requests, quick actions, and a global search across projects and users.

4. **Create or join a project.** A **project** is the top-level unit of collaboration. Users create projects, receive invitations by email or link, or request access to public projects. Every project assigns each member a role — **owner**, **editor**, or **viewer** — which governs what they can do everywhere inside it.

5. **Open a page in the editor.** Each project contains multiple pages, and each page maps to a Liveblocks room. The editor is a full canvas workspace with 18 shape tools, selection and transform handles, layers, alignment, snapping, and undo/redo. Everything is drawn into a shared CRDT document, so co-editors see changes (and each other's cursors) instantly.

6. **Collaborate.** Invite members from the editor or project settings, manage role changes, remove members, and handle access requests. All of this is reflected in real time through Socket.IO notifications and live project settings.

7. **Save & persist.** Liveblocks is authoritative during a session. When storage changes, a `storageUpdated` webhook fetches the full room document and writes it to PostgreSQL transactionally — so the canvas survives reloads and rehydrates the next time anyone opens the page.

8. **AI assistance.** Inside the editor, the AI panel turns a plain-English prompt into a validated layout of shapes via a local Ollama model — no cloud AI required.

9. **Discover.** Users can browse public profiles and public projects, follow owners, and jump into shared work from anywhere in the app.

---

## Tech stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite 6 |
| Routing | React Router 7 |
| Canvas rendering | Konva 10 + react-konva 19 |
| Styling | Tailwind CSS v4, Radix UI, shadcn/ui, Lucide icons |
| Data fetching | SWR, Axios |
| Backend | Express 5 + TypeScript (`tsx` in dev) |
| ORM / Database | Prisma 7 + PostgreSQL (pg driver adapter) |
| Authentication | Clerk (JWT) |
| Canvas sync | Liveblocks 3.23 (CRDT rooms + presence) |
| Real-time events | Socket.IO 4.8 |
| AI | Ollama (local LLM → validated shape JSON) |

---

## Architecture

```mermaid
graph TD
    subgraph Client["Browser — React SPA"]
        LC[Liveblocks client]
        SC[Socket.IO client]
        AX[Axios HTTP client]
    end

    subgraph Cloud["External services"]
        LB[Liveblocks Cloud<br/>CRDT rooms · presence]
        CK[Clerk Cloud<br/>auth UI · JWT issuer]
        OL[Ollama<br/>local LLM · :11434]
    end

    subgraph API["Express 5 API"]
        RT[Routers / services]
        PR[Prisma ORM]
        DB[(PostgreSQL)]
        AU[Auth guard · Clerk JWT verify]
    end

    LC -- "WSS · CRDT" --> LB
    LB -- "storageUpdated webhook" --> RT
    SC -- "WSS · events" --> RT
    AX -- "REST · JSON + JWT" --> RT
    AX -. "session / token" .-> CK
    RT -- "HTTP · /ai/generate" --> OL
    RT --> AU
    RT --> PR --> DB
```

### How a live edit is persisted

Liveblocks holds the authoritative live state; the database is updated asynchronously and never blocks an edit.

```mermaid
sequenceDiagram
    participant U as User
    participant LB as Liveblocks room
    participant OC as Other clients
    participant WH as Express webhook
    participant API as Liveblocks REST API
    participant DB as PostgreSQL

    U->>LB: Edit shape (useMutation)
    LB-->>OC: Broadcast update over WSS (instant)
    LB-->>WH: storageUpdated event (async)
    WH->>API: getStorageDocument(roomId, "json")
    API-->>WH: Full node document
    WH->>DB: Transactional replace (delete + insert)
```

One Express 5 gotcha is handled in this codebase: routers mounted at a parameterized path (e.g. `/project/:projectId/pages`) no longer receive mount params in `req.params` under path-to-regexp v8. The `captureMountParams` middleware in `server/src/middleware/mount-params.ts` restores them.

---

## Getting started

### Prerequisites

- **Node.js 20+**
- **PostgreSQL 15+** running locally
- A **Clerk** application (auth — free tier is fine) at <https://clerk.com>
- A **Liveblocks** project (canvas sync — free tier is fine) at <https://liveblocks.io>
- **Ollama** with a pulled model (only needed for the AI assistant) at <https://ollama.com>

### 1. Install dependencies

```bash
cd server
npm install

cd ../client
npm install
```

### 2. Configure environment variables

Copy the templates below into `server/.env` and `client/.env.local`.

**`server/.env`**

```env
DATABASE_URL="postgresql://user:password@localhost:5432/craftboard"
CLERK_SECRET_KEY="sk_test_..."
LIVEBLOCKS_SECRET_KEY="sk_dev_..."
LIVEBLOCKS_WEBHOOK_SECRET="whsec_..."      # from Liveblocks webhooks settings
FRONTEND_URL="http://localhost:5173"
FRONTEND_URLS="http://localhost:5173,http://localhost:5174"
PORT=4001

# Optional — AI assistant (defaults shown)
OLLAMA_URL="http://localhost:11434"
OLLAMA_MODEL="llama3.2:latest"
```

**`client/.env.local`**

```env
VITE_CLERK_PUBLISHABLE_KEY="pk_test_..."
VITE_API_URL="http://localhost:4001"
```

### 3. Set up the database

```bash
cd server
npm run migrate
```

This applies Prisma migrations — and self-heals migration history if it ever gets out of sync.

### 4. Configure the Liveblocks webhook

In your Liveblocks dashboard, create a **storage** webhook targeting your API:

```
POST http://localhost:4001/webhooks/liveblocks
```

Use the **Storage: `storageUpdated`** event. The signing secret must match `LIVEBLOCKS_WEBHOOK_SECRET`. This webhook is what persists canvas edits to PostgreSQL.

### 5. Run it

```bash
# Terminal 1 — API on http://localhost:4001
cd server
npm run dev

# Terminal 2 — client on http://localhost:5173
cd client
npm run dev
```

Open `http://localhost:5173` — you'll land on the marketing page. Sign in via Clerk to reach the dashboard.

> Signing in uses dedicated `/sign-in` and `/sign-up` pages. Clerk modal routing is not supported by the react-router v7 integration used here, so buttons navigate to the full-page routes instead.

---

## Testing with two users

The app is built for collaboration, so it's useful to run it with two identities side by side:

1. Start a second client instance on another port:

   ```bash
   cd client
   npm run dev -- --port 5174
   ```

2. Open **user A** in a normal window at `http://localhost:5173` and **user B** in a private/incognito window at `http://localhost:5174` (Clerk sessions are per-browser, so the two identities stay separate).

3. Sign in with two different Clerk accounts.

Typical flows to exercise:

- **Invite / share** — A opens a project → **Invite** → B's email → B accepts in **Invitations** → the project appears in B's dashboard with their role badge.
- **Request access** — B opens a project they're not a member of → **Request access** → A approves it from the dashboard or `/access` → B can edit.
- **Live editing** — both open the same page in the editor → cursors and presence are visible, edits sync both ways in real time.
- **Ownership & roles** — A changes B's role, transfers ownership, or removes B from the Members settings and watches B's access update live.

---

## AI assistant

The editor's **AI Assistant** panel turns a natural-language prompt into a placed layout of canvas shapes.

How it works:

1. You type a prompt, e.g. `A hero section with a big title, subtitle, and a blue button`.
2. `POST /ai/generate` (`server/src/services/ai.service.ts`) sends your prompt plus a strict JSON-schema system prompt to a local Ollama model.
3. The model returns `{ title, summary, shapes: [...] }`; each shape is validated and clamped server-side (allowed types, size/color bounds).
4. The panel previews the result; **Add to canvas** lays the shapes out in a vertical stack, auto-sizing text so headings render at their real scale.

Setup:

```bash
ollama pull llama3.2:latest   # or qwen2.5:7b for smarter layouts
```

Tuning:

- Set `OLLAMA_MODEL` in `server/.env` to switch models without code changes.
- The default is `llama3.2:latest` — it produces the most reliable JSON. For higher-quality layouts, `ollama pull qwen2.5:7b` and set `OLLAMA_MODEL="qwen2.5:7b"`.
- AI availability and the active model are reported at `GET /ai/status`.

> Ollama is a **text** runtime — the AI generates vector shapes, not bitmap images. If you want real image generation, add a diffusion backend (e.g. ComfyUI / Stable Diffusion or a cloud image API). The editor already supports `image` nodes with an `imageUrl`, so the plumbing exists.

---

## API overview

The server exposes Swagger UI at:

```
http://localhost:4001/api
```

Endpoint groups (mounted in `server/src/app.ts`):

| Prefix | Purpose |
|--------|---------|
| `/project` | Project CRUD, settings, pages, ownership, favorites, pins, archive |
| `/project/:projectId/pages` | Page CRUD within a project |
| `/pages/:pageId/nodes` | Canvas node read / save |
| `/webhooks/liveblocks` | Liveblocks `storageUpdated` webhook (node persistence) |
| `/users` | Profiles, activity, public projects |
| `/projects/:projectId/members` | Member listing, role changes, removal |
| `/liveblocks` | Liveblocks room authorization |
| `/access-requests` | Request / respond / bulk-respond |
| `/invitations` | Invite by email/user/link, accept, decline, list |
| `/access` | Access center |
| `/notifications` | Real-time + persisted notifications |
| `/dashboard` | Aggregated dashboard payload |
| `/search` | Global search |
| `/ai` | AI status + generate |

All routes except webhooks and health require a `Bearer` JWT from Clerk (`Authorization: Bearer <token>`).

---

## Database schema

PostgreSQL via Prisma — 10 models:

`User`, `Project`, `Page`, `Node`, `ProjectMember`, `PageVisit`, `Notification`, `ProjectInvitation`, `AccessRequest`, `AccessRequestEvent`

Notable relations:

- `User` → `Project` (owned) and `ProjectMember` (joined)
- `Project` → `Page` → `Node` (each page maps to a Liveblocks room `page-{pageId}`)
- `ProjectMember` is unique on `(projectId, userId)` and carries the `owner | editor | viewer` role
- `AccessRequest` → `AccessRequestEvent` (an audit trail of approve/deny decisions)

Canvas nodes store the core geometry in typed columns (`type`, `x`, `y`, `zIndex`, ...) and the complete client shape in a `data` JSONB column, so no shape properties are lost on save/reload.

---

## Project structure

```
craftboard/
├── server/                    # Express API
│   ├── prisma/
│   │   ├── schema.prisma        # Database schema
│   │   └── migrations/          # Prisma migration history
│   ├── src/
│   │   ├── index.ts             # Bootstrap (DB connect, gateway, listen)
│   │   ├── app.ts               # Middleware + router mounts
│   │   ├── routes/              # 14 routers (see API overview)
│   │   ├── services/            # Business logic (pages, nodes, AI, ...)
│   │   ├── middleware/          # requireAuth, requireProjectRole, mount-params
│   │   └── lib/                 # Prisma client, Socket.IO gateway, errors
│   ├── migrate.js               # Migration runner (self-healing)
│   └── package.json
├── client/                    # React (Vite) SPA
│   └── src/
│       ├── App.tsx              # Route table
│       ├── pages/               # Landing, dashboard, projects, access, editor, ...
│       ├── components/          # Canvas, panels, dashboard, landing, UI kit
│       ├── layouts/             # MainLayout, EditorLayout (Clerk-guarded)
│       ├── hooks/               # useDashboard, useDebounce, canvas hooks, ...
│       ├── lib/                 # API client, http client, canvas utils
│       └── types/               # CanvasTypes (Node, ShapeType)
└── README.md
```

---

## Design decisions

- **Konva (HTML5 canvas) over SVG** — handles hundreds of nodes smoothly and ships transform handles out of the box.
- **Two separate real-time channels** — Liveblocks owns canvas CRDT state; Socket.IO carries notifications and events. A busy notification stream can never stall canvas sync.
- **Async persistence via webhook** — Liveblocks is authoritative during a session; a `storageUpdated` webhook fetches the room document and writes it to PostgreSQL outside the edit path, transactionally.
- **Middleware-based authorization** — `requireAuth` (Clerk JWT verify) then `requireProjectRole(...)` cleanly separates authentication from per-project role checks.
- **Route-level code splitting** — the Konva editor is lazy-loaded so the app shell and landing page stay lean.
- **Structured AI contract** — the LLM is forced into a validated, typed shape payload instead of free-form output, so generated layouts are always renderable.

---

## Security notes

- All API routes (except webhooks and health) verify a Clerk JWT.
- Project resources are scoped by role (`viewer`/`editor`/`owner`); pages and nodes are additionally validated to belong to the project in the URL.
- Liveblocks webhook payloads are verified against `LIVEBLOCKS_WEBHOOK_SECRET` before processing.
- Ownership can only be changed through the dedicated transfer-ownership flow — the generic role endpoint rejects `owner`.
- CORS is restricted to the origins listed in `FRONTEND_URLS`.

---

## Troubleshooting

- **API returns 403 "Missing auth or project context"** — this was the Express 5 mount-param bug; make sure you're running current code (fixed in `middleware/mount-params.ts`).
- **Canvas edits don't persist across reloads** — confirm the Liveblocks webhook points at `POST /webhooks/liveblocks` with the `storageUpdated` event, and that `LIVEBLOCKS_WEBHOOK_SECRET` matches the value in your Liveblocks dashboard.
- **Live cursors / sync not working** — check that `LIVEBLOCKS_SECRET_KEY` (server) belongs to the same project as the client's Liveblocks keys, and that your Liveblocks project is configured to allow your origins.
- **AI errors** — ensure Ollama is running (`ollama serve`) and the configured model is pulled (`ollama pull llama3.2:latest`). `GET /ai/status` shows what the server sees.
- **Port already in use** — run the client on another port with `npm run dev -- --port 5174` and add it to `FRONTEND_URLS`.
- **"Failed to load pages" / "Failed to create page"** — confirm the API is up (`http://localhost:4001/api`) and the mount-params fix is present.

---

## Roadmap

- [ ] Redis caching layer as concurrent room count grows
- [ ] Message queue for webhook / notification delivery
- [ ] Shared types package between client and server
- [ ] Real AI image generation via a diffusion backend
- [ ] Deeper automated test coverage

---

## Contributing

Contributions are welcome. Please open an issue to discuss significant changes before submitting a pull request.

## License

[MIT](LICENSE)
