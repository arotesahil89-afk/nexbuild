# Implementation Priority & Quick Start Guide

## EXECUTIVE DECISION: WHERE TO START?

---

## PRIORITY MATRIX

### High Priority (Core)
```
✅ Start here first
├─ Database Setup (PostgreSQL + Prisma)
├─ JWT Authentication System
├─ Base Express Server
└─ Error Handling & Validation
```

### Medium Priority (Features)
```
⚠️ Build after core
├─ Awards CRUD API
├─ Events CRUD API
├─ Admin management
└─ Logging & Audit trails
```

### Low Priority (Enhancement)
```
ℹ️ Optional, can add later
├─ Socket.io Real-time
├─ Advanced caching
├─ Advanced monitoring
└─ API rate limiting
```

---

## QUICK START IMPLEMENTATION PATH

### Option A: Minimum Viable Backend (Week 1-2)
**Best if**: You want to go live fast with basic functionality
```
Day 1-2: Database + Auth
Day 3-4: Awards API
Day 5-6: Events API
Day 7: Frontend integration
Day 8-10: Testing & deployment
```

**What you get**: Working backend with CRUD operations (no Socket.io yet)

### Option B: Complete Backend (Week 3-4)
**Best if**: You want production-ready with all features
```
Day 1-2: Database + Auth
Day 3-4: Awards API
Day 5-6: Events API
Day 7-8: Socket.io real-time
Day 9-10: Logging + monitoring
Day 11-12: Testing
Day 13-14: Deployment
```

**What you get**: Full-featured backend ready for scale

### Option C: Phased Migration (Week 1-6)
**Best if**: You want zero downtime, parallel running
```
Week 1: Backend setup & testing
Week 2: Frontend service layer + API integration
Week 3: Feature flag - both backends running
Week 4: Gradual traffic migration
Week 5: Full cutover to Node.js
Week 6: Sunset Firebase, cleanup
```

**What you get**: Safe, zero-downtime migration

---

## RECOMMENDED: Option A + Socket.io Later

**Why**: 
- Fast MVP (ready in 2 weeks)
- Can use polling instead of WebSocket initially
- Add Socket.io later without changing API
- Lowest risk
- Easiest to test

---

## PHASE 1: CORE SETUP (3-4 Days)

### Step 1: Initialize Backend
```bash
mkdir mumbaicha-raja-backend
cd mumbaicha-raja-backend
npm init -y
npm install express dotenv cors helmet joi bcryptjs jsonwebtoken socket.io
npm install -D nodemon prisma @prisma/client
npm install -D jest supertest # Testing
```

### Step 2: Folder Structure
```bash
mkdir -p src/{config,middleware,routes,controllers,services,models,utils,websocket}
mkdir -p prisma
mkdir -p tests
```

### Step 3: Create .env
```bash
cat > .env << 'EOF'
NODE_ENV=development
PORT=5000
DATABASE_URL="postgresql://user:password@localhost:5432/mumbaicha_raja"
JWT_SECRET="your-super-secret-key-minimum-32-characters-long"
JWT_EXPIRE=7d
FRONTEND_URL="http://localhost:5173"
LOG_LEVEL=debug
EOF
```

### Step 4: Initialize Prisma
```bash
npx prisma init
# Update DATABASE_URL in .env
# Edit prisma/schema.prisma with the schema below
```

### Step 5: Database Schema
**File: `prisma/schema.prisma`**
```prisma
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
  password  String
  role      String   @default("admin")
  active    Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@map("admins")
}

model Award {
  id        String   @id @default(cuid())
  language  String
  text      String
  heading   String
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
  time          String
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@map("events")
  @@index([date])
}

model AuditLog {
  id        String   @id @default(cuid())
  action    String
  entity    String
  entityId  String
  changes   Json
  adminId   String
  createdAt DateTime @default(now())
  
  @@map("audit_logs")
  @@index([createdAt])
}
```

### Step 6: Run Migrations
```bash
npx prisma migrate dev --name init
npx prisma generate
```

