# Complete Firebase Operations → Node.js Mapping

## SUMMARY: EVERY FIREBASE CALL MAPPED TO NODE.JS EQUIVALENT

---

## 1. AUTHENTICATION

### Firebase Auth Operations

#### 1.1 Sign In
```javascript
// Firebase (OLD)
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase/firebase";

await signInWithEmailAndPassword(auth, email, password);
// Returns: User object { uid, email, ... }
```

```javascript
// Node.js (NEW)
import apiClient from "../services/apiService";

const response = await apiClient.post('/api/auth/login', { email, password });
// Returns: { token: "jwt...", admin: { id, email, role } }
```

**Backend Implementation**:
```javascript
// routes/auth.routes.js
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin) throw new Error('Invalid credentials');
    
    const validPassword = await bcrypt.compare(password, admin.password);
    if (!validPassword) throw new Error('Invalid credentials');
    
    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({ token, admin: { id: admin.id, email, role: admin.role } });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});
```

#### 1.2 Get Current User
```javascript
// Firebase (OLD)
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase/firebase";

onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log('User:', user.uid, user.email);
  } else {
    console.log('No user');
  }
});
```

```javascript
// Node.js (NEW)
import apiClient from "../services/apiService";

const admin = await apiClient.get('/api/auth/verify');
// Returns: { id, email, role, iat, exp }
```

**Backend Implementation**:
```javascript
// middleware/auth.js
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// routes/auth.routes.js
router.get('/verify', authMiddleware, (req, res) => {
  res.json(req.admin);
});
```

#### 1.3 Sign Out
```javascript
// Firebase (OLD)
import { signOut } from "firebase/auth";
import { auth } from "../../firebase/firebase";

await signOut(auth);
```

```javascript
// Node.js (NEW)
import apiClient from "../services/apiService";

await apiClient.post('/api/auth/logout');
localStorage.removeItem('authToken');
```

**Backend Implementation**:
```javascript
// routes/auth.routes.js
router.post('/logout', authMiddleware, async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  // Add token to blacklist
  await prisma.apiToken.create({
    data: {
      token,
      adminId: req.admin.id,
      revokedAt: new Date(),
      expiresAt: new Date(req.admin.exp * 1000)
    }
  });
  
  res.json({ message: 'Logged out' });
});
```

---

## 2. DATA READING (FIRESTORE GETDOC)

### Awards - Single Read

```javascript
// Firebase (OLD)
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";

const docRef = doc(db, "translations", "awards");
const docSnap = await getDoc(docRef);
if (docSnap.exists()) {
  console.log("Document data:", docSnap.data());
}
```

```javascript
// Node.js (NEW)
import apiClient from "../services/apiService";

const response = await apiClient.get('/api/awards');
console.log("Awards data:", response.data);
```

**Backend Implementation**:
```javascript
// routes/awards.routes.js
router.get('/', async (req, res) => {
  const awards = await prisma.award.findMany({
    orderBy: { order: 'asc' }
  });
  
  // Transform to language-grouped format
  const grouped = {
    en: awards.filter(a => a.language === 'en'),
    hi: awards.filter(a => a.language === 'hi'),
    mr: awards.filter(a => a.language === 'mr'),
    heading: awards[0]?.heading || {}
  };
  
  res.json(grouped);
});
```

### Events - Single Read

```javascript
// Firebase (OLD)
const eventsRef = doc(db, "translations", "events");
const docSnap = await getDoc(eventsRef);
const eventList = docSnap.data().eventList;
```

```javascript
// Node.js (NEW)
const response = await apiClient.get('/api/events');
const eventList = response.data.events;
```

**Backend Implementation**:
```javascript
// routes/events.routes.js
router.get('/', async (req, res) => {
  const events = await prisma.event.findMany({
    orderBy: { date: 'asc' }
  });
  
  res.json({
    events: events.map(e => ({
      id: e.id,
      title: { en: e.titleEn, hi: e.titleHi, mr: e.titleMr },
      description: { en: e.descriptionEn, hi: e.descriptionHi, mr: e.descriptionMr },
      date: e.date.toISOString().split('T')[0],
      time: e.time
    }))
  });
});
```

---

## 3. DATA READING (FIRESTORE ONSNAPSHOT - REAL-TIME)

### Awards Real-time Listener

