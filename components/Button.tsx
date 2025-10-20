import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'icon';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', size = 'md', className = '', ...props }) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200';

  const variantClasses = {
    primary: 'bg-brand-secondary text-text-inverted hover:bg-brand-primary focus:ring-brand-secondary',
    secondary: 'bg-bg-muted text-text-base hover:bg-bg-hover focus:ring-gray-400 border border-border-input',
    danger: 'bg-danger text-text-inverted hover:opacity-90 focus:ring-danger',
    icon: 'text-text-muted hover:bg-bg-muted hover:text-text-base focus:ring-brand-secondary',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const finalClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  return (
    <button className={finalClasses} {...props}>
      {children}
    </button>
  );
};