### Step 7: Seed Database
**File: `prisma/seed.js`**
```javascript
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@mumbaicharaja.com' },
    update: {},
    create: {
      email: 'admin@mumbaicharaja.com',
      password: hashedPassword,
      role: 'super_admin'
    }
  });
  console.log('✅ Admin created:', admin.email);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
```

```bash
node prisma/seed.js
```

### Step 8: Base Express App
**File: `src/app.js`**
```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();

// Security
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

// Middleware
app.use(express.json());

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

module.exports = app;
```

### Step 9: Server Entry Point
**File: `server.js`**
```javascript
const app = require('./src/app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
```

### Step 10: Test
```bash
npx nodemon server.js
# Should see: 🚀 Server running on http://localhost:5000
```

---

## PHASE 2: AUTHENTICATION (2-3 Days)

### Step 1: Auth Middleware
**File: `src/middleware/auth.js`**
```javascript
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
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

### Step 2: Auth Service
**File: `src/services/authService.js`**
```javascript
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class AuthService {
  async login(email, password) {
    const admin = await prisma.admin.findUnique({ where: { email } });
    
    if (!admin) {
      throw new Error('Invalid credentials');
    }
    
    const validPassword = await bcrypt.compare(password, admin.password);
    
    if (!validPassword) {
      throw new Error('Invalid credentials');
    }
    
    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
    
    return {
      token,
      admin: { id: admin.id, email: admin.email, role: admin.role }
    };
  }

  async verifyToken(token) {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  }
}

module.exports = new AuthService();
```

### Step 3: Auth Routes
**File: `src/routes/auth.routes.js`**
```javascript
const express = require('express');
const authService = require('../services/authService');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    
    const result = await authService.login(email, password);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.get('/verify', authMiddleware, (req, res) => {
  res.json(req.admin);
});

router.post('/logout', authMiddleware, (req, res) => {
  // For now, just confirm logout (JWT is stateless)
  res.json({ message: 'Logged out' });
});

module.exports = router;
```

### Step 4: Register Routes
**File: `src/app.js`** (update)
```javascript
const authRoutes = require('./routes/auth.routes');

app.use('/api/auth', authRoutes);
```

### Step 5: Test Auth
```bash
# Test login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@mumbaicharaja.com","password":"admin123"}'

# Should return token

# Test verify with token
curl -H "Authorization: Bearer <token>" \
  http://localhost:5000/api/auth/verify
```

---

## PHASE 3: AWARDS API (2-3 Days)

### Step 1: Awards Service
**File: `src/services/awardService.js`**
```javascript
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class AwardService {
  async getAll() {
    const awards = await prisma.award.findMany({
      orderBy: { order: 'asc' }
    });
    
    return {
      en: awards.filter(a => a.language === 'en'),
      hi: awards.filter(a => a.language === 'hi'),
      mr: awards.filter(a => a.language === 'mr'),
      heading: {
        en: awards[0]?.heading || 'Awards',
        hi: awards[0]?.heading || 'Awards',
        mr: awards[0]?.heading || 'Awards'
      }
    };
  }

  async create(data) {
    return prisma.award.create({ data });
  }

  async update(id, data) {
    return prisma.award.update({ where: { id }, data });
  }

  async delete(id) {
    return prisma.award.delete({ where: { id } });
  }
}

