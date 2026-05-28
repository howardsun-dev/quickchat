# QuickChat

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Sevalla-6C5CE7)](https://quickchat-v72jh.sevalla.app/)
[![GitHub license](https://img.shields.io/github/license/howardsun-dev/quickchat)](./LICENSE)
[![GitHub issues](https://img.shields.io/github/issues/howardsun-dev/quickchat)](https://github.com/howardsun-dev/quickchat/issues)
[![GitHub stars](https://img.shields.io/github/stars/howardsun-dev/quickchat)](https://github.com/howardsun-dev/quickchat/stars)
[![GitHub last commit](https://img.shields.io/github/last-commit/howardsun-dev/quickchat)](https://github.com/howardsun-dev/quickchat/commits/main)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?style=flat&logo=socket.io)](https://socket.io/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Zustand](https://img.shields.io/badge/Zustand-FF6B6B?style=flat&logo=zustand&logoColor=white)](https://zustand-demo.pmndrs.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Arcjet](https://img.shields.io/badge/Arcjet-FF6B35?style=flat&logo=arcjet&logoColor=white)](https://arcjet.com/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=flat&logo=cloudinary&logoColor=white)](https://cloudinary.com/)
[![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=flat&logo=github-actions&logoColor=white)](https://github.com/howardsun-dev/quickchat/actions)

## Overview

**QuickChat** is a production-ready full-stack real-time chat application built with modern TypeScript practices. It demonstrates end-to-end development skills from database design to polished UI, with strong emphasis on security, real-time communication, and maintainable architecture.

## ✨ Key Features

### 🔐 Authentication & Security
- **JWT-based authentication** - Secure login, signup, session management, and password reset
- **Arcjet security** - Bot detection, rate limiting, email validation, and IP allowlisting
- **Input validation & sanitization** - Protection against XSS and injection attacks
- **Password hashing** - bcrypt for secure credential storage

### 💬 Real-time Communication
- **Socket.IO-powered messaging** - Sub-second message delivery with reconnection handling
- **Optimistic UI updates** - Messages appear instantly before server confirmation
- **Typing indicators** - Real-time user typing status
- **Read receipts** - Message delivery and read status tracking

### 📎 Media & File Handling
- **Cloudinary integration** - Secure image and file uploads with CDN delivery
- **File type validation** - MIME type checking for security
- **Image preview** - Thumbnail generation for uploaded images

### 👥 User Experience
- **Online presence detection** - Real-time online/offline status with lastSeen tracking
- **Responsive design** - Tailwind CSS + DaisyUI, works on mobile and desktop
- **Persistent chat history** - MongoDB storage for message persistence
- **Keyboard shortcuts** - Enter to send, Escape to clear input, etc.
- **Audio feedback** - Optional keyboard sound effects

### ⚙️ Developer Experience
- **TypeScript end-to-end** - Strict typing from frontend to backend
- **Modular architecture** - Separate concerns for auth, chat, media, and utilities
- **Environment configuration** - Dotenv support for different deployment environments
- **Comprehensive error handling** - Graceful degradation and meaningful error messages

## 🛠️ Tech Stack

### Frontend
- **React 18** - Functional components with hooks
- **Zustand** - Lightweight state management
- **Socket.IO Client** - Real-time bidirectional communication
- **Tailwind CSS** - Utility-first CSS framework
- **DaisyUI** - Component library for Tailwind
- **TypeScript** - Static typing for enhanced developer experience

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **Socket.IO** - Real-time communication layer
- **MongoDB** - Document database for chat persistence
- **Mongoose** - MongoDB object modeling
- **JsonWebToken** - Authentication token handling
- **bcryptjs** - Password hashing
- **validator** - Input validation and sanitization

### Infrastructure
- **GitHub Actions** - CI/CD pipeline for testing
- **Environment variables** - Secure configuration management
- **CORS handling** - Cross-origin resource sharing configuration

## 🏗️ Architecture Overview

```
┌─────────────────┐    WebSocket    ┌─────────────────┐
│   React Client  │◄──────────────►│   Node.js Server│
│ (SPA + Zustand) │    Socket.IO    │ (Express + IO)  │
└─────────────────┘                 └─────────────────┘
                                    │
                                    ▼
                           ┌─────────────────┐
                           │  MongoDB Atlas  │
                           │ (Chat Storage)  │
                           └─────────────────┘
                                    │
                                    ▼
                           ┌─────────────────┐
                           │  Cloudinary     │
                           │ (Media Storage) │
                           └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account (for media uploads)
- Arcjet account (for security - optional but recommended)

### Development Setup
```bash
# Clone repository
git clone https://github.com/howardsun-dev/quickchat.git
cd quickchat

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your credentials:
# MONGODB_URI, JWT_SECRET, CLOUDINARY_*, ARCJET_*, PORT

# Start development server
npm run dev
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
```

### Production Deployment
The app is designed for easy deployment to platforms like:
- **Vercel** (frontend) + **Render/Railway** (backend)
- **Docker** (see Dockerfile)
- **AWS** (ECS/EKS with RDS)
- **Sevalla** (currently deployed)

## 🧪 Testing

```bash
# Run linting
npm run lint

# Run tests (when implemented)
npm test

# Format code
npm run format
```

## 📚 Learning Outcomes

This project demonstrates proficiency in:
- **Full-stack TypeScript development** - End-to-end type safety
- **Real-time web applications** - WebSocket implementation with Socket.IO
- **Authentication systems** - JWT-based auth with refresh tokens
- **File upload handling** - Secure integration with Cloudinary
- **Security best practices** - Rate limiting, input validation, CORS
- **State management** - Zustand for predictable state updates
- **Responsive design** - Mobile-first approach with Tailwind CSS
- **Database integration** - MongoDB with Mongoose ODM
- **API design** - RESTful endpoints combined with real-time events
- **DevOps practices** - Environment configuration, logging, error handling

## 📞 Connect & Collaborate

**Live Demo**: [https://quickchat-v72jh.sevalla.app/](https://quickchat-v72jh.sevalla.app/)  
**Report Issues**: [GitHub Issues](https://github.com/howardsun-dev/quickchat/issues)  
**Pull Requests**: Welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md)  
**Email**: howardsun.swe@gmail.com

---

*Built with ❤️ by Howard Sun — Full-Stack Engineer specializing in TypeScript, React, and scalable web applications.*
