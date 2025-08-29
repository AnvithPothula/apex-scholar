import React from 'react';

/**
 * Apex Scholar Logo Component
 * Provides consistent logo display across the application
 */
const ApexScholarLogo = ({ 
  size = 'md', 
  className = '', 
  showText = false,
  variant = 'default' 
}) => {
  // Size configurations
  const sizeConfig = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6', 
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
    '2xl': 'w-24 h-24'
  };

  // Get size classes - use className if provided, otherwise use size config
  const logoSizeClasses = className.includes('w-') && className.includes('h-') 
    ? className.split(' ').filter(cls => cls.startsWith('w-') || cls.startsWith('h-')).join(' ')
    : (typeof size === 'string' ? sizeConfig[size] || sizeConfig.md : size);

  // Filter out size classes from className to avoid conflicts
  const otherClasses = className.split(' ').filter(cls => !cls.startsWith('w-') && !cls.startsWith('h-')).join(' ');

  return (
    <div className={`flex items-center space-x-2 ${otherClasses}`}>
      <img 
        src="/Apex_Scholar_Logo_NoText.png" 
        alt="Apex Scholar Logo" 
        className={`${logoSizeClasses} object-contain ${variant === 'favicon' ? 'rounded-lg' : ''}`}
        style={{ 
          filter: variant === 'dark' ? 'brightness(0.9)' : 'none',
          transition: 'all 0.2s ease-in-out'
        }}
      />
      {showText && (
        <span className="font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Apex Scholar
        </span>
      )}
    </div>
  );
};

export default ApexScholarLogo;
