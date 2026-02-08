'use client';

import React from 'react';

export default function FeaturesSection() {
  const features = [
    {
      icon: '👥',
      title: 'Role-Based Access',
      description:
        'Secure access control for Administrators, Managers, and Crew members with tailored permissions and functionality.',
      gradient: 'from-mango-sun to-mango-gold',
    },
    {
      icon: '📊',
      title: 'Real-Time Reporting',
      description:
        'Comprehensive analytics with daily sales, gross profit, net profit, and consumption tracking across all branches.',
      gradient: 'from-tropical-green to-mint-fresh',
    },
    {
      icon: '📦',
      title: 'Inventory Management',
      description:
        'Track stock levels, manage ingredients, automate reordering, and monitor usage patterns in real-time.',
      gradient: 'from-mango-gold to-mango-sunset',
    },
    {
      icon: '🍽️',
      title: 'Menu Control',
      description:
        'Create, update, and manage menu items with pricing, categories, and availability across multiple locations.',
      gradient: 'from-sky-light to-mint-fresh',
    },
    {
      icon: '💰',
      title: 'Discount System',
      description:
        'Built-in PWD and Senior Citizen discount management with automated calculation and compliance tracking.',
      gradient: 'from-mango-sunset to-tropical-green',
    },
    {
      icon: '🔒',
      title: 'Enterprise Security',
      description:
        'Bank-level encryption, secure authentication, and comprehensive audit logs for complete data protection.',
      gradient: 'from-graham-brown to-graham-dark',
    },
  ];

  return (
    <section id="features" className="py-24 bg-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/4 left-10 w-96 h-96 rounded-full bg-gradient-to-r from-mango-sun to-mango-gold blur-3xl" />
        <div className="absolute bottom-1/4 right-10 w-80 h-80 rounded-full bg-tropical-green blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-mango-sun/20 to-mango-gold/20 border border-mango-gold/30 mb-6">
            <span className="text-sm font-semibold text-mango-gold">
              POWERFUL FEATURES
            </span>
          </div>
          <h2 className="text-5xl font-bold text-neutral-900 mb-6">
            Everything You Need to
            <br />
            <span className="bg-gradient-to-r from-mango-sun via-mango-gold to-mango-sunset bg-clip-text text-transparent">
              Manage Your Business
            </span>
          </h2>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
            Built on a robust three-tier architecture with Next.js, NestJS, and PostgreSQL for maximum performance and scalability.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group relative bg-gradient-to-br from-cream-white to-cream-vanilla rounded-2xl p-8 shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 animate-slide-up border border-neutral-200"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-2xl from-mango-sun to-mango-gold" />
              
              <div className="relative">
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                >
                  <span className="text-3xl">{feature.icon}</span>
                </div>

                <h3 className="text-2xl font-bold text-neutral-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-neutral-600 leading-relaxed">
                  {feature.description}
                </p>

                <div className="mt-6 flex items-center gap-2 text-mango-gold font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span>Learn more</span>
                  <svg
                    className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-6 bg-gradient-to-r from-cream-white to-cream-vanilla rounded-2xl p-8 shadow-lg border border-neutral-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-tropical-green to-mint-fresh flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-left">
                <div className="text-sm font-semibold text-neutral-900">
                  Ready to transform your operations?
                </div>
                <div className="text-xs text-neutral-600">
                  Start your 14-day free trial today
                </div>
              </div>
            </div>
            <button className="px-6 py-3 rounded-full bg-gradient-to-r from-mango-sun via-mango-gold to-mango-sunset text-white font-semibold shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300">
              Get Started Free
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}