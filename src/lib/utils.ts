import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// combines classnames with tailwind merge
export function classNames(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
} 