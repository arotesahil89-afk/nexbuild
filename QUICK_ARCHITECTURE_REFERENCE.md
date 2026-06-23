# Quick Architecture Reference - Firebase vs Node.js

## AT A GLANCE: WHAT'S CHANGING?

### Current Stack (Firebase)
```
React App → Firebase SDK → Firestore
                        → Firebase Auth
                        → Firebase Analytics
```

### New Stack (Node.js)
```
React App → HTTP REST API → Node.js Express Server → PostgreSQL
            WebSocket       JWT Auth              → Session/Token Store
```

---

## KEY DIFFERENCES

| Aspect | Firebase | Node.js Backend |
|--------|----------|-----------------|
| **Auth** | `signInWithEmailAndPassword()` → User object | POST `/api/auth/login` → JWT token |
| **Data Fetch** | `getDoc()` / `onSnapshot()` from Firestore | `GET /api/awards` / `GET /api/events` |
| **Real-time** | Built-in Firestore listeners | Socket.io events |
| **Data Storage** | Firestore NoSQL | PostgreSQL relational DB |
| **Cost** | $25-50/month (variable) | $5-15/month (fixed) |
| **Deployment** | Google Cloud | Render/Railway/AWS |
| **Bundle Size** | +350KB Firebase SDK | No SDK needed |
| **Control** | Limited by Firebase | Complete control |

---

## CODE MIGRATION EXAMPLES

### 1. LOGIN

#### Before (Firebase)
```javascript
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

#### After (Node.js)
```javascript
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

**What changed**: Firebase `signInWithEmailAndPassword` → REST API call → JWT token storage

---

### 2. FETCH AWARDS

#### Before (Firebase)
```javascript
import { useEffect, useState } from "react";
import { db } from "../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";

const useAwardsLoader = (lang = "en") => {
  const [awards, setAwards] = useState(null);

  useEffect(() => {
    const fetchAwards = async () => {
      const docRef = doc(db, "translations", "awards");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setAwards(docSnap.data());
      }
    };
    fetchAwards();
  }, [lang]);

  return { awards };
};
```

#### After (Node.js)
```javascript
import { useEffect, useState } from "react";
import apiClient from "../services/apiService";

const useAwardsLoader = (lang = "en") => {
  const [awards, setAwards] = useState(null);

  useEffect(() => {
    const fetchAwards = async () => {
      const response = await apiClient.get('/api/awards');
      setAwards(response.data);
    };
    fetchAwards();
  }, [lang]);

  return { awards };
};
```

**What changed**: Firestore `getDoc()` → REST API `GET /api/awards`

---

### 3. REAL-TIME UPDATES (Admin Panel)

#### Before (Firebase)
```javascript
import { onSnapshot, doc } from "firebase/firestore";
import { db } from "../../firebase/firebase";

useEffect(() => {
  const unsubscribe = onSnapshot(
    doc(db, "translations", "awards"),
    (docSnap) => {
      if (docSnap.exists()) {
        setAwardsData(docSnap.data());
      }
    }
  );
  return () => unsubscribe();
}, []);
```

#### After (Node.js + Socket.io)
```javascript
import io from 'socket.io-client';

useEffect(() => {
  const token = localStorage.getItem('authToken');
  const socket = io(import.meta.env.VITE_API_URL, {
    auth: { token }
  });

  socket.on('awards:updated', (data) => {
    setAwardsData(data);
  });

  return () => socket.disconnect();
}, []);
```

**What changed**: Firestore listeners → Socket.io WebSocket events

---

### 4. ADMIN ROUTE PROTECTION

#### Before (Firebase)
```javascript
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../firebase/firebase";

export default function AdminRoute({ children }) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      const adminDoc = await getDoc(doc(db, "admins", user.uid));
      if (adminDoc.exists()) {
        setIsAdmin(true);
      }
    });
    return () => unsub();
  }, []);

  if (!isAdmin) return <Navigate to="/admin-login" />;
  return children;
}
```

#### After (Node.js)
```javascript
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { verifyToken } from "../../services/authService";

export default function AdminRoute({ children }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verify = async () => {
      try {
        const admin = await verifyToken();
        setIsAdmin(admin.role === 'admin' || admin.role === 'super_admin');
      } catch (err) {
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };
    verify();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (!isAdmin) return <Navigate to="/admin-login" />;
  return children;
}
```

**What changed**: Firebase auth listener → JWT token verification via API

---

## DATA TRANSFORMATION

### Firebase Structure → Node.js Structure

#### Awards
```javascript
// Firebase (current)
{
  heading: { en: "Awards & Recognition", hi: "...", mr: "..." },
  en: ["Award 1", "Award 2"],
  hi: ["पुरस्कार 1", "पुरस्कार 2"],
  mr: ["पुरस्कार 1", "पुरस्कार 2"]
}

// Node.js (new)
GET /api/awards → Returns array:
[
  { id: "1", language: "en", text: "Award 1", heading: "Awards & Recognition" },
  { id: "2", language: "en", text: "Award 2", heading: "Awards & Recognition" },
  { id: "3", language: "hi", text: "पुरस्कार 1", heading: "..." },
  ...
]

// Or groupBy language in frontend
{
  en: [{ id: "1", text: "Award 1" }, ...],
  hi: [...],
  mr: [...]
}
```

#### Events
```javascript
// Firebase (current)
{
  eventList: [
    {
      title: { en: "Event", hi: "...", mr: "..." },
      description: { en: "Desc", hi: "...", mr: "..." },
      date: "2025-08-27",
      time: "8:00 AM"
    }
  ]
}

// Node.js (new)
GET /api/events → Returns:
[
  {
    id: "event1",
    titleEn: "Event",
    titleHi: "...",
    titleMr: "...",
    descriptionEn: "Desc",
    descriptionHi: "...",
    descriptionMr: "...",
    date: "2025-08-27",
    time: "8:00 AM"
  }
]
```

