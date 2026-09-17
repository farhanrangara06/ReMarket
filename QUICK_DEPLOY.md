# Quick Deploy — ReMarket

Repo: **https://github.com/farhanrangara06/ReMarket**

---

## Step 1 — GitHub ✅ DONE

Code is pushed to GitHub.

---

## Step 2 — Render (API) — ~5 min

1. Open: **https://dashboard.render.com/blueprint/new**
2. Connect GitHub → select **farhanrangara06/ReMarket**
3. Render reads `render.yaml` automatically
4. Run locally to print your env vars:
   ```powershell
   .\scripts\show-deploy-env.ps1
   ```
5. Paste each value into Render when prompted
6. Click **Apply** → wait ~5 min
7. API URL: `https://remarket-api.onrender.com`

**Verify:**
```
https://remarket-api.onrender.com/api/health
```

---

## Step 3 — Vercel (frontend) — ~3 min

1. Open: **https://vercel.com/new**
2. Import **farhanrangara06/ReMarket**
3. Settings:
   - **Root Directory:** `client`
   - **Framework:** Vite
4. Environment variable:
   ```
   VITE_API_URL=https://remarket-api.onrender.com/api
   ```
5. Click **Deploy**
6. Copy your URL: `https://remarket-xxxx.vercel.app`

---

## Step 4 — Connect frontend + backend

1. Render → **remarket-api** → **Environment**
2. Set:
   ```
   CLIENT_URL=https://remarket-xxxx.vercel.app
   ```
   (use your real Vercel URL)
3. **Manual Deploy** → Deploy latest commit

---

## Step 5 — Test live app

1. Open your Vercel URL
2. Login: `rahul@remarket.demo` / `Demo@123`
3. Browse products, wishlist, dashboard

---

## If login fails on live site

- `CLIENT_URL` on Render must exactly match Vercel URL (no trailing slash)
- Redeploy Render after changing `CLIENT_URL`
- Clear browser cookies and try again
