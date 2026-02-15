import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  href?: string;
  icon?: React.ReactNode;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  href,
  icon,
  className = '',
  type = 'button',
  disabled = false,
}: ButtonProps) {
  const baseStyles =
    'font-bold rounded-full transition-all duration-300 inline-flex items-center justify-center gap-2 border-3 font-body';

  const variantStyles = {
    primary:
      'bg-gradient-to-br from-primaryYellow to-sunYellow text-darkBg border-darkBg shadow-lg hover:shadow-xl hover:-translate-y-1',
    secondary:
      'bg-gradient-to-br from-primaryGreen to-green-600 text-white border-darkGreen shadow-lg hover:shadow-xl hover:-translate-y-1',
    outline:
      'bg-transparent text-darkBg border-darkBg hover:bg-darkBg hover:text-white',
  };

  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-10 py-4 text-lg',
  };

  const classes = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`;

  if (href) {
    return (
      <a href={href} className={classes}>
        {icon && <span>{icon}</span>}
        {children}
      </a>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      className={classes}
      disabled={disabled}
    >
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
}
