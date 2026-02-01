# Call Analyzer - Professional Call Analytics Platform

A full-stack React application with Firebase Authentication and Razorpay payment integration for analyzing call logs and generating insights.

## 🚀 Features

### Authentication
- ✅ Email/Password authentication
- ✅ Google Sign-In (OAuth)
- ✅ Protected routes
- ✅ User session management

### Payment Integration
- ✅ Razorpay payment gateway
- ✅ Multiple pricing plans (₹20 and ₹100)
- ✅ Subscription management
- ✅ Real payment processing

### Call Analytics
- 📊 Parse and analyze call logs
- 📈 Interactive charts and visualizations
- 📉 Call statistics (total, connected, missed)
- ⏱️ Duration analysis
- 👥 Top contacts identification
- 📱 Detailed call history table

### UI/UX
- 🎨 Modern, responsive design
- 🌙 Dark mode support
- 📱 Mobile-friendly
- ⚡ Fast and optimized with Vite

## 📁 Project Structure

```
call-analyzer-app/
├── src/
│   ├── components/          # Reusable components
│   │   └── ProtectedRoute.jsx
│   ├── pages/              # Page components
│   │   ├── Login.jsx
│   │   ├── SignUp.jsx
│   │   ├── Pricing.jsx
│   │   └── Dashboard.jsx
│   ├── services/           # API services
│   │   ├── authService.js
│   │   └── paymentService.js
│   ├── context/            # React Context
│   │   └── AuthContext.jsx
│   ├── config/             # Configuration files
│   │   └── config.js
│   ├── styles/             # Global styles
│   │   └── index.css
│   ├── App.jsx             # Main App component
│   └── main.jsx            # Entry point
├── public/                 # Static assets
├── FIREBASE_SETUP.md       # Firebase setup guide
├── RAZORPAY_SETUP.md       # Razorpay setup guide
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## 🛠️ Tech Stack

- **Frontend Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **Authentication**: Firebase Auth
- **Payment Gateway**: Razorpay
- **Charts**: Recharts
- **Icons**: Lucide React

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- A Firebase account
- A Razorpay account (for payments)

### Step 1: Clone or Download

Download the project folder to your local machine.

### Step 2: Install Dependencies

```bash
cd call-analyzer-app
npm install
```

### Step 3: Configure Firebase

Follow the detailed guide in **[FIREBASE_SETUP.md](FIREBASE_SETUP.md)** to:
1. Create a Firebase project
2. Enable Authentication (Email/Password and Google)
3. Get your Firebase configuration
4. Update the config file

Quick setup:
```javascript
// src/config/config.js
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### Step 4: Configure Razorpay

Follow the detailed guide in **[RAZORPAY_SETUP.md](RAZORPAY_SETUP.md)** to:
1. Create a Razorpay account
2. Get your API keys
3. Set up test mode
4. Configure payment integration

Quick setup:
```javascript
// src/config/config.js
export const razorpayConfig = {
  keyId: "rzp_test_XXXXXXXXXXXXX"
};
```

### Step 5: Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## 🚦 Usage

### 1. Sign Up / Login
- Navigate to the app
- Click "Sign up" to create a new account
- Or use "Sign in with Google" for quick access

### 2. Choose a Plan
- After signing up, you'll be redirected to the pricing page
- Choose between Basic (₹20/month) or Premium (₹100/month)
- Click "Subscribe Now" to proceed with payment

### 3. Make Payment
- Razorpay checkout will open
- In test mode, use test cards:
  - Card: `4111 1111 1111 1111`
  - CVV: `123`
  - Expiry: Any future date

### 4. Analyze Calls
- Go to the Dashboard
- Paste your call logs in the format:
  ```
  +919876543210  1/15/2024 9:30 AM, 00:05:30
  +919876543211  1/15/2024 10:15 AM
  +919876543210  1/15/2024 11:00 AM, 00:10:20
  ```
- Click "Analyze Calls"
- View statistics, charts, and detailed call history

## 📊 Call Log Format

The app accepts call logs in the following format:

