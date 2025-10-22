import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Logo({ className = '', size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'h-16',
    md: 'h-20', 
    lg: 'h-24',
    xl: 'h-32'
  };

  const textSizes = {
    sm: { main: 'text-lg', sub: 'text-xs', line: 'w-16' },
    md: { main: 'text-xl', sub: 'text-sm', line: 'w-20' },
    lg: { main: 'text-2xl', sub: 'text-base', line: 'w-24' },
    xl: { main: 'text-3xl', sub: 'text-lg', line: 'w-32' }
  };

  const currentSize = textSizes[size];

  return (
    <div className={`flex flex-col items-center justify-center ${sizeClasses[size]} ${className}`}>
      {/* Nome principal */}
      <div className={`font-bold text-gray-800 ${currentSize.main} tracking-wide`}>
        EMERSON REIS
      </div>
      
      {/* Linha cinza - alinhada com o texto abaixo */}
      <div className={`h-0.5 bg-gradient-to-r from-gray-600 to-gray-800 ${currentSize.line} mt-1`}></div>
      
      {/* Texto secundário */}
      <div className={`font-medium text-gray-700 ${currentSize.sub} mt-1 tracking-wide`}>
        ADVOGADO
      </div>
    </div>
  );
}
