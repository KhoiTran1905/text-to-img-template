# Firebase Setup Instructions - SIMPLE & FREE

## 🚀 Quick Setup (10 minutes)

### Step 1: Create a Firebase Project

1. Go to: https://console.firebase.google.com/
2. Click **"Add project"** or **"Create a project"**
3. Enter project name: `trangthidua-logs` (or any name you like)
4. Disable Google Analytics (not needed) → Click **Continue**
5. Wait for project creation → Click **Continue**

### Step 2: Enable Firestore Database

1. In your Firebase project, click **"Firestore Database"** from the left menu
2. Click **"Create database"**
3. **Choose location**: Select closest to your users (e.g., `asia-southeast1` for Vietnam)
4. **Security rules**: Start in **production mode** (we'll use server-side only)
5. Click **"Enable"**

### Step 3: Get Your Service Account Credentials

1. Click the **⚙️ gear icon** (Settings) → **"Project settings"**
2. Go to **"Service accounts"** tab
3. Click **"Generate new private key"** button
4. Click **"Generate key"** in the popup
5. A JSON file will download - **KEEP THIS SAFE!**

### Step 4: Add Credentials to Vercel

1. Open the downloaded JSON file
2. Go to your Vercel project: https://vercel.com/dashboard
3. Select your `trangthidua` project
4. Go to **Settings** → **Environment Variables**
5. Add these **3 variables**:

   **Variable 1:**
   - Name: `FIREBASE_PROJECT_ID`
   - Value: Copy the `project_id` from your JSON file
   - Environment: Production, Preview, Development (check all)

   **Variable 2:**
   - Name: `FIREBASE_CLIENT_EMAIL`
   - Value: Copy the `client_email` from your JSON file
   - Environment: Production, Preview, Development (check all)

   **Variable 3:**
   - Name: `FIREBASE_PRIVATE_KEY`
   - Value: Copy the entire `private_key` from your JSON file (including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`)
   - Environment: Production, Preview, Development (check all)

6. Click **"Save"** for each variable

### Step 5: Deploy

1. Commit and push your code (we'll do this next)
2. Vercel will automatically redeploy
3. Done! Logging will work! 🎉

---

## 📋 For Local Development (Optional)

If you want to test locally:

1. Create a file `.env.local` in your project root
2. Copy the template from `.env.local.example`
3. Fill in the values from your downloaded JSON file:

```env
FIREBASE_PROJECT_ID=your-project-id-here
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
Your private key here (keep the quotes and line breaks)
-----END PRIVATE KEY-----
"
```

4. Restart dev server: `npm run dev`

---

## ✅ Benefits of Firebase

- ✅ **100% Free** for your usage (generous free tier)
- ✅ **Works everywhere** - no Vercel-specific setup
- ✅ **Easy to verify** - view logs in Firebase Console
- ✅ **Real-time updates** (bonus!)
- ✅ **No connection issues** - stable Google infrastructure

### Free Tier Limits (More than enough!):
- 50,000 reads/day
- 20,000 writes/day  
- 1 GB storage
- 10 GB/month bandwidth

---

## 🎯 Testing After Setup

1. Visit your deployed site
2. Create and download a card
3. Check Firebase Console:
   - Go to Firestore Database
   - You'll see a `logs` collection with `stats` and `entries` documents
4. Visit `/log` route on your site
5. Enter password: `admin123`
6. See your downloads logged! 🎊

---

## 🔍 View Logs in Firebase Console

You can also view logs directly in Firebase:

1. Go to: https://console.firebase.google.com/
2. Select your project
3. Click **"Firestore Database"**
4. Expand the `logs` collection
5. Click on `stats` to see total count
6. Click on `entries` to see all downloads

---

## 🆘 Troubleshooting

**Error: "Cannot find module '@/lib/firebase'"**
- Make sure the file `src/lib/firebase.ts` was created
- Restart your dev server

**Error: "FIREBASE_PROJECT_ID is not defined"**
- Add environment variables in Vercel Dashboard
- Make sure all 3 variables are added
- Redeploy the project

**Logs not appearing**
- Check Firebase Console → Firestore Database
- Make sure database is enabled
- Check if documents are being created

**Private key error**
- Make sure to include the entire key with `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`
- Keep the quotes around the key
- Don't remove the `\n` characters

---

## 📝 Summary

1. ✅ Create Firebase project
2. ✅ Enable Firestore
3. ✅ Download service account JSON
4. ✅ Add 3 environment variables to Vercel
5. ✅ Deploy
6. ✅ Test!

**That's it! Much simpler than Upstash!** 🚀
