'use client';

import React, { useState, useEffect } from 'react';
import Button from '../ui/button';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Home', href: '#home' },
    { label: 'Menu', href: '#menu' },
    { label: 'About', href: '#about' },
    { label: 'Locations', href: '#locations' },
    { label: 'Contact', href: '#contact' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-mango-sun via-mango-gold to-mango-sunset flex items-center justify-center shadow-md group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
              <span className="text-2xl">🥭</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold bg-gradient-to-r from-mango-sun via-mango-gold to-mango-sunset bg-clip-text text-transparent leading-none">
                Machi
              </span>
              <span className="text-xs font-semibold text-graham-brown -mt-1">
                Mango Inventory
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-semibold text-neutral-700 hover:text-mango-gold transition-colors duration-200 relative group"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-mango-sun to-mango-gold group-hover:w-full transition-all duration-300" />
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => (window.location.href = '/login')}
            >
              Login
            </Button>
            <Button
              variant="gradient"
              size="sm"
            >
              Get Started
            </Button>
          </div>

          <button
            className="md:hidden p-2 rounded-lg hover:bg-mango-gold/10 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg
              className="w-6 h-6 text-neutral-700"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMobileMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-neutral-200 shadow-lg">
          <div className="px-4 py-6 space-y-4">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="block text-base font-semibold text-neutral-700 hover:text-mango-gold transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="pt-4 space-y-3 border-t border-neutral-200">
              <Button
                variant="outline"
                size="md"
                fullWidth
                onClick={() => (window.location.href = '/login')}
              >
                Login
              </Button>
              <Button variant="gradient" size="md" fullWidth>
                Get Started
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}