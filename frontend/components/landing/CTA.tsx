import React from 'react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

export default function CTA() {
  return (
    <section
      id="contact"
      className="section section-yellow text-center relative overflow-hidden"
    >
      <div className="max-w-4xl mx-auto relative z-10">
        <Badge variant="secondary" className="mb-6">
          FRANCHISE PORTAL
        </Badge>

        <h2
          className="font-heading text-5xl font-bold text-white mb-6"
          style={{
            textShadow:
              '-3px -3px 0 #8B4513, 3px -3px 0 #8B4513, -3px 3px 0 #8B4513, 3px 3px 0 #8B4513',
          }}
        >
          Ready to Get Started?
        </h2>

        <div className="bg-white/95 p-8 rounded-2xl shadow-lg mb-10">
          <p className="text-lg text-brownDark leading-relaxed font-medium">
            Access the Machi Mango Inventory & Ordering System with your
            franchise credentials. All accounts are securely managed by
            headquarters.
          </p>
        </div>

        <div className="flex gap-6 justify-center flex-wrap">
          <Button
            variant="primary"
            size="lg"
            href="/login"
            icon={
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                <polyline points="10 17 15 12 10 7"></polyline>
                <line x1="15" y1="12" x2="3" y2="12"></line>
              </svg>
            }
          >
            Login to System
          </Button>
          <Button
            variant="secondary"
            size="lg"
            href="#contact"
            icon={
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            }
          >
            Contact HQ
          </Button>
        </div>

        <div className="inline-block bg-white/90 p-4 rounded-xl shadow-sm mt-8">
          <p className="text-sm text-darkBg flex items-center gap-2">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            New franchise owner? Contact headquarters for account setup
          </p>
        </div>
      </div>
    </section>
  );
}
