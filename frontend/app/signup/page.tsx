'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/ui/Navbar';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    invitationCode: '',
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [serverError, setServerError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }

    setServerError('');

    if (name === 'password') {
      calculatePasswordStrength(value);
    }
  };

  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^a-zA-Z0-9]/)) strength++;
    setPasswordStrength(strength);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');
    setServerError('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          invitationCode: formData.invitationCode,
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        }),
      });

      const data = await response.json();
      console.log('Response:', data);

      if (response.ok && data.success) {
        setSuccessMessage('Admin account created! Redirecting to dashboard...');
        setFormData({
          invitationCode: '',
          fullName: '',
          email: '',
          password: '',
          confirmPassword: '',
        });
        setPasswordStrength(0);

        setTimeout(() => {
          window.location.href = '/admin/dashboard';
        }, 2000);
      } else {
        if (data.message && Array.isArray(data.message)) {
          setServerError(data.message.join(', '));
        } else if (data.message) {
          setServerError(data.message);
        } else if (data.error) {
          setServerError(data.error);
        } else {
          setServerError('Something went wrong. Please try again.');
        }
      }
    } catch (error) {
      console.error('Signup error:', error);
      setServerError(
        'Cannot connect to backend server. Make sure it is running on port 3000.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength === 0) return 'bg-gray-200';
    if (passwordStrength === 1) return 'bg-red-500';
    if (passwordStrength === 2) return 'bg-primaryOrange';
    if (passwordStrength === 3) return 'bg-primaryYellow';
    return 'bg-primaryGreen';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength === 0) return '';
    if (passwordStrength === 1) return 'Weak';
    if (passwordStrength === 2) return 'Fair';
    if (passwordStrength === 3) return 'Good';
    return 'Strong';
  };

  return (
    <>
      {/* Navbar */}
      <Navbar />

      <div className="min-h-screen grid lg:grid-cols-2 relative overflow-hidden pt-20">
        {/* Left Panel - Brand & Features */}
        <div className="hidden lg:flex flex-col justify-between p-12 xl:p-16 relative overflow-hidden bg-gradient-to-br from-skyBlue via-blue-300 to-skyBlue">
          {/* Green ground gradient */}
          <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-primaryGreen via-lightGreen to-transparent"></div>

          {/* Floating mango decorations */}
          <div className="animate-bounce absolute w-24 h-24 bg-gradient-to-br from-sunYellow to-primaryOrange rounded-[50%_40%_50%_40%] shadow-2xl top-20 right-20 opacity-60"></div>
          <div
            className="animate-bounce absolute w-16 h-16 bg-gradient-to-br from-sunYellow to-primaryOrange rounded-[50%_40%_50%_40%] shadow-xl bottom-32 left-16 opacity-50"
            style={{ animationDelay: '1s' }}
          ></div>
          <div
            className="animate-bounce absolute w-20 h-20 bg-gradient-to-br from-sunYellow to-primaryOrange rounded-[50%_40%_50%_40%] shadow-xl top-1/2 right-32 opacity-40"
            style={{ animationDelay: '2s' }}
          ></div>

          {/* Main content */}
          <div className="relative z-10 space-y-8 max-w-lg animate-slideInLeft">
            <div className="space-y-6">
              <h2
                className="font-heading text-5xl xl:text-6xl font-bold text-primaryYellow leading-tight transform -rotate-1"
                style={{
                  textShadow:
                    '-4px -4px 0 #8B4513, 4px -4px 0 #8B4513, -4px 4px 0 #8B4513, 4px 4px 0 #8B4513, 0 0 20px rgba(255, 215, 0, 0.6)',
                  letterSpacing: '-2px',
                }}
              >
                Welcome to Machi Mango!
              </h2>
            </div>

            {/* Feature cards */}
            <div className="space-y-4">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border-4 border-white/60">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primaryGreen to-darkGreen flex items-center justify-center flex-shrink-0 shadow-lg">
                    <svg
                      width="28"
                      height="28"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="2.5"
                    >
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                      <polyline points="9 22 9 12 15 12 15 22"></polyline>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-brownDark text-xl mb-2">
                      Centralized Control
                    </h3>
                    <p className="text-brownDark/80 leading-relaxed">
                      Manage all your branches from one powerful dashboard
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border-4 border-white/60">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primaryOrange to-[#ff6600] flex items-center justify-center flex-shrink-0 shadow-lg">
                    <svg
                      width="28"
                      height="28"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="2.5"
                    >
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-brownDark text-xl mb-2">
                      Real-time Updates
                    </h3>
                    <p className="text-brownDark/80 leading-relaxed">
                      Track inventory and orders as they happen
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border-4 border-white/60">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-sunYellow to-primaryYellow flex items-center justify-center flex-shrink-0 shadow-lg">
                    <svg
                      width="28"
                      height="28"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#8B4513"
                      strokeWidth="2.5"
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
                  <div>
                    <h3 className="font-bold text-brownDark text-xl mb-2">
                      100% Secure
                    </h3>
                    <p className="text-brownDark/80 leading-relaxed">
                      Bank-level encryption protects your data
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="flex items-center justify-center p-6 lg:p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primaryYellow/10 via-primaryOrange/10 to-primaryGreen/10"></div>
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-skyBlue/20 to-transparent lg:hidden"></div>

          <div className="w-full max-w-md relative z-10 mt-20 lg:mt-0">
            {/* Success Message */}
            {successMessage && (
              <div className="mb-4 bg-primaryGreen/10 border-l-4 border-primaryGreen p-4 rounded-lg animate-fadeIn">
                <div className="flex items-center gap-3">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-primaryGreen flex-shrink-0"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  <p className="text-sm font-semibold text-primaryGreen">
                    {successMessage}
                  </p>
                </div>
              </div>
            )}

            {/* Server Error */}
            {serverError && (
              <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg animate-fadeIn">
                <div className="flex items-center gap-3">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-red-500 flex-shrink-0"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  <p className="text-sm font-semibold text-red-700">
                    {serverError}
                  </p>
                </div>
              </div>
            )}

            {/* Form card */}
            <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-10 border-4 border-primaryYellow/40 animate-fadeIn">
              {/* Header */}
              <div className="mb-8 text-center">
                <h1
                  className="font-heading text-4xl font-bold text-primaryYellow mb-3 transform -rotate-1"
                  style={{
                    textShadow:
                      '-3px -3px 0 #8B4513, 3px -3px 0 #8B4513, -3px 3px 0 #8B4513, 3px 3px 0 #8B4513',
                    letterSpacing: '-1px',
                  }}
                >
                  Create Account
                </h1>
                <p className="text-lg font-bold bg-gradient-to-r from-primaryGreen to-darkGreen bg-clip-text text-transparent">
                  Start Your Journey Today
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Invitation Code */}
                <div>
                  <label
                    htmlFor="invitationCode"
                    className="block text-sm font-bold text-darkBg mb-2"
                  >
                    Invitation Code
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
                        className="text-primaryYellow"
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
                      type="text"
                      id="invitationCode"
                      name="invitationCode"
                      value={formData.invitationCode}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl border-3 border-primaryYellow/40 focus:border-primaryYellow focus:outline-none focus:ring-4 focus:ring-primaryYellow/20 transition-all font-mono text-base tracking-widest bg-primaryYellow/5"
                      placeholder="XXXX-XXXX-XXXX"
                      required
                    />
                  </div>
                </div>

                {/* Full Name */}
                <div>
                  <label
                    htmlFor="fullName"
                    className="block text-sm font-bold text-darkBg mb-2"
                  >
                    Full Name
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
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                    </div>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl border-3 border-primaryGreen/40 focus:border-primaryGreen focus:outline-none focus:ring-4 focus:ring-primaryGreen/20 transition-all"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                </div>

                {/* Email */}
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
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl border-3 border-primaryGreen/40 focus:border-primaryGreen focus:outline-none focus:ring-4 focus:ring-primaryGreen/20 transition-all"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
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
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full pl-12 pr-12 py-3.5 rounded-xl border-3 ${errors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-primaryOrange/40 focus:border-primaryOrange focus:ring-primaryOrange/20'} focus:ring-4 focus:outline-none transition-all`}
                      placeholder="Create a strong password"
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
                  {errors.password && (
                    <p className="mt-1.5 text-xs text-red-600 font-semibold flex items-center gap-1">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <circle cx="12" cy="12" r="10"></circle>
                        <line
                          x1="12"
                          y1="8"
                          x2="12"
                          y2="12"
                          stroke="white"
                          strokeWidth="2"
                        ></line>
                        <line
                          x1="12"
                          y1="16"
                          x2="12.01"
                          y2="16"
                          stroke="white"
                          strokeWidth="2"
                        ></line>
                      </svg>
                      {errors.password}
                    </p>
                  )}
                  {formData.password && !errors.password && (
                    <div className="mt-2 space-y-2">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((level) => (
                          <div
                            key={level}
                            className={`h-2 flex-1 rounded-full transition-all ${
                              level <= passwordStrength
                                ? getPasswordStrengthColor()
                                : 'bg-gray-200'
                            }`}
                          ></div>
                        ))}
                      </div>
                      {passwordStrength > 0 && (
                        <p className="text-xs text-brownDark/60 font-semibold">
                          Strength: {getPasswordStrengthText()}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-bold text-darkBg mb-2"
                  >
                    Confirm Password
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
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`w-full pl-12 pr-12 py-3.5 rounded-xl border-3 ${errors.confirmPassword ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-primaryOrange/40 focus:border-primaryOrange focus:ring-primaryOrange/20'} focus:ring-4 focus:outline-none transition-all`}
                      placeholder="Re-enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-brownDark/50 hover:text-brownDark transition-colors"
                    >
                      {showConfirmPassword ? (
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
                  {errors.confirmPassword && (
                    <p className="mt-1.5 text-xs text-red-600 font-semibold flex items-center gap-1">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <circle cx="12" cy="12" r="10"></circle>
                        <line
                          x1="12"
                          y1="8"
                          x2="12"
                          y2="12"
                          stroke="white"
                          strokeWidth="2"
                        ></line>
                        <line
                          x1="12"
                          y1="16"
                          x2="12.01"
                          y2="16"
                          stroke="white"
                          strokeWidth="2"
                        ></line>
                      </svg>
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-primaryGreen to-darkGreen text-white font-bold py-4 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 active:translate-y-0 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 mt-6 border-3 border-darkGreen"
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
                      Creating Account...
                    </span>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="mt-8 pt-6 border-t-2 border-brownDark/20">
                <p className="text-center text-sm text-brownDark/70">
                  Already have an account?{' '}
                  <Link
                    href="/login"
                    className="font-bold text-primaryGreen hover:text-darkGreen transition-colors"
                  >
                    Sign in here
                  </Link>
                </p>
              </div>

              {/* Public Registration Notice */}
              <div className="mt-4 pt-4 border-t border-brownDark/10">
                <p className="text-center text-xs text-brownDark/60 flex items-center justify-center gap-2">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-brownDark/40"
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
                  This system is not intended for public registration.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
