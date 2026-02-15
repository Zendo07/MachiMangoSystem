'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full bg-gradient-to-r from-darkBg to-brownDark z-50 shadow-xl border-b-4 border-primaryYellow">
      <div className="max-w-7xl mx-auto px-[5%] py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-4">
          <div className="relative w-[50px] h-[50px] rounded-lg shadow-lg overflow-hidden">
            <Image
              src="/images/machiMangoLogo.webp"
              alt="Machi Mango Logo"
              fill
              className="object-cover"
            />
          </div>
          <span
            className="font-heading text-3xl font-bold text-primaryYellow tracking-tight"
            style={{
              textShadow:
                '-3px -3px 0 #8B4513, 3px -3px 0 #8B4513, -3px 3px 0 #8B4513, 3px 3px 0 #8B4513, 0 0 10px rgba(255, 215, 0, 0.5)',
            }}
          >
            Machi Mango
          </span>
        </Link>

        <ul className="hidden md:flex gap-8 list-none">
          <li>
            <Link
              href="#features"
              className="text-white font-medium hover:text-primaryYellow transition-colors relative group"
            >
              Features
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primaryYellow transition-all group-hover:w-full"></span>
            </Link>
          </li>
          <li>
            <Link
              href="#benefits"
              className="text-white font-medium hover:text-primaryYellow transition-colors relative group"
            >
              Benefits
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primaryYellow transition-all group-hover:w-full"></span>
            </Link>
          </li>
          <li>
            <Link
              href="#contact"
              className="text-white font-medium hover:text-primaryYellow transition-colors relative group"
            >
              Get Started
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primaryYellow transition-all group-hover:w-full"></span>
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
