import React from 'react';
import Card from '../ui/Card';

const howItWorks = [
  {
    icon: (
      <svg
        width="50"
        height="50"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#8B4513"
        strokeWidth="2.5"
      >
        <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
        <path d="M2 17l10 5 10-5M2 12l10 5 10-5"></path>
      </svg>
    ),
    title: 'HQ Controls Access',
    description:
      'Machi Mango headquarters creates and manages all user accounts',
  },
  {
    icon: (
      <svg
        width="50"
        height="50"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#8B4513"
        strokeWidth="2.5"
      >
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>
    ),
    title: 'Franchise Accounts',
    description: 'Each franchisee receives secure login credentials from HQ',
  },
  {
    icon: (
      <svg
        width="50"
        height="50"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#8B4513"
        strokeWidth="2.5"
      >
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
      </svg>
    ),
    title: 'Crew Members',
    description:
      'Franchise owners can request crew access through headquarters',
  },
  {
    icon: (
      <svg
        width="50"
        height="50"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#8B4513"
        strokeWidth="2.5"
      >
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
      </svg>
    ),
    title: 'Role-Based Security',
    description: 'Admin, user, and crew roles with appropriate permissions',
  },
];

const systemBenefits = [
  {
    number: '95%',
    title: 'Error Reduction',
    description: 'Eliminate manual tracking errors with automated systems',
  },
  {
    number: '50%',
    title: 'Time Saved',
    description: 'Cut inventory management time in half',
  },
  {
    number: '100%',
    title: 'Visibility',
    description: 'Complete transparency across all branches',
  },
  {
    number: '24/7',
    title: 'Access',
    description: 'Monitor your business anytime, anywhere',
  },
];

export default function Benefits() {
  return (
    <>
      {/* How It Works */}
      <section id="benefits" className="section section-green">
        <h2
          className="font-heading text-5xl font-bold text-center text-white mb-4"
          style={{
            textShadow:
              '-3px -3px 0 #228B22, 3px -3px 0 #228B22, -3px 3px 0 #228B22, 3px 3px 0 #228B22',
          }}
        >
          How It Works
        </h2>
        <p className="text-center text-xl text-brownDark font-semibold bg-white/80 inline-block px-8 py-3 rounded-full mx-auto block w-fit mb-16">
          Secure, centralized control for your franchise network
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {howItWorks.map((item, index) => (
            <Card
              key={index}
              variant="benefit"
              className="animate-fadeIn"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-24 h-24 mx-auto mb-6 flex items-center justify-center bg-gradient-to-br from-primaryYellow to-sunYellow rounded-full shadow-lg">
                {item.icon}
              </div>
              <h3 className="text-xl font-semibold text-darkBg mb-2">
                {item.title}
              </h3>
              <p className="text-gray-600 text-sm">{item.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* System Benefits */}
      <section className="section section-yellow relative overflow-hidden">
        <h2
          className="font-heading text-5xl font-bold text-center text-white mb-4"
          style={{
            textShadow:
              '-3px -3px 0 #8B4513, 3px -3px 0 #8B4513, -3px 3px 0 #8B4513, 3px 3px 0 #8B4513',
          }}
        >
          System Benefits
        </h2>
        <p className="text-center text-xl text-brownDark font-semibold bg-white/80 inline-block px-8 py-3 rounded-full mx-auto block w-fit mb-16">
          Built specifically for Machi Mango franchise operations
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {systemBenefits.map((benefit, index) => (
            <Card key={index} variant="benefit">
              <div className="font-heading text-6xl font-bold text-primaryOrange mb-4">
                {benefit.number}
              </div>
              <h3 className="text-xl font-semibold text-darkBg mb-2">
                {benefit.title}
              </h3>
              <p className="text-gray-600 text-sm">{benefit.description}</p>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}
