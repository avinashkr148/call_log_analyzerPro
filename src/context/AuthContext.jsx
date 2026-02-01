import { createContext, useContext, useState, useEffect } from 'react';
import { onAuthChange } from '../services/authService';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthChange((user) => {
      setCurrentUser(user);
      setLoading(false);
      
      // Load user subscription from localStorage (in production, fetch from backend)
      if (user) {
        const savedSubscription = localStorage.getItem(`subscription_${user.uid}`);
        if (savedSubscription) {
          setSubscription(JSON.parse(savedSubscription));
        }
      } else {
        setSubscription(null);
      }
    });

    return unsubscribe;
  }, []);

  const updateSubscription = (subscriptionData) => {
    setSubscription(subscriptionData);
    // Save to localStorage (in production, save to backend database)
    if (currentUser) {
      localStorage.setItem(`subscription_${currentUser.uid}`, JSON.stringify(subscriptionData));
    }
  };

  const value = {
    currentUser,
    loading,
    subscription,
    updateSubscription,
    isAuthenticated: !!currentUser,
    hasActiveSubscription: !!subscription && new Date(subscription.expiresAt) > new Date()
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
