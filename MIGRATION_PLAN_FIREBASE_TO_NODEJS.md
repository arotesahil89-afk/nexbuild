# Firebase → Node.js Custom Backend Migration Strategy
**Mumbai Cha Raja - React 19 + Vite Application**  
**Analysis Date:** 2026-06-23  
**Author:** Senior Software Developer Review

---

## TABLE OF CONTENTS
1. [Executive Summary](#executive-summary)
2. [Current Firebase Architecture](#current-firebase-architecture)
3. [Proposed Node.js Architecture](#proposed-nodejs-architecture)
4. [Detailed Migration Plan](#detailed-migration-plan)
5. [Database Design](#database-design)
6. [API Specifications](#api-specifications)
7. [Authentication Strategy](#authentication-strategy)
8. [Real-time Updates (Socket.io)](#real-time-updates-socketio)
9. [File Structure](#file-structure)
10. [Migration Steps](#migration-steps)
11. [Testing Strategy](#testing-strategy)
12. [Deployment Considerations](#deployment-considerations)

---

## EXECUTIVE SUMMARY

### Why Migrate from Firebase?
1. **Cost Control**: Firebase scales with usage; custom backend provides predictable costs
2. **Data Ownership**: Full control over data storage and infrastructure
3. **Customization**: Can implement complex business logic without Firebase limitations
4. **Performance**: Direct database access without Firebase SDK overhead
5. **Vendor Lock-in Reduction**: Move away from proprietary Google infrastructure
6. **Scalability**: Better control over scaling patterns and database optimization

### What We're Building
- **Backend**: Node.js + Express REST API (initially HTTP polling, later Socket.io)
- **Database**: PostgreSQL (recommended) or MongoDB (faster migration)
- **Auth**: JWT-based authentication replacing Firebase Auth
- **Real-time**: Socket.io for real-time updates to replace Firestore listeners
- **Admin Panel**: Unchanged React frontend with new API integration layer

### High-Level Benefits
✅ **Reduced bundle size** - No Firebase SDK (~350KB)  
✅ **Faster auth** - JWT is lighter than Firebase auth flow  
✅ **Better control** - Custom business logic implementation  
✅ **Improved security** - No exposed API keys, token-based auth  
✅ **Cost predictability** - Fixed backend costs vs. variable Firebase costs  

---

## CURRENT FIREBASE ARCHITECTURE

### Data Collections (Firestore)

```
firebaseConfig = {
  projectId: "mumbaicharajawebsite",
  authDomain: "mumbaicharajawebsite.firebaseapp.com",
  storageBucket: "mumbaicharajawebsite.firebasestorage.app"
}
```

#### Collection 1: `translations/awards`
```javascript
{
  heading: { en: "Awards & Recognition", hi: "...", mr: "..." },
  en: ["Award 1 text", "Award 2 text", ...],
  hi: ["पुरस्कार 1", ...],
  mr: ["पुरस्कार 1", ...]
}
```
**Operations**: 
- Read: `getDoc(doc(db, "translations", "awards"))` in Awards.jsx
- Write: `setDoc()` in ManageAward.jsx
- Listen: `onSnapshot()` for real-time updates

#### Collection 2: `translations/events`
```javascript
{
  eventList: [
    {
      title: { en: "Event Name", hi: "...", mr: "..." },
      description: { en: "...", hi: "...", mr: "..." },
      date: "2025-08-27",
      time: "8:00 AM"
    },
    ...
  ]
}
```
**Operations**:
- Read: `getDoc()` and `onSnapshot()` for real-time
- Write: `updateDoc()` to update entire eventList array
- Used by: EventsPage.jsx, UpcomingEvents.jsx, LivePage.jsx

#### Collection 3: `admins/{uid}`
```javascript
{
  // Just marking user as admin
  // uid: true (simple doc existence check)
}
```
**Operations**:
- Read: `getDoc(doc(db, "admins", user.uid))` in AdminRoute.jsx
- Write: Manual via Firebase console

### Authentication Flow (Firebase Auth)
```
1. AdminLogin.jsx → signInWithEmailAndPassword(auth, email, password)
   ↓
2. Returns Firebase User object with uid
   ↓
3. AdminRoute.jsx checks: getDoc(doc(db, "admins", user.uid))
   ↓
4. If admin doc exists → Allow access to /admin
   ↓
5. If not → signOut() and redirect to login
```

### Real-time Listeners (Active)
- **Awards**: `onSnapshot(doc(db, "translations", "awards"))` 
  - Used in: ManageAward.jsx
  - Purpose: Live updates while editing
  
- **Events**: `onSnapshot(doc(db, "translations", "events"))` 
  - Used in: ManageEvents.jsx, UpcomingEvents.jsx
  - Purpose: Instant updates across components

---

## PROPOSED NODE.JS ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND (React 19 + Vite)                  │
│  - Remove Firebase SDK (~350KB saving)                           │
│  - Add Axios/Fetch API layer                                     │
│  - Add Socket.io client for real-time                            │
│  - JWT stored in localStorage/sessionStorage                     │
└────────────────────────┬──────────────────────────────────────────┘
                         │
                         │ HTTP REST API + WebSocket
                         │
┌────────────────────────▼──────────────────────────────────────────┐
│                    NODE.JS BACKEND (Express)                       │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  API Routes Layer                                       │    │
│  │  ├─ /auth/login (POST)         [Public]               │    │
│  │  ├─ /auth/verify (GET)         [Auth Required]        │    │
│  │  ├─ /auth/logout (POST)        [Auth Required]        │    │
│  │  ├─ /api/awards (GET)          [Public]               │    │
│  │  ├─ /api/awards (CRUD)         [Admin Only]           │    │
│  │  ├─ /api/events (GET)          [Public]               │    │
│  │  ├─ /api/events (CRUD)         [Admin Only]           │    │
│  │  └─ /api/admin/users (GET)     [Super Admin]          │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Middleware Layer                                       │    │
│  │  ├─ Authentication (JWT verification)                  │    │
│  │  ├─ Authorization (Role-based access)                  │    │
│  │  ├─ Input validation                                   │    │
│  │  ├─ Error handling                                     │    │
│  │  └─ CORS/Security headers                              │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Business Logic Layer (Services)                        │    │
│  │  ├─ AwardService (CRUD operations)                     │    │
│  │  ├─ EventService (CRUD operations)                     │    │
│  │  ├─ AuthService (JWT generation/validation)           │    │
│  │  ├─ AdminService (User management)                     │    │
│  │  └─ WebSocketService (Real-time events)               │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Database Abstraction Layer (DAL)                       │    │
│  │  ├─ AwardDAO                                           │    │
│  │  ├─ EventDAO                                           │    │
│  │  ├─ AdminDAO                                           │    │
│  │  └─ Query optimization                                 │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  WebSocket Handler (Socket.io)                          │    │
│  │  ├─ Connection/Disconnection management                │    │
│  │  ├─ Real-time award updates                            │    │
│  │  ├─ Real-time event updates                            │    │
│  │  └─ Client notification system                         │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                   │
└────────────────────────┬──────────────────────────────────────────┘
                         │
┌────────────────────────▼──────────────────────────────────────────┐
│              DATABASE LAYER                                        │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Primary Option: PostgreSQL + Prisma ORM                         │
│  ├─ awards table (id, lang, text, heading, created_at)          │
│  ├─ events table (id, title, description, date, time, langs)    │
│  ├─ admins table (id, email, password_hash, role, active)       │
│  ├─ audit_logs table (track changes)                            │
│  └─ api_tokens table (JWT blacklist for logout)                 │
│                                                                   │
│  Alternative: MongoDB + Mongoose                                │
│  ├─ awards collection { _id, heading, languages }               │
│  ├─ events collection { _id, eventList, createdAt }             │
│  ├─ admins collection { _id, email, password, role }            │
│  └─ audit_logs collection                                       │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

### Architecture Layers Explained

#### 1. **Route Layer** (Express Router)
- HTTP endpoints for all CRUD operations
- Input validation before passing to services
- Error handling and HTTP response formatting
- Rate limiting and request logging

#### 2. **Middleware Layer**
- **JWT Authentication**: Verify tokens on protected routes
- **Authorization**: Check user role (admin, super-admin, user)
- **Validation**: Joi/Zod schema validation
- **CORS**: Handle cross-origin requests
- **Security**: Helmet for security headers
- **Logging**: Morgan/Winston for request logging

#### 3. **Business Logic Layer (Services)**
- Encapsulate business rules
- Handle multi-language logic
- Validation and transformation
- Transaction management
- Error handling with proper messages

#### 4. **Data Access Layer (DAL)**
- Direct database queries via Prisma/Mongoose
- Connection pooling
- Query optimization
- Caching strategies

#### 5. **Real-time Layer (Socket.io)**
- Maintains WebSocket connections
- Broadcasts changes to subscribed clients
- Handles client join/leave
- Message queuing for offline clients

---

## DETAILED MIGRATION PLAN

### Phase 1: Backend Setup (Week 1)
**Duration**: 3-4 days

#### 1.1 Initialize Node.js Project
```bash
mkdir backend
cd backend
npm init -y
npm install express dotenv cors helmet joi
npm install --save-dev nodemon prettier eslint
```

#### 1.2 Install Database & ORM
**PostgreSQL (Recommended)**
```bash
npm install @prisma/client
npm install -D prisma
npx prisma init
```

**OR MongoDB (Faster)**
```bash
npm install mongoose
```

#### 1.3 Install Authentication
```bash
npm install jsonwebtoken bcryptjs
npm install express-jwt
```

#### 1.4 Install Real-time
```bash
npm install socket.io
```

#### 1.5 Create Project Structure
```
backend/
├── src/
│   ├── config/
│   │   ├── database.js
│   │   ├── environment.js
│   │   └── socket.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── validation.js
│   │   ├── errorHandler.js
│   │   └── security.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── awards.routes.js
│   │   ├── events.routes.js
│   │   └── admin.routes.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── awardController.js
│   │   ├── eventController.js
│   │   └── adminController.js
│   ├── services/
│   │   ├── authService.js
│   │   ├── awardService.js
│   │   ├── eventService.js
│   │   └── adminService.js
│   ├── models/
│   │   ├── prisma/ (schema.prisma)
│   │   └── schemas/ (validation schemas)
│   ├── utils/
│   │   ├── logger.js
│   │   ├── errorHandler.js
│   │   └── constants.js
│   ├── websocket/
│   │   ├── events.js
│   │   ├── handlers.js
│   │   └── rooms.js
│   └── app.js
├── .env
├── .env.example
├── server.js
└── package.json
```

### Phase 2: Database Schema Design (Week 1-2)
**Duration**: 2 days

#### Prisma Schema (PostgreSQL)
```prisma
// prisma/schema.prisma

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Admin {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String   // bcrypt hashed
  role      String   @default("admin") // admin, super_admin
  active    Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@map("admins")
}

model Award {
  id        String   @id @default(cuid())
  language  String   // 'en', 'hi', 'mr'
  text      String
  heading   String?
  order     Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@map("awards")
  @@index([language])
  @@index([order])
}

model Event {
  id            String   @id @default(cuid())
  titleEn       String
  titleHi       String
  titleMr       String
  descriptionEn String?
  descriptionHi String?
  descriptionMr String?
  date          DateTime
  time          String   // "8:00 AM" format
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@map("events")
  @@index([date])
}

model AuditLog {
  id        String   @id @default(cuid())
  action    String   // 'CREATE', 'UPDATE', 'DELETE'
  entity    String   // 'award', 'event', 'admin'
  entityId  String
  changes   Json
  adminId   String
  createdAt DateTime @default(now())
  
  @@map("audit_logs")
  @@index([createdAt])
}

model ApiToken {
  id        String   @id @default(cuid())
  token     String   @unique
  adminId   String
  revokedAt DateTime?
  expiresAt DateTime
  createdAt DateTime @default(now())
  
  @@map("api_tokens")
}
```

#### Alternative MongoDB Schema
```javascript
// models/Award.js
const awardSchema = new Schema({
  heading: {
    en: String,
    hi: String,
    mr: String
  },
  en: [String],
  hi: [String],
  mr: [String],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// models/Event.js
const eventSchema = new Schema({
  eventList: [{
    title: { en: String, hi: String, mr: String },
    description: { en: String, hi: String, mr: String },
    date: String,
    time: String
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// models/Admin.js
const adminSchema = new Schema({
  email: { type: String, unique: true },
  password: String, // bcrypt hashed
  role: { type: String, default: 'admin' },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});
```

### Phase 3: Authentication System (Week 2)
**Duration**: 2-3 days

#### JWT-Based Auth Flow
```javascript
// services/authService.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

class AuthService {
  async login(email, password) {
    // 1. Find admin by email
    const admin = await Admin.findUnique({ where: { email } });
    
    if (!admin) {
      throw new Error('Invalid credentials');
    }
    
    // 2. Verify password
    const validPassword = await bcrypt.compare(password, admin.password);
    
    if (!validPassword) {
      throw new Error('Invalid credentials');
    }
    
    // 3. Generate JWT token
    const token = jwt.sign(
      { 
        id: admin.id, 
        email: admin.email,
        role: admin.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' } // Token valid for 7 days
    );
    
    // 4. Return token + admin info
    return {
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        role: admin.role
      }
    };
  }

  async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return decoded;
    } catch (err) {
      throw new Error('Invalid token');
    }
  }

  async logout(token) {
    // Add token to blacklist in database
    await ApiToken.create({
      token,
      revokedAt: new Date(),
      expiresAt: jwt.decode(token).exp * 1000
    });
  }
}

module.exports = new AuthService();
```

#### Auth Middleware
```javascript
// middleware/auth.js
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  // Get token from headers
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.admin.role !== 'admin' && req.admin.role !== 'super_admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

module.exports = { authMiddleware, adminOnly };
```

### Phase 4: API Routes Implementation (Week 2-3)
**Duration**: 3-4 days

#### Authentication Routes
```javascript
// routes/auth.routes.js
const express = require('express');
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.post('/login', authController.login);
router.get('/verify', authMiddleware, authController.verify);
router.post('/logout', authMiddleware, authController.logout);

module.exports = router;
```

#### Award Routes
```javascript
// routes/awards.routes.js
const express = require('express');
const awardController = require('../controllers/awardController');
const { authMiddleware, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', awardController.getAll);

// Admin routes
router.post('/', authMiddleware, adminOnly, awardController.create);
router.put('/:id', authMiddleware, adminOnly, awardController.update);
router.delete('/:id', authMiddleware, adminOnly, awardController.delete);
router.put('/heading/update', authMiddleware, adminOnly, awardController.updateHeading);

module.exports = router;
```

#### Event Routes
```javascript
// routes/events.routes.js
const express = require('express');
const eventController = require('../controllers/eventController');
const { authMiddleware, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', eventController.getAll);

// Admin routes
router.post('/', authMiddleware, adminOnly, eventController.create);
router.put('/:id', authMiddleware, adminOnly, eventController.update);
router.delete('/:id', authMiddleware, adminOnly, eventController.delete);

module.exports = router;
```

### Phase 5: Real-time WebSocket Integration (Week 3)
**Duration**: 2-3 days

#### Socket.io Setup
```javascript
// config/socket.js
const socketIO = require('socket.io');

const configureSocket = (server) => {
  const io = socketIO(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      credentials: true
    }
  });

  io.use((socket, next) => {
    // Verify JWT token from socket handshake
    const token = socket.handshake.auth.token;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.admin = decoded;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Admin ${socket.admin.id} connected`);

    // Join admin room for notifications
    socket.join(`admin-${socket.admin.id}`);

    // Listen for disconnect
    socket.on('disconnect', () => {
      console.log(`Admin ${socket.admin.id} disconnected`);
    });
  });

  return io;
};

module.exports = configureSocket;
```

#### Broadcast Updates
```javascript
// When award is created/updated/deleted
awardService.createAward(data).then(award => {
  // Broadcast to all connected admins
  io.emit('awards:updated', award);
});

// When event is modified
eventService.updateEvent(id, data).then(event => {
  // Broadcast to all connected admins
  io.emit('events:updated', event);
});
```

### Phase 6: Frontend API Integration (Week 3-4)
**Duration**: 3-4 days

#### Create API Service Layer
```javascript
// src/services/apiService.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add JWT to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
```

#### Auth Service
```javascript
// src/services/authService.js
import apiClient from './apiService';

export const loginAdmin = async (email, password) => {
  const response = await apiClient.post('/auth/login', { email, password });
  if (response.data.token) {
    localStorage.setItem('authToken', response.data.token);
  }
  return response.data;
};

export const logout = async () => {
  await apiClient.post('/auth/logout');
  localStorage.removeItem('authToken');
};

export const verifyToken = async () => {
  const response = await apiClient.get('/auth/verify');
  return response.data;
};
```

#### Awards API Service
```javascript
// src/services/awardsService.js
import apiClient from './apiService';

export const getAwards = async () => {
  const response = await apiClient.get('/awards');
  return response.data;
};

export const createAward = async (award) => {
  const response = await apiClient.post('/awards', award);
  return response.data;
};

export const updateAward = async (id, award) => {
  const response = await apiClient.put(`/awards/${id}`, award);
  return response.data;
};

export const deleteAward = async (id) => {
  const response = await apiClient.delete(`/awards/${id}`);
  return response.data;
};

export const updateHeading = async (heading) => {
  const response = await apiClient.put('/awards/heading/update', { heading });
  return response.data;
};
```

#### Replace Firebase Components
**Before (Firebase)**:
```javascript
// AdminLogin.jsx
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase/firebase";

const handleLogin = async (e) => {
  e.preventDefault();
  try {
    await signInWithEmailAndPassword(auth, email, password);
    window.location.href = "/admin";
  } catch (err) {
    setError("Login failed: " + err.message);
  }
};
```

**After (Node.js Backend)**:
```javascript
// AdminLogin.jsx
import { loginAdmin } from "../../services/authService";

const handleLogin = async (e) => {
  e.preventDefault();
  try {
    const response = await loginAdmin(email, password);
    localStorage.setItem('authToken', response.token);
    window.location.href = "/admin";
  } catch (err) {
    setError("Login failed: " + err.message);
  }
};
```

#### Real-time Updates via Socket.io
```javascript
// hooks/useAwardsSocket.js
import { useEffect, useState } from 'react';
import io from 'socket.io-client';

export const useAwardsSocket = () => {
  const [awards, setAwards] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      auth: { token }
    });

    socket.on('awards:updated', (data) => {
      setAwards(data);
    });

    return () => socket.disconnect();
  }, []);

  return awards;
};
```

### Phase 7: Testing & Validation (Week 4)
**Duration**: 2-3 days

#### Backend Tests
```javascript
// tests/auth.test.js
describe('Authentication', () => {
  test('should login with valid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@example.com', password: 'password123' });
    
    expect(response.status).toBe(200);
    expect(response.body.token).toBeDefined();
  });

  test('should reject invalid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@example.com', password: 'wrong' });
    
    expect(response.status).toBe(401);
  });
});
```

#### Frontend Integration Tests
```javascript
// tests/AdminLogin.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import AdminLogin from '../AdminLogin';

