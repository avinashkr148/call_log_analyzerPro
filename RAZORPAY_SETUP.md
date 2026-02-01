# Razorpay Payment Integration Guide

This comprehensive guide will help you set up Razorpay payment gateway for your Call Analyzer app. Razorpay is one of India's leading payment gateways supporting UPI, Cards, Net Banking, and Wallets.

## Why Razorpay?

- ✅ Most popular payment gateway in India
- ✅ Supports all major payment methods (UPI, Cards, Net Banking, Wallets)
- ✅ Easy integration
- ✅ Competitive pricing (2% + GST on domestic transactions)
- ✅ Instant settlements available
- ✅ Excellent dashboard and analytics

---

## Prerequisites

- A business/company registered in India
- Valid business documents (PAN, GST certificate, etc.)
- Business bank account
- Phone number and email

---

## Step 1: Create Razorpay Account

1. **Visit Razorpay Website**
   - Go to: https://razorpay.com/
   - Click on "Sign Up" button

2. **Sign Up**
   - Enter your email address
   - Enter your mobile number
   - Click "Get Started"
   - Verify your mobile number via OTP

3. **Complete Your Profile**
   - Enter business details:
     - Business Name
     - Business Type (Proprietorship/Partnership/LLP/Private Limited, etc.)
     - Business Category
     - Business Subcategory
   - Click "Continue"

4. **Business Details**
   - Enter your PAN number
   - Upload PAN card
   - Enter GST number (if applicable)
   - Upload GST certificate (if applicable)
   - Enter business address
   - Click "Submit"

5. **Bank Account Details**
   - Enter bank account number
   - Enter IFSC code
   - Upload cancelled cheque or bank statement
   - Click "Submit"

6. **Wait for Activation**
   - Razorpay will review your application (takes 24-48 hours)
   - You'll receive an email once approved
   - Meanwhile, you can use **Test Mode** for development

---

## Step 2: Get API Keys

### Test Mode Keys (For Development)

1. **Access Dashboard**
   - Login to: https://dashboard.razorpay.com/
   - You'll be in Test Mode by default

2. **Navigate to API Keys**
   - Click on "Settings" in the left sidebar
   - Click on "API Keys" under "Website and API Keys"
   - OR directly go to: https://dashboard.razorpay.com/app/keys

3. **Generate Test Keys**
   - Click on "Generate Test Key" (if not already generated)
   - You'll see two keys:
     - **Key Id** (starts with `rzp_test_`) - This is your public key
     - **Key Secret** - This is your private key (keep it secret!)
   
4. **Copy and Save Keys**
   - Copy both keys to a secure location
   - **IMPORTANT**: The Key Secret is shown only once!

### Live Mode Keys (For Production)

1. **Switch to Live Mode**
   - Toggle the "Test Mode" / "Live Mode" switch in the dashboard
   - This is only available after account activation

2. **Generate Live Keys**
   - Go to Settings → API Keys
   - Click "Generate Live Key"
   - Copy and securely store both keys
   - Live keys start with `rzp_live_`

---

## Step 3: Configure Your Application

### Option A: Direct Configuration (Quick Start)

1. **Update src/config/config.js**
   ```javascript
   export const razorpayConfig = {
     keyId: "rzp_test_XXXXXXXXXXXXX", // Your Test Key ID
     keySecret: "YOUR_SECRET_KEY" // Only use on backend!
   };
   ```

### Option B: Environment Variables (Recommended)

1. **Update .env File**
   ```env
   VITE_RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXX
   ```

2. **Update src/config/config.js**
   ```javascript
   export const razorpayConfig = {
     keyId: import.meta.env.VITE_RAZORPAY_KEY_ID,
     keySecret: "NEVER_EXPOSE_THIS_ON_FRONTEND"
   };
   ```

**⚠️ SECURITY WARNING**: Never expose your Key Secret in frontend code or environment variables that are bundled with your app!

---

## Step 4: Test Payment Integration

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Test the Payment Flow**
   - Sign up or login to your app
   - Navigate to the Pricing page
   - Click "Subscribe Now" on any plan
   - Razorpay checkout will open

4. **Use Test Cards**
   Razorpay provides test cards for development:
   
   **Successful Payment:**
   - Card Number: `4111 1111 1111 1111`
   - CVV: Any 3 digits (e.g., `123`)
   - Expiry: Any future date (e.g., `12/25`)
   - Name: Any name
   
   **Failed Payment:**
   - Card Number: `4000 0000 0000 0002`
   - CVV: Any 3 digits
   - Expiry: Any future date
   
   **Test UPI:**
   - UPI ID: `success@razorpay`
   - This will simulate a successful payment
   
   **Test Net Banking:**
   - Select any bank
   - Click "Success" or "Failure" as needed