```javascript
// Firebase (OLD)
import { onSnapshot } from "firebase/firestore";

const unsubscribe = onSnapshot(
  doc(db, "translations", "awards"),
  (docSnap) => {
    if (docSnap.exists()) {
      setAwardsData(docSnap.data());
    }
  }
);
// Later: unsubscribe() to stop listening
```

```javascript
// Node.js (NEW) - Via Socket.io
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

**Backend Implementation**:
```javascript
// When admin updates awards, broadcast to all
const io = require('socket.io')(server, { cors: {...} });

router.put('/awards/:id', authMiddleware, adminOnly, async (req, res) => {
  const updatedAward = await prisma.award.update({
    where: { id: req.params.id },
    data: req.body
  });
  
  // Broadcast update to all connected clients
  io.emit('awards:updated', updatedAward);
  
  res.json(updatedAward);
});
```

### Events Real-time Listener

```javascript
// Firebase (OLD)
const unsubscribe = onSnapshot(
  doc(db, "translations", "events"),
  (docSnap) => {
    if (docSnap.exists()) {
      setEvents(docSnap.data().eventList);
    }
  }
);
```

```javascript
// Node.js (NEW)
socket.on('events:updated', (data) => {
  setEvents(data);
});
```

---

## 4. DATA WRITING (CREATE)

### Create Award

```javascript
// Firebase (OLD)
import { setDoc, doc } from "firebase/firestore";

await setDoc(doc(db, "translations", "awards"), {
  en: ["New Award", ...existingAwards.en],
  hi: ["नया पुरस्कार", ...existingAwards.hi],
  mr: ["नवा पुरस्कार", ...existingAwards.mr],
  heading: { en: "...", hi: "...", mr: "..." }
});
```

```javascript
// Node.js (NEW)
import apiClient from "../services/apiService";

