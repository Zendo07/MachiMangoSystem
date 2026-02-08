'use client';

import React from 'react';
import Button from '../ui/button';

export default function CtaSection() {
  const benefits = [
    { icon: '⚡', title: 'Quick Setup', description: 'Get started in minutes' },
    { icon: '🔒', title: 'Secure Platform', description: 'Enterprise-grade security' },
    { icon: '💪', title: 'Reliable Support', description: '24/7 customer assistance' },
    { icon: '📈', title: 'Scale Easily', description: 'Grow without limits' },
  ];

  return (
    <section
      id="cta"
      className="relative overflow-hidden"
      style={{
        paddingTop: '4rem',
        paddingBottom: '4rem',
        background: 'linear-gradient(135deg, #FFB84D 0%, #FF9500 50%, #FF6B35 100%)',
        zIndex: 10,
      }}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0, opacity: 0.1 }}>
        <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full animate-float" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full animate-float" style={{ animationDelay: '300ms' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-white rounded-full animate-pulse-glow" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ zIndex: 10 }}>
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 md:mb-6 px-4">
            Ready to Transform
            <br />
            Your Business Operations?
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-white/90 mb-8 md:mb-10 max-w-3xl mx-auto px-4">
            Join hundreds of businesses already streamlining their inventory and ordering processes with our powerful platform.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Button
              variant="secondary"
              size="xl"
              icon={
                <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              }
              iconPosition="left"
            >
              Start Free Trial
            </Button>
            <button className="px-8 md:px-10 py-4 md:py-5 text-lg md:text-xl rounded-full border-2 border-white text-white font-semibold hover:bg-white hover:text-mango-gold transition-all duration-300 hover:scale-105 shadow-lg whitespace-nowrap">
              Schedule Demo
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-5xl mx-auto mt-12 md:mt-16">
          {benefits.map((benefit, index) => (
            <div
              key={benefit.title}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 md:p-6 text-center border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105"
            >
              <div className="text-3xl md:text-4xl mb-2 md:mb-3">{benefit.icon}</div>
              <div className="text-base md:text-lg font-bold text-white mb-1">{benefit.title}</div>
              <div className="text-xs md:text-sm text-white/80">{benefit.description}</div>
            </div>
          ))}
        </div>

        <div className="mt-12 md:mt-16 bg-white/10 backdrop-blur-sm rounded-2xl md:rounded-3xl p-6 md:p-8 border border-white/20 max-w-4xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">14 Days</div>
              <div className="text-sm md:text-base text-white/80">Free Trial</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">No Card</div>
              <div className="text-sm md:text-base text-white/80">Required</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">Cancel</div>
              <div className="text-sm md:text-base text-white/80">Anytime</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}