'use client';

import React from 'react';

export default function RolesSection() {
  const roles = [
    {
      title: 'Administrator',
      subtitle: 'Main Portal',
      icon: '👑',
      color: 'from-mango-sun to-mango-gold',
      features: [
        'Full system access and control',
        'Menu management (CRUD operations)',
        'Account creation and management',
        'Global sales and consumption reports',
        'Multi-branch oversight',
        'System configuration',
      ],
    },
    {
      title: 'Manager/Owner',
      subtitle: 'Users Portal',
      icon: '👨‍💼',
      color: 'from-tropical-green to-mint-fresh',
      features: [
        'Discount management (PWD/Senior)',
        'Crew account creation',
        'Inventory tracking and management',
        'Financial reporting (Sales & Profit)',
        'Stock-in/Stock-out monitoring',
        'Daily operations control',
      ],
    },
    {
      title: 'Crew Member',
      subtitle: 'Crew Account',
      icon: '👨‍🍳',
      color: 'from-sky-light to-mint-fresh',
      features: [
        'View-only menu access',
        'Transaction processing',
        'Order management',
        'Read-only permissions',
        'Quick service interface',
        'Simple navigation',
      ],
    },
  ];

  return (
    <section
      id="roles"
      className="relative overflow-hidden"
      style={{
        paddingTop: '4rem',
        paddingBottom: '4rem',
        background: 'linear-gradient(180deg, #FFFFFF 0%, #FFF8E7 50%, #FFEFD5 100%)',
        zIndex: 10,
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-tropical-green/20 to-mint-fresh/20 border border-tropical-green/30 mb-4 md:mb-6">
            <span className="text-xs sm:text-sm font-semibold text-tropical-green">USER ROLES</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-neutral-900 mb-4 md:mb-6 px-4">
            Designed for
            <br />
            <span className="bg-gradient-to-r from-mango-sun via-mango-gold to-mango-sunset bg-clip-text text-transparent">
              Every Team Member
            </span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-neutral-600 max-w-3xl mx-auto px-4">
            Role-based access control ensures each user has the right tools and permissions for their responsibilities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {roles.map((role, index) => (
            <div
              key={role.title}
              className="group relative bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border border-neutral-200"
            >
              <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-2xl md:rounded-3xl from-mango-sun to-mango-gold" />

              <div className="relative">
                <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-r ${role.color} flex items-center justify-center mb-4 md:mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <span className="text-3xl md:text-4xl">{role.icon}</span>
                </div>

                <div className="mb-4 md:mb-6">
                  <h3 className="text-xl md:text-2xl font-bold text-neutral-900 mb-1">{role.title}</h3>
                  <p className="text-xs md:text-sm font-semibold text-neutral-500 uppercase tracking-wider">{role.subtitle}</p>
                </div>

                <ul className="space-y-2 md:space-y-3">
                  {role.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 md:gap-3">
                      <svg className="w-5 h-5 text-tropical-green mt-0.5 flex-shrink-0" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-xs md:text-sm text-neutral-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button className={`w-full mt-6 md:mt-8 px-6 py-3 rounded-full bg-gradient-to-r ${role.color} text-white font-semibold shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300`}>
                  Learn More
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 md:mt-16 bg-gradient-to-r from-mango-sun via-mango-gold to-mango-sunset rounded-2xl md:rounded-3xl p-8 md:p-12 text-center shadow-2xl">
          <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3 md:mb-4 px-4">Secure Access for Everyone</h3>
          <p className="text-base sm:text-lg text-white/90 mb-6 md:mb-8 max-w-2xl mx-auto px-4">
            Our role-based access control (RBAC) system ensures data security while providing each team member with exactly what they need to succeed.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4">
            <button className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 rounded-full bg-white text-mango-gold font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
              Request a Demo
            </button>
            <button className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 rounded-full border-2 border-white text-white font-bold hover:bg-white hover:text-mango-gold transition-all duration-300">
              View Documentation
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}