# Deploying D&D 5e Character Dashboard to Vercel

Complete step-by-step guide for deploying your app to Vercel's free tier.

## Prerequisites

1. **GitHub Account** (free)
2. **Vercel Account** (free) - Sign up at [vercel.com](https://vercel.com)
3. **Convex Account** (free) - Sign up at [convex.dev](https://convex.dev)
4. **Node.js** installed locally (for initial setup)

---

## Step 1: Set Up Convex Backend

### 1.1 Create a Convex Project

1. Go to [https://dashboard.convex.dev](https://dashboard.convex.dev)
2. Sign in or create an account
3. Click **"New Project"**
4. Choose a project name (e.g., `dnd-character-dashboard`)
5. Select a region (choose closest to you)
6. Click **"Create Project"**

### 1.2 Link Your Local Project to Convex

1. Open a terminal in your project directory:
   ```bash
   cd dnd_5e_character_dashboard
   ```

2. Install Convex CLI globally (if not already installed):
   ```bash
   npm install -g convex
   ```

3. Login to Convex:
   ```bash
   npx convex login
   ```
   - This will open a browser window to authenticate

4. Initialize Convex in your project:
   ```bash
   npx convex dev
   ```
   - This will:
     - Create a `convex.json` file
     - Generate deployment keys
     - Start the Convex dev server
     - Create a `.env.local` file with your Convex URL

5. **Note your Convex URL** from `.env.local`:
   ```
   VITE_CONVEX_URL=https://your-project-name.convex.cloud
   ```

6. Stop the dev server (Ctrl+C) - we'll set it up properly next

### 1.3 Configure Convex Auth

1. Your auth is already configured in `convex/auth.config.ts`
2. The auth uses Anonymous authentication (no setup needed for free tier)

---

## Step 2: Prepare Your Code for Deployment

### 2.1 Create a `.gitignore` (if not exists)

Make sure `.gitignore` includes:
```
node_modules/
.env.local
.env
dist/
.convex/
```

### 2.2 Verify Build Script

Your `package.json` should have:
```json
{
  "scripts": {
    "build": "vite build"
  }
}
```

### 2.3 Create `vercel.json` (Optional)

Create `vercel.json` in your project root:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**Note:** Vercel usually auto-detects Vite projects, so this may not be necessary.

---

## Step 3: Push Code to GitHub

### 3.1 Initialize Git (if not already done)

```bash
git init
git add .
git commit -m "Initial commit"
```

### 3.2 Create GitHub Repository

1. Go to [github.com](https://github.com)
2. Click **"New repository"**
3. Name it (e.g., `dnd-character-dashboard`)
4. Choose **Public** (required for free Vercel)
5. **Don't** initialize with README, .gitignore, or license
6. Click **"Create repository"**

### 3.3 Push to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/dnd-character-dashboard.git
git branch -M main
git push -u origin main
```

---

## Step 4: Deploy to Vercel

### 4.1 Import Project to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign in (or create account)
3. Click **"Add New..."** → **"Project"**
4. Click **"Import Git Repository"**
5. Select your GitHub repository (`dnd-character-dashboard`)
6. Click **"Import"**

### 4.2 Configure Project Settings

1. **Framework Preset:** Vercel should auto-detect "Vite"
2. **Root Directory:** Leave as `.` (root)
3. **Build Command:** `npm run build` (should be auto-filled)
4. **Output Directory:** `dist` (should be auto-filled)
5. **Install Command:** `npm install` (should be auto-filled)

### 4.3 Add Environment Variables

**IMPORTANT:** Add your Convex URL and deploy key as environment variables:

1. In the Vercel project settings, scroll to **"Environment Variables"**
2. Click **"Add"** and add the following:

   **First variable:**
   - **Name:** `VITE_CONVEX_URL`
   - **Value:** Your Convex URL from Step 1.2 (e.g., `https://your-project-name.convex.cloud`)
   - **Environment:** Select all (Production, Preview, Development)
   - Click **"Save"**

   **Second variable (for build):**
   - **Name:** `CONVEX_DEPLOY_KEY`
   - **Value:** Get this from Convex Dashboard → Settings → Deploy Keys → Create Deploy Key
   - **Environment:** Select all (Production, Preview, Development)
   - Click **"Save"**

   **Note:** The `CONVEX_DEPLOY_KEY` is needed for `convex dev --once` to generate files during the build.

### 4.4 Deploy

1. Click **"Deploy"**
2. Wait for the build to complete (usually 1-2 minutes)
3. Once deployed, you'll see:
   - ✅ Build successful
   - Your app URL (e.g., `https://dnd-character-dashboard.vercel.app`)

---

## Step 5: Configure Convex for Production

### 5.1 Set Convex Site URL

1. Go to [Convex Dashboard](https://dashboard.convex.dev)
2. Select your project
3. Go to **"Settings"** → **"Environment Variables"**
4. Add environment variable:
   - **Name:** `CONVEX_SITE_URL`
   - **Value:** Your Vercel URL (e.g., `https://dnd-character-dashboard.vercel.app`)
5. Click **"Save"**

**Note:** This is needed for authentication to work properly.

### 5.2 Verify Convex Deployment

1. In Convex Dashboard, go to **"Deployments"**
2. Make sure your latest deployment is active
3. Check that all functions are deployed successfully

---

## Step 6: Test Your Deployment

### 6.1 Test the App

1. Visit your Vercel URL (e.g., `https://dnd-character-dashboard.vercel.app`)
2. You should see your app load
3. Try signing in (Anonymous auth should work)
4. Create a test character
5. Test various features

### 6.2 Check for Errors

1. Open browser DevTools (F12)
2. Check Console for any errors
3. Check Network tab for failed requests
4. If you see CORS errors, verify `CONVEX_SITE_URL` is set correctly

---

## Step 7: Load Bestiary Data (Optional)

Once your app is deployed, you can load your bestiary data:

### Option 1: Using Convex Dashboard

1. Go to Convex Dashboard → Functions
2. Run `bestiaryReference:loadMonsters` with your monster data

### Option 2: Using the Script

1. Set `CONVEX_URL` environment variable locally:
   ```bash
   export CONVEX_URL=https://your-project-name.convex.cloud
   ```
2. Run:
   ```bash
   node scripts/loadBestiaryToConvex.js
   ```

See `BESTIARY_LOADING_INSTRUCTIONS.md` for detailed instructions.

---

## Troubleshooting

### Build Fails

**Error: "Cannot find module"**
- Make sure all dependencies are in `package.json`
- Run `npm install` locally to verify

**Error: "VITE_CONVEX_URL is not defined"**
- Make sure you added `VITE_CONVEX_URL` in Vercel environment variables
- Redeploy after adding environment variables

**Error: "Could not resolve ../convex/_generated/api"**
- Make sure you added `CONVEX_DEPLOY_KEY` in Vercel environment variables
- The build script runs `convex dev --once` which needs the deploy key
- Redeploy after adding the deploy key

### App Doesn't Load

**Blank page or errors**
- Check browser console for errors
- Verify `VITE_CONVEX_URL` is correct
- Check Convex Dashboard for deployment status

**Authentication not working**
- Verify `CONVEX_SITE_URL` is set in Convex Dashboard
- Make sure it matches your Vercel URL exactly (including `https://`)

### CORS Errors

- Verify `CONVEX_SITE_URL` in Convex Dashboard matches your Vercel URL
- Check that your Convex deployment is active

### Environment Variables Not Working

- Environment variables are only available at build time for Vite
- Make sure variable names start with `VITE_` for client-side access
- Redeploy after adding/updating environment variables

---

## Updating Your Deployment

### Automatic Updates

- Every push to `main` branch automatically triggers a new deployment
- Preview deployments are created for pull requests

### Manual Updates

1. Make changes to your code
2. Commit and push:
   ```bash
   git add .
   git commit -m "Your changes"
   git push
   ```
3. Vercel will automatically deploy

### Updating Convex Functions

1. Make changes to files in `convex/`
2. Run locally to test:
   ```bash
   npx convex dev
   ```
3. Push to GitHub (Vercel will redeploy frontend)
4. Convex functions are automatically deployed when you push

---

## Free Tier Limits

### Vercel Free Tier
- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ Automatic HTTPS
- ✅ Custom domains (1)
- ⚠️ 100 builds/month (usually plenty)

### Convex Free Tier
- ✅ 1M function calls/month
- ✅ 1GB database storage
- ✅ 1GB file storage
- ✅ Unlimited projects
- ⚠️ 1M function calls/month (should be plenty for personal use)

---

## Next Steps

1. **Custom Domain** (Optional)
   - In Vercel Dashboard → Settings → Domains
   - Add your custom domain
   - Follow DNS setup instructions

2. **Monitor Usage**
   - Check Vercel Dashboard for build/bandwidth usage
   - Check Convex Dashboard for function call usage

3. **Set Up Monitoring** (Optional)
   - Add error tracking (e.g., Sentry)
   - Set up analytics (e.g., Vercel Analytics)

---

## Quick Reference

### Important URLs
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Convex Dashboard:** https://dashboard.convex.dev
- **Your App:** `https://your-project.vercel.app`

### Important Environment Variables

**Vercel:**
- `VITE_CONVEX_URL` = Your Convex deployment URL (e.g., `https://your-project.convex.cloud`)
- `CONVEX_DEPLOY_KEY` = Your Convex deploy key (from Convex Dashboard → Settings → Deploy Keys)

**Convex:**
- `CONVEX_SITE_URL` = Your Vercel app URL (e.g., `https://your-project.vercel.app`)

### Common Commands

```bash
# Local development
npm run dev

# Build locally
npm run build

# Deploy Convex functions
npx convex dev

# Check Convex deployment
npx convex deploy
```

---

## Support

- **Vercel Docs:** https://vercel.com/docs
- **Convex Docs:** https://docs.convex.dev
- **Vite Docs:** https://vitejs.dev

If you run into issues, check:
1. Browser console for errors
2. Vercel deployment logs
3. Convex Dashboard logs
4. Network tab in DevTools