test('should call loginAdmin on form submit', async () => {
  render(<AdminLogin />);
  
  const emailInput = screen.getByPlaceholderText('Email');
  const passwordInput = screen.getByPlaceholderText('Password');
  const submitButton = screen.getByRole('button', { name: /login/i });

  fireEvent.change(emailInput, { target: { value: 'admin@example.com' } });
  fireEvent.change(passwordInput, { target: { value: 'password123' } });
  fireEvent.click(submitButton);

  // Assert API was called
});
```

---

## DATABASE DESIGN

### Recommendation: PostgreSQL + Prisma

**Why PostgreSQL?**
- ✅ ACID compliance (data integrity)
- ✅ JSON support for multilingual data
- ✅ Better for relational data
- ✅ Superior query optimization
- ✅ Excellent free hosting options (Render, Supabase)

**Why Prisma ORM?**
- ✅ Type-safe queries
- ✅ Zero runtime dependencies (compiles away)
- ✅ Automatic migrations
- ✅ Great debugging tools
- ✅ Easy to reason about

### Data Model

```
┌─────────────────────────┐
│      AWARDS             │
├─────────────────────────┤
│ id: String (PK)         │
│ language: String (en)   │
│ text: String            │
│ heading: String         │
│ order: Int              │
│ createdAt: DateTime     │
│ updatedAt: DateTime     │
└─────────────────────────┘

