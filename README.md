# CreatorBase ERP - Complete Management Platform

A comprehensive ERP system for content creators and SaaS development teams, built with MERN stack (MongoDB, Express.js, React.js, Node.js).

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB Atlas account
- Git

### Local Development (Feature Branches → dev_db)

1. **Clone and setup:**
   ```bash
   git clone <your-repo>
   cd ERP
   git checkout -b feature/your-feature dev
   ```

2. **Backend setup:**
   ```bash
   cd backend
   npm install
   npm run dev:local
   ```
   Backend will run on http://localhost:5000

3. **Frontend setup:**
   ```bash
   cd frontend-nextjs
   npm install
   npm run dev:local
   ```
   Frontend will run on http://localhost:3000

4. **Verify environment:**
   - Backend health: http://localhost:5000/api/health
   - Frontend: Look for blue "DEV ENVIRONMENT" banner at top

### Staging Test (dev branch → staging_db)

1. **Switch to dev branch:**
   ```bash
   git checkout dev
   git pull origin dev
   ```

2. **Test backend staging:**
   ```bash
   cd backend
   npm run start:staging
   ```

3. **Test frontend staging:**
   ```bash
   cd frontend-nextjs
   npm run build:staging
   npm run start:staging
   ```

4. **Verify environment:**
   - Backend health: Check for "staging" in response
   - Frontend: Look for yellow "STAGING ENVIRONMENT" banner

### Production Test (main branch → prod_db)

1. **Switch to main branch:**
   ```bash
   git checkout main
   git pull origin main
   ```

2. **Test backend production:**
   ```bash
   cd backend
   npm run start:prod
   ```

3. **Test frontend production:**
   ```bash
   cd frontend-nextjs
   npm run build:prod
   npm run start:prod
   ```

4. **Verify environment:**
   - Backend health: Check for "production" in response
   - Frontend: No environment banner (production mode)

## 🗄️ Database Setup

### MongoDB Atlas Configuration

1. **Create 3 databases in your cluster:**
   - `dev_db` → for local development
   - `staging_db` → for staging/testing
   - `prod_db` → for production

2. **Initialize databases:**
   ```bash
   # Connect to MongoDB Atlas
   mongosh "mongodb+srv://username:password@cluster.mongodb.net/"
   
   # Initialize databases
   use dev_db
   db.__init.insertOne({createdAt: new Date()})
   
   use staging_db
   db.__init.insertOne({createdAt: new Date()})
   
   use prod_db
   db.__init.insertOne({createdAt: new Date()})
   ```

3. **Create database users (optional but recommended):**
   - `dev_user` → readWrite on `dev_db`
   - `staging_user` → readWrite on `staging_db`
   - `prod_user` → readWrite on `prod_db`

## 🔧 Environment Configuration

### Backend Environment Files
- `env.development` → points to `dev_db`
- `env.staging` → points to `staging_db`
- `env.production` → points to `prod_db`

### Frontend Environment Files
- `env.development` → points to local backend
- `env.staging` → points to staging backend
- `env.production` → points to production backend

### Key Environment Variables
- `APP_ENV` → environment identifier
- `MONGO_URI` → MongoDB connection string
- `JWT_SECRET` → JWT signing secret
- `FRONTEND_URL` → CORS origin for backend

## 🚀 Deployment

### Vercel (Frontend)
- **Production Branch:** `main`
- **Preview Deployments:** Enabled for `dev` and `feature/*` branches
- **Environment Variables:**
  - Production: Use `env.production` values
  - Preview: Use `env.staging` values

### Render (Backend)
- **Production Service:** `api-prod` → connected to `main` branch
- **Staging Service:** `api-staging` → connected to `dev` branch
- **Environment Variables:** Use respective `env.*` files

## 📁 Project Structure

```
ERP/
├── backend/                 # Express.js API server
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── models/         # MongoDB models
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Custom middleware
│   │   └── services/       # Business logic
│   ├── env.development     # Development environment
│   ├── env.staging         # Staging environment
│   └── env.production      # Production environment
├── frontend-nextjs/         # Next.js frontend
│   ├── src/
│   │   ├── app/            # Next.js 13+ app router
│   │   ├── components/     # React components
│   │   ├── context/        # React context providers
│   │   └── services/       # API service functions
│   ├── env.development     # Development environment
│   ├── env.staging         # Staging environment
│   └── env.production      # Production environment
└── README.md               # This file
```

## 🔐 Security Notes

- Never commit `.env*` files (they're in `.gitignore`)
- Use strong, unique JWT secrets per environment
- Database users should have minimal required permissions
- CORS is configured per environment

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend-nextjs
npm run lint
```

## 📞 Support

For issues or questions:
1. Check the environment configuration
2. Verify database connectivity
3. Check the health endpoints
4. Review environment-specific logs

---

**Remember:** Always test in staging before deploying to production! 