5. **Verify Payment**
   - After successful payment, check Razorpay Dashboard
   - Go to Transactions → Payments
   - You should see your test payment

---

## Step 5: Create a Backend Server (IMPORTANT!)

**⚠️ CRITICAL SECURITY REQUIREMENT**

The current implementation is for demonstration only. For production, you MUST create a backend server to:
1. Create orders securely
2. Verify payment signatures
3. Update user subscriptions in database

### Backend Setup (Node.js + Express Example)

1. **Create a Backend Folder**
   ```bash
   mkdir backend
   cd backend
   npm init -y
   npm install express razorpay crypto cors dotenv
   ```

2. **Create server.js**
   ```javascript
   const express = require('express');
   const Razorpay = require('razorpay');
   const crypto = require('crypto');
   const cors = require('cors');
   require('dotenv').config();
   
   const app = express();
   app.use(express.json());
   app.use(cors());
   
   // Initialize Razorpay
   const razorpay = new Razorpay({
     key_id: process.env.RAZORPAY_KEY_ID,
     key_secret: process.env.RAZORPAY_KEY_SECRET,
   });
   
   // Create Order
   app.post('/api/create-order', async (req, res) => {
     try {
       const { amount, currency, receipt } = req.body;
       
       const order = await razorpay.orders.create({
         amount: amount * 100, // Convert to paise
         currency: currency || 'INR',
         receipt: receipt || `receipt_${Date.now()}`,
       });
       
       res.json(order);
     } catch (error) {
       res.status(500).json({ error: error.message });
     }
   });
   
   // Verify Payment
   app.post('/api/verify-payment', async (req, res) => {
     try {
       const {
         razorpay_order_id,
         razorpay_payment_id,
         razorpay_signature
       } = req.body;
       
       // Verify signature
       const sign = razorpay_order_id + "|" + razorpay_payment_id;
       const expectedSign = crypto
         .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
         .update(sign.toString())
         .digest("hex");
       
       if (razorpay_signature === expectedSign) {
         // Payment is verified
         // Update user subscription in database here
         res.json({ 
           success: true, 
           message: 'Payment verified successfully' 
         });
       } else {
         res.status(400).json({ 
           success: false, 
           message: 'Invalid signature' 
         });
       }
     } catch (error) {
       res.status(500).json({ error: error.message });
     }
   });
   
   const PORT = process.env.PORT || 5000;
   app.listen(PORT, () => {
     console.log(`Server running on port ${PORT}`);
   });
   ```

3. **Create .env in Backend**
   ```env
   RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXX
   RAZORPAY_KEY_SECRET=your_secret_key
   PORT=5000
   ```

4. **Update Frontend Service**
   Update `src/services/paymentService.js` to call your backend:
   
   ```javascript
   export const createOrder = async (planId) => {
     const plan = paymentPlans[planId];
     
     const response = await fetch('http://localhost:5000/api/create-order', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ 
         amount: plan.price, 
         currency: plan.currency 
       })
     });
     
     return await response.json();
   };
   
   export const verifyPayment = async (paymentData) => {
     const response = await fetch('http://localhost:5000/api/verify-payment', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify(paymentData)
     });
     
     return await response.json();
   };
   ```

---

## Step 6: Handle Webhooks (Recommended)

Webhooks notify your server about payment events in real-time.

1. **Set Up Webhook Endpoint**
   ```javascript
   // In your backend server.js
   app.post('/api/webhook', (req, res) => {
     const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
     const signature = req.headers['x-razorpay-signature'];
     
     // Verify webhook signature
     const expectedSignature = crypto
       .createHmac('sha256', secret)
       .update(JSON.stringify(req.body))
       .digest('hex');
     
     if (signature === expectedSignature) {
       // Webhook is verified
       const event = req.body.event;
       const payment = req.body.payload.payment.entity;
       
       if (event === 'payment.captured') {
         // Payment successful - update database
         console.log('Payment captured:', payment.id);
       }
       
       res.json({ status: 'ok' });
     } else {
       res.status(400).json({ error: 'Invalid signature' });
     }
   });
   ```

2. **Configure Webhook in Razorpay Dashboard**
   - Go to Settings → Webhooks
   - Click "Add New Webhook"
   - Enter your webhook URL: `https://yourdomain.com/api/webhook`
   - Select events to track:
     - payment.authorized
     - payment.captured
     - payment.failed
   - Enter webhook secret (generate a random string)
   - Click "Create Webhook"

---

## Step 7: Go Live!

1. **Complete KYC Verification**
   - Ensure all documents are submitted
   - Wait for Razorpay approval

2. **Switch to Live Mode**
   - Get Live API keys from dashboard
   - Update your production environment variables
   - Deploy your backend with Live keys

