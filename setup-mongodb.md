# MongoDB Setup Instructions

## Option 1: MongoDB Atlas (Recommended - Cloud)

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account
3. Create a new cluster (free tier)
4. Create a database user
5. Get your connection string
6. Replace the MONGODB_URI in your .env file

## Option 2: Local MongoDB Installation

### Windows:
1. Download MongoDB Community Server from: https://www.mongodb.com/try/download/community
2. Install MongoDB
3. Create data directory: `mkdir C:\data\db`
4. Start MongoDB: `mongod`

### Using Docker (Easiest):
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

## Option 3: Quick Fix - Use SQLite for now

If you want to get started quickly without MongoDB, we can modify the backend to use SQLite instead.

## Environment File Setup

Create a `.env` file in the backend directory with:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/erp-system
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
```

## Quick Start with Docker MongoDB

Run this command to start MongoDB:
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

Then start your backend:
```bash
cd backend
npm run dev
``` 