---

## BACKEND API ENDPOINTS REFERENCE

### Authentication
```
POST   /api/auth/login              Login and get JWT
GET    /api/auth/verify             Verify JWT token
POST   /api/auth/logout             Logout and revoke token
```

### Awards (Public)
```
GET    /api/awards                  Get all awards
```

### Awards (Admin Only)
```
POST   /api/awards                  Create award
PUT    /api/awards/:id              Update award
DELETE /api/awards/:id              Delete award
PUT    /api/awards/heading/update   Update heading
```

### Events (Public)
```
GET    /api/events                  Get all events
```

### Events (Admin Only)
```
POST   /api/events                  Create event
PUT    /api/events/:id              Update event
DELETE /api/events/:id              Delete event
```

---

## FOLDER STRUCTURE COMPARISON

### Frontend (Minimal Changes)
```
src/
├── services/ [NEW/UPDATED]
│   ├── apiService.js              (Axios wrapper)
│   ├── authService.js             (replaces Firebase)
│   ├── awardsService.js           (API calls)
│   ├── eventsService.js           (API calls)
│   └── socketService.js           (Socket.io setup)
├── hooks/ [NEW/UPDATED]
│   ├── useSocket.js               (Socket connection)
│   ├── useAwardsSocket.js         (Real-time awards)
│   └── useAuth.js                 (Auth state)
├── Components/
│   ├── Admin/ [UPDATED]
│   │   ├── AdminLogin.jsx         (use authService)
│   │   ├── AdminRoute.jsx         (use authService)
│   │   └── AdminDashboard.jsx     (use Socket.io)
│   └── ...
└── ...
```

### Backend (New Project)
```
backend/
├── src/
│   ├── config/                    (DB, env, socket config)
│   ├── middleware/                (Auth, validation, error)
│   ├── routes/                    (HTTP endpoints)
│   ├── controllers/               (Route handlers)
│   ├── services/                  (Business logic)
│   ├── models/                    (Data validation)
│   ├── utils/                     (Helpers, logging)
│   ├── websocket/                 (Socket.io handlers)
│   └── app.js                     (Express app)
├── prisma/
│   └── schema.prisma              (Database schema)
├── tests/                         (Test files)
├── .env                           (Secrets)
├── server.js                      (Entry point)
└── package.json
```

---

## ENVIRONMENT VARIABLES

### Frontend (.env)
```bash
# Remove Firebase config
# VITE_FIREBASE_API_KEY=...

# Add new backend URL
VITE_API_URL=http://localhost:5000  # Dev
VITE_API_URL=https://api.mumbaicharaja.co  # Prod
```

### Backend (.env)
```bash
NODE_ENV=development
PORT=5000

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/mumbaicha_raja

# JWT
JWT_SECRET=your-secret-key-min-32-characters-long
JWT_EXPIRE=7d

# CORS
FRONTEND_URL=http://localhost:5173

# Monitoring (optional)
SENTRY_DSN=https://...

# Logging
LOG_LEVEL=debug
```

---

## INSTALLATION CHECKLIST

### Backend Setup
- [ ] Create backend directory
- [ ] Initialize Node.js project (`npm init`)
- [ ] Install Express, PostgreSQL, JWT dependencies
- [ ] Set up Prisma ORM
- [ ] Create `.env` file
- [ ] Design database schema
- [ ] Set up authentication routes
- [ ] Create CRUD endpoints
- [ ] Implement Socket.io
- [ ] Add error handling & logging
- [ ] Write tests
- [ ] Deploy to Render/Railway

### Frontend Integration
- [ ] Remove Firebase dependencies
- [ ] Create API service layer
- [ ] Create Socket.io hooks
- [ ] Update AdminLogin component
- [ ] Update AdminRoute component
- [ ] Update ManageAward component
- [ ] Update ManageEvent component
- [ ] Test all flows
- [ ] Update environment variables
- [ ] Deploy

---

## QUICK DECISION MATRIX

**Choose PostgreSQL if**:
- ✅ You need relational data (future user management, etc.)
- ✅ You prefer type-safe ORM (Prisma)
- ✅ You want ACID compliance
- ✅ You're building for the long term

**Choose MongoDB if**:
- ✅ You want faster setup
- ✅ You prefer schema flexibility
- ✅ You're comfortable with NoSQL
- ✅ You already use MongoDB elsewhere

**Recommendation**: **PostgreSQL + Prisma** (best for scale and maintainability)

---

## COST COMPARISON

| Item | Firebase | Render.com |
|------|----------|-----------|
| Backend | - | $5-7/mo |
| Database | $25/mo avg | $7/mo |
| Hosting | Included | - |
| **Total** | **$25-50/mo** | **$12-14/mo** |
| **Savings** | - | **60% cheaper** |

---

## MIGRATION TIMELINE

```
Week 1: Backend project setup, database design, auth system
Week 2: API routes, event management, testing
Week 3: Frontend integration, Socket.io setup
Week 4: Final testing, deployment, monitoring setup

Total: ~4 weeks for full migration
```

---

## NEXT STEP: ACTUALLY STARTING

Would you like me to:
1. **Generate backend starter code** (Express + Prisma setup)
2. **Create the database schema file** (ready to migrate)
3. **Build the authentication service** (complete with tests)
4. **Generate API route files** (awards, events, auth)
5. **Create frontend service layer** (apiService, authService, etc.)
6. **All of the above** (complete backend + frontend integration)

**Pick one and I'll code it up!**
