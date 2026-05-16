# Vercel Deployment Guide

## Prerequisites
- GitHub account (already done ✓)
- Vercel account (free)
- Environment variables ready

## Step 1: Create Vercel Account
1. Go to https://vercel.com
2. Click "Sign Up"
3. Choose "Continue with GitHub"
4. Authorize Vercel to access your repos

## Step 2: Import Repository
1. Click "New Project" on Vercel dashboard
2. Click "Import Git Repository"
3. Search for "CareerPropel"
4. Click "Import"

## Step 3: Configure Project
- Framework: Next.js (should auto-detect)
- Root Directory: ./ (default)
- Build Command: next build (default)
- Output Directory: .next (default)

## Step 4: Add Environment Variables
Vercel Dashboard → Project Settings → Environment Variables

Add these:
```
NEXTAUTH_URL=https://your-project.vercel.app
NEXTAUTH_SECRET=your-secret-key-here

# Database (if using cloud database)
DATABASE_URL=postgresql://user:password@host:port/database

# Optional
REDIS_URL=redis://user:password@host:port
LOG_LEVEL=info
```

## Step 5: Deploy!
- Click "Deploy"
- Wait 2-3 minutes
- Get your live URL

## Step 6: Post-Deployment
1. Test the live URL
2. Update GitHub README with demo link
3. Share on LinkedIn/Twitter
4. Add to portfolio

## Troubleshooting
If build fails:
- Check environment variables are set
- Verify database connection string
- Check build logs in Vercel dashboard
- Make sure all dependencies are in package.json
