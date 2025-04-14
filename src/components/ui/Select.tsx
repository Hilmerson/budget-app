'use client';

import { forwardRef, SelectHTMLAttributes, ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  helperText?: string;
  error?: string;
  options: SelectOption[];
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  className?: string;
  selectClassName?: string;
  containerClassName?: string;
  fullWidth?: boolean;
  hideLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ 
    label, 
    helperText, 
    error, 
    options, 
    startIcon, 
    endIcon, 
    className, 
    selectClassName,
    containerClassName,
    fullWidth = true,
    hideLabel = false,
    size = 'md',
    id,
    required,
    disabled,
    ...props 
  }, ref) => {
    const uniqueId = id || `select-${Math.random().toString(36).substring(2, 9)}`;
    
    // Base container styles
    const containerStyles = fullWidth ? 'w-full' : '';
    
    // Base select styles
    const baseSelectStyles = "block w-full rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors appearance-none";
    
    // Icon padding adjustments
    const paddingStyles = startIcon ? "pl-10" : "pl-4";
    const rightPaddingStyles = "pr-10"; // Always need space for the dropdown arrow
    
    // Size styles
    const sizeStyles = {
      sm: "py-2 text-sm",
      md: "py-3",
      lg: "py-4 text-lg"
    };
    
    // Disabled and error state styles
    const stateStyles = disabled 
      ? "bg-gray-100 cursor-not-allowed opacity-75" 
      : error 
        ? "border-red-500 focus:ring-red-500 focus:border-red-500" 
        : "";
    
    return (
      <div className={twMerge('mb-4', containerStyles, containerClassName)}>
        {label && !hideLabel && (
          <label 
            htmlFor={uniqueId} 
            className={`block text-sm font-medium mb-1 ${error ? 'text-red-600' : 'text-gray-700'}`}
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <div className="relative w-full">
          {startIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {startIcon}
            </div>
          )}
          
          <select
            ref={ref}
            id={uniqueId}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={error ? `${uniqueId}-error` : helperText ? `${uniqueId}-helper` : undefined}
            disabled={disabled}
            required={required}
            className={twMerge(
              baseSelectStyles,
              paddingStyles,
              rightPaddingStyles,
              sizeStyles[size],
              stateStyles,
              selectClassName
            )}
            {...props}
          >
            {options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          
          {/* Custom dropdown arrow */}
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        
        {error && (
          <p id={`${uniqueId}-error`} className="mt-1 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        
        {helperText && !error && (
          <p id={`${uniqueId}-helper`} className="mt-1 text-sm text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select; 