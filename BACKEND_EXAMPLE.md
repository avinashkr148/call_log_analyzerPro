# Backend Server Example for Production

This is a complete backend server implementation for handling Razorpay payments securely.

## Setup Instructions

### 1. Create Backend Directory

```bash
mkdir backend
cd backend
npm init -y
```

### 2. Install Dependencies

```bash
npm install express razorpay crypto cors dotenv
npm install --save-dev nodemon
```

### 3. Create .env File

```env
RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXX
RAZORPAY_KEY_SECRET=your_secret_key_here
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
PORT=5000
NODE_ENV=development
```

### 4. Create server.js

```javascript
const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://call-log-analyzer-pro.vercel.app/' 
    : 'http://localhost:3000',
  credentials: true
}));

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Create Order
app.post('/api/create-order', async (req, res) => {
  try {
    const { amount, currency, planId, userId } = req.body;
    
    // Validate input
    if (!amount || amount <= 0) {
      return res.status(400).json({ 
        error: 'Invalid amount' 
      });
    }
    
    // Create order
    const order = await razorpay.orders.create({
      amount: amount * 100, // Convert to paise
      currency: currency || 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        planId: planId,
        userId: userId
      }
    });
    
    console.log('Order created:', order.id);
    res.json(order);
    
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ 
      error: 'Failed to create order',
      message: error.message 
    });
  }
});

// Verify Payment
app.post('/api/verify-payment', async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      planId,
      userId
    } = req.body;
    
    // Validate input
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ 
        error: 'Missing required payment details' 
      });
    }
    
    // Verify signature
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");
    
    if (razorpay_signature === expectedSign) {
      // Payment is verified
      console.log('Payment verified:', razorpay_payment_id);
      
      // TODO: Update user subscription in database
      // Example:
      // await updateUserSubscription(userId, {
      //   planId: planId,
      //   paymentId: razorpay_payment_id,
      //   orderId: razorpay_order_id,
      //   status: 'active',
      //   expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      // });
      
      res.json({ 
        success: true, 
        message: 'Payment verified successfully',
        paymentId: razorpay_payment_id
      });
      
    } else {
      console.error('Invalid signature');
      res.status(400).json({ 
        success: false, 
        message: 'Invalid payment signature' 
      });
    }
    
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ 
      error: 'Failed to verify payment',
      message: error.message 
    });
  }
});

// Webhook handler
app.post('/api/webhook', (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];
    
    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(req.body))
      .digest('hex');
    
    if (signature !== expectedSignature) {
      console.error('Invalid webhook signature');
      return res.status(400).json({ error: 'Invalid signature' });
    }
    
    // Process webhook event
    const event = req.body.event;
    const payload = req.body.payload;
    
    console.log('Webhook received:', event);
    
    switch (event) {
      case 'payment.authorized':
        console.log('Payment authorized:', payload.payment.entity.id);
        // Handle authorized payment
        break;
        
      case 'payment.captured':
        console.log('Payment captured:', payload.payment.entity.id);
        // Handle captured payment
        // TODO: Update subscription in database
        break;
        
      case 'payment.failed':
        console.log('Payment failed:', payload.payment.entity.id);
        // Handle failed payment
        break;
        
      case 'order.paid':
        console.log('Order paid:', payload.order.entity.id);
        // Handle paid order
        break;
        
      default:
        console.log('Unhandled event:', event);
    }
    
    res.json({ status: 'ok' });
    
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Fetch payment details
app.get('/api/payment/:paymentId', async (req, res) => {
  try {
    const { paymentId } = req.params;
    const payment = await razorpay.payments.fetch(paymentId);
    res.json(payment);
  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user subscription (mock - replace with database query)
app.get('/api/subscription/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // TODO: Fetch from database
    // const subscription = await getUserSubscription(userId);
    
    // Mock response
    res.json({
      userId: userId,
      planId: 'premium',
      status: 'active',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
    
  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
```

### 5. Update package.json

```json
{
  "name": "call-analyzer-backend",
  "version": "1.0.0",
  "description": "Backend server for Call Analyzer",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "razorpay": "^2.9.2",
    "crypto": "^1.0.1",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

### 6. Run the Server

Development:
```bash
npm run dev
```

Production:
```bash
npm start
```

## Database Integration

To store subscriptions, integrate with a database. Here's an example with MongoDB:

### Install MongoDB Driver

```bash
npm install mongodb
```

### Add to server.js

```javascript
const { MongoClient } = require('mongodb');

// MongoDB connection
const mongoClient = new MongoClient(process.env.MONGODB_URI);
let db;

async function connectDB() {
  await mongoClient.connect();
  db = mongoClient.db('call-analyzer');
  console.log('Connected to MongoDB');
}

connectDB();

// Update subscription in database
async function updateUserSubscription(userId, subscriptionData) {
  const subscriptions = db.collection('subscriptions');
  await subscriptions.updateOne(
    { userId: userId },
    { 
      $set: {
        ...subscriptionData,
        updatedAt: new Date()
      }
    },
    { upsert: true }
  );
}

// Get user subscription
async function getUserSubscription(userId) {
  const subscriptions = db.collection('subscriptions');
  return await subscriptions.findOne({ userId: userId });
}
```

## Deployment

### Deploy to Heroku

1. Install Heroku CLI
2. Create new app: `heroku create call-analyzer-api`
3. Set environment variables: `heroku config:set KEY=value`
4. Deploy: `git push heroku main`

### Deploy to Render

1. Create account on render.com
2. New Web Service
3. Connect your repository
4. Set environment variables
5. Deploy

### Deploy to Railway

1. Create account on railway.app
2. New Project → Deploy from GitHub
3. Set environment variables
4. Deploy

## Security Checklist

- [ ] Environment variables properly set
- [ ] CORS configured for production domain
- [ ] Rate limiting implemented (optional)
- [ ] Input validation on all endpoints
- [ ] Error messages don't leak sensitive info
- [ ] Webhook signature verification enabled
- [ ] HTTPS enabled in production
- [ ] Database queries are parameterized
- [ ] Logs don't contain sensitive data

## Testing

Test all endpoints:

```bash
# Create order
curl -X POST http://localhost:5000/api/create-order \
  -H "Content-Type: application/json" \
  -d '{"amount": 100, "currency": "INR", "planId": "premium", "userId": "user123"}'

# Verify payment (after getting payment from Razorpay)
curl -X POST http://localhost:5000/api/verify-payment \
  -H "Content-Type: application/json" \
  -d '{
    "razorpay_order_id": "order_xxx",
    "razorpay_payment_id": "pay_xxx",
    "razorpay_signature": "signature_xxx",
    "planId": "premium",
    "userId": "user123"
  }'
```

## Monitoring

Add monitoring with services like:
- Sentry (error tracking)
- Datadog (performance monitoring)
- LogRocket (user session replay)

---

**This backend is production-ready after adding database integration and proper deployment setup.**