┌─────────────────────────┐
│      EVENTS             │
├─────────────────────────┤
│ id: String (PK)         │
│ titleEn: String         │
│ titleHi: String         │
│ titleMr: String         │
│ descriptionEn: String   │
│ descriptionHi: String   │
│ descriptionMr: String   │
│ date: DateTime          │
│ time: String            │
│ createdAt: DateTime     │
│ updatedAt: DateTime     │
└─────────────────────────┘

┌─────────────────────────┐
│      ADMINS             │
├─────────────────────────┤
│ id: String (PK)         │
│ email: String (UK)      │
│ password: String        │
│ role: String            │
│ active: Boolean         │
│ createdAt: DateTime     │
│ updatedAt: DateTime     │
└─────────────────────────┘

┌─────────────────────────┐
│    AUDIT_LOGS           │
├─────────────────────────┤
│ id: String (PK)         │
│ action: String          │
│ entity: String          │
│ entityId: String        │
│ changes: JSON           │
│ adminId: String (FK)    │
│ createdAt: DateTime     │
└─────────────────────────┘
```

### Indexing Strategy
```sql
-- Performance indexes
CREATE INDEX idx_awards_language ON awards(language);
CREATE INDEX idx_awards_order ON awards(order);
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_audit_logs_created ON audit_logs(createdAt);
CREATE INDEX idx_admins_email ON admins(email);
```

---

## API SPECIFICATIONS

### Authentication Endpoints

#### 1. Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password123"
}

Response (200):
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "admin": {
    "id": "abc123",
    "email": "admin@example.com",
    "role": "admin"
  }
}

Response (401):
{
  "error": "Invalid credentials"
}
```

