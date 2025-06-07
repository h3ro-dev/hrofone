import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helpText, leftIcon, rightIcon, className = '', ...props }, ref) => {
    const baseClasses = 'block w-full px-3 py-2.5 text-gray-900 border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors';
    const normalClasses = 'border-gray-300 focus:ring-primary-500 focus:border-primary-500';
    const errorClasses = 'border-error-DEFAULT focus:ring-error-DEFAULT focus:border-error-DEFAULT bg-red-50';
    const disabledClasses = 'disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-75';
    const iconPaddingClasses = leftIcon ? 'pl-10' : rightIcon ? 'pr-10' : '';
    
    const inputClasses = `${baseClasses} ${error ? errorClasses : normalClasses} ${disabledClasses} ${iconPaddingClasses} ${className}`;
    
    return (
      <div>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={inputClasses}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1 text-sm text-error-DEFAULT">{error}</p>
        )}
        {helpText && !error && (
          <p className="mt-1 text-sm text-gray-600">{helpText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input'; 