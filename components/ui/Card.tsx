import React from 'react';

interface CardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ title, children, className = '' }) => {
  return (
    <div className={`bg-bg-surface rounded-lg shadow-md border border-border-base ${className}`}>
      <div className="p-4 border-b border-border-base">
        <h3 className="text-lg font-semibold text-text-heading">{title}</h3>
      </div>
      <div className="p-4 md:p-6">
        {children}
      </div>
    </div>
  );
};