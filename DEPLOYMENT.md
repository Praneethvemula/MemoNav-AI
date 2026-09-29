# 🚀 MemoNav AI Deployment Guide

This guide details how to deploy MemoNav AI with **Vercel** for the Frontend and **Render** (or Railway) for the Backend.

---

## 1. Deploy the Backend to Render (Free)

### Option A: Using the Render Blueprint (Recommended)
1. Go to [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** > **Blueprint**.
3. Select your repository: `Praneethvemula/MemoNav-AI`.
4. Render will automatically detect [`render.yaml`](./render.yaml).
5. Fill in the optional environment variables:
   - `GEMINI_API_KEY`: Your Google Gemini API Key.
   - `HINDSIGHT_API_KEY`: Your Hindsight API Key (optional).
   - `MONGODB_URI`: (Optional) MongoDB Atlas connection string. If omitted, MemoNav AI automatically activates its built-in resilient local storage.
6. Click **Apply**.
7. Once deployed, note down your backend URL (e.g., `https://memonav-ai-server.onrender.com`).

### Option B: Manual Web Service Setup
- **Environment**: Node
- **Root Directory**: `server`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Health Check Path**: `/api/health`

---

## 2. Deploy the Frontend to Vercel (Free)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New...** > **Project**.
3. Import your GitHub repository: `Praneethvemula/MemoNav-AI`.
4. Configure the Project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `client` (Click "Edit" and choose `client`)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. **Environment Variables**:
   - Add:
     - `VITE_API_BASE_URL` = `https://your-backend-url.onrender.com/api`
       *(replace with your actual Render backend URL)*
6. Click **Deploy**.

---

## 3. Verify Deployment
- Open your Vercel URL (e.g., `https://memonav-ai.vercel.app`).
- Check that the Navigation, Memory, and Vision features connect seamlessly to your deployed Render backend.
- Check backend health at `https://your-backend-url.onrender.com/api/health`.
