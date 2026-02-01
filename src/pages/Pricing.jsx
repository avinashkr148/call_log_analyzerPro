import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, CreditCard } from 'lucide-react';
import { paymentPlans } from '../config/config';
import { initiatePayment } from '../services/paymentService';
import { useAuth } from '../context/AuthContext';

export default function Pricing() {
  const [processing, setProcessing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const { currentUser, updateSubscription } = useAuth();
  const navigate = useNavigate();

  const handleSubscribe = async (planId) => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    setProcessing(true);
    setSelectedPlan(planId);

    const userDetails = {
      name: currentUser.displayName || '',
      email: currentUser.email || '',
      userId: currentUser.uid
    };

    const onSuccess = (paymentData) => {
      // Save subscription data
      const subscriptionData = {
        planId: paymentData.planId,
        planName: paymentData.planName,
        amount: paymentData.amount,
        currency: paymentData.currency,
        paymentId: paymentData.razorpay_payment_id,
        orderId: paymentData.razorpay_order_id,
        purchasedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
      };

      updateSubscription(subscriptionData);
      setProcessing(false);
      setSelectedPlan(null);
      navigate('/dashboard');
    };

    const onFailure = (error) => {
      console.error('Payment failed:', error);
      alert('Payment failed: ' + (error.error || 'Unknown error'));
      setProcessing(false);
      setSelectedPlan(null);
    };

    await initiatePayment(planId, userDetails, onSuccess, onFailure);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Select the perfect plan for your call analysis needs
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {Object.values(paymentPlans).map((plan) => (
            <div
              key={plan.id}
              className={`card hover:shadow-xl transition-all duration-300 ${
                plan.id === 'premium' ? 'border-2 border-primary-500 relative' : ''
              }`}
            >
              {plan.id === 'premium' && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {plan.name}
                </h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-primary-600 dark:text-primary-400">
                    ₹{plan.price}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">/month</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="text-green-500 flex-shrink-0 mt-0.5" size={20} />
                    <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={processing && selectedPlan === plan.id}
                className={`w-full flex items-center justify-center gap-2 ${
                  plan.id === 'premium' ? 'btn-primary' : 'btn-secondary'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <CreditCard size={20} />
                {processing && selectedPlan === plan.id ? 'Processing...' : 'Subscribe Now'}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            All plans include secure payment processing via Razorpay
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-primary-600 dark:text-primary-400 hover:underline"
          >
            Skip for now and explore the dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
