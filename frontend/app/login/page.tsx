'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/ui/Navbar';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // TODO: Add login logic here later
    console.log('Login attempt:', { email, password });

    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  return (
    <>
      {/* Navbar */}
      <Navbar />

      <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden pt-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primaryYellow via-primaryOrange to-primaryGreen opacity-20"></div>

        <div className="relative z-10 w-full max-w-md animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-primaryYellow">
            <div className="text-center mb-8">
              <div className="inline-block bg-gradient-to-br from-primaryYellow to-sunYellow px-6 py-3 rounded-full mb-4">
                <h1 className="font-heading text-3xl font-bold text-darkBg">
                  Welcome Back!
                </h1>
              </div>
              <p className="text-brownDark font-medium">
                Sign in to access your franchise portal
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-bold text-darkBg mb-2"
                >
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-primaryGreen"
                    >
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                  </div>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border-3 border-primaryGreen/40 focus:border-primaryGreen focus:outline-none focus:ring-4 focus:ring-primaryGreen/20 transition-all"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-bold text-darkBg mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-primaryOrange"
                    >
                      <rect
                        x="3"
                        y="11"
                        width="18"
                        height="11"
                        rx="2"
                        ry="2"
                      ></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3.5 rounded-xl border-3 border-primaryOrange/40 focus:border-primaryOrange focus:outline-none focus:ring-4 focus:ring-primaryOrange/20 transition-all"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-brownDark/50 hover:text-brownDark transition-colors"
                  >
                    {showPassword ? (
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    ) : (
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-2 border-brownDark/30 text-primaryYellow focus:ring-primaryYellow"
                  />
                  <span className="ml-2 text-sm text-brownDark">
                    Remember me
                  </span>
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-primaryGreen hover:text-darkGreen font-semibold transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-primaryGreen to-darkGreen text-white font-bold py-4 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 active:translate-y-0 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 border-3 border-darkGreen"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t-2 border-brownDark/20">
              <p className="text-center text-sm text-brownDark/70">
                First-time owner?{' '}
                <Link
                  href="/signup"
                  className="font-bold text-primaryGreen hover:text-darkGreen transition-colors"
                >
                  Sign up here with invitation code
                </Link>
              </p>
            </div>

            <div className="mt-6 text-center">
              <p className="text-xs text-brownDark/60">
                🥭 100% Pure & Fresh Management Solutions
              </p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-brownDark/70 bg-white/80 inline-block px-6 py-3 rounded-full shadow-md">
              All accounts are managed by{' '}
              <span className="font-bold text-primaryGreen">Machi Mango</span>
            </p>
          </div>
        </div>

        <div className="absolute bottom-8 right-8 animate-bounce">
          <div className="w-16 h-16 bg-gradient-to-br from-sunYellow to-primaryOrange rounded-[50%_40%_50%_40%] shadow-lg opacity-50"></div>
        </div>
        <div
          className="absolute top-1/4 right-1/4 animate-bounce"
          style={{ animationDelay: '1s' }}
        >
          <div className="w-12 h-12 bg-gradient-to-br from-sunYellow to-primaryOrange rounded-[50%_40%_50%_40%] shadow-lg opacity-30"></div>
        </div>
        <div
          className="absolute bottom-1/4 left-1/4 animate-bounce"
          style={{ animationDelay: '2s' }}
        >
          <div className="w-10 h-10 bg-gradient-to-br from-sunYellow to-primaryOrange rounded-[50%_40%_50%_40%] shadow-lg opacity-40"></div>
        </div>
      </div>
    </>
  );
}
