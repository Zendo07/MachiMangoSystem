import React from 'react';
import Card from '../ui/Card';

const features = [
  {
    icon: (
      <svg
        width="50"
        height="50"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#8B4513"
        strokeWidth="2"
      >
        <rect x="3" y="3" width="7" height="7"></rect>
        <rect x="14" y="3" width="7" height="7"></rect>
        <rect x="14" y="14" width="7" height="7"></rect>
        <rect x="3" y="14" width="7" height="7"></rect>
      </svg>
    ),
    title: 'Real-Time Inventory',
    description:
      'Monitor stock levels across all branches in real-time. Get instant alerts when supplies run low.',
  },
  {
    icon: (
      <svg
        width="50"
        height="50"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#8B4513"
        strokeWidth="2"
      >
        <circle cx="9" cy="21" r="1"></circle>
        <circle cx="20" cy="21" r="1"></circle>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
      </svg>
    ),
    title: 'Smart Ordering',
    description:
      'Automated ordering system that predicts needs and streamlines supplier communication.',
  },
  {
    icon: (
      <svg
        width="50"
        height="50"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#8B4513"
        strokeWidth="2"
      >
        <line x1="12" y1="1" x2="12" y2="23"></line>
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
      </svg>
    ),
    title: 'Sales Tracking',
    description:
      'Record daily sales, apply discounts automatically, and generate comprehensive profit reports.',
  },
  {
    icon: (
      <svg
        width="50"
        height="50"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#8B4513"
        strokeWidth="2"
      >
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        <polyline points="9 22 9 12 15 12 15 22"></polyline>
      </svg>
    ),
    title: 'Multi-Branch Control',
    description:
      'Centralized dashboard to oversee all locations with role-based access for staff.',
  },
  {
    icon: (
      <svg
        width="50"
        height="50"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#8B4513"
        strokeWidth="2"
      >
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
        <line x1="12" y1="18" x2="12.01" y2="18"></line>
      </svg>
    ),
    title: 'Menu Management',
    description:
      'Update menu items, prices, and ingredients across all branches instantly.',
  },
  {
    icon: (
      <svg
        width="50"
        height="50"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#8B4513"
        strokeWidth="2"
      >
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
      </svg>
    ),
    title: 'Analytics & Reports',
    description:
      'Data-driven insights for strategic decision-making and business growth.',
  },
];

export default function Features() {
  return (
    <section id="features" className="section section-white">
      <h2
        className="font-heading text-5xl font-bold text-center text-primaryYellow mb-4"
        style={{
          textShadow:
            '-3px -3px 0 #8B4513, 3px -3px 0 #8B4513, -3px 3px 0 #8B4513, 3px 3px 0 #8B4513, 0 0 15px rgba(255, 215, 0, 0.5)',
        }}
      >
        Powerful Features
      </h2>
      <p className="text-center text-xl text-brownDark font-semibold bg-white/80 inline-block px-8 py-3 rounded-full mx-auto block w-fit mb-16">
        Everything you need to manage your beverage business efficiently
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-7xl mx-auto">
        {features.map((feature, index) => (
          <Card
            key={index}
            variant="feature"
            className="animate-fadeIn"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center bg-white/30 rounded-2xl shadow-sm">
              {feature.icon}
            </div>
            <h3 className="font-heading text-2xl text-darkBg mb-4">
              {feature.title}
            </h3>
            <p className="text-brownDark leading-relaxed font-medium">
              {feature.description}
            </p>
          </Card>
        ))}
      </div>
    </section>
  );
}