#### 2. Verify Token
```http
GET /api/auth/verify
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

Response (200):
{
  "id": "abc123",
  "email": "admin@example.com",
  "role": "admin",
  "iat": 1624324324,
  "exp": 1624930324
}

Response (401):
{
  "error": "Invalid token"
}
```

#### 3. Logout
```http
POST /api/auth/logout
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

Response (200):
{
  "message": "Logged out successfully"
}
```

### Awards Endpoints

#### 1. Get All Awards
```http
GET /api/awards

Response (200):
{
  "awards": [
    {
      "id": "award1",
      "language": "en",
      "text": "Best Award",
      "heading": "Awards & Recognition",
      "order": 0
    },
    ...
  ]
}
```

#### 2. Create Award
```http
POST /api/awards
Authorization: Bearer <token>
Content-Type: application/json

{
  "language": "en",
  "text": "New Award",
  "heading": "Awards & Recognition"
}

Response (201):
{
  "id": "award123",
  "language": "en",
  "text": "New Award",
  "heading": "Awards & Recognition",
  "order": 0
}
```

#### 3. Update Award
```http
PUT /api/awards/:id
Authorization: Bearer <token>

{
  "text": "Updated Award",
  "heading": "Updated Heading"
}

Response (200):
{
  "id": "award123",
  "text": "Updated Award",
  "heading": "Updated Heading"
}
```

