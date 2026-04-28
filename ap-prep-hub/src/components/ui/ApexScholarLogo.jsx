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

  // <picture> serves WebP (~9 KB) to browsers that support it (≈97% of
  // global traffic per caniuse) and falls back to PNG (~89 KB) for older
  // ones. Saves ~80 KB on every cold load. The <img> remains the actual
  // rendered element, so existing className/style/alt attributes still
  // attach correctly.
  return (
    <div className={`flex items-center space-x-2 ${otherClasses}`}>
      <picture>
        <source srcSet="/Apex_Scholar_Logo_NoText.webp" type="image/webp" />
        <img
          src="/Apex_Scholar_Logo_NoText.png"
          alt="Apex Scholar Logo"
          className={`${logoSizeClasses} object-contain ${variant === 'favicon' ? 'rounded-lg' : ''}`}
          style={{
            filter: variant === 'dark' ? 'brightness(0.9)' : 'none',
            transition: 'all 0.2s ease-in-out',
          }}
        />
      </picture>
      {showText && (
        <span className="text-content-primary font-display font-semibold">
          Apex Scholar
        </span>
      )}
    </div>
  );
};

export default ApexScholarLogo;
