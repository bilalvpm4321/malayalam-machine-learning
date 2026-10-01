import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  inline?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  label = 'Processing...',
  size = 'md',
  inline = false,
}) => {
  const sizeMap = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-8 w-8',
  };

  const content = (
    <div className={`flex items-center gap-2.5 ${inline ? 'inline-flex' : 'flex-col justify-center py-6'}`}>
      <Loader2 className={`${sizeMap[size]} animate-spin text-indigo-600 dark:text-indigo-400`} />
      {label && (
        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
          {label}
        </span>
      )}
    </div>
  );

  return content;
};
