import React from 'react';
import { Loader2 } from 'lucide-react';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  className = 'text-blue-600',
  label,
}) => {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-2" role="status">
      <Loader2 className={`${sizeMap[size]} animate-spin ${className}`} />
      {label && <span className="text-xs text-slate-500 font-medium">{label}</span>}
      <span className="sr-only">Loading...</span>
    </div>
  );
};
