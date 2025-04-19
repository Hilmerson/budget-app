'use client';

import { ReactNode, ButtonHTMLAttributes, forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';
import { classNames } from '@/lib/utils';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'success' | 'ghost';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  fullWidth?: boolean;
  className?: string;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    children, 
    variant = 'primary', 
    size = 'md', 
    isLoading = false, 
    iconLeft, 
    iconRight, 
    fullWidth = false,
    className,
    disabled,
    ...props 
  }, ref) => {
    // Base styles
    const baseStyles = "inline-flex items-center justify-center font-medium transition-colors rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2";
    
    // Vibrant Duolingo-inspired variant styles
    const variantStyles = {
      primary: "bg-gradient-to-r from-[#58CC02] to-[#40A002] text-white hover:from-[#40A002] hover:to-[#2C8000] focus:ring-[#58CC02] shadow-sm",
      secondary: "bg-gray-100 text-gray-800 hover:bg-gray-200 focus:ring-gray-400",
      outline: "bg-transparent text-[#58CC02] border border-[#58CC02] hover:bg-[#F1FAE9] focus:ring-[#58CC02]",
      danger: "bg-gradient-to-r from-[#FF3F80] to-[#E71D36] text-white hover:from-[#E71D36] hover:to-[#C31A30] focus:ring-[#FF3F80] shadow-sm",
      success: "bg-gradient-to-r from-[#58CC02] to-[#40A002] text-white hover:from-[#40A002] hover:to-[#2C8000] focus:ring-[#58CC02] shadow-sm",
      ghost: "bg-transparent text-gray-600 hover:bg-gray-100 focus:ring-gray-400",
    };
    
    // Size styles with improved padding for better touch targets
    const sizeStyles = {
      xs: "text-xs px-2.5 py-1.5 rounded-md",
      sm: "text-sm px-3.5 py-2 rounded-md",
      md: "text-sm px-5 py-2.5 rounded-lg",
      lg: "text-base px-6 py-3.5 rounded-lg font-semibold",
    };
    
    // Disabled styles override
    const disabledStyles = disabled || isLoading 
      ? "opacity-60 cursor-not-allowed pointer-events-none" 
      : "";
    
    // Full width style
    const widthStyle = fullWidth ? "w-full" : "";
    
    // Merge the variant and size classes with any additional className
    const buttonClasses = classNames(
      'inline-flex items-center justify-center font-medium focus:outline-none',
      'transition-all duration-200 ease-in-out',
      'cursor-pointer', // Add cursor-pointer to all buttons
      variantStyles[variant],
      sizeStyles[size],
      {
        'opacity-50 cursor-not-allowed': disabled,
      },
      className
    );
    
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={twMerge(
          baseStyles,
          buttonClasses,
          widthStyle,
          disabledStyles
        )}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        
        {!isLoading && iconLeft && <span className="mr-2">{iconLeft}</span>}
        {children}
        {!isLoading && iconRight && <span className="ml-2">{iconRight}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button; 