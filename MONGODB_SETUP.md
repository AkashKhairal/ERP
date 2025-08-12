# MongoDB Atlas Setup for 3-Environment CI/CD

## Database Configuration

This ERP system uses **3 separate databases** on a single MongoDB Atlas cluster:
- `dev_db` → for local development (feature branches)
- `staging_db` → for staging/testing (dev branch)
- `prod_db` → for production (main branch)

## 🗄️ Database Initialization Commands

### 1. Connect to MongoDB Atlas
```bash
mongosh "mongodb+srv://username:password@cluster0.rdgxy4m.mongodb.net/"
```

### 2. Initialize Development Database
```bash
use dev_db
db.__init.insertOne({createdAt: new Date(), env: "development", purpose: "Local development and feature branches"})
```

### 3. Initialize Staging Database
```bash
use staging_db
db.__init.insertOne({createdAt: new Date(), env: "staging", purpose: "Integration testing and staging deployments"})
```

### 4. Initialize Production Database
```bash
use prod_db
db.__init.insertOne({createdAt: new Date(), env: "production", purpose: "Live production environment"})
```

### 5. Verify Database Creation
```bash
show dbs
```

You should see:
- `dev_db`
- `staging_db` 
- `prod_db`

## 👤 Optional: Create Database Users

### Development User
```bash
use admin
db.createUser({
  user: "dev_user",
  pwd: "dev_password_here",
  roles: [
    { role: "readWrite", db: "dev_db" }
  ]
})
```

### Staging User
```bash
use admin
db.createUser({
  user: "staging_user",
  pwd: "staging_password_here",
  roles: [
    { role: "readWrite", db: "staging_db" }
  ]
})
```

### Production User
```bash
use admin
db.createUser({
  user: "prod_user",
  pwd: "prod_password_here",
  roles: [
    { role: "readWrite", db: "prod_db" }
  ]
})
```

## 🔗 Connection Strings

### Development
```
mongodb+srv://dev_user:dev_password@cluster0.rdgxy4m.mongodb.net/dev_db?retryWrites=true&w=majority&appName=Cluster0
```

### Staging
```
mongodb+srv://staging_user:staging_password@cluster0.rdgxy4m.mongodb.net/staging_db?retryWrites=true&w=majority&appName=Cluster0
```

### Production
```
mongodb+srv://prod_user:prod_password@cluster0.rdgxy4m.mongodb.net/prod_db?retryWrites=true&w=majority&appName=Cluster0
```

## ⚠️ Important Notes

1. **Never use production credentials in development/staging**
2. **Each environment should have its own database user**
3. **Database users should have minimal required permissions**
4. **Update the respective `env.*` files with correct connection strings**
5. **Test connectivity before deploying**

## 🧪 Test Connection

After setting up, test each environment:

### Development
```bash
# Backend health check
curl http://localhost:5000/api/health
# Should return: {"status":"OK","env":"development","db":"connected",...}
```

### Staging
```bash
# Backend health check (after staging deployment)
curl https://staging-backend-url.onrender.com/api/health
# Should return: {"status":"OK","env":"staging","db":"connected",...}
```

### Production
```bash
# Backend health check (after production deployment)
curl https://production-backend-url.onrender.com/api/health
# Should return: {"status":"OK","env":"production","db":"connected",...}
```
