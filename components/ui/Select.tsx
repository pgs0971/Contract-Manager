import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  children: React.ReactNode;
  helperText?: string;
}

export const Select: React.FC<SelectProps> = ({ label, helperText, id, children, ...props }) => {
    const selectId = id || `select-${props.name}`;
  return (
    <div className="w-full">
      <label htmlFor={selectId} className="block text-sm font-medium text-text-base mb-1">
        {label}
      </label>
      <select
        id={selectId}
        className="w-full px-3 py-2 border border-border-input bg-bg-surface text-text-base rounded-md shadow-sm focus:ring-brand-secondary focus:border-brand-secondary sm:text-sm"
        {...props}
      >
          {children}
      </select>
      {helperText && <p className="mt-1 text-xs text-text-muted">{helperText}</p>}
    </div>
  );
};