import { razorpayConfig, paymentPlans } from '../config/config';

// Load Razorpay script
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

// Create Razorpay order (this would normally be done on backend)
// For production, you MUST create orders on your backend server
export const createOrder = async (planId) => {
  const plan = paymentPlans[planId];
  
  // In production, make API call to your backend:
  // const response = await fetch('/api/create-order', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ planId, amount: plan.price })
  // });
  // return await response.json();
  
  // Mock order creation for demo purposes
  return {
    id: 'order_' + Math.random().toString(36).substr(2, 9),
    amount: plan.price * 100, // Razorpay expects amount in paise (smallest currency unit)
    currency: plan.currency,
    planId: planId
  };
};

// Initialize Razorpay payment
export const initiatePayment = async (planId, userDetails, onSuccess, onFailure) => {
  try {
    // Load Razorpay script
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      throw new Error('Failed to load Razorpay SDK');
    }

    // Create order
    const order = await createOrder(planId);
    const plan = paymentPlans[planId];

    // Razorpay options
    const options = {
      key: razorpayConfig.keyId,
      amount: order.amount,
      currency: order.currency,
      name: 'Call Analyzer',
      description: plan.name,
      order_id: order.id,
      handler: function (response) {
        // Payment successful
        const paymentData = {
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
          planId: planId,
          planName: plan.name,
          amount: plan.price,
          currency: plan.currency
        };
        
        // In production, verify payment on backend:
        // await fetch('/api/verify-payment', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(paymentData)
        // });
        
        onSuccess(paymentData);
      },
      prefill: {
        name: userDetails.name || '',
        email: userDetails.email || '',
        contact: userDetails.phone || ''
      },
      notes: {
        planId: planId,
        userId: userDetails.userId || ''
      },
      theme: {
        color: '#0ea5e9'
      },
      modal: {
        ondismiss: function() {
          onFailure({ error: 'Payment cancelled by user' });
        }
      }
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();

  } catch (error) {
    onFailure({ error: error.message });
  }
};

// Verify payment signature (should be done on backend)
export const verifyPayment = async (paymentData) => {
  // In production, send to backend for verification:
  // const response = await fetch('/api/verify-payment', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(paymentData)
  // });
  // return await response.json();
  
  return { success: true, verified: true };
};
