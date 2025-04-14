/**
 * Handles keyboard events for interactive elements to ensure accessibility
 * 
 * @param event - The keyboard event
 * @param callback - The function to call when Enter or Space is pressed
 */
export const handleKeyboardEvent = (
  event: React.KeyboardEvent<HTMLElement>,
  callback: () => void
) => {
  // Support Enter and Space keys for interactive elements
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    callback();
  }
};

/**
 * Makes a div or other non-interactive element accessible as a button
 * 
 * @param callback - The click handler function
 * @returns Props to spread onto the element
 */
export const makeAccessibleButton = (callback: () => void) => {
  return {
    role: 'button',
    tabIndex: 0,
    onClick: callback,
    onKeyDown: (event: React.KeyboardEvent<HTMLElement>) => 
      handleKeyboardEvent(event, callback),
    'aria-pressed': undefined,
  };
};

/**
 * Provides accessible props for toggling elements like checkboxes
 * 
 * @param isSelected - Whether the element is currently selected
 * @param callback - The toggle handler function
 * @returns Props to spread onto the element
 */
export const makeAccessibleToggle = (isSelected: boolean, callback: () => void) => {
  return {
    role: 'switch',
    tabIndex: 0,
    'aria-checked': isSelected,
    onClick: callback,
    onKeyDown: (event: React.KeyboardEvent<HTMLElement>) => 
      handleKeyboardEvent(event, callback),
  };
};

/**
 * Generates a unique ID for linking form elements to their labels
 * 
 * @param prefix - Optional prefix for the ID
 * @returns A unique ID string
 */
export const generateUniqueId = (prefix: string = 'element'): string => {
  return `${prefix}-${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Focus trap for modals and other popups
 * 
 * @param containerRef - Ref to the container element 
 * @param isActive - Whether the focus trap is active
 */
export const useFocusTrap = (
  containerRef: React.RefObject<HTMLElement>,
  isActive: boolean = true
) => {
  // Implementation would go here - typically using useEffect
  // to trap focus when active and restore it when not
};

export default {
  handleKeyboardEvent,
  makeAccessibleButton,
  makeAccessibleToggle,
  generateUniqueId,
  useFocusTrap,
}; 