# 🚂 Railway Deployment Guide for HealthMate Backend

## Quick Start Checklist

- [ ] Code is committed to GitHub
- [ ] `.env` is in `.gitignore`
- [ ] All dependencies are in `package.json`
- [ ] MongoDB Atlas is configured
- [ ] Cloudinary account is ready
- [ ] Gemini API key is obtained

---

## Step-by-Step Deployment

### 1. Prepare Your Code

```bash
# Make sure everything is committed
git add .
git commit -m "Ready for Railway deployment"
git push origin main
```

### 2. Sign Up for Railway

1. Go to [railway.app](https://railway.app)
2. Click "Login" and sign in with GitHub
3. Authorize Railway to access your repositories

### 3. Create New Project

1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Search for and select `healthMate_backend`
4. Railway will start the deployment automatically

### 4. Configure Environment Variables

Click on your project → Go to "Variables" tab → Add these variables:

#### Required Variables

```env
MONGODB_URI=mongodb+srv://your_user:your_password@cluster.mongodb.net/healthmate?retryWrites=true&w=majority
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
GEMINI_API_KEY=your_gemini_api_key
JWT_SECRET=create_a_strong_random_32_character_secret_here
NODE_ENV=production
```

#### Optional Variables

```env
PORT=5000
JWT_EXPIRE=72h
MAX_FILE_SIZE=10485760
FRONTEND_URL=https://your-frontend.vercel.app
```

**Important:** Click "Add" for each variable!

### 5. Configure MongoDB Atlas

1. Log in to [MongoDB Atlas](https://cloud.mongodb.com)
2. Go to your cluster → "Network Access"
3. Click "Add IP Address"
4. Select "Allow Access from Anywhere" (0.0.0.0/0)
5. Click "Confirm"

### 6. Deploy & Monitor

1. Railway will automatically deploy after adding variables
2. Wait for the build to complete (usually 2-3 minutes)
3. Click on your deployment to see logs

### 7. Get Your Backend URL

1. In Railway project, click "Settings"
2. Under "Domains", click "Generate Domain"
3. Copy the URL (e.g., `https://healthmate-backend-production.up.railway.app`)

### 8. Test Your Deployment

Test the health endpoint:
```bash
curl https://your-app.up.railway.app/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-10-20T...",
  "uptime": 123.45,
  "environment": "production",
  "database": "connected"
}
```

### 9. Update Your Frontend

In your frontend `.env` file:
```env
VITE_API_URL=https://your-app.up.railway.app/api
```

---

## Common Issues & Solutions

### ❌ Build Failed

**Problem:** Deployment fails during build

**Solution:**
1. Check Railway logs for errors
2. Verify `package.json` has all dependencies
3. Make sure Node.js version is compatible (v18+)

### ❌ MongoDB Connection Error

**Problem:** "MongoServerSelectionError" or "queryTxt ETIMEOUT"

**Solution:**
1. Verify MongoDB Atlas Network Access allows 0.0.0.0/0
2. Check if MONGODB_URI is correct in Railway variables
3. Ensure MongoDB cluster is active (not paused)

### ❌ Application Error / Crashes

**Problem:** App starts but crashes immediately

**Solution:**
1. Check Railway logs for specific error
2. Verify all required environment variables are set
3. Make sure JWT_SECRET is set and not "nothing"

### ❌ CORS Errors from Frontend

**Problem:** Frontend gets CORS errors when calling API

**Solution:**
1. Add your frontend URL to `FRONTEND_URL` variable in Railway
2. Or add it directly in `src/app.js` allowedOrigins array
3. Redeploy after changes

### ❌ File Upload Issues

**Problem:** Files not uploading or persisting

**Solution:**
1. Verify Cloudinary credentials in Railway variables
2. Check Cloudinary dashboard for upload limits
3. Files should upload to Cloudinary (Railway storage is ephemeral)

---

## Environment Variables Explained

| Variable | Where to Get It | Example |
|----------|----------------|---------|
| `MONGODB_URI` | MongoDB Atlas → Connect → Driver | `mongodb+srv://user:pass@...` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary Dashboard | `your_cloud_name` |
| `CLOUDINARY_API_KEY` | Cloudinary Dashboard → Settings | `123456789012345` |
| `CLOUDINARY_API_SECRET` | Cloudinary Dashboard → Settings | `abcdef123456...` |
| `GEMINI_API_KEY` | Google AI Studio → API Keys | `AIzaSy...` |
| `JWT_SECRET` | Generate random 32+ char string | Use: `openssl rand -base64 32` |

---

## Generating a Secure JWT Secret

### On Windows (PowerShell):
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

### On Mac/Linux:
```bash
openssl rand -base64 32
```

### Online:
Use [random.org](https://www.random.org/strings/) to generate a 32-character string

---

## Monitoring Your App

### View Logs
1. Railway Dashboard → Your Project
2. Click on the deployment
3. View real-time logs

### Set Up Alerts
1. Railway Dashboard → Settings
2. Configure notifications for crashes/errors

### Check Health
Visit: `https://your-app.up.railway.app/health`

---

## Updating Your App

### Deploy Changes
```bash
git add .
git commit -m "Your changes"
git push origin main
```

Railway will automatically detect changes and redeploy!

### Manual Redeploy
1. Railway Dashboard → Deployments
2. Click "..." → "Redeploy"

---

## Cost Estimate

Railway offers:
- **Free Trial**: $5 credit (enough for testing)
- **Hobby Plan**: $5/month for small projects
- **Pro Plan**: Pay-as-you-go for production

Your HealthMate backend should run comfortably on the Hobby plan.

---

## Need Help?

- Check Railway logs for specific errors
- Review MongoDB Atlas connection settings
- Verify all environment variables are set correctly
- Test endpoints with Postman or curl

**Your backend should now be live on Railway! 🚀**
