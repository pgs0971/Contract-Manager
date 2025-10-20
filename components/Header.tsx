import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-bg-surface border-b border-border-base shadow-sm sticky top-0 z-10 no-print">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-text-heading">Reinsurance Contract Manager</h1>
          </div>
          <div className="flex items-center">
            {/* Placeholder for user actions */}
            <p className="text-sm text-text-muted">Welcome, User</p>
          </div>
        </div>
      </div>
    </header>
  );
};
