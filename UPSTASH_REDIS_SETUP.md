# Upstash Redis Setup Instructions (Updated)

## ⚠️ Important: Vercel KV is now Upstash Redis

Vercel has migrated to Upstash Redis as the official Redis solution. This guide shows the updated setup process.

## Setting up Upstash Redis for Download Logging

### Step 1: Install Upstash Redis Integration on Vercel

**Option A: Through Vercel Dashboard (Recommended)**

1. Go to your Vercel Dashboard: https://vercel.com/dashboard
2. Select your project (trangthidua)
3. Click on the **"Storage"** tab
4. Click **"Create Database"** or **"Connect Store"**
5. Select **"Upstash Redis"** from the marketplace
6. Click **"Add Integration"**
7. Follow the prompts to create a new Redis database
8. Name it: `download-logs`
9. Select the free tier (more than enough!)
10. Click **"Create & Continue"**
11. Select which projects to connect (choose `trangthidua`)
12. Click **"Connect"**

**Option B: Through Vercel Marketplace**

1. Go to: https://vercel.com/marketplace/upstash
2. Click **"Add Integration"**
3. Follow the setup wizard
4. Connect to your `trangthidua` project

### Step 2: Environment Variables (Auto-configured)

After installation, Vercel automatically adds these environment variables to your project:
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

You can verify this by:
1. Go to Project Settings → Environment Variables
2. You should see the Upstash variables listed

### Step 3: Deploy

The code is already updated to use Upstash Redis!

1. Just push your code (already done)
2. Vercel will automatically redeploy
3. Logging will work immediately after connecting Upstash!

### Step 4: For Local Development (Optional)

If you want to test logging locally:

1. In your Vercel Dashboard, go to **Settings** → **Environment Variables**
2. Copy `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
3. Create a file `.env.local` in your project root
4. Add:
```env
UPSTASH_REDIS_REST_URL="https://xxxxxx.upstash.io"
UPSTASH_REDIS_REST_TOKEN="AXxxxxxxxxxxxx"
```
5. Restart your dev server: `npm run dev`

## Testing

After connecting Upstash:
1. Visit your deployed site
2. Download an image
3. Visit `/log` route
4. Enter password: `admin123`
5. You should see the download logged! 🎉

## Pricing

**Free Tier Includes:**
- ✅ 10,000 commands/day (plenty for logging!)
- ✅ 256 MB storage
- ✅ Pay-as-you-go after limits
- ✅ Global replication
- ✅ Fast performance

## Benefits Over File System

| File System (Old) | Upstash Redis (New) |
|-------------------|---------------------|
| ❌ Doesn't work on Vercel | ✅ Works perfectly |
| ❌ Data lost on redeploy | ✅ Data persists forever |
| ❌ Read-only errors | ✅ Always writable |
| ❌ Slow | ✅ Ultra-fast (in-memory) |
| ❌ Race conditions | ✅ Atomic operations |

## Troubleshooting

**Error: "UPSTASH_REDIS_REST_URL is not defined"**
- Install the Upstash integration in Vercel Dashboard
- Make sure it's connected to the correct project
- Redeploy your project

**Local development not working**
- Copy environment variables from Vercel Dashboard → Settings → Environment Variables
- Create `.env.local` file
- Restart dev server with `npm run dev`

**Still seeing old Vercel KV warnings**
- Already fixed! We're now using `@upstash/redis` package
- The warning was for the old deprecated `@vercel/kv`

## Links

- Upstash Integration: https://vercel.com/marketplace/upstash
- Upstash Dashboard: https://console.upstash.com/
- Documentation: https://upstash.com/docs/redis/overall/getstarted
