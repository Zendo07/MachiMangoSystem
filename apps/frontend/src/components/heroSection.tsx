'use client';

import React, { useEffect, useState } from 'react';

export default function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-32"
      style={{
        background: 'linear-gradient(135deg, #FFF8E7 0%, #FFEFD5 25%, #FFE4B5 50%, #FFEFD5 75%, #FFF8E7 100%)',
      }}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating Mango Slices */}
        <div className="absolute top-20 left-10 w-24 h-24 opacity-20 animate-float">
          <div className="w-full h-full rounded-full bg-gradient-to-br from-mango-sun to-mango-gold transform rotate-12" />
        </div>
        <div className="absolute top-40 right-20 w-32 h-32 opacity-15 animate-float delay-200">
          <div className="w-full h-full rounded-full bg-gradient-to-br from-mango-gold to-mango-sunset transform -rotate-12" />
        </div>
        <div className="absolute bottom-32 left-1/4 w-20 h-20 opacity-20 animate-float delay-400">
          <div className="w-full h-full rounded-full bg-gradient-to-br from-mango-sun to-mango-gold" />
        </div>

        {/* Graham Cracker Texture Dots */}
        {[
          { top: 15, left: 20, duration: 5.5, delay: 0.2 },
          { top: 25, left: 80, duration: 6.2, delay: 0.8 },
          { top: 35, left: 10, duration: 4.8, delay: 1.5 },
          { top: 45, left: 90, duration: 7.1, delay: 0.4 },
          { top: 55, left: 30, duration: 5.3, delay: 1.2 },
          { top: 65, left: 70, duration: 6.8, delay: 0.6 },
          { top: 75, left: 15, duration: 4.5, delay: 1.8 },
          { top: 85, left: 85, duration: 6.5, delay: 0.3 },
          { top: 12, left: 50, duration: 5.8, delay: 1.0 },
          { top: 28, left: 40, duration: 6.3, delay: 0.7 },
          { top: 42, left: 65, duration: 4.9, delay: 1.6 },
          { top: 58, left: 25, duration: 7.2, delay: 0.5 },
          { top: 68, left: 55, duration: 5.6, delay: 1.3 },
          { top: 78, left: 75, duration: 6.1, delay: 0.9 },
          { top: 88, left: 35, duration: 5.2, delay: 1.7 },
          { top: 18, left: 60, duration: 6.9, delay: 0.4 },
          { top: 38, left: 45, duration: 4.7, delay: 1.1 },
          { top: 52, left: 82, duration: 6.6, delay: 0.8 },
          { top: 72, left: 22, duration: 5.4, delay: 1.4 },
          { top: 92, left: 68, duration: 7.0, delay: 0.6 },
        ].map((dot, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-graham-tan opacity-20"
            style={{
              top: `${dot.top}%`,
              left: `${dot.left}%`,
              animation: `float ${dot.duration}s ease-in-out infinite`,
              animationDelay: `${dot.delay}s`,
            }}
          />
        ))}

        {/* Cream Swirls */}
        <div className="absolute top-1/4 right-10 w-64 h-64 rounded-full bg-white/30 blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/4 left-10 w-80 h-80 rounded-full bg-mango-sun/20 blur-3xl animate-float" />
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text Content */}
          <div className="space-y-8 text-center lg:text-left order-2 lg:order-1">
            {/* Handwritten Tagline */}
            <div
              className={`text-handwritten text-tropical-green opacity-0 ${
                isVisible ? 'animate-slide-up' : ''
              }`}
            >
              Tropical Bliss in Every Sip
            </div>

            {/* Main Headline */}
            <h1
              className={`text-display-xl text-gradient-mango opacity-0 ${
                isVisible ? 'animate-slide-up delay-100' : ''
              }`}
            >
              Machi Mango
              <br />
              <span className="text-display-lg text-neutral-800">Graham Shake</span>
            </h1>

            {/* Description */}
            <p
              className={`text-body-xl text-neutral-700 max-w-2xl mx-auto lg:mx-0 opacity-0 ${
                isVisible ? 'animate-slide-up delay-200' : ''
              }`}
            >
              Experience the perfect blend of sweet Philippine mangoes, rich cream,
              and crunchy graham crackers. A taste of summer in every glass.
            </p>

            {/* CTA Buttons */}
            <div
              className={`flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-4 pt-6 opacity-0 ${
                isVisible ? 'animate-slide-up delay-300' : ''
              }`}
            >
              <button className="btn btn-primary btn-xl btn-3d btn-with-icon">
                <span>Order Now</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </button>
              <button className="btn btn-secondary btn-xl btn-with-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="6 3 20 12 6 21 6 3" />
                </svg>
                <span>Watch Video</span>
              </button>
            </div>

            {/* Stats */}
            <div
              className={`grid grid-cols-3 gap-8 max-w-3xl mx-auto lg:mx-0 pt-12 opacity-0 ${
                isVisible ? 'animate-fade-in delay-500' : ''
              }`}
            >
              <div className="text-center lg:text-left">
                <div className="text-h2 text-mango-gold font-bold">1000+</div>
                <div className="text-body-sm text-neutral-700">Happy Customers</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-h2 text-mango-gold font-bold">100%</div>
                <div className="text-body-sm text-neutral-700">Natural Mangoes</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-h2 text-mango-gold font-bold">5★</div>
                <div className="text-body-sm text-neutral-700">Rated Shake</div>
              </div>
            </div>
          </div>

          {/* Right Column - Shake Illustration */}
          <div
            className={`relative flex items-center justify-center order-1 lg:order-2 opacity-0 ${
              isVisible ? 'animate-slide-up delay-400' : ''
            }`}
          >
            <div className="relative w-full max-w-md h-[500px] flex items-end justify-center">
              {/* Shake Glass Illustration */}
              <div className="relative">
                {/* Glass */}
                <div className="w-48 h-80 bg-gradient-to-b from-transparent to-white/40 backdrop-blur-sm rounded-t-3xl rounded-b-lg border-4 border-white/50 shadow-2xl relative">
                  {/* Shake Content */}
                  <div className="absolute inset-x-2 bottom-2 h-64 gradient-mango rounded-lg opacity-80" />
                  <div className="absolute inset-x-2 bottom-2 h-32 bg-gradient-to-t from-cream-vanilla to-transparent rounded-lg" />
                  
                  {/* Graham Crumbles */}
                  <div className="absolute top-20 left-8 w-3 h-3 bg-graham-brown rounded-full" />
                  <div className="absolute top-32 right-10 w-2 h-2 bg-graham-brown rounded-full" />
                  <div className="absolute top-40 left-12 w-4 h-4 bg-graham-tan rounded-full" />
                </div>

                {/* Straw */}
                <div className="absolute top-0 right-12 w-4 h-64 bg-gradient-to-b from-red-500 to-red-400 rounded-full transform rotate-12 shadow-lg" />

                {/* Toppings */}
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                  <div className="w-20 h-12 bg-cream-white rounded-full shadow-lg" />
                  <div className="absolute top-2 left-4 text-2xl animate-bounce-slow">🥭</div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute -right-12 top-20 text-4xl animate-float">
                  ✨
                </div>
                <div className="absolute -left-12 top-32 text-3xl animate-float delay-200">
                  🌟
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator - Fixed positioning */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce-slow z-20">
        <div className="flex flex-col items-center gap-2 text-neutral-700">
          <span className="text-body-sm font-medium">Scroll Down</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </div>
    </section>
  );
}