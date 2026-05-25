# QuickChat

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Sevalla-6C5CE7)](https://quickchat-v72jh.sevalla.app/)
[![MIT License](https://img.shields.io/badge/License-MIT-green)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)

A full-stack real-time chat application with JWT authentication, optimistic UI updates, online presence detection, and secure media uploads.

> Built with React, Node.js, Express, Socket.IO, MongoDB, and TypeScript.

---

## Features

- **Real-time messaging** — WebSocket-powered chat via Socket.IO with sub-second delivery
- **JWT authentication** — Secure login, signup, session management, and password reset flow
- **Optimistic UI updates** — Messages appear instantly in the UI before the server confirms delivery
- **Online presence** — Real-time online/offline detection with `lastSeen` tracking
- **Media uploads** — Image and file attachments stored via Cloudinary
- **Rate limiting & bot protection** — Arcjet shields the API from abuse
- **Responsive design** — Tailwind CSS + DaisyUI, works on desktop and mobile
- **Keyboard sound effects** — Optional audio feedback while typing
- **Forgot / reset password** — Email-based password recovery via Resend

## Architecture

▶ **[View Interactive Architecture Diagram on Excalidraw](https://excalidraw.com/#json=JwKDclbwls3OlS8_aU59l,4iiiypHTpFIY25fQ3lx1sw)**

### Overview

```
┌──────────────┐    HTTP REST    ┌──────────────┐    Mongoose    ┌────────────┐
│   React App  │ ◄──────────────► │  Express API  │ ◄────────────► │  MongoDB   │
│   (Vite)     │                  │  (Node.js)    │               │  (Atlas)   │
│              │    WebSocket     │               │               └────────────┘
│  Zustand +   │ ◄──────────────► │  Socket.IO    │ ┌──────────────────────────┐
│  Socket.IO   │                  │  (presence)   │ │  Cloudinary · Resend ·   │
│  Client      │                  │               │ │  Arcjet (external svcs)  │
└──────────────┘                  └──────────────┘ └──────────────────────────┘
```

### Frontend

| Layer | Technology | Purpose |
|---|---|---|
| Framework | React 19 + Vite + TypeScript | SPA with fast HMR |
| State | Zustand | Global stores for auth and chat state |
| Routing | React Router | Client-side navigation |
| HTTP | Axios | REST API calls with cookies |
| Real-time | Socket.IO Client | WebSocket messaging, presence |
| Styling | Tailwind CSS + DaisyUI | Responsive, component-ready UI |
| Auth | useAuthStore | JWT token handling, session check |

### Backend

| Layer | Technology | Purpose |
|---|---|---|
| Server | Node.js + Express | REST API, static file serving (prod) |
| Database | MongoDB + Mongoose | User profiles, messages |
| Real-time | Socket.IO | Bidirectional event-based communication |
| Auth | JWT (jsonwebtoken) | Token-based authentication with cookies |
| Email | Resend | Password reset emails |
| Media | Cloudinary | Image/file uploads and transformations |
| Security | Arcjet | Rate limiting, bot detection |
| Validation | Zod (via Arcjet) | Request validation |

### Data Flow (Sending a Message)

1. User types and sends → React updates UI **optimistically** via Zustand
2. Axios POSTs to `/api/messages/send/:id`
3. Express stores the message in MongoDB via Mongoose
4. Socket.IO emits `newMessage` event to the recipient
5. Recipient's app receives the event → Zustand updates → UI re-renders

Online status, typing indicators, and unread counts all flow through the same Socket.IO channel.

## Project Structure

```
/
├── backend/               # Express API server
│   └── src/
│       ├── controllers/   # Route handlers (auth, messages, users)
│       ├── middlewares/    # JWT auth, socket auth, Arcjet
│       ├── models/        # Mongoose schemas (User, Message)
│       ├── routes/        # Express route definitions
│       ├── lib/           # DB, Socket.IO, Cloudinary, email config
│       └── server.ts      # Entry point
├── frontend/              # React SPA
│   └── src/
│       ├── pages/         # Route-level components
│       ├── components/    # Reusable UI components
│       ├── store/         # Zustand stores (auth, chat)
│       ├── hooks/         # Custom hooks (keyboard sounds)
│       ├── lib/           # Axios instance, error helpers
│       └── App.tsx        # Root component with routing
├── package.json           # Root scripts (build, start, test)
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 20+
- MongoDB instance (local or [Atlas](https://www.mongodb.com/atlas))
- [Cloudinary](https://cloudinary.com/) account
- [Arcjet](https://arcjet.com/) account
- [Resend](https://resend.com/) account (for password reset emails)

### Environment Variables

Copy the example file and fill in your local credentials:

```bash
cp backend/.env.example backend/.env
```

The backend reads environment variables from `backend/.env`. The most important values are:

```bash
MONGO_URI=             # MongoDB connection string
JWT_SECRET=            # Secret key for JWT signing
CLOUDINARY_CLOUD_NAME= # Cloudinary cloud name
CLOUDINARY_API_KEY=    # Cloudinary API key
CLOUDINARY_API_SECRET= # Cloudinary API secret
ARCJET_KEY=            # Arcjet API key
PORT=                  # Server port (default: 3000)
CLIENT_URL=            # Frontend origin, e.g. http://localhost:5173
```

Optional password-reset email values:

```bash
RESEND_API_KEY=
EMAIL_FROM=
EMAIL_FROM_NAME=
```

See [`backend/.env.example`](./backend/.env.example) and `backend/src/lib/env.ts` for the full list of supported variables.

### Install & Run

```bash
# Install all dependencies
npm install

# Start in production mode (serves frontend from backend)
npm start
```

**Development mode** (separate terminals):

```bash
# Terminal 1 — Backend
cd backend
npm install
npm run dev

# Terminal 2 — Frontend
cd frontend
npm install
npm run dev
```

The backend must be running before starting the frontend. In development, the frontend proxies API calls to `localhost:3000`.

## API Endpoints

### Authentication — `/api/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/signup` | No | Create a new account |
| POST | `/login` | No | Sign in |
| POST | `/logout` | No | Clear session |
| GET | `/check` | JWT | Verify active session |
| POST | `/forgot-password` | No | Send reset email |
| POST | `/reset-password/:token` | No | Reset password with token |
| POST | `/change-password` | JWT | Change password (authenticated) |
| PUT | `/update-profile` | JWT | Update display name, avatar, etc. |

### Messages — `/api/messages`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/contacts` | JWT | List all contacts |
| GET | `/chats` | JWT | List recent conversations |
| GET | `/:id` | JWT | Get messages with a specific user |
| POST | `/send/:id` | JWT | Send a message to a user |

### Users — `/api/user`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/status/:id` | JWT | Get user online/lastSeen status |

## Testing

```bash
npm test
```

Tests are run with [Vitest](https://vitest.dev/).

## Deployment

QuickChat is deployed on [Sevalla](https://sevalla.app/). The production build serves the React frontend as static files from the Express server.

## License

MIT — see [LICENSE](./LICENSE) for details.
