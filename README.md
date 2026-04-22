# QuickChat

A full-stack real-time chat application built with React, Node.js, Socket.IO, and MongoDB. Features JWT authentication, optimistic UI updates, online/offline presence detection, and secure media uploads.

<!-- Add live demo link if deployed: [Live Demo](https://your-url.com) -->

---

## Features

- **Real-time messaging** via Socket.IO WebSocket connections
- **JWT authentication** with secure session handling
- **Optimistic UI updates** for a responsive, low-latency feel
- **Online/offline presence detection** across connected users
- **Media uploads** via Cloudinary integration
- **Rate limiting & bot protection** via Arcjet
- **Responsive UI** built with Tailwind CSS and DaisyUI

---

## Tech Stack

**Frontend**
- React
- Zustand (state management)
- Socket.IO client
- Tailwind CSS + DaisyUI

**Backend**
- Node.js + Express
- Socket.IO
- MongoDB + Mongoose
- Cloudinary (media storage)
- Arcjet (rate limiting & request protection)
- JSON Web Tokens (JWT)

---

## Project Structure

```
/
├── backend/        # Express server, Socket.IO, REST API
├── frontend/       # React client
├── package.json    # Root scripts (build, start, test)
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js v20+
- npm
- MongoDB instance (local or Atlas)
- Cloudinary account
- Arcjet account

### Environment Variables

Create a `.env` file in the `backend/` directory. Reference `ENV.ts` for the full list of required variables. At minimum you will need:

```
MONGODB_URI=
JWT_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
ARCJET_KEY=
PORT=
```

### Install & Run

```bash
# Install all dependencies
npm run build

# Start the backend server
npm start
```

Or run frontend and backend separately during development:

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend (in a separate terminal)
cd frontend
npm install
npm run dev
```

The backend must be running before starting the frontend.

---

## Testing

```bash
npm test
```

Tests are run with Vitest.

---

## License

MIT — see [LICENSE](./LICENSE) for details.
