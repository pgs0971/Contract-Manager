import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  helperText?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, helperText, error, id, ...props }) => {
  const inputId = id || `input-${props.name}`;
  return (
    <div className="w-full">
      <label htmlFor={inputId} className="block text-sm font-medium text-text-base mb-1">
        {label}
      </label>
      <input
        id={inputId}
        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-brand-secondary focus:border-brand-secondary sm:text-sm bg-bg-surface text-text-base ${
          error ? 'border-danger' : 'border-border-input'
        }`}
        {...props}
      />
      {helperText && !error && <p className="mt-1 text-xs text-text-muted">{helperText}</p>}
      {error && <p className="mt-1 text-xs text-danger-text">{error}</p>}
    </div>
  );
};