import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Firebase Configuration
// IMPORTANT: Replace these values with your actual Firebase project credentials
// Get these from: Firebase Console > Project Settings > General > Your apps > SDK setup and configuration

export const firebaseConfig = {
 apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Razorpay Configuration (Indian Payment Gateway)
// IMPORTANT: Replace these values with your actual Razorpay credentials
// Get these from: Razorpay Dashboard > Settings > API Keys
export const razorpayConfig = {
  keyId: "YOUR_RAZORPAY_KEY_ID", // This is your public key (safe to expose in frontend)
  keySecret: "YOUR_RAZORPAY_KEY_SECRET" // Keep this secret! Use only on backend
};

// Payment Plans
export const paymentPlans = {
  basic: {
    id: 'basic',
    name: 'Basic Plan',
    price: 20,
    currency: 'INR',
    features: [
      'Analyze up to 3000 calls per month',
      'Basic analytics dashboard',
      'Export reports (PDF)',
      'Email support'
    ]
  },
  premium: {
    id: 'premium',
    name: 'Premium Plan',
    price: 100,
    currency: 'INR',
    features: [
      'Unlimited call analysis',
      'Advanced analytics & insights',
      'Export reports (PDF, Excel)',
      'Priority email support',
      'Custom reports',
      'API access'
    ]
  }
};
