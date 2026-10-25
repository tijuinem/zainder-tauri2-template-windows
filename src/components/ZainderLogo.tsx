import React, { useState } from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  subtitleText?: string;
  brandName?: string;
  subtitleBelowAll?: boolean;
  light?: boolean;
}

export const ZainderLogo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showSubtitle = false,
  subtitleText = 'APLICACIÓN DE ESCRITORIO',
  brandName = 'ZAINDER',
  subtitleBelowAll = false,
  light = false
}) => {
  const [zImgError, setZImgError] = useState(false);
  const [textImgError, setTextImgError] = useState(false);

  // Emblem "Z" dimensions preserved (sm: 32px, md: 40px, lg: 64px, xl: 104px)
  const iconDimensions = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-26 h-26'
  }[size];

  // Letters sizes
  const textSizes = {
    sm: 'text-[16px] tracking-widest',
    md: 'text-[21.5px] tracking-widest',
    lg: 'text-[32.5px] tracking-widest',
    xl: 'text-[54px] tracking-widest'
  }[size];

  const primaryColor = light ? '#ffffff' : '#002a5b';
  const cyanColor = '#25b0ae';
  const gradId = light ? 'zainderZGradLight' : 'zainderZGradDark';

  const zImgSrc = '/logo-z.png';

  const renderZMark = () => {
    if (!zImgError) {
      return (
        <img
          src={zImgSrc}
          alt={`${brandName} Emblem`}
          className={`${iconDimensions} shrink-0 object-contain transition-transform`}
          onError={() => setZImgError(true)}
        />
      );
    }

    return (
      <svg
        className={`${iconDimensions} shrink-0 transition-transform`}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label={`${brandName} Emblem`}
      >
        <defs>
          <linearGradient id={gradId} x1="10%" y1="10%" x2="90%" y2="90%">
            <stop offset="0%" stopColor={light ? '#38bdf8' : '#002a5b'} />
            <stop offset="55%" stopColor={light ? '#25b0ae' : '#126892'} />
            <stop offset="100%" stopColor={light ? '#5eead4' : '#25b0ae'} />
          </linearGradient>
        </defs>

        {/* Dynamic upper horizontal arm and sharp diagonal */}
        <path
          d="M 18 20 L 80 20 C 85 20 88 24 84 29 L 40 76 L 82 76 C 85 76 87 78 87 81 C 87 84 85 86 82 86 L 18 86 C 13 86 10 81 14 76 L 58 28 L 20 28 C 16 28 15 25 17 21 C 17.5 20.3 18.2 20 18 20 Z"
          fill={`url(#${gradId})`}
        />

        {/* Modern layered aerodynamic curves & book pages on bottom-right tail */}
        <path
          d="M 52 70 C 65 67 76 69 88 65 C 80 69 70 72 56 73 Z"
          fill={cyanColor}
          opacity="0.9"
        />
        <path
          d="M 57 76 C 68 73 80 75 92 71 C 84 75 73 78 61 79 Z"
          fill={light ? '#2dd4bf' : '#17808f'}
        />
        <path
          d="M 64 82 C 73 80 83 81 94 78 C 87 82 78 84 67 85 Z"
          fill={light ? '#38bdf8' : '#002a5b'}
          opacity="0.8"
        />

        {/* Dynamic speed dash at the top */}
        <rect x="22" y="14" width="22" height="2.5" rx="1.25" fill="#25b0ae" opacity="0.85" />
        <rect x="52" y="14" width="14" height="2.5" rx="1.25" fill={light ? '#e0f2fe' : '#002a5b'} opacity="0.6" />
      </svg>
    );
  };

  const renderLetters = () => {
    return (
      <span
        className={`font-black tracking-[0.22em] select-none uppercase transition-colors ${textSizes}`}
        style={{ color: primaryColor }}
      >
        {brandName}
      </span>
    );
  };

  if (subtitleBelowAll) {
    return (
      <div className={`flex flex-col items-start gap-1.5 select-none ${className}`}>
        {/* Horizontal row: Z Mark + letters */}
        <div className="flex items-center gap-3">
          {renderZMark()}
          {renderLetters()}
        </div>

        {/* Subtitle positioned directly below the mark and the letters */}
        {showSubtitle && (
          <span
            className="text-[10.5px] sm:text-xs font-bold uppercase tracking-wider text-[#25b0ae] pl-0.5 mt-0.5 leading-snug"
          >
            {subtitleText}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {renderZMark()}

      <div className="flex flex-col justify-center">
        {renderLetters()}

        {showSubtitle && (
          <span
            className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider -mt-0.5"
            style={{ color: light ? '#99f6e4' : cyanColor }}
          >
            {subtitleText}
          </span>
        )}
      </div>
    </div>
  );
};

export const ZeltaviaLogo = ZainderLogo;
