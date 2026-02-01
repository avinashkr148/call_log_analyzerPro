# Firebase Authentication Setup Guide

This guide will walk you through setting up Firebase Authentication for your Call Analyzer app, including both Email/Password and Google Sign-In.

## Prerequisites
- A Google account
- Node.js installed on your system

---

## Step 1: Create a Firebase Project

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com/
   - Sign in with your Google account

2. **Create a New Project**
   - Click on "Add project" or "Create a project"
   - Enter your project name (e.g., "Call Analyzer")
   - Click "Continue"
   
3. **Configure Google Analytics (Optional)**
   - Choose whether to enable Google Analytics
   - If enabled, select or create an Analytics account
   - Click "Create project"
   - Wait for the project to be created (takes ~30 seconds)
   - Click "Continue" when ready

---

## Step 2: Register Your Web App

1. **Add a Web App**
   - In your Firebase project dashboard, click on the web icon (</>) to add a web app
   - Alternatively: Go to Project Settings > General > Your apps section

2. **Register the App**
   - Enter an app nickname (e.g., "Call Analyzer Web")
   - Check "Also set up Firebase Hosting" (optional)
   - Click "Register app"

3. **Copy Firebase Configuration**
   - You'll see a code snippet with your Firebase config
   - It looks like this:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXX",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:xxxxxxxxxxxxx"
   };
   ```
   - **IMPORTANT**: Copy these values - you'll need them later!
   - Click "Continue to console"

---

## Step 3: Enable Authentication Methods

### Enable Email/Password Authentication

1. **Navigate to Authentication**
   - In the left sidebar, click on "Build" → "Authentication"
   - Click "Get started" (if first time)

2. **Enable Email/Password**
   - Click on the "Sign-in method" tab
   - Click on "Email/Password" from the providers list
   - Toggle "Enable" to ON
   - Click "Save"

### Enable Google Sign-In

1. **Enable Google Provider**
   - Still in the "Sign-in method" tab
   - Click on "Google" from the providers list
   - Toggle "Enable" to ON
   
2. **Configure Google Sign-In**
   - Enter a project support email (your email)
   - This email will be shown to users during sign-in
   - Click "Save"

---

## Step 4: Configure Authorized Domains

1. **Add Localhost for Development**
   - In Authentication → Settings → Authorized domains
   - `localhost` should already be there by default
   - This allows testing on your local machine

2. **Add Production Domain (Later)**
   - When deploying to production, add your domain here
   - Example: `yourapp.com`, `www.yourapp.com`
   - Click "Add domain" and enter your domain

---

## Step 5: Update Your Application Config

1. **Navigate to Your Project Folder**
   ```bash
   cd call-analyzer-app
   ```

2. **Update src/config/config.js**
   - Open `src/config/config.js`
   - Replace the placeholder values with your actual Firebase config:
   
   ```javascript
   export const firebaseConfig = {
     apiKey: "YOUR_ACTUAL_API_KEY",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project-id.appspot.com",
     messagingSenderId: "YOUR_SENDER_ID",
     appId: "YOUR_APP_ID",
     measurementId: "YOUR_MEASUREMENT_ID" // Optional
   };
   ```

3. **Alternatively, Use Environment Variables (Recommended)**
   - Create a `.env` file in the root directory
   - Copy from `.env.example` and fill in your values:
   
   ```env
   VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXX
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:xxxxxxxxxxxxx
   VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
   ```
   
   - Then update `src/config/config.js` to use environment variables:
   
   ```javascript
   export const firebaseConfig = {
     apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
     authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
     projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
     storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
     messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
     appId: import.meta.env.VITE_FIREBASE_APP_ID,
     measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
   };
   ```

---

## Step 6: Test Your Authentication

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Test Email/Password Sign-Up**
   - Navigate to http://localhost:3000
   - Click "Sign up"
   - Fill in the form with a test email and password
   - Click "Create Account"
   - You should be redirected to the pricing page

4. **Test Google Sign-In**
   - Go back to the login page
   - Click "Sign in with Google"
   - Select your Google account
   - You should be signed in successfully

5. **Verify Users in Firebase Console**
   - Go to Firebase Console → Authentication → Users
   - You should see your test users listed there

---

## Step 7: Security Rules (Important!)

### Firestore Security Rules (if using Firestore later)

If you plan to store user data in Firestore, set up security rules:

1. **Navigate to Firestore Database**
   - In Firebase Console, go to Firestore Database
   - Click on the "Rules" tab

2. **Set Basic Rules**
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Users can only read/write their own data
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
       
       // Subscriptions
       match /subscriptions/{subscriptionId} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```

3. **Publish the Rules**
   - Click "Publish"

---

## Troubleshooting

### Common Issues and Solutions

1. **"Firebase: Error (auth/api-key-not-valid-please-pass-a-valid-api-key)"**
   - Solution: Double-check your API key in config.js
   - Make sure there are no extra spaces or quotes

2. **"Firebase: Error (auth/unauthorized-domain)"**
   - Solution: Add your domain to Authorized domains in Firebase Console
   - Authentication → Settings → Authorized domains

3. **Google Sign-In Not Working**
   - Make sure Google provider is enabled in Firebase Console
   - Check that you've added a support email
   - Clear browser cache and cookies

4. **"Firebase: Error (auth/operation-not-allowed)"**
   - Solution: Enable the authentication method in Firebase Console
   - Authentication → Sign-in method → Enable Email/Password or Google

5. **Environment Variables Not Loading**
   - Make sure your .env file is in the root directory (same level as package.json)
   - Restart your development server after creating/modifying .env
   - Vite requires the prefix `VITE_` for environment variables

---

## Security Best Practices

1. **Never Commit Credentials**
   - Add `.env` to `.gitignore` (already done)
   - Never commit your Firebase config to public repositories

2. **Use Environment Variables**
   - Store sensitive config in `.env` files
   - Use different configs for development and production

3. **Enable Email Verification (Optional but Recommended)**
   - In Firebase Console → Authentication → Templates
   - Customize email verification template
   - Require email verification before allowing access

4. **Set Up Password Requirements**
   - Minimum 6 characters (enforced by Firebase by default)
   - Consider requiring stronger passwords in your app logic

5. **Monitor Authentication Activity**
   - Regularly check Firebase Console → Authentication → Users
   - Look for suspicious activity or unusual patterns

---

## Next Steps

After completing this setup:

1. ✅ Your Firebase Authentication is configured
2. ✅ Users can sign up with email/password
3. ✅ Users can sign in with Google
4. 📝 Next: Set up Razorpay payment integration (see RAZORPAY_SETUP.md)
5. 🚀 Deploy your app to production

---

## Additional Resources

- [Firebase Authentication Documentation](https://firebase.google.com/docs/auth)
- [Firebase Console](https://console.firebase.google.com/)
- [Firebase Pricing](https://firebase.google.com/pricing) - Check usage limits
- [Firebase Security Rules](https://firebase.google.com/docs/rules)

---

## Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Review Firebase Console error messages
3. Check browser console for detailed errors
4. Visit Firebase documentation for specific error codes
