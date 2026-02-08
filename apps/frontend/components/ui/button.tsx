'use client';

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  icon,
  iconPosition = 'right',
  fullWidth = false,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-semibold rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-offset-2 whitespace-nowrap';

  const variants = {
    primary: 'bg-gradient-to-r from-mango-sun via-mango-gold to-mango-sunset text-white shadow-md hover:shadow-xl hover:-translate-y-1 focus:ring-mango-sun/30 active:translate-y-0',
    secondary: 'bg-white text-mango-gold border-2 border-mango-gold hover:bg-mango-gold hover:text-white shadow-sm hover:shadow-md hover:-translate-y-1 focus:ring-mango-gold/30 active:translate-y-0',
    outline: 'bg-transparent text-mango-gold border-2 border-mango-gold hover:bg-mango-gold hover:text-white hover:-translate-y-1 focus:ring-mango-gold/30 active:translate-y-0',
    ghost: 'bg-transparent text-mango-gold hover:bg-mango-gold/10 hover:-translate-y-0.5 focus:ring-mango-gold/20',
    gradient: 'bg-gradient-to-r from-mango-sun to-mango-sunset text-white shadow-lg hover:shadow-2xl hover:scale-105 focus:ring-mango-sun/40 active:scale-100',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-base md:text-lg',
    xl: 'px-10 py-4 md:py-5 text-lg md:text-xl',
  };

  return (
    <button
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {icon && iconPosition === 'left' && <span className="flex-shrink-0">{icon}</span>}
      {children}
      {icon && iconPosition === 'right' && <span className="flex-shrink-0">{icon}</span>}
    </button>
  );
}