import React from 'react';

interface ESGReportLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'horizontal' | 'icon' | 'stacked';
  theme?: 'light' | 'dark';
  className?: string;
}

export const ESGReportLogo: React.FC<ESGReportLogoProps> = ({
  size = 'md',
  variant = 'horizontal',
  theme = 'light',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'h-10',
    md: 'h-14',
    lg: 'h-20',
    xl: 'h-28'
  };

  if (variant === 'icon') {
    return (
      <img
        src="/esgreport_icon.png"
        alt="ESGReport"
        className={`${sizeClasses[size]} w-auto ${className}`}
      />
    );
  }

  const logoSrc = theme === 'dark' ? '/esgreport_logo-dark-back.png' : '/esgreport_logo-light-back.png';

  return (
    <img
      src={logoSrc}
      alt="ESGReport - Sustainability Reporting Platform"
      className={`${sizeClasses[size]} w-auto ${className}`}
    />
  );
};

export default ESGReportLogo;
