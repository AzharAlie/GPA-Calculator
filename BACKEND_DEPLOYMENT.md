# Backend Deployment Guide - Deploy Your Node.js Server

Since your project is a **MERN app** with a separate backend, you need to deploy both:
- ✅ **Frontend (React)** → Already on Vercel
- ❌ **Backend (Node.js/Express)** → NOT YET DEPLOYED (This is why auth & features aren't working!)

---

## Quick Fix: Deploy Backend to Render.com (Recommended)

### Step 1: Prepare Your Backend

1. Create a `.env.production` file in the `server/` folder:
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=5000
```

2. Make sure `server/server.js` has this code to handle production:
```javascript
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

### Step 2: Push to GitHub

```powershell
# From root directory
git add .
git commit -m "Prepare backend for deployment"
git push origin main
```

### Step 3: Deploy to Render

1. Go to [render.com](https://render.com) and sign up (free)
2. Click "New +" → "Web Service"
3. Select "Deploy an existing Git repository"
4. Connect your GitHub repo
5. Fill in these settings:
   - **Name**: `gpa-calculator-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && npm start`
   - **Instance Type**: Free

6. Click "Advanced" and add environment variables:
   - `MONGODB_URI` = your MongoDB connection string
   - `JWT_SECRET` = a secure random string
   - `NODE_ENV` = production

7. Click "Create Web Service"

### Step 4: Update Frontend to Use New Backend URL

Once Render deploys your backend, you'll get a URL like: `https://gpa-calculator-backend.onrender.com`

1. In Vercel dashboard, add environment variable:
   - Variable: `VITE_API_URL`
   - Value: `https://gpa-calculator-backend.onrender.com/api`

2. **Redeploy frontend** (push to GitHub or manually trigger in Vercel)

---

## Option 2: Deploy Backend to Railway.app

1. Go to [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repo
4. Click on `server` folder in Railway
5. Add environment variables same as above
6. Deploy!
7. Get your Railway URL and update Vercel frontend URL

---

## Checking If Backend is Working

Once deployed, test your backend:

```powershell
# Replace YOUR_BACKEND_URL with actual URL
curl https://YOUR_BACKEND_URL/api/health

# Should return something like:
# {"status":"Server is running","timestamp":"2024-01-21"}
```

If you see the response, your backend is live! ✅

---

## Common Issues

### Issue: Frontend still doesn't see backend
- Make sure `VITE_API_URL` is set in Vercel
- Redeploy frontend after setting the variable
- Check browser console (F12) for API errors

### Issue: CORS errors
Make sure your backend has CORS enabled. Check `server/server.js`:
```javascript
import cors from 'cors';
app.use(cors()); // Allow all origins for development
```

For production, restrict CORS:
```javascript
app.use(cors({
  origin: 'https://your-vercel-frontend-url.vercel.app',
  credentials: true
}));
```

### Issue: Can't connect to MongoDB
- Verify MongoDB connection string is correct
- Add Render/Railway IP to MongoDB Atlas whitelist (allow 0.0.0.0/0 for development)

---

## Summary

1. ✅ Push code to GitHub
2. ✅ Deploy backend to Render/Railway
3. ✅ Get backend URL
4. ✅ Update `VITE_API_URL` in Vercel
5. ✅ Redeploy frontend
6. ✅ Test!

That's it! Your auth and PDF features will now work. 🎉
