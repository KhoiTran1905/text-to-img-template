# Vercel KV Setup Instructions

## Setting up Vercel KV for Download Logging

### Step 1: Create a KV Database on Vercel

1. Go to your Vercel Dashboard: https://vercel.com/dashboard
2. Select your project (trangthidua)
3. Click on the **Storage** tab
4. Click **Create Database**
5. Select **KV (Redis)**
6. Give it a name (e.g., "download-logs")
7. Click **Create**

### Step 2: Connect KV to Your Project

After creating the database:
1. Vercel will show you a confirmation screen
2. Click **Connect to Project**
3. Select your project from the dropdown
4. Click **Connect**

Vercel will automatically add the required environment variables to your project.

### Step 3: For Local Development (Optional)

If you want to test logging locally:

1. In your Vercel Dashboard, go to Storage → Your KV database
2. Click on the **.env.local** tab
3. Copy all the environment variables shown
4. Create a file `.env.local` in your project root
5. Paste the environment variables

**Example:**
```
KV_URL="redis://..."
KV_REST_API_URL="https://..."
KV_REST_API_TOKEN="..."
KV_REST_API_READ_ONLY_TOKEN="..."
```

### Step 4: Deploy

1. Commit and push your changes
2. Vercel will automatically redeploy
3. The logging will now work on production!

### Testing

After deployment:
1. Download an image from your app
2. Visit `/log` route
3. Enter password: `admin123`
4. You should see the download logged!

## Notes

- ✅ Free tier includes 3000 commands/day (more than enough for logging)
- ✅ Data persists across deployments
- ✅ No need to create JSON files
- ✅ Much faster than file system operations
- ✅ Atomic operations prevent race conditions

## Troubleshooting

**Error: "KV_REST_API_URL is not defined"**
- Make sure you connected the KV database to your project in Vercel Dashboard
- Redeploy after connecting

**Local development not working**
- Copy the environment variables from Vercel Dashboard → Storage → .env.local tab
- Create `.env.local` file in project root
- Restart your dev server