3. **Test with Real Payment**
   - Make a small test payment (₹1)
   - Verify it appears in dashboard
   - Verify webhook notifications

4. **Enable Instant Settlements (Optional)**
   - Go to Settings → Settlements
   - Enable instant settlements for faster payouts
   - Additional charges may apply

---

## Payment Methods Supported

Razorpay supports all major Indian payment methods:

1. **Cards**
   - Credit Cards (Visa, Mastercard, RuPay, American Express)
   - Debit Cards (All major banks)

2. **UPI**
   - Google Pay
   - PhonePe
   - Paytm
   - BHIM UPI
   - Any UPI app

3. **Net Banking**
   - All major banks (SBI, HDFC, ICICI, Axis, etc.)
   - 58+ banks supported

4. **Wallets**
   - Paytm
   - PhonePe
   - Amazon Pay
   - Airtel Money
   - Freecharge
   - And more

5. **EMI**
   - Debit Card EMI
   - Credit Card EMI
   - Cardless EMI

---

## Pricing

Razorpay Pricing (as of 2024):
- **Domestic Payments**: 2% + GST
- **International Payments**: 3% + GST
- **No setup fees**
- **No annual maintenance fees**

Check latest pricing at: https://razorpay.com/pricing/

---

## Alternative Payment Gateways in India

If Razorpay doesn't work for you, consider these alternatives:

1. **Paytm Payment Gateway**
   - Website: https://business.paytm.com/payment-gateway
   - Pricing: ~2% + GST
   - Good for businesses already using Paytm

2. **Instamojo**
   - Website: https://www.instamojo.com/
   - Pricing: 2% + ₹3 per transaction + GST
   - Good for startups and small businesses
   - Lower KYC requirements

3. **Cashfree**
   - Website: https://www.cashfree.com/
   - Pricing: 1.75% - 2% + GST
   - Good for high volume businesses

4. **CCAvenue**
   - Website: https://www.ccavenue.com/
   - Pricing: 1.99% + GST
   - One of the oldest payment gateways in India

5. **PayU**
   - Website: https://payu.in/
   - Pricing: 2% + GST
   - Good for enterprise businesses

---

## Troubleshooting

### Common Issues

1. **Checkout Not Opening**
   - Check if Razorpay script is loaded: `console.log(window.Razorpay)`
   - Ensure Key ID is correct
   - Check browser console for errors

2. **Payment Failed**
   - Check if amount is in paise (multiply by 100)
   - Verify test card details are correct
   - Check if your Razorpay account is active

3. **Signature Verification Failed**
   - Ensure Key Secret is correct in backend
   - Check if signature is calculated correctly
   - Verify the order ID matches

4. **Webhook Not Working**
   - Check if webhook URL is publicly accessible
   - Verify webhook secret matches
   - Check server logs for errors
   - Test webhook using Razorpay Dashboard tools

---

## Security Best Practices

1. ✅ Never expose Key Secret in frontend
2. ✅ Always verify payment signature on backend
3. ✅ Use HTTPS in production
4. ✅ Implement rate limiting on payment endpoints
5. ✅ Store payment records in database
6. ✅ Use webhooks for reliable payment tracking
7. ✅ Implement proper error handling
8. ✅ Log all payment events for audit
9. ✅ Use environment variables for sensitive data
10. ✅ Regularly update your Razorpay SDK

---

## Testing Checklist

Before going live, test these scenarios:

- [ ] Successful payment with card
- [ ] Successful payment with UPI
- [ ] Successful payment with net banking
- [ ] Failed payment
- [ ] Payment cancellation by user
- [ ] Multiple quick payments (race conditions)
- [ ] Payment with different amounts
- [ ] Webhook notifications
- [ ] Order creation
- [ ] Signature verification
- [ ] Subscription activation after payment
- [ ] Payment on different browsers
- [ ] Payment on mobile devices

---

## Resources

- [Razorpay Documentation](https://razorpay.com/docs/)
- [Razorpay Dashboard](https://dashboard.razorpay.com/)
- [Razorpay API Reference](https://razorpay.com/docs/api/)
- [Razorpay Support](https://razorpay.com/support/)
- [Test Cards and Methods](https://razorpay.com/docs/payments/payments/test-card-details/)

---

## Support

If you need help:
1. Check Razorpay documentation
2. Contact Razorpay support (24/7 available)
3. Check community forums
4. Email: support@razorpay.com
5. Phone: +91-80-61593333

---

## Next Steps

After completing this setup:
1. ✅ Razorpay account is created
2. ✅ API keys are configured
3. ✅ Payment flow is working
4. 🔒 Backend server is set up for security
5. 🚀 Ready to accept real payments!
