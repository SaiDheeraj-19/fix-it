
import React from 'react';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = "h-full w-auto" }) => {
  return (
    <svg 
      viewBox="0 0 512 512" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
    >
      {/* Outer Black Bracket */}
      <path 
        d="M145 70 H442 V367" 
        stroke="white" 
        strokeWidth="75" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        className="stroke-white" 
      />
      {/* Inner Red Bracket */}
      <path 
        d="M145 185 H327 V367" 
        stroke="#FF0000" 
        strokeWidth="75" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      {/* Accent Square */}
      <rect x="145" y="420" width="45" height="45" fill="white" className="fill-white" />
    </svg>
  );
};

export default Logo;
