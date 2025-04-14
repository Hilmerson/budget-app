'use client';

import { forwardRef, InputHTMLAttributes, ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  className?: string;
  inputClassName?: string;
  containerClassName?: string;
  fullWidth?: boolean;
  hideLabel?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    label, 
    helperText, 
    error, 
    startIcon, 
    endIcon, 
    className, 
    inputClassName,
    containerClassName,
    fullWidth = true,
    hideLabel = false,
    id,
    required,
    disabled,
    ...props 
  }, ref) => {
    const uniqueId = id || `input-${Math.random().toString(36).substring(2, 9)}`;
    
    // Base container styles
    const containerStyles = fullWidth ? 'w-full' : '';
    
    // Base input styles
    const baseInputStyles = "block w-full rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors";
    
    // Icon padding adjustments
    const paddingStyles = startIcon ? "pl-10" : "pl-4";
    const rightPaddingStyles = endIcon ? "pr-10" : "pr-4";
    
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
          
          <input
            ref={ref}
            id={uniqueId}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={error ? `${uniqueId}-error` : helperText ? `${uniqueId}-helper` : undefined}
            disabled={disabled}
            required={required}
            className={twMerge(
              baseInputStyles,
              paddingStyles,
              rightPaddingStyles,
              "py-3",
              stateStyles,
              inputClassName
            )}
            {...props}
          />
          
          {endIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              {endIcon}
            </div>
          )}
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

Input.displayName = 'Input';

export default Input; 