#### 4. Delete Award
```http
DELETE /api/awards/:id
Authorization: Bearer <token>

Response (204): No content
```

#### 5. Update Heading
```http
PUT /api/awards/heading/update
Authorization: Bearer <token>

{
  "heading": {
    "en": "New English Heading",
    "hi": "नई हिंदी शीर्षक",
    "mr": "नई मराठी शीर्षक"
  }
}

Response (200):
{
  "heading": { "en": "...", "hi": "...", "mr": "..." }
}
```

### Events Endpoints

#### 1. Get All Events
```http
GET /api/events

Response (200):
{
  "events": [
    {
      "id": "event1",
      "titleEn": "Ganpati Visarjan",
      "titleHi": "गणपति विसर्जन",
      "titleMr": "गणपति विसर्जन",
      "descriptionEn": "...",
      "date": "2025-08-27",
      "time": "8:00 AM"
    },
    ...
  ]
}
```

#### 2. Create Event
```http
POST /api/events
Authorization: Bearer <token>

{
  "titleEn": "New Event",
  "titleHi": "नया कार्यक्रम",
  "titleMr": "नव कार्यक्रम",
  "descriptionEn": "Description",
  "date": "2025-12-25",
  "time": "10:00 AM"
}

Response (201):
{
  "id": "event123",
  "titleEn": "New Event",
  ...
}
```