module.exports = new AwardService();
```

### Step 2: Awards Routes
**File: `src/routes/awards.routes.js`**
```javascript
const express = require('express');
const awardService = require('../services/awardService');
const { authMiddleware, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Public
router.get('/', async (req, res, next) => {
  try {
    const awards = await awardService.getAll();
    res.json(awards);
  } catch (err) {
    next(err);
  }
});

// Admin
router.post('/', authMiddleware, adminOnly, async (req, res, next) => {
  try {
    const award = await awardService.create(req.body);
    res.status(201).json(award);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', authMiddleware, adminOnly, async (req, res, next) => {
  try {
    const award = await awardService.update(req.params.id, req.body);
    res.json(award);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', authMiddleware, adminOnly, async (req, res, next) => {
  try {
    await awardService.delete(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
```

### Step 3: Register Routes
**File: `src/app.js`** (update)
```javascript
const awardsRoutes = require('./routes/awards.routes');

app.use('/api/awards', awardsRoutes);
```

---

## PHASE 4: EVENTS API (2-3 Days)

**Similar to Awards API, just update the service and routes for events.**

---

## PHASE 5: FRONTEND INTEGRATION (3-4 Days)

### Step 1: Install Dependencies
```bash
npm install axios socket.io-client
npm uninstall firebase
```

### Step 2: Create API Service
**File: `src/services/apiService.js`**
```javascript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
```

### Step 3: Update AdminLogin
**File: `src/Components/Admin/AdminLogin.jsx`**
```javascript
import apiClient from "../../services/apiService";

const handleLogin = async (e) => {
  e.preventDefault();
  try {
    const response = await apiClient.post('/auth/login', { email, password });
    localStorage.setItem('authToken', response.data.token);
    window.location.href = "/admin";
  } catch (err) {
    setError("Login failed: " + err.message);
  }
};
```

### Step 4: Update AdminRoute
**File: `src/Components/Admin/AdminRoute.jsx`**
```javascript
import apiClient from "../../services/apiService";

useEffect(() => {
  const verify = async () => {
    try {
      const response = await apiClient.get('/auth/verify');
      if (response.data.role === 'admin' || response.data.role === 'super_admin') {
        setIsAdmin(true);
      }
    } catch (err) {
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };
  verify();
}, []);
```

---

## DEPLOYMENT QUICK START (Render.com)

### Backend Deployment

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial backend"
   git push origin main
   ```

2. **Create Render Web Service**
   - Go to render.com
   - New → Web Service
   - Connect GitHub repo
   - Set build command: `npm install`
   - Set start command: `npm start`

3. **Create PostgreSQL Database**
   - New → PostgreSQL
   - Copy DATABASE_URL

4. **Set Environment Variables in Render**
   ```
   DATABASE_URL=postgresql://...
   JWT_SECRET=your-secret-key
   FRONTEND_URL=https://mumbaicharaja.co
   NODE_ENV=production
   ```

5. **Run Migrations**
   ```bash
   render pg connect ...
   npx prisma migrate deploy
   node prisma/seed.js
   ```

6. **Update Frontend .env**
   ```bash
   VITE_API_URL=https://your-app.onrender.com/api
   ```

---

## SUCCESS CHECKLIST

### Core System
- [ ] Database setup and migrations
- [ ] JWT authentication working
- [ ] Can login with admin credentials
- [ ] Token verification working

### APIs
- [ ] GET /api/awards returns data
- [ ] POST /api/awards creates award (admin)
- [ ] PUT /api/awards/:id updates award (admin)
- [ ] DELETE /api/awards/:id deletes award (admin)
- [ ] Same for events

### Frontend
- [ ] AdminLogin calls new API
- [ ] AdminRoute checks JWT token
- [ ] ManageAward component works
- [ ] ManageEvent component works
- [ ] Awards display on home page
- [ ] Events display on event page

### Deployment
- [ ] Backend running on Render
- [ ] Database persisting data
- [ ] Frontend calling backend API
- [ ] All flows tested in production

---

## TROUBLESHOOTING

### JWT Issues
```javascript
// Check token
const jwt = require('jsonwebtoken');
const decoded = jwt.decode(token);
console.log(decoded);
```

### Database Connection
```bash
# Test connection
psql -c "SELECT NOW()"

# Check Prisma
npx prisma studio
```

### CORS Issues
```javascript
// Verify CORS configuration
console.log('ALLOWED_ORIGIN:', process.env.FRONTEND_URL);
```

### Common Errors

| Error | Solution |
|-------|----------|
| `No token provided` | Add `Authorization: Bearer <token>` header |
| `Invalid token` | Token expired or JWT_SECRET mismatch |
| `Database connection failed` | Check DATABASE_URL environment variable |
| `CORS error` | Add frontend URL to CORS origins |

---

## NEXT STEPS AFTER CORE IS WORKING

1. Add Socket.io for real-time updates
2. Add logging system (Winston)
3. Add monitoring (Sentry)
4. Add testing suite (Jest)
5. Add rate limiting
6. Add caching layer (Redis)
7. Add API documentation (Swagger)

---

**You're ready to start building! Pick Phase 1 and execute.**
