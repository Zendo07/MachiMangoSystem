import React from 'react';
import Image from 'next/image';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

export default function Hero() {
  return (
    <section className="min-h-screen flex items-center justify-between px-[5%] pt-32 pb-16 gap-16 relative overflow-hidden">
      <div className="flex-1 max-w-2xl animate-slideInLeft">
        <h1
          className="font-heading text-6xl font-bold text-primaryYellow mb-6 leading-tight transform -rotate-2"
          style={{
            textShadow:
              '-4px -4px 0 #8B4513, 4px -4px 0 #8B4513, -4px 4px 0 #8B4513, 4px 4px 0 #8B4513, 0 0 20px rgba(255, 215, 0, 0.6)',
            letterSpacing: '-2px',
          }}
        >
          Inventory & Ordering System
        </h1>

        <p className="text-2xl font-bold mb-8 bg-gradient-to-r from-primaryGreen to-darkGreen bg-clip-text text-transparent">
          Centralized Management for All Franchise Locations
        </p>

        <div className="bg-white/85 p-6 rounded-2xl shadow-lg mb-10">
          <p className="text-lg text-brownDark leading-relaxed">
            Our internal inventory and ordering system connects all Machi Mango
            franchise branches. Headquarters maintains full control with secure
            access for franchisees and their crew members.
          </p>
        </div>

        <div className="flex gap-6 flex-wrap">
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
            Access System
          </Button>
          <Button variant="secondary" size="lg" href="#features">
            Learn More
          </Button>
        </div>
      </div>

      <div className="flex-1 flex justify-center items-center relative animate-slideInRight">
        <div className="relative w-full max-w-xl">
          <div className="animate-float relative w-full h-96 bg-gradient-to-br from-skyBlue to-blue-300 rounded-3xl p-8 shadow-2xl border-4 border-white/60 overflow-hidden">
            <Badge
              variant="primary"
              className="absolute top-4 left-4 z-30 animate-wiggle"
            >
              100% Pure & Fresh
            </Badge>

            <div className="absolute bottom-0 left-0 w-full h-28 bg-gradient-to-t from-primaryGreen via-primaryGreen to-transparent rounded-b-3xl z-20"></div>

            <div className="animate-bounce absolute w-12 h-12 bg-gradient-to-br from-sunYellow to-primaryOrange rounded-[50%_40%_50%_40%] shadow-lg z-30 top-12 right-8"></div>
            <div
              className="animate-bounce absolute w-10 h-10 bg-gradient-to-br from-sunYellow to-primaryOrange rounded-[50%_40%_50%_40%] shadow-lg z-30 bottom-32 left-6"
              style={{ animationDelay: '1s' }}
            ></div>
            <div
              className="animate-bounce absolute w-8 h-8 bg-gradient-to-br from-sunYellow to-primaryOrange rounded-[50%_40%_50%_40%] shadow-lg z-30 top-1/2 right-10"
              style={{ animationDelay: '2s' }}
            ></div>

            <div className="relative w-full h-full flex items-center justify-center z-10">
              <div className="relative w-full h-full">
                <Image
                  src="/images/machibg.webp"
                  alt="Machi Mango Products"
                  fill
                  className="object-contain drop-shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
