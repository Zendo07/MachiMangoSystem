import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  className?: string;
}

export default function Badge({
  children,
  variant = 'primary',
  className = '',
}: BadgeProps) {
  const baseStyles =
    'inline-block px-5 py-3 rounded-full font-heading font-bold text-sm shadow-md';

  const variantStyles = {
    primary:
      'bg-gradient-to-br from-primaryYellow to-sunYellow text-darkBg border-3 border-darkBg',
    secondary:
      'bg-brownDark/20 text-darkBg border-2 border-darkBg tracking-wider',
  };

  const classes = `${baseStyles} ${variantStyles[variant]} ${className}`;

  return <span className={classes}>{children}</span>;
}
