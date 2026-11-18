import React from 'react';

/**
 * Garis pemisah berinspirasikan ukiran awan larat tradisional Melayu.
 */
export const AwanLaratDivider: React.FC<{ className?: string; light?: boolean }> = ({
  className = '',
  light = false,
}) => {
  const strokeColor = light ? '#DFB95E' : '#C89B3C';
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`} aria-hidden="true">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#C89B3C]/45 to-[#C89B3C]/70" />
      <svg
        width="76"
        height="20"
        viewBox="0 0 76 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        <path
          d="M2 10C10 10 12 4 19 4C24 4 26 8 23 11C20 13.5 16 12 16 9.5"
          stroke={strokeColor}
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <path
          d="M74 10C66 10 64 4 57 4C52 4 50 8 53 11C56 13.5 60 12 60 9.5"
          stroke={strokeColor}
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <path
          d="M38 2L45 10L38 18L31 10L38 2Z"
          stroke={strokeColor}
          strokeWidth="1.4"
          fill={strokeColor}
          fillOpacity="0.18"
        />
        <circle cx="38" cy="10" r="2.2" fill={strokeColor} />
      </svg>
      <div className="h-px flex-1 bg-gradient-to-l from-transparent via-[#C89B3C]/45 to-[#C89B3C]/70" />
    </div>
  );
};

/**
 * Hiasan sudut motif bunga tanjung songket.
 */
export const SongketCornerOrnament: React.FC<{
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  className?: string;
}> = ({ position = 'top-left', className = '' }) => {
  const rotationMap = {
    'top-left': 'rotate-0',
    'top-right': 'rotate-90',
    'bottom-right': 'rotate-180',
    'bottom-left': '-rotate-90',
  };

  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={`pointer-events-none select-none ${rotationMap[position]} ${className}`}
    >
      <path d="M2 22V2H22" stroke="#C89B3C" strokeOpacity="0.55" strokeWidth="1.5" />
      <path d="M2 12L12 2" stroke="#C89B3C" strokeOpacity="0.4" strokeWidth="1.2" />
      <path
        d="M8 8L12 6L10 10L6 12L8 8Z"
        fill="#C89B3C"
        fillOpacity="0.45"
      />
    </svg>
  );
};