```
[Phone Number]  [Date Time], [Duration (optional)]
```

Examples:
```
+919876543210  1/15/2024 9:30 AM, 00:05:30
+918765432109  1/15/2024 10:15 AM
9988776655  1/15/2024 11:00 AM, 00:10:20
```

- **Phone Number**: Can include +91 or just digits
- **Date Time**: MM/DD/YYYY HH:MM AM/PM
- **Duration**: HH:MM:SS (optional, if missing, treated as missed call)

## 🔒 Security Notes

### Important Security Considerations

1. **Firebase Config**: While the API key can be public, never commit your config to public repositories without proper precautions.

2. **Razorpay Secret**: NEVER expose your Razorpay Key Secret in frontend code. It should only be used on the backend server.

3. **Backend Required**: For production, you MUST implement a backend server to:
   - Create payment orders
   - Verify payment signatures
   - Update user subscriptions securely

4. **Environment Variables**: Use `.env` files for sensitive configuration (see `.env.example`)

## 🧪 Testing

### Test Authentication
1. Create a test account with email/password
2. Test Google Sign-In
3. Verify login/logout functionality

### Test Payments
Use Razorpay test mode with these test cards:

**Successful Payment:**
- Card: `4111 1111 1111 1111`
- CVV: `123`
- Expiry: `12/25`

**Test UPI:**
- UPI ID: `success@razorpay`

**Test Net Banking:**
- Select any bank and click "Success"

## 📝 Available Scripts

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Add Environment Variables**
   - Go to your Vercel dashboard
   - Project Settings → Environment Variables
   - Add all your Firebase and Razorpay variables

### Deploy to Netlify

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy dist folder**
   - Drag and drop `dist` folder to Netlify
   - Or connect your Git repository

3. **Add Environment Variables**
   - Site Settings → Build & Deploy → Environment
   - Add all your variables

### Deploy to Firebase Hosting

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login and Initialize**
   ```bash
   firebase login
   firebase init hosting
   ```

3. **Build and Deploy**
   ```bash
   npm run build
   firebase deploy
   ```

## 🐛 Troubleshooting

### Common Issues

1. **Firebase Auth Error**
   - Check if Firebase config is correct
   - Verify authentication methods are enabled
   - Check authorized domains in Firebase Console

2. **Razorpay Checkout Not Opening**
   - Verify Razorpay script is loaded
   - Check Key ID is correct
   - Look for errors in browser console

3. **Build Errors**
   - Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
   - Clear Vite cache: `rm -rf .vite`

4. **Environment Variables Not Working**
   - Ensure variables start with `VITE_`
   - Restart dev server after changing .env
   - Check .env is in root directory

## 📚 Documentation

- [Firebase Setup Guide](FIREBASE_SETUP.md)
- [Razorpay Setup Guide](RAZORPAY_SETUP.md)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)

## 🤝 Contributing

Contributions are welcome! Feel free to:
1. Fork the project
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is open source and available under the MIT License.

## 💡 Tips

1. **Start with Test Mode**: Always test with Razorpay test mode before going live
2. **Backend is Essential**: Implement a backend server before production deployment
3. **Monitor Usage**: Keep an eye on Firebase and Razorpay usage to avoid unexpected costs
4. **Security First**: Never commit sensitive credentials to version control
5. **User Experience**: Test the complete flow from signup to payment to dashboard

## 🆘 Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Review the setup guides (FIREBASE_SETUP.md, RAZORPAY_SETUP.md)
3. Check browser console for errors
4. Review Firebase/Razorpay documentation

## ✨ Future Enhancements

Potential features to add:
- [ ] Export reports to PDF/Excel
- [ ] Advanced analytics with AI insights
- [ ] Multi-user support for teams
- [ ] Call recording integration
- [ ] SMS notifications
- [ ] API for third-party integrations
- [ ] Admin dashboard
- [ ] Subscription management
- [ ] Invoice generation

---

**Built with ❤️ using React, Firebase, and Razorpay**
#   c a l l _ l o g _ a n a l y z e r P r o  
 