await apiClient.post('/api/awards', {
  language: 'en',
  text: 'New Award',
  heading: 'Awards & Recognition'
});
```

**Backend Implementation**:
```javascript
// routes/awards.routes.js
router.post('/', authMiddleware, adminOnly, async (req, res) => {
  const { language, text, heading } = req.body;
  
  if (!language || !text) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  
  const award = await prisma.award.create({
    data: {
      language,
      text,
      heading,
      order: 0
    }
  });
  
  // Log action
  await prisma.auditLog.create({
    data: {
      action: 'CREATE',
      entity: 'award',
      entityId: award.id,
      changes: award,
      adminId: req.admin.id
    }
  });
  
  // Broadcast
  io.emit('awards:updated', award);
  
  res.status(201).json(award);
});
```

### Create Event

```javascript
// Firebase (OLD)
const eventList = docSnap.data().eventList;
eventList.push({
  title: { en: "...", hi: "...", mr: "..." },
  description: { en: "...", hi: "...", mr: "..." },
  date: "2025-12-25",
  time: "10:00 AM"
});
await updateDoc(doc(db, "translations", "events"), { eventList });
```

```javascript
// Node.js (NEW)
await apiClient.post('/api/events', {
  titleEn: "Event Name",
  titleHi: "इवेंट नाम",
  titleMr: "इव्हेंट नाव",
  descriptionEn: "Description",
  date: "2025-12-25",
  time: "10:00 AM"
});
```

**Backend Implementation**:
```javascript
router.post('/', authMiddleware, adminOnly, async (req, res) => {
  const { titleEn, titleHi, titleMr, descriptionEn, descriptionHi, descriptionMr, date, time } = req.body;
  
  const event = await prisma.event.create({
    data: {
      titleEn, titleHi, titleMr,
      descriptionEn, descriptionHi, descriptionMr,
      date: new Date(date),
      time
    }
  });
  
  io.emit('events:updated', event);
  res.status(201).json(event);
});
```

---

## 5. DATA WRITING (UPDATE)

### Update Award

```javascript
// Firebase (OLD)
const updatedAwards = { ...awardsData };
updatedAwards.en[index] = newText;
updatedAwards.hi[index] = newTextHi;
updatedAwards.mr[index] = newTextMr;
await setDoc(doc(db, "translations", "awards"), updatedAwards);
```

```javascript
// Node.js (NEW)
await apiClient.put(`/api/awards/${awardId}`, {
  text: 'Updated text',
  language: 'en'
});
```

**Backend Implementation**:
```javascript
router.put('/:id', authMiddleware, adminOnly, async (req, res) => {
  const { text, heading } = req.body;
  
  const award = await prisma.award.update({
    where: { id: req.params.id },
    data: { text, heading }
  });
  
  io.emit('awards:updated', award);
  res.json(award);
});
```

### Update Heading

```javascript
// Firebase (OLD)
const updatedAwards = { ...awardsData, heading: newHeading };
await setDoc(doc(db, "translations", "awards"), updatedAwards);
```

```javascript
// Node.js (NEW)
await apiClient.put('/api/awards/heading/update', {
  heading: {
    en: "New Heading",
    hi: "नया शीर्षक",
    mr: "नवा शीर्षक"
  }
});
```

**Backend Implementation**:
```javascript
router.put('/heading/update', authMiddleware, adminOnly, async (req, res) => {
  const { heading } = req.body;
  
  // Update all awards with new heading
  await prisma.award.updateMany({
    data: { heading }
  });
  
  io.emit('awards:headingUpdated', heading);
  res.json({ heading });
});
```

### Update Event

```javascript
// Firebase (OLD)
const eventList = [...events];
eventList[index] = { ...updatedEventData };
await updateDoc(doc(db, "translations", "events"), { eventList });
```

```javascript
// Node.js (NEW)
await apiClient.put(`/api/events/${eventId}`, {
  titleEn: "Updated Title",
  time: "2:00 PM"
});
```

**Backend Implementation**:
```javascript
router.put('/:id', authMiddleware, adminOnly, async (req, res) => {
  const event = await prisma.event.update({
    where: { id: req.params.id },
    data: req.body
  });
  
  io.emit('events:updated', event);
  res.json(event);
});
```

---

## 6. DATA WRITING (DELETE)

### Delete Award

```javascript
// Firebase (OLD)
const updatedAwards = { ...awardsData };
updatedAwards.en = updatedAwards.en.filter((_, i) => i !== index);
updatedAwards.hi = updatedAwards.hi.filter((_, i) => i !== index);
updatedAwards.mr = updatedAwards.mr.filter((_, i) => i !== index);
await setDoc(doc(db, "translations", "awards"), updatedAwards);
```

```javascript
// Node.js (NEW)
await apiClient.delete(`/api/awards/${awardId}`);
```

**Backend Implementation**:
```javascript
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  const award = await prisma.award.delete({
    where: { id: req.params.id }
  });
  
  io.emit('awards:deleted', award.id);
  res.status(204).send();
});
```

### Delete Event

```javascript
// Firebase (OLD)
const eventList = events.filter((_, i) => i !== index);
await updateDoc(doc(db, "translations", "events"), { eventList });
```

```javascript
// Node.js (NEW)
await apiClient.delete(`/api/events/${eventId}`);
```

**Backend Implementation**:
```javascript
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  const event = await prisma.event.delete({
    where: { id: req.params.id }
  });
  
  io.emit('events:deleted', event.id);
  res.status(204).send();
});
```

---

## 7. ADMIN VERIFICATION

### Check if User is Admin

```javascript
// Firebase (OLD)
const adminDoc = await getDoc(doc(db, "admins", user.uid));
if (adminDoc.exists()) {
  // User is admin
}
```

```javascript
// Node.js (NEW)
try {
  const admin = await apiClient.get('/api/auth/verify');
  if (admin.role === 'admin' || admin.role === 'super_admin') {
    // User is admin
  }
} catch (err) {
  // Not authenticated or not admin
}
```

**Backend Implementation**:
```javascript
// Middleware
const adminOnly = (req, res, next) => {
  if (req.admin.role !== 'admin' && req.admin.role !== 'super_admin') {
    return res.status(403).json({ error: 'Admin only' });
  }
  next();
};

// Use on routes
router.post('/api/awards', authMiddleware, adminOnly, controller);
```

---

## 8. ANALYTICS (NO CHANGE NEEDED)

```javascript
// Firebase Analytics (STAYS THE SAME - Independent of backend)
import { getAnalytics } from "firebase/analytics";

const analytics = getAnalytics(app);
// This can continue to work with Node.js backend
// Analytics is independent of authentication backend
```

---

## COMPONENT-BY-COMPONENT MIGRATION

### AdminLogin.jsx
```javascript
// Before
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase/firebase";

// After
import { loginAdmin } from "../../services/authService";
import apiClient from "../../services/apiService";
```

### AdminRoute.jsx
```javascript
// Before
import { onAuthStateChanged } from "firebase/auth";
import { getDoc } from "firebase/firestore";
import { auth, db } from "../../firebase/firebase";

