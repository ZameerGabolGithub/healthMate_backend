 
# HealthMate Backend API

AI-powered personal health companion backend built with Node.js, Express, MongoDB, and Google Gemini AI.

## 🚀 Features

- **User Authentication**: JWT-based secure authentication
- **File Management**: Upload and store medical reports (PDF, images)
- **AI Analysis**: Automatic medical report analysis with Gemini AI
- **Vitals Tracking**: Manual health vitals logging (BP, sugar, weight, etc.)
- **Timeline View**: Unified timeline of reports and vitals
- **Cloud Storage**: Cloudinary integration for file storage

## 📦 Tech Stack

- Node.js & Express.js
- MongoDB with Mongoose
- Google Gemini AI
- Cloudinary (File Storage)
- JWT Authentication
- Bcrypt (Password Hashing)

## 🛠️ Installation

### Prerequisites

- Node.js (v18 or higher)
- MongoDB Atlas account
- Cloudinary account
- Google AI Studio API key

### Local Development Setup

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/healthMate_backend.git
cd healthMate_backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
   - Copy `.env.example` to `.env`
   - Fill in all required values:
```bash
cp .env.example .env
```

4. **Configure your .env file**
   - `MONGODB_URI`: Your MongoDB connection string from MongoDB Atlas
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: From Cloudinary dashboard
   - `GEMINI_API_KEY`: From Google AI Studio
   - `JWT_SECRET`: A strong random string (min 32 characters)

5. **Run the development server**
```bash
npm run dev
```

The server will start on `http://localhost:5000`

## 🚂 Railway Deployment

### Step 1: Prepare Your Repository

1. **Make sure all changes are committed**
```bash
git add .
git commit -m "Prepare for Railway deployment"
git push origin main
```

2. **Verify .gitignore**
   - Ensure `.env` and `node_modules/` are in `.gitignore`
   - The `.env.example` file should be committed

### Step 2: Deploy to Railway

1. **Sign up/Login to Railway**
   - Go to [railway.app](https://railway.app)
   - Sign up or login with GitHub

2. **Create a New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your `healthMate_backend` repository

3. **Configure Environment Variables**
   
   Go to your Railway project → Variables tab and add these:

   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/healthmate?retryWrites=true&w=majority
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   GEMINI_API_KEY=your_gemini_api_key
   NODE_ENV=production
   PORT=5000
   JWT_SECRET=your_secure_random_jwt_secret_min_32_characters
   JWT_EXPIRE=72h
   MAX_FILE_SIZE=10485760
   FRONTEND_URL=https://your-frontend-url.vercel.app
   ```

   **⚠️ IMPORTANT**: Use strong, unique values for production!

4. **Deploy**
   - Railway will automatically detect your Node.js app
   - It will use the `Procfile` or the `start` script from `package.json`
   - Wait for the deployment to complete

5. **Get Your Deployment URL**
   - Railway will provide a URL like: `https://your-app.up.railway.app`
   - Test it by visiting: `https://your-app.up.railway.app/health`

### Step 3: Configure MongoDB Atlas for Railway

1. Go to MongoDB Atlas → Network Access
2. Add Railway's IP to allowlist:
   - Click "Add IP Address"
   - Select "Allow Access from Anywhere" (0.0.0.0/0)
   - Or add Railway's specific IP if provided

### Step 4: Update Frontend CORS

After deployment, update your frontend to use the Railway backend URL:
```javascript
const API_URL = 'https://your-app.up.railway.app/api';
```

## 📡 API Endpoints

### Health Check
```
GET /          - API information
GET /health    - Health status with database check
```

### Authentication
```
POST /api/auth/register    - Register new user
POST /api/auth/login       - Login user
GET  /api/auth/me          - Get current user (Protected)
PUT  /api/auth/profile     - Update profile (Protected)
```

### Files
```
POST   /api/files/upload   - Upload medical file (Protected)
GET    /api/files          - Get all user files (Protected)
GET    /api/files/:id      - Get single file (Protected)
DELETE /api/files/:id      - Delete file (Protected)
```

### AI Analysis
```
POST /api/ai/analyze/:fileId       - Analyze file with AI (Protected)
GET  /api/ai/insights/:fileId      - Get AI insights (Protected)
GET  /api/ai/chat                  - AI chat endpoint (Protected)
```

### Vitals
```
POST /api/vitals           - Add vitals record (Protected)
GET  /api/vitals           - Get user vitals (Protected)
GET  /api/vitals/:id       - Get single vital (Protected)
```

### Timeline
```
GET /api/timeline          - Get combined timeline (Protected)
```

## 🔒 Security Notes

1. **Never commit `.env` file** - It's in `.gitignore`
2. **Use strong JWT_SECRET** - At least 32 random characters
3. **MongoDB**: Restrict IP access in production
4. **API Keys**: Keep Cloudinary and Gemini API keys secure
5. **CORS**: Only allow trusted frontend origins

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Verify connection string in `.env`
- Check MongoDB Atlas network access settings
- Ensure database user has correct permissions

### Railway Deployment Fails
- Check Railway logs for specific errors
- Verify all environment variables are set
- Ensure `package.json` has correct start script

### File Upload Issues
- Railway provides ephemeral storage
- Files are stored in Cloudinary (persistent)
- Check Cloudinary credentials

### CORS Errors
- Add your frontend URL to allowed origins in `src/app.js`
- Or add `FRONTEND_URL` to environment variables

## 📝 Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | ✅ Yes |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | ✅ Yes |
| `CLOUDINARY_API_KEY` | Cloudinary API key | ✅ Yes |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | ✅ Yes |
| `GEMINI_API_KEY` | Google Gemini API key | ✅ Yes |
| `JWT_SECRET` | Secret for JWT signing (32+ chars) | ✅ Yes |
| `JWT_EXPIRE` | JWT expiration time | ❌ No (default: 72h) |
| `NODE_ENV` | Environment mode | ❌ No (default: development) |
| `PORT` | Server port | ❌ No (default: 5000) |
| `MAX_FILE_SIZE` | Max upload size in bytes | ❌ No (default: 10MB) |
| `FRONTEND_URL` | Frontend URL for CORS | ❌ No |

## 📧 Support

For issues and questions, please open an issue on GitHub.

## 📄 License

MIT

---

**Built with ❤️ for better health management**
 
