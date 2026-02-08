'use client';

import React from 'react';
import Button from '../ui/button';

export default function CtaSection() {
  const benefits = [
    {
      icon: '⚡',
      title: 'Quick Setup',
      description: 'Get started in minutes',
    },
    {
      icon: '🔒',
      title: 'Secure Platform',
      description: 'Enterprise-grade security',
    },
    {
      icon: '💪',
      title: 'Reliable Support',
      description: '24/7 customer assistance',
    },
    {
      icon: '📈',
      title: 'Scale Easily',
      description: 'Grow without limits',
    },
  ];

  return (
    <section
      id="cta"
      className="py-24 relative overflow-hidden"
      style={{
        background:
          'linear-gradient(135deg, #FFB84D 0%, #FF9500 50%, #FF6B35 100%)',
      }}
    >
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full animate-float" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full animate-float delay-300" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-white rounded-full animate-pulse-glow" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-5xl lg:text-6xl font-bold text-white mb-6">
            Ready to Transform
            <br />
            Your Business Operations?
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-3xl mx-auto">
            Join hundreds of businesses already streamlining their inventory and ordering processes with our powerful platform.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              variant="secondary"
              size="xl"
              icon={
                <svg
                  className="w-5 h-5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              }
              iconPosition="left"
            >
              Start Free Trial
            </Button>
            <button className="px-10 py-5 text-xl rounded-full border-2 border-white text-white font-semibold hover:bg-white hover:text-mango-gold transition-all duration-300 hover:scale-105 shadow-lg">
              Schedule Demo
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto mt-16">
          {benefits.map((benefit, index) => (
            <div
              key={benefit.title}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="text-4xl mb-3">{benefit.icon}</div>
              <div className="text-lg font-bold text-white mb-1">
                {benefit.title}
              </div>
              <div className="text-sm text-white/80">{benefit.description}</div>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-white mb-2">14 Days</div>
              <div className="text-white/80">Free Trial</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">No Card</div>
              <div className="text-white/80">Required</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">Cancel</div>
              <div className="text-white/80">Anytime</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}