// After
import { verifyToken } from "../../services/authService";
```

### ManageAward.jsx
```javascript
// Before
import { onSnapshot, setDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase";

// After
import apiClient from "../../services/apiService";
import { useSocket } from "../../hooks/useSocket";
```

### ManageEvents.jsx
```javascript
// Before
import { updateDoc } from "firebase/firestore";
import useEventsLoader from "../../loaders/useEventsLoader";

// After
import apiClient from "../../services/apiService";
import { useSocket } from "../../hooks/useSocket";
```

### Awards.jsx (Uses loader)
```javascript
// Before
import useAwardsLoader from "../../loaders/AwardsLoader";

// After (no change needed - loader still works, just uses API instead)
import useAwardsLoader from "../../loaders/AwardsLoader";
```

### UpcomingEvents.jsx
```javascript
// Before
import useEventsLoader from "../../loaders/useEventsLoader";

// After (no change needed - loader still works)
import useEventsLoader from "../../loaders/useEventsLoader";
```

---

## DEPLOYMENT CHECKLIST

### Backend Deployment (Render.com example)

- [ ] Push backend code to GitHub
- [ ] Create Render account
- [ ] Create new Web Service
- [ ] Connect GitHub repository
- [ ] Set environment variables:
  - [ ] `DATABASE_URL`
  - [ ] `JWT_SECRET`
  - [ ] `FRONTEND_URL`
  - [ ] `NODE_ENV=production`
- [ ] Set build command: `npm install`
- [ ] Set start command: `npm start`
- [ ] Create PostgreSQL database
- [ ] Run migrations: `npx prisma migrate deploy`
- [ ] Seed initial admin user
- [ ] Test API endpoints
- [ ] Set up monitoring/logging
- [ ] Configure domain

### Frontend Deployment

- [ ] Remove Firebase config from .env
- [ ] Set `VITE_API_URL` to production backend URL
- [ ] Build: `npm run build`
- [ ] Test API calls
- [ ] Deploy to Netlify
- [ ] Verify all routes work

---

## SUMMARY TABLE: EVERY FIREBASE OPERATION

| Operation | Firebase | Node.js | Endpoint |
|-----------|----------|---------|----------|
| Login | `signInWithEmailAndPassword()` | `apiClient.post()` | `POST /api/auth/login` |
| Logout | `signOut()` | `apiClient.post()` | `POST /api/auth/logout` |
| Verify Auth | `onAuthStateChanged()` | `apiClient.get()` | `GET /api/auth/verify` |
| Get Awards | `getDoc()` | `apiClient.get()` | `GET /api/awards` |
| Get Events | `getDoc()` | `apiClient.get()` | `GET /api/events` |
| Listen Awards | `onSnapshot()` | Socket.io | `socket.on('awards:updated')` |
| Listen Events | `onSnapshot()` | Socket.io | `socket.on('events:updated')` |
| Create Award | `setDoc()` | `apiClient.post()` | `POST /api/awards` |
| Create Event | `updateDoc()` | `apiClient.post()` | `POST /api/events` |
| Update Award | `setDoc()` | `apiClient.put()` | `PUT /api/awards/:id` |
| Update Event | `updateDoc()` | `apiClient.put()` | `PUT /api/events/:id` |
| Delete Award | `setDoc()` | `apiClient.delete()` | `DELETE /api/awards/:id` |
| Delete Event | `updateDoc()` | `apiClient.delete()` | `DELETE /api/events/:id` |
| Check Admin | `getDoc()` | JWT decode | Middleware check |

---

## FILE CHANGES SUMMARY

### Files to DELETE
```
src/firebase/firebase.js
```

### Files to REPLACE
```
src/Components/Admin/AdminLogin.jsx
src/Components/Admin/AdminRoute.jsx
src/loaders/AwardsLoader.jsx
src/loaders/useEventsLoader.jsx
```

### Files to CREATE
```
src/services/apiService.js
src/services/authService.js
src/services/awardsService.js
src/services/eventsService.js
src/services/socketService.js
src/hooks/useSocket.js
src/hooks/useAwardsSocket.js
src/hooks/useEventsSocket.js
src/hooks/useAuth.js
```

### Backend Files to CREATE (entire folder)
```
backend/src/config/
backend/src/middleware/
backend/src/routes/
backend/src/controllers/
backend/src/services/
backend/src/models/
backend/src/utils/
backend/src/websocket/
backend/prisma/
backend/tests/
```

---

**This mapping covers 100% of Firebase operations in your application.**
**All can be directly replaced with Node.js equivalents.**
