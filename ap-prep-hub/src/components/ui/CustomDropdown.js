import React, { useState, useRef, useEffect } from 'react';

/**
 * CustomDropdown - A reusable dropdown component with consistent styling
 * @param {Array} options - Array of objects with { value, label } structure
 * @param {string|null} value - Currently selected value
 * @param {Function} onChange - Callback function when option is selected
 * @param {string} placeholder - Placeholder text when no option selected
 * @param {string} className - Additional CSS classes
 * @param {boolean} disabled - Whether the dropdown is disabled
 */
const CustomDropdown = ({ 
  options, 
  value, 
  onChange, 
  placeholder = "Select an option", 
  className = "",
  disabled = false 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(
    value ? options.find(opt => opt.value === value) : null
  );
  const dropdownRef = useRef(null);

  // Update selected option when value prop changes
  useEffect(() => {
    setSelectedOption(value ? options.find(opt => opt.value === value) : null);
  }, [value, options]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (option) => {
    setSelectedOption(option);
    setIsOpen(false);
    if (onChange) {
      onChange(option.value);
    }
  };

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div 
      ref={dropdownRef}
      className={`relative inline-block w-full ${className}`}
    >
      <button
        type="button"
        className={`
          w-full px-4 py-3 bg-base-800 border border-border-strong rounded-lg
          text-left focus:outline-none focus:ring-2 focus:ring-content-muted
          focus:border-transparent transition-all duration-200 flex justify-between items-center
          ${disabled
            ? 'opacity-50 cursor-not-allowed bg-base-800/30'
            : 'hover:bg-base-750 cursor-pointer'
          }
          ${isOpen ? 'ring-2 ring-content-muted border-transparent' : ''}
        `}
        onClick={handleToggle}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={selectedOption ? 'text-content-primary' : 'text-content-muted'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg
          className={`
            w-5 h-5 transition-transform duration-200 text-content-muted
            ${isOpen ? 'transform rotate-180' : ''}
          `}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-base-800 border border-border rounded-lg shadow-floating max-h-60 overflow-y-auto">
          {options.length === 0 ? (
            <div className="px-4 py-3 text-content-muted text-sm">
              No options available
            </div>
          ) : (
            options.map((option, index) => (
              <button
                key={option.value || index}
                type="button"
                className={`
                  w-full px-4 py-3 text-left hover:bg-base-750 focus:bg-base-750
                  focus:outline-none transition-colors duration-150 text-content-primary
                  ${selectedOption?.value === option.value ? 'bg-base-750 text-content-muted' : ''}
                  ${index === options.length - 1 ? '' : 'border-b border-border-subtle'}
                `}
                onClick={() => handleSelect(option)}
                role="option"
                aria-selected={selectedOption?.value === option.value}
              >
                {option.label}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;
