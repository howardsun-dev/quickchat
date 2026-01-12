# Quickchat

**Proof of concept full‑stack chat application** — built with a separate frontend and backend.

This repository contains the source code for **Quickchat**, a demo chat project with real‑time messaging capabilities.

---

## 🧠 Overview

Quickchat is a prototype chat app that demonstrates real‑time messaging between users. The project uses a modern frontend and backend stack to showcase:

- 🚀 Real‑time communication (WebSockets / similar)
- ⚙️ Separate **frontend** and **backend** codebases
- 📦 Easy local development with clear folder structure

---

## 📁 Repository Structure

/
├── backend/ # Server‑side code
├── frontend/ # Client‑side UI
├── .vscode/ # Workspace configs
├── package.json # Monorepo scripts & tooling (if applicable)
├── LICENSE # MIT License
└── README.md # Project overview (this file)


---

## 🚀 Features

✨ Basic real‑time discussion interface  
🔐 Simple authentication flow *(if implemented)*  
💬 Message persistence *(depending on backend)*  
📦 API server + UI decoupled architecture

> _This is a proof‑of‑concept; features may be experimental._

---

## 🛠 Tech Stack *(update as needed)*

**Frontend**
- React
- Zustand
- Tailwind CSS
- Daisy UI
- Socket.IO

**Backend**
- Node.js / TypeScript or JavaScript
- Express / Fastify or equivalent
- Socket.IO
- Arcjet
- Cloudinary
- MongoDB

*(Replace the above with actual choices used in your code.)*

---

## 💻 Local Setup

### Prerequisites

Make sure you have the following installed:

- Node.js (v16+)
- npm or yarn

---
Define your .ENV for ports and variables defined within ENV.ts

### Backend Setup

1. Navigate to the backend folder:
   ```bash
   cd backend

   npm install
   npm run dev
   
   ```

2.  Navigate to frontend folder:
   ```bash
npm install
npm run dev
```


   
