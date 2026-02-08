'use client';

import React, { useEffect, useState } from 'react';
import Button from '../ui/button';

export default function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{
        paddingTop: '6rem',
        paddingBottom: '3rem',
        background: 'linear-gradient(135deg, #FFF8E7 0%, #FFEFD5 25%, #FFE4B5 50%, #FFEFD5 75%, #FFF8E7 100%)',
        zIndex: 10,
      }}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
        <div className="absolute top-20 left-10 w-24 h-24 opacity-20 animate-float">
          <div className="w-full h-full rounded-full bg-gradient-to-br from-mango-sun to-mango-gold transform rotate-12" />
        </div>
        <div className="absolute top-40 right-20 w-32 h-32 opacity-15 animate-float" style={{ animationDelay: '200ms' }}>
          <div className="w-full h-full rounded-full bg-gradient-to-br from-mango-gold to-mango-sunset transform -rotate-12" />
        </div>
        <div className="absolute bottom-32 left-1/4 w-20 h-20 opacity-20 animate-float" style={{ animationDelay: '400ms' }}>
          <div className="w-full h-full rounded-full bg-gradient-to-br from-mango-sun to-mango-gold" />
        </div>
        <div className="absolute top-1/4 right-10 w-64 h-64 rounded-full bg-white/30 blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/4 left-10 w-80 h-80 rounded-full bg-mango-sun/20 blur-3xl animate-float" />
      </div>

      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ zIndex: 10 }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <div className="space-y-6 md:space-y-8 text-center lg:text-left">
            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-tropical-green/20 to-mint-fresh/20 border border-tropical-green/30 transition-opacity duration-800 ${
                isVisible ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-tropical-green animate-pulse" />
              <span className="text-xs sm:text-sm font-semibold text-tropical-green">
                Next-Gen Inventory Management
              </span>
            </div>

            <h1
              className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold transition-opacity duration-800 ${
                isVisible ? 'opacity-100' : 'opacity-0'
              }`}
              style={{ transitionDelay: '100ms' }}
            >
              <span className="bg-gradient-to-r from-mango-sun via-mango-gold to-mango-sunset bg-clip-text text-transparent">
                Smart Inventory
              </span>
              <br />
              <span className="text-neutral-900">for Your Business</span>
            </h1>

            <p
              className={`text-base sm:text-lg md:text-xl text-neutral-700 max-w-2xl mx-auto lg:mx-0 leading-relaxed transition-opacity duration-800 ${
                isVisible ? 'opacity-100' : 'opacity-0'
              }`}
              style={{ transitionDelay: '200ms' }}
            >
              Streamline operations across multiple branches with real-time inventory tracking, automated ordering, and comprehensive reporting.
            </p>

            <div
              className={`flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-3 sm:gap-4 pt-4 transition-opacity duration-800 ${
                isVisible ? 'opacity-100' : 'opacity-0'
              }`}
              style={{ transitionDelay: '300ms' }}
            >
              <Button
                variant="gradient"
                size="lg"
                icon={
                  <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                }
                iconPosition="left"
              >
                Start Free Trial
              </Button>
              <Button
                variant="outline"
                size="lg"
                icon={
                  <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
                iconPosition="left"
              >
                Watch Demo
              </Button>
            </div>

            <div
              className={`grid grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-2xl mx-auto lg:mx-0 pt-6 md:pt-8 transition-opacity duration-800 ${
                isVisible ? 'opacity-100' : 'opacity-0'
              }`}
              style={{ transitionDelay: '500ms' }}
            >
              <div className="text-center lg:text-left">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-mango-sun to-mango-gold bg-clip-text text-transparent">
                  15+
                </div>
                <div className="text-xs sm:text-sm text-neutral-600 mt-1">Branches</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-mango-sun to-mango-gold bg-clip-text text-transparent">
                  99.9%
                </div>
                <div className="text-xs sm:text-sm text-neutral-600 mt-1">Uptime</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-mango-sun to-mango-gold bg-clip-text text-transparent">
                  24/7
                </div>
                <div className="text-xs sm:text-sm text-neutral-600 mt-1">Support</div>
              </div>
            </div>
          </div>

          <div
            className={`relative flex items-center justify-center transition-opacity duration-800 ${
              isVisible ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ transitionDelay: '400ms' }}
          >
            <div className="relative w-full max-w-md lg:max-w-lg">
              <div className="absolute inset-0 bg-gradient-to-r from-mango-sun via-mango-gold to-mango-sunset rounded-3xl blur-3xl opacity-30 animate-pulse-glow" />
              
              <div className="relative bg-white rounded-2xl md:rounded-3xl shadow-2xl p-6 md:p-8 border border-neutral-200">
                <div className="flex items-center gap-2 mb-4 md:mb-6">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>

                <div className="space-y-3 md:space-y-4">
                  <div className="bg-gradient-to-r from-cream-white to-cream-vanilla rounded-lg md:rounded-xl p-3 md:p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs md:text-sm font-semibold text-neutral-700">Dashboard Overview</span>
                      <span className="text-xs text-tropical-green font-semibold">Live</span>
                    </div>
                    <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-mango-sun to-mango-gold rounded-full w-3/4 animate-pulse" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 md:gap-4">
                    <div className="bg-gradient-to-br from-mango-sun/10 to-mango-gold/10 rounded-lg md:rounded-xl p-3 md:p-4 border border-mango-gold/20">
                      <div className="text-xl md:text-2xl mb-1">📦</div>
                      <div className="text-xs text-neutral-600">Inventory</div>
                      <div className="text-base md:text-lg font-bold text-neutral-900 mt-1">1,234</div>
                    </div>
                    <div className="bg-gradient-to-br from-tropical-green/10 to-mint-fresh/10 rounded-lg md:rounded-xl p-3 md:p-4 border border-tropical-green/20">
                      <div className="text-xl md:text-2xl mb-1">📊</div>
                      <div className="text-xs text-neutral-600">Sales</div>
                      <div className="text-base md:text-lg font-bold text-neutral-900 mt-1">₱45.2K</div>
                    </div>
                  </div>

                  <div className="bg-neutral-50 rounded-lg md:rounded-xl p-3 md:p-4 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-neutral-600">Recent Activity</span>
                      <span className="text-mango-gold font-semibold">View All</span>
                    </div>
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-2 md:gap-3 bg-white rounded-lg p-2">
                        <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-r from-mango-sun to-mango-gold flex items-center justify-center text-xs flex-shrink-0">
                          🥭
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium text-neutral-900 truncate">Stock Updated</div>
                          <div className="text-xs text-neutral-500">{i}m ago</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}