#!/bin/bash

# Production Deployment Script for CreatorBase ERP
# This script optimizes and deploys the application for production

echo "🚀 Starting CreatorBase Production Deployment..."

# Set production environment
export NODE_ENV=production

# Backend deployment
echo "📦 Deploying Backend..."

cd backend

# Install production dependencies only
echo "Installing production dependencies..."
npm ci --only=production

# Remove development dependencies
echo "Removing development dependencies..."
npm prune --production

# Create production build
echo "Creating production build..."
npm run build

# Optimize package.json for production
echo "Optimizing package.json..."
node -e "
const pkg = require('./package.json');
delete pkg.devDependencies;
delete pkg.scripts.dev;
delete pkg.scripts.test;
fs.writeFileSync('./package.json', JSON.stringify(pkg, null, 2));
"

# Frontend deployment
echo "📱 Deploying Frontend..."

cd ../frontend-nextjs

# Install dependencies
echo "Installing frontend dependencies..."
npm ci

# Create production build
echo "Creating production build..."
npm run build

# Optimize build output
echo "Optimizing build output..."
rm -rf .next/cache
rm -rf .next/server/chunks

# Create production package
echo "Creating production package..."
tar -czf ../frontend-production.tar.gz .next package.json package-lock.json

cd ..

echo "✅ Production deployment completed!"
echo ""
echo "📋 Deployment Summary:"
echo "  Backend: Ready for deployment to Render"
echo "  Frontend: Ready for deployment to Vercel"
echo "  Build files: frontend-production.tar.gz"
echo ""
echo "🔧 Next Steps:"
echo "  1. Deploy backend to Render using the backend folder"
echo "  2. Deploy frontend to Vercel using the frontend-production.tar.gz"
echo "  3. Update environment variables in both platforms"
echo "  4. Test all functionality in production"
echo ""
echo "�� Happy deploying!"


