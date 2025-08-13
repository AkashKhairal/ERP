# Deployment Checklists for 3-Environment CI/CD

## 🚀 Vercel Frontend Deployment

### Production Branch Configuration
- [ ] **Production Branch:** Set to `main`
- [ ] **Preview Deployments:** Enabled for all other branches
- [ ] **Auto-deploy:** Enabled for main branch only

### Environment Variables Setup

#### Production Environment (main branch)
- [ ] `NEXT_PUBLIC_APP_ENV` = `production`
- [ ] `NEXT_PUBLIC_API_BASE` = `https://production-backend-url.onrender.com/api`
- [ ] `NEXT_PUBLIC_APP_URL` = `https://production-frontend-url.vercel.app`
- [ ] `NEXT_PUBLIC_GOOGLE_CLIENT_ID` = Production Google OAuth client ID

#### Preview Environment (dev and feature branches)
- [ ] `NEXT_PUBLIC_APP_ENV` = `staging`
- [ ] `NEXT_PUBLIC_API_BASE` = `https://staging-backend-url.onrender.com/api`
- [ ] `NEXT_PUBLIC_APP_URL` = `https://staging-frontend-url.vercel.app`
- [ ] `NEXT_PUBLIC_GOOGLE_CLIENT_ID` = Staging Google OAuth client ID

### Deployment Verification
- [ ] Production URL loads correctly
- [ ] No environment banner visible (production mode)
- [ ] API calls go to production backend
- [ ] Google OAuth works with production client ID

---

## 🖥️ Render Backend Deployment

### Service 1: Production API (api-prod)
- [ ] **Repository:** Connected to `main` branch
- [ ] **Auto-deploy:** Enabled from main branch only
- [ ] **Environment:** Production
- [ ] **Build Command:** `npm install`
- **Start Command:** `npm run start:prod`

#### Environment Variables
- [ ] `APP_ENV` = `production`
- [ ] `NODE_ENV` = `production`
- [ ] `MONGO_URI` = Production MongoDB connection string
- [ ] `JWT_SECRET` = Production JWT secret
- [ ] `FRONTEND_URL` = Production frontend URL
- [ ] All other production environment variables

### Service 2: Staging API (api-staging)
- [ ] **Repository:** Connected to `dev` branch
- [ ] **Auto-deploy:** Enabled from dev branch only
- [ ] **Environment:** Staging
- [ ] **Build Command:** `npm install`
- **Start Command:** `npm run start:staging`

#### Environment Variables
- [ ] `APP_ENV` = `staging`
- [ ] `NODE_ENV` = `staging`
- [ ] `MONGO_URI` = Staging MongoDB connection string
- [ ] `JWT_SECRET` = Staging JWT secret
- [ ] `FRONTEND_URL` = Staging frontend URL
- [ ] All other staging environment variables

### Deployment Verification
- [ ] Health endpoint returns correct environment
- [ ] Database connection successful
- [ ] CORS allows frontend origin
- [ ] JWT authentication works
- [ ] All API endpoints respond correctly

---

## 🔄 CI/CD Workflow

### Feature Development
1. [ ] Create feature branch from `dev`: `git checkout -b feature/name dev`
2. [ ] Develop locally using `npm run dev:local`
3. [ ] Test with development database
4. [ ] Commit and push: `git push origin feature/name`
5. [ ] Create PR to `dev` branch

### Staging Deployment
1. [ ] Merge feature branch to `dev`
2. [ ] Verify staging backend deploys automatically
3. [ ] Verify staging frontend deploys automatically
4. [ ] Run smoke tests on staging environment
5. [ ] Verify staging database connectivity

### Production Deployment
1. [ ] Create PR from `dev` to `main`
2. [ ] **WAIT FOR EXPLICIT APPROVAL: "DEPLOY PROD"**
3. [ ] Merge to `main` branch
4. [ ] Verify production backend deploys automatically
5. [ ] Verify production frontend deploys automatically
6. [ ] Run production smoke tests
7. [ ] Verify production database connectivity

---

## 🧪 Smoke Test Commands

### Staging Environment
```bash
# Backend health
curl https://staging-backend-url.onrender.com/api/health
# Expected: {"status":"OK","env":"staging","db":"connected"}

# Frontend
# Visit staging frontend URL
# Verify: Yellow "STAGING ENVIRONMENT" banner visible
# Verify: API calls go to staging backend
```

### Production Environment
```bash
# Backend health
curl https://production-backend-url.onrender.com/api/health
# Expected: {"status":"OK","env":"production","db":"connected"}

# Frontend
# Visit production frontend URL
# Verify: No environment banner visible
# Verify: API calls go to production backend
```

---

## ⚠️ Critical Safety Checks

### Before Production Deployment
- [ ] **NEVER deploy without explicit "DEPLOY PROD" command**
- [ ] Verify staging environment is stable
- [ ] Confirm production database is ready
- [ ] Check all environment variables are correct
- [ ] Verify production secrets are secure

### Database Safety
- [ ] Production database is separate from staging/dev
- [ ] Production database user has minimal permissions
- [ ] No development data in production
- [ ] Database backups are configured

### Security Checklist
- [ ] JWT secrets are unique per environment
- [ ] CORS origins are restricted appropriately
- [ ] Rate limiting is configured
- [ ] Environment variables are not exposed in logs
- [ ] HTTPS is enforced in production

---

## 📋 Post-Deployment Checklist

### Production Deployment
- [ ] Health endpoint responds correctly
- [ ] Database connection successful
- [ ] Frontend loads without errors
- [ ] Authentication flow works
- [ ] Core functionality tested
- [ ] Monitor error logs for 24 hours
- [ ] Verify analytics are tracking correctly

### Rollback Plan
- [ ] Keep previous deployment as backup
- [ ] Document rollback procedure
- [ ] Test rollback process in staging
- [ ] Have database rollback plan ready

---

**Remember:** Safety first! Always test in staging before production deployment.
