# Render Redeploy (fix failed deployment)

## MongoDB Atlas fix (REQUIRED if you see SSL / whitelist errors)

1. Go to **[cloud.mongodb.com](https://cloud.mongodb.com)** → your project
2. **Network Access** (left sidebar) → **+ Add IP Address**
3. Click **Allow Access from Anywhere** → adds `0.0.0.0/0`
4. Click **Confirm** → wait 1–2 minutes
5. On Render → **Manual Deploy** → Deploy latest commit

Without `0.0.0.0/0`, Render cannot reach Atlas and deploy fails with SSL errors.

---

## Deploy the correct backend (3 env vars only)

1. Open: **https://dashboard.render.com/blueprint/new**
2. Sign in with GitHub → select **farhanrangara06/ReMarket**
3. Set **only these 3** when prompted:

| Variable | Value |
|----------|-------|
| `MONGO_URI` | Your Atlas connection string |
| `CLOUDINARY_CLOUD_NAME` | `tk2bj8qd` |
| `CLOUDINARY_API_KEY` | From your Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | From your Cloudinary dashboard |

Everything else has defaults in `render.yaml`.

4. Click **Apply** → wait ~5 min
5. Test: `https://remarket-backend.onrender.com/api/health`

Should return:
```json
{"success":true,"database":"connected","storage":"cloudinary"}
```

## Frontend is already live

**https://farhanrangara06.github.io/ReMarket/**

After Render deploys, login with: `rahul@remarket.demo` / `Demo@123`