#### 3. Update Event
```http
PUT /api/events/:id
Authorization: Bearer <token>

{
  "titleEn": "Updated Title",
  "time": "2:00 PM"
}

Response (200):
{
  "id": "event123",
  "titleEn": "Updated Title",
  ...
}
```

#### 4. Delete Event
```http
DELETE /api/events/:id
Authorization: Bearer <token>

Response (204): No content
```

---

## AUTHENTICATION STRATEGY

### JWT Implementation

```javascript
// JWT Token Payload
{
  "id": "admin123",
  "email": "admin@example.com",
  "role": "admin",
  "iat": 1624324324,      // Issued at
  "exp": 1624930324       // Expires at (7 days)
}
```

### Token Storage (Frontend)
```javascript
// Option 1: localStorage (Simple, but vulnerable to XSS)
localStorage.setItem('authToken', token);

// Option 2: sessionStorage (Cleared on tab close)
sessionStorage.setItem('authToken', token);

// Option 3: httpOnly Cookie (More secure against XSS)
// Set by backend on login response
// Automatically sent with requests
```

### Token Refresh Strategy
```javascript
// Implement refresh tokens for better UX
POST /api/auth/refresh
{
  "refreshToken": "..."
}

Response:
{
  "token": "new_access_token",
  "refreshToken": "new_refresh_token"
}
```

### Security Headers
```javascript
// config/security.js
const helmet = require('helmet');

app.use(helmet()); // Sets secure headers
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
```

---

## REAL-TIME UPDATES (SOCKET.IO)

### Implementation Flow

```
1. Admin login → receive JWT token
2. Frontend connects to Socket.io with token
3. Backend verifies token in middleware
4. Socket authenticated, joins admin room
5. When data changes → broadcast to room
6. Frontend receives update and updates UI
```

### Client-Side Socket Setup
```javascript
// hooks/useSocket.js
import { useEffect, useState } from 'react';
import io from 'socket.io-client';

export const useSocket = () => {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    const socket = io(import.meta.env.VITE_API_URL, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000
    });

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    // Listen for updates
    socket.on('awards:updated', (data) => {
      // Update local state or refetch
    });

    socket.on('events:updated', (data) => {
      // Update local state or refetch
    });

    return () => socket.disconnect();
  }, []);

  return connected;
};
```

### Server-Side Broadcasting
```javascript
// Emit to all connected admins
io.emit('awards:updated', newAward);

// Emit to specific room
io.to('admin-123').emit('awards:created', newAward);

// Emit to all except sender
socket.broadcast.emit('awards:updated', newAward);
```

---

## FILE STRUCTURE

### Backend Project Structure
```
backend/
├── src/
│   ├── config/
│   │   ├── database.js
│   │   ├── environment.js
│   │   └── socket.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   ├── validation.js
│   │   └── security.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── awards.routes.js
│   │   ├── events.routes.js
│   │   └── admin.routes.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── awardController.js
│   │   ├── eventController.js
│   │   └── adminController.js
│   ├── services/
│   │   ├── authService.js
│   │   ├── awardService.js
│   │   ├── eventService.js
│   │   └── adminService.js
│   ├── models/
│   │   └── prisma/
│   │       └── schema.prisma
│   ├── utils/
│   │   ├── logger.js
│   │   ├── constants.js
│   │   └── errors.js
│   ├── websocket/
│   │   ├── handlers.js
│   │   └── rooms.js
│   └── app.js
├── prisma/
│   ├── migrations/
│   └── schema.prisma
├── tests/
│   ├── auth.test.js
│   ├── awards.test.js
│   └── events.test.js
├── .env
├── .env.example
├── .gitignore
├── server.js
├── package.json
└── README.md
```

