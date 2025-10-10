#!/bin/bash

# Vercel Build Script for Raunaimer System
# This script builds both frontend and backend for Vercel deployment

set -e

echo "🚀 Starting Vercel build process..."

# Install dependencies
echo "📦 Installing frontend dependencies..."
npm install

echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

# Build backend first
echo "🔨 Building backend..."
cd backend
npm run build
cd ..

# Build frontend
echo "🔨 Building frontend..."
npm run build

echo "✅ Build completed successfully!"
echo "📁 Frontend build: ./dist/"
echo "📁 Backend build: ./backend/dist/"

# Verify builds
if [ ! -d "dist" ]; then
  echo "❌ Frontend build failed - dist directory not found"
  exit 1
fi

if [ ! -d "backend/dist" ]; then
  echo "❌ Backend build failed - backend/dist directory not found"
  exit 1
fi

echo "🎉 All builds verified successfully!"
