# Firebase Migration Guide

## Overview
This guide will help you migrate from Supabase to Firebase for your music app. We're using Firebase for everything:
- **Firebase** for Authentication, Database (playlists, likes, etc.), and Avatar URL storage

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name (e.g., "tones-music-app")
4. Enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Enable Firebase Services

### Authentication
1. Go to Authentication > Sign-in method
2. Enable Email/Password
3. Enable Google (recommended)
4. Add your domain to authorized domains

### Firestore Database
1. Go to Firestore Database
2. Click "Create database"
3. Choose "Start in test mode" (we'll add security rules later)
4. Select a location close to your users

**Note:** We do NOT need Firebase Storage - avatars will be stored as URLs in user profiles.

## Step 3: Get Firebase Configuration

1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps"
3. Click "Add app" > Web
4. Register app with a nickname
5. Copy the configuration object

## Step 4: Update Configuration

Replace the placeholder config in `src/integrations/firebase/config.ts`:

```typescript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com", // Can be ignored
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

## Step 5: Deploy Security Rules

### Firestore Rules Only
1. Copy the contents of `firestore.rules`
2. Go to Firestore Database > Rules
3. Replace the default rules with our custom rules
4. Click "Publish"

**Note:** We do NOT need to deploy storage rules since we're not using Firebase Storage.

## Step 6: Avatar URL Storage

Avatar images will be stored as URLs in Firestore user profiles:
- Users can provide image URLs (e.g., from imgur, cloudinary, etc.)
- No file upload functionality needed
- URLs are stored in the `avatarUrl` field of user profiles

## Step 7: Update Your App

The Firebase services are now ready to use. You'll need to:

1. **Test Authentication** - sign up, sign in, sign out
2. **Test Database Features** - create playlists, like songs, etc.
3. **Test Avatar Functionality** - profile images via URLs

## Step 8: Data Migration (Optional)

If you have existing data in Supabase that you want to migrate to Firebase:

1. Export your Supabase data
2. Transform the data to match Firestore structure
3. Import using Firebase Admin SDK or manual import

## Firebase vs Supabase Comparison

| Feature | Supabase | Firebase |
|---------|----------|----------|
| Database | PostgreSQL (SQL) | Firestore (NoSQL) |
| Real-time | Built-in | Built-in |
| Offline | Limited | Excellent |
| Mobile SDKs | Good | Excellent |
| Free Tier | Generous | Very Generous |
| Learning Curve | SQL knowledge needed | NoSQL concepts |

## Benefits of Firebase for Your App

1. **Better Offline Support**: Users can access playlists offline
2. **Superior Mobile SDKs**: Better for future mobile apps
3. **Real-time Sync**: Better for collaborative features
4. **Scalability**: Better for growing user base
5. **Free Tier**: Perfect for 10-20 users
6. **Simplified Architecture**: Everything in one platform

## Complete Firebase Setup Benefits

- **Single Platform**: All data and auth in one place
- **Simplified Management**: No need to manage multiple services
- **Better Integration**: Seamless auth and database integration
- **Future Flexibility**: Easy to add more Firebase features later

## Next Steps

1. Set up your Firebase project
2. Update the configuration
3. Deploy Firestore security rules
4. Test the migration
5. Update your components (I'll help with this next)

## Need Help?

If you need help with any step or encounter issues, let me know! I can help you:
- Set up the Firebase project
- Migrate your existing data
- Update your components 