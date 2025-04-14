import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { 
  handleKeyboardEvent, 
  makeAccessibleButton, 
  makeAccessibleToggle,
  generateUniqueId
} from '../accessibility';

// Mock keyboard events
const createKeyboardEvent = (key: string) => {
  return {
    key,
    preventDefault: jest.fn()
  } as unknown as React.KeyboardEvent<HTMLElement>;
};

describe('Accessibility Utilities', () => {
  describe('handleKeyboardEvent', () => {
    it('calls callback when Enter key is pressed', () => {
      const mockCallback = jest.fn();
      const event = createKeyboardEvent('Enter');
      
      handleKeyboardEvent(event, mockCallback);
      
      expect(event.preventDefault).toHaveBeenCalled();
      expect(mockCallback).toHaveBeenCalled();
    });
    
    it('calls callback when Space key is pressed', () => {
      const mockCallback = jest.fn();
      const event = createKeyboardEvent(' ');
      
      handleKeyboardEvent(event, mockCallback);
      
      expect(event.preventDefault).toHaveBeenCalled();
      expect(mockCallback).toHaveBeenCalled();
    });
    
    it('does not call callback for other keys', () => {
      const mockCallback = jest.fn();
      const event = createKeyboardEvent('Tab');
      
      handleKeyboardEvent(event, mockCallback);
      
      expect(event.preventDefault).not.toHaveBeenCalled();
      expect(mockCallback).not.toHaveBeenCalled();
    });
  });

  describe('makeAccessibleButton', () => {
    it('returns correct accessible props', () => {
      const mockCallback = jest.fn();
      const props = makeAccessibleButton(mockCallback);
      
      expect(props.role).toBe('button');
      expect(props.tabIndex).toBe(0);
      expect(props.onClick).toBe(mockCallback);
      expect(props['aria-pressed']).toBeUndefined();
    });
    
    it('when used with a div, makes it keyboard accessible', () => {
      const mockCallback = jest.fn();
      
      const TestComponent = () => {
        return (
          <div data-testid="accessible-div" {...makeAccessibleButton(mockCallback)}>
            Click me
          </div>
        );
      };
      
      render(<TestComponent />);
      const div = screen.getByTestId('accessible-div');
      
      // Test click
      fireEvent.click(div);
      expect(mockCallback).toHaveBeenCalledTimes(1);
      
      // Test keyboard
      fireEvent.keyDown(div, { key: 'Enter' });
      expect(mockCallback).toHaveBeenCalledTimes(2);
      
      fireEvent.keyDown(div, { key: ' ' });
      expect(mockCallback).toHaveBeenCalledTimes(3);
    });
  });

  describe('makeAccessibleToggle', () => {
    it('returns correct accessible props for selected state', () => {
      const mockCallback = jest.fn();
      const props = makeAccessibleToggle(true, mockCallback);
      
      expect(props.role).toBe('switch');
      expect(props.tabIndex).toBe(0);
      expect(props['aria-checked']).toBe(true);
      expect(props.onClick).toBe(mockCallback);
    });
    
    it('returns correct accessible props for unselected state', () => {
      const mockCallback = jest.fn();
      const props = makeAccessibleToggle(false, mockCallback);
      
      expect(props['aria-checked']).toBe(false);
    });
  });

  describe('generateUniqueId', () => {
    it('generates unique IDs', () => {
      const id1 = generateUniqueId();
      const id2 = generateUniqueId();
      
      expect(id1).not.toBe(id2);
    });
    
    it('uses provided prefix', () => {
      const id = generateUniqueId('test');
      
      expect(id).toMatch(/^test-/);
    });
  });
}); 