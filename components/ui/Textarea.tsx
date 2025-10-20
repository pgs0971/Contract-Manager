import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  helperText?: string;
}

export const Textarea: React.FC<TextareaProps> = ({ label, helperText, id, ...props }) => {
    const textareaId = id || `textarea-${props.name}`;
  return (
    <div className="w-full">
      <label htmlFor={textareaId} className="block text-sm font-medium text-text-base mb-1">
        {label}
      </label>
      <textarea
        id={textareaId}
        rows={4}
        className="w-full px-3 py-2 border border-border-input bg-bg-surface text-text-base rounded-md shadow-sm focus:ring-brand-secondary focus:border-brand-secondary sm:text-sm"
        {...props}
      ></textarea>
      {helperText && <p className="mt-1 text-xs text-text-muted">{helperText}</p>}
    </div>
  );
};