### Frontend Changes
```
src/
├── services/
│   ├── apiService.js        [NEW]
│   ├── authService.js       [REPLACE Firebase]
│   ├── awardsService.js     [NEW]
│   ├── eventsService.js     [NEW]
│   └── socketService.js     [NEW]
├── hooks/
│   ├── useAwardsSocket.js   [NEW]
│   ├── useEventsSocket.js   [NEW]
│   └── useAuth.js           [NEW]
├── Components/
│   ├── Admin/
│   │   ├── AdminLogin.jsx   [MODIFY]
│   │   ├── AdminRoute.jsx   [MODIFY]
│   │   └── AdminDashboard.jsx [MODIFY]
│   └── ...
└── ...
```

---

## MIGRATION STEPS

### Step-by-Step Implementation

#### Step 1: Set Up Backend Project
```bash
mkdir mumbaicha-raja-backend
cd mumbaicha-raja-backend
npm init -y
npm install express dotenv cors helmet joi
npm install @prisma/client jsonwebtoken bcryptjs socket.io
npm install -D nodemon prisma
npx prisma init
```

#### Step 2: Configure Environment
```env
# .env
NODE_ENV=development
PORT=5000
DATABASE_URL="postgresql://user:password@localhost:5432/mumbaicha_raja"
JWT_SECRET="your-super-secret-key-min-32-chars"
JWT_EXPIRE=7d
FRONTEND_URL="http://localhost:5173"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="initial-password"
```

#### Step 3: Set Up Database
```bash
npx prisma migrate dev --name init
npx prisma generate
```

#### Step 4: Seed Initial Data
```javascript
// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Create initial admin
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.admin.create({
    data: {
      email: 'admin@mumbaicharaja.com',
      password: hashedPassword,
      role: 'super_admin'
    }
  });
  console.log('Admin created:', admin);

  // Create initial awards
  const awards = await prisma.award.createMany({
    data: [
      { language: 'en', text: 'Award 1', heading: 'Awards', order: 0 },
      { language: 'en', text: 'Award 2', heading: 'Awards', order: 1 }
    ]
  });
  console.log('Awards created:', awards);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Run: `node prisma/seed.js`

#### Step 5: Build Core API
```bash
npm start
# Server running on http://localhost:5000
```

#### Step 6: Test APIs with Postman/Insomnia
- Test `/api/auth/login`
- Test `/api/awards` (GET)
- Test `/api/events` (GET)

#### Step 7: Update Frontend Imports
```bash
npm install axios socket.io-client
```

Replace all Firebase imports:
```bash
# Remove
npm uninstall firebase @firebase/app @firebase/auth @firebase/firestore

# Update components to use new service layer
```

#### Step 8: Integration Testing
- Login with new credentials
- Test CRUD operations
- Verify socket.io real-time updates

#### Step 9: Deploy Backend
- Option 1: Render.com (Free tier)
- Option 2: Railway.app
- Option 3: DigitalOcean App Platform
- Option 4: AWS Lambda + RDS

---

## TESTING STRATEGY

### Unit Tests
```javascript
// test/services/authService.test.js
const authService = require('../../src/services/authService');

describe('AuthService', () => {
  describe('login', () => {
    it('should return token for valid credentials', async () => {
      const result = await authService.login('admin@example.com', 'password123');
      expect(result.token).toBeDefined();
      expect(result.admin).toBeDefined();
    });

    it('should throw error for invalid email', async () => {
      await expect(
        authService.login('notfound@example.com', 'password123')
      ).rejects.toThrow('Invalid credentials');
    });
  });
});
```

### Integration Tests
```javascript
// test/api/auth.integration.test.js
const request = require('supertest');
const app = require('../../src/app');

describe('Auth API', () => {
  it('POST /api/auth/login should return token', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'password123'
      });

    expect(response.status).toBe(200);
    expect(response.body.token).toBeDefined();
  });

  it('GET /api/auth/verify should verify token', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@example.com', password: 'password123' });

    const verifyRes = await request(app)
      .get('/api/auth/verify')
      .set('Authorization', `Bearer ${loginRes.body.token}`);

    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.email).toBe('admin@example.com');
  });
});
```

### Frontend Tests
```javascript
// src/__tests__/AdminLogin.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AdminLogin from '../Components/Admin/AdminLogin';

vi.mock('../services/authService', () => ({
  loginAdmin: vi.fn()
}));

describe('AdminLogin', () => {
  it('should login successfully with valid credentials', async () => {
    render(
      <BrowserRouter>
        <AdminLogin />
      </BrowserRouter>
    );

    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    const submitButton = screen.getByRole('button', { name: /login/i });

    fireEvent.change(emailInput, { target: { value: 'admin@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(localStorage.getItem('authToken')).toBeDefined();
    });
  });
});
```

---

## DEPLOYMENT CONSIDERATIONS

### Backend Deployment Options

#### Option 1: Render.com (Recommended)
- ✅ Free tier available
- ✅ Auto-deploys from GitHub
- ✅ PostgreSQL included
- ✅ Custom domains

**Steps**:
1. Push backend to GitHub
2. Connect Render.com account
3. Create new Web Service
4. Connect PostgreSQL database
5. Set environment variables

#### Option 2: Railway.app
- ✅ Very developer-friendly
- ✅ Simple deployment
- ✅ Built-in database hosting
- ✅ Good free tier

#### Option 3: DigitalOcean App Platform
- ✅ Affordable ($5-12/month)
- ✅ Good performance
- ✅ Full control
- ✅ One-click deployment

#### Option 4: AWS Lambda + RDS
- ✅ Serverless backend
- ✅ Scales automatically
- ✅ Pay per request
- ❌ More complex setup

### Frontend Deployment
- Keep existing Netlify setup
- Update `VITE_API_URL` environment variable
- Point to new backend API

### Environment Variables

**Backend (.env)**
```
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://...
JWT_SECRET=long-random-secret-key
FRONTEND_URL=https://mumbaicharaja.co
```

**Frontend (.env.production)**
```
VITE_API_URL=https://api.mumbaicharaja.co
```

### Database Backups
```bash
# PostgreSQL backup
pg_dump -h localhost -U user -d mumbaicha_raja > backup.sql

# Restore
psql -h localhost -U user -d mumbaicha_raja < backup.sql

# Automated backups (via Render/Railway)
# Set up automatic daily backups in dashboard
```

### Monitoring & Logging
```javascript
// Winston Logger
const logger = require('winston');

logger.info('Application started');
logger.error('Error occurred', error);

// Sentry for error tracking
const Sentry = require('@sentry/node');
Sentry.init({ dsn: process.env.SENTRY_DSN });
```

---

## TIMELINE & EFFORT ESTIMATE

| Phase | Task | Duration | Effort |
|-------|------|----------|--------|
| 1 | Backend Setup & Structure | 3-4 days | 24 hours |
| 2 | Database Design & Migration | 2 days | 16 hours |
| 3 | Authentication System | 2-3 days | 20 hours |
| 4 | API Routes Implementation | 3-4 days | 28 hours |
| 5 | Real-time WebSocket Setup | 2-3 days | 20 hours |
| 6 | Frontend Integration | 3-4 days | 28 hours |
| 7 | Testing & QA | 2-3 days | 20 hours |
| 8 | Deployment & Documentation | 2 days | 16 hours |

**Total**: ~4 weeks (150+ hours)

---

## ROLLBACK PLAN

In case issues arise during migration:

1. **Keep Firebase Active** during initial backend launch
2. **Feature Flag** both auth systems (Firebase + JWT)
3. **Admin Dashboard** can switch between backends
4. **Quick Rollback**: Revert to Firebase by changing API endpoints

```javascript
// Toggle between backends
const useFirebaseBackend = import.meta.env.VITE_USE_FIREBASE === 'true';

export const loginAdmin = async (email, password) => {
  if (useFirebaseBackend) {
    return firebase.auth().signInWithEmailAndPassword(email, password);
  } else {
    return apiClient.post('/api/auth/login', { email, password });
  }
};
```

---

## COST ANALYSIS

### Current Costs (Firebase)
- **Firestore**: ~$25/month (variable, based on usage)
- **Firebase Auth**: Included
- **Hosting**: Netlify $19/month (or free)
- **Total**: ~$44-50/month

### New Costs (Custom Backend)
- **Backend Server**: $5-12/month (Render/Railway)
- **PostgreSQL**: $10-15/month (or free on Render)
- **Domain**: Already have
- **Monitoring**: Free (Winston/Sentry free tier)
- **Total**: ~$15-27/month

**Savings**: 40-70% monthly reduction

---

## CONCLUSION & RECOMMENDATIONS

### Key Advantages
1. **Cost Efficiency**: 50-60% cost reduction
2. **Full Control**: Complete ownership of architecture
3. **Better Performance**: Direct database access, JWT is lighter
4. **Scalability**: Can implement any custom logic
5. **Security**: No exposed API keys, JWT-based auth
6. **Data Privacy**: All data stays in your database

### Recommended Approach
1. **Start with PostgreSQL + Prisma** (best for long-term)
2. **Use Render.com** (free PostgreSQL + Node.js hosting)
3. **Implement JWT** authentication
4. **Add Socket.io** for real-time (optional, can add later)
5. **Keep Firebase** as backup for 2-4 weeks

### Next Steps
1. Create backend project with proposed structure
2. Set up PostgreSQL database
3. Implement authentication first
4. Build API routes incrementally
5. Migrate frontend one component at a time
6. Run parallel tests with both backends
7. Deploy to production with monitoring

---

**Ready to proceed? Would you like me to generate code for any specific phase?**
