'use client';

import { ReactNode, HTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';
import { makeAccessibleButton } from '../../utils/accessibility';

export interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string | ReactNode;
  titleClassName?: string;
  subtitle?: string | ReactNode;
  subtitleClassName?: string;
  action?: ReactNode;
  variant?: 'default' | 'outlined' | 'elevated' | 'colorful' | 'accent';
  accentColor?: 'green' | 'indigo' | 'orange' | 'pink' | 'teal' | 'yellow' | 'purple';
  isClickable?: boolean;
  onClick?: () => void;
  fullWidth?: boolean;
  padding?: 'none' | 'small' | 'medium' | 'large';
  noDivider?: boolean;
  id?: string;
  style?: React.CSSProperties;
  'aria-label'?: string;
}

export function Card({
  children,
  className,
  title,
  titleClassName,
  subtitle,
  subtitleClassName,
  action,
  variant = 'default',
  accentColor = 'green',
  isClickable = false,
  onClick,
  fullWidth = true,
  padding = 'medium',
  noDivider = false,
  ...props
}: CardProps) {
  const variantStyles = {
    default: 'bg-white border border-gray-100',
    outlined: 'bg-white border border-gray-200',
    elevated: 'bg-white shadow-md border border-gray-50',
    colorful: `bg-gradient-to-br from-white to-gray-50 border border-gray-100`,
    accent: getAccentStyle(accentColor),
  };

  function getAccentStyle(color: CardProps['accentColor']) {
    const accentColors = {
      green: 'border-l-4 border-l-[#58CC02] border-t border-r border-b border-gray-100',
      indigo: 'border-l-4 border-l-[#4D38CA] border-t border-r border-b border-gray-100',
      orange: 'border-l-4 border-l-[#FF5800] border-t border-r border-b border-gray-100',
      pink: 'border-l-4 border-l-[#FF3F80] border-t border-r border-b border-gray-100',
      teal: 'border-l-4 border-l-[#00B8D8] border-t border-r border-b border-gray-100',
      yellow: 'border-l-4 border-l-[#FFC800] border-t border-r border-b border-gray-100',
      purple: 'border-l-4 border-l-[#AF52DE] border-t border-r border-b border-gray-100',
    };
    return accentColors[color as keyof typeof accentColors] || accentColors.green;
  }

  const paddingStyles = {
    none: 'p-0',
    small: 'p-3',
    medium: 'p-5',
    large: 'p-6',
  };

  const widthStyles = fullWidth ? 'w-full' : '';
  const clickableStyles = isClickable 
    ? 'hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer' 
    : '';
  
  // Apply accessibility attributes for clickable cards
  const accessibilityProps = isClickable && onClick ? makeAccessibleButton(onClick) : {};

  return (
    <div
      className={twMerge(
        'rounded-xl',
        variantStyles[variant],
        paddingStyles[padding],
        widthStyles,
        clickableStyles,
        className
      )}
      {...accessibilityProps}
      {...props}
    >
      {(title || action) && (
        <div className="flex justify-between items-start mb-4">
          <div>
            {title && typeof title === 'string' ? (
              <h3 className={twMerge('text-lg font-semibold text-gray-900', titleClassName)}>
                {title}
              </h3>
            ) : (
              title
            )}
            {subtitle && typeof subtitle === 'string' ? (
              <p className={twMerge('text-sm text-gray-500 mt-1', subtitleClassName)}>
                {subtitle}
              </p>
            ) : (
              subtitle
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      
      {title && !noDivider && <div className="border-b border-gray-100 -mx-5 mb-4" />}
      
      <div className={!title && !action ? '' : ''}>
        {children}
      </div>
    </div>
  );
}

export default Card; 