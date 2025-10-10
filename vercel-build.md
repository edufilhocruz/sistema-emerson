# Vercel Build Configuration

## Frontend Build
- Builds the React frontend using Vite
- Outputs to `dist/` directory
- Serves static files

## Backend Build  
- Builds the NestJS backend
- Outputs to `backend/dist/` directory
- Runs as serverless function

## Build Commands
```bash
# Frontend
npm run build

# Backend  
cd backend && npm run build
```

## Environment Variables
Make sure to set these in Vercel dashboard:
- `DATABASE_URL`
- `JWT_SECRET`
- `EMAIL_HOST`
- `EMAIL_PORT`
- `EMAIL_USER`
- `EMAIL_PASS`
- `NODE_ENV=production`

## Routes
- `/api/*` → Backend API
- `/*` → Frontend static files
