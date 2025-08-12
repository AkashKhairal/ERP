# Local Development Setup

This guide explains how to set up the ERP system for local development.

## Architecture

- **Frontend**: Next.js running on `http://localhost:3000`
- **Backend**: Node.js/Express running on `http://localhost:5000`
- **Database**: MongoDB running on `mongodb://localhost:27017`

## Prerequisites

1. **Node.js** (v16 or higher)
2. **MongoDB** running locally
3. **Git** for version control

## Setup Steps

### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Edit .env.local with your local settings
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/creatorbase
JWT_SECRET=your-local-secret-key

# Start the backend server
npm start
```

The backend will run on `http://localhost:5000`

### 2. Frontend Setup

```bash
cd frontend-nextjs

# Install dependencies
npm install

# The frontend is now configured to automatically use:
# - Local backend (localhost:5000) in development mode
# - Production backend (Render) in production mode

# Start the frontend development server
npm run dev
```

The frontend will run on `http://localhost:3000`

### 3. Database Setup

Ensure MongoDB is running locally:

```bash
# Start MongoDB (Windows)
mongod

# Or if using MongoDB as a service
net start MongoDB
```

## Environment Variables

### Backend (.env.local)
- `NODE_ENV=development` - Sets development mode
- `PORT=5000` - Backend port
- `MONGODB_URI` - Local MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens

### Frontend Configuration
- **Development Mode**: Automatically uses `http://localhost:5000/api`
- **Production Mode**: Automatically uses production backend URL
- **No Environment Files Required**: Configuration is built into the code

## CORS Configuration

The backend is configured to allow:
- **Development**: `http://localhost:3000`, `http://localhost:3001`
- **Production**: Vercel domains and `FRONTEND_URL` environment variable

## Quick Start

### Option 1: Use the Startup Scripts
- **Windows**: Double-click `start-local-dev.bat`
- **PowerShell**: Run `.\start-local-dev.ps1`

### Option 2: Manual Start
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend-nextjs
npm run dev
```

## Troubleshooting

### CORS Errors
- Ensure backend is running on port 5000
- Check that `NODE_ENV=development` in backend
- Frontend automatically uses local backend in development mode

### Database Connection
- Ensure MongoDB is running locally
- Check connection string in backend `.env.local`

### Port Conflicts
- Backend: Change `PORT` in backend `.env.local`
- Frontend: Change port in `package.json` scripts

## Production vs Development

- **Development**: Frontend → Local Backend → Local MongoDB
- **Production**: Vercel Frontend → Render Backend → Cloud MongoDB

## Switching Between Environments

To switch to production:
1. Change `NEXT_PUBLIC_API_URL` to production URL
2. Set `NODE_ENV=production` in backend
3. Update CORS origins in backend

To switch back to development:
1. Change `NEXT_PUBLIC_API_URL` to `http://localhost:5000/api`
2. Set `NODE_ENV=development` in backend
3. Ensure local MongoDB is running
