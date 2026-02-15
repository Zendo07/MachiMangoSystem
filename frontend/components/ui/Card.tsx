import React from 'react';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'feature' | 'benefit';
  className?: string;
  onClick?: () => void;
}

export default function Card({
  children,
  variant = 'default',
  className = '',
  onClick,
}: CardProps) {
  const baseStyles =
    'rounded-2xl p-6 transition-all duration-300 cursor-pointer';

  const variantStyles = {
    default: 'bg-white shadow-md hover:shadow-lg hover:-translate-y-1',
    feature:
      'bg-gradient-to-br from-primaryYellow to-primaryOrange border-3 border-brownDark/30 shadow-lg hover:shadow-xl hover:-translate-y-2 hover:rotate-[-1deg]',
    benefit: 'bg-white text-center shadow-lg hover:scale-105',
  };

  const classes = `${baseStyles} ${variantStyles[variant]} ${className}`;

  return (
    <div className={classes} onClick={onClick}>
      {children}
    </div>
  );
}
