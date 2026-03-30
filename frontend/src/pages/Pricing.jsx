// frontend/src/pages/Pricing.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePhotographer } from '../context/PhotographerContext';
import { Check, X } from 'lucide-react';

export const Pricing = () => {
  const navigate = useNavigate();
  const { photographer } = usePhotographer();

  const plans = [
    {
      name: 'Free',
      price: '₹0',
      period: 'Forever',
      description: 'Perfect to get started',
      color: 'from-slate-600 to-slate-700',
      current: photographer?.subscription_tier === 'free',
      features: [
        { text: '1 project', included: true },
        { text: '100 photos', included: true },
        { text: 'Basic sharing', included: true },
        { text: 'Manual payment recording', included: true },
        { text: 'Razorpay payments', included: false },
        { text: 'Email notifications', included: false },
        { text: 'Analytics', included: false },
        { text: 'Watermarking', included: false }
      ],
      buttonText: photographer?.subscription_tier === 'free' ? 'Current Plan' : 'Get Started',
      buttonColor: 'from-slate-500 to-slate-600'
    },
    {
      name: 'Starter',
      price: '₹499',
      period: 'per month',
      description: 'For growing photographers',
      color: 'from-blue-600 to-blue-700',
      current: photographer?.subscription_tier === 'starter',
      features: [
        { text: '5 projects', included: true },
        { text: '1,000 photos', included: true },
        { text: 'Advanced sharing', included: true },
        { text: 'Razorpay payments', included: true },
        { text: 'Email notifications', included: true },
        { text: 'Analytics dashboard', included: true },
        { text: 'Watermarking', included: true },
        { text: 'Custom branding', included: false }
      ],
      buttonText: photographer?.subscription_tier === 'starter' ? 'Current Plan' : 'Upgrade Now',
      buttonColor: 'from-blue-500 to-blue-600'
    },
    {
      name: 'Pro',
      price: '₹1,499',
      period: 'per month',
      description: 'For professional photographers',
      color: 'from-purple-600 to-purple-700',
      current: photographer?.subscription_tier === 'pro',
      badge: 'Most Popular',
      features: [
        { text: 'Unlimited projects', included: true },
        { text: 'Unlimited photos', included: true },
        { text: 'Stripe + Razorpay', included: true },
        { text: 'Email notifications', included: true },
        { text: 'Advanced analytics', included: true },
        { text: 'Watermarking', included: true },
        { text: 'Custom branding', included: true },
        { text: 'Team members (2)', included: true }
      ],
      buttonText: photographer?.subscription_tier === 'pro' ? 'Current Plan' : 'Upgrade Now',
      buttonColor: 'from-purple-500 to-purple-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => navigate(-1)}
            className="text-slate-400 hover:text-white mb-4 transition"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-500">
            Simple, Transparent Pricing
          </h1>
          <p className="text-slate-400 text-sm mt-1">Choose the perfect plan for your photography business</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan, idx) => (
            <div 
              key={idx} 
              className={`relative rounded-2xl border transition-all hover:shadow-xl hover:shadow-amber-500/20 ${
                plan.current 
                  ? 'border-amber-500 bg-gradient-to-br from-slate-800/50 to-slate-900/50 ring-2 ring-amber-500'
                  : 'border-slate-700 bg-gradient-to-br from-slate-800/30 to-slate-900/30'
              }`}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-black text-xs font-bold px-4 py-1 rounded-full">
                    {plan.badge}
                  </div>
                </div>
              )}

              {/* Badge - Current Plan */}
              {plan.current && (
                <div className="absolute -top-4 right-6">
                  <div className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    Current Plan
                  </div>
                </div>
              )}

              <div className="p-8">
                {/* Header */}
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-slate-400 text-sm mb-6">{plan.description}</p>

                {/* Price */}
                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-slate-400 ml-2">/{plan.period}</span>
                </div>

                {/* Button */}
                <button
                  onClick={() => {
                    if (!plan.current) {
                      // Handle upgrade logic
                      console.log(`Upgrade to ${plan.name}`);
                    }
                  }}
                  disabled={plan.current}
                  className={`w-full py-3 rounded-lg font-bold transition-all mb-8 ${
                    plan.current
                      ? 'bg-slate-700 text-slate-400 cursor-default'
                      : `bg-gradient-to-r ${plan.buttonColor} text-white hover:shadow-lg hover:shadow-amber-500/30`
                  }`}
                >
                  {plan.buttonText}
                </button>

                {/* Features */}
                <div className="space-y-3">
                  {plan.features.map((feature, fidx) => (
                    <div key={fidx} className="flex items-center gap-3">
                      {feature.included ? (
                        <Check size={18} className="text-green-400 flex-shrink-0" />
                      ) : (
                        <X size={18} className="text-slate-600 flex-shrink-0" />
                      )}
                      <span className={feature.included ? 'text-white' : 'text-slate-500'}>
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-white mb-8">Frequently Asked Questions</h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Can I change plans anytime?</h3>
              <p className="text-slate-400">Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-2">What payment methods do you accept?</h3>
              <p className="text-slate-400">We accept Razorpay (UPI, Cards, NetBanking) and Stripe (International Cards).</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Is there a free trial?</h3>
              <p className="text-slate-400">Yes, start with our Free plan. Upgrade anytime to unlock more features and photos.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Do you offer refunds?</h3>
              <p className="text-slate-400">We offer a 7-day money-back guarantee on all paid plans.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
