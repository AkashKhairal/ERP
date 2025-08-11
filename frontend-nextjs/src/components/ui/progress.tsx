'use client';

import * as React from 'react';
import { cn } from '../../lib/utils';

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  variant?: 'default' | 'destructive' | 'warning' | 'success';
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, variant = 'default', ...props }, ref) => {
    const getVariantClasses = () => {
      switch (variant) {
        case 'destructive':
          return 'bg-gradient-to-r from-red-400 to-red-500';
        case 'warning':
          return 'bg-gradient-to-r from-yellow-400 to-orange-500';
        case 'success':
          return 'bg-gradient-to-r from-green-400 to-green-500';
        default:
          return 'bg-gradient-to-r from-yellow-400 to-orange-500';
      }
    };

    const getBackgroundClasses = () => {
      switch (variant) {
        case 'destructive':
          return 'bg-red-200';
        case 'warning':
          return 'bg-orange-200';
        case 'success':
          return 'bg-green-200';
        default:
          return 'bg-gray-200';
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          'relative h-2 w-full overflow-hidden rounded-full',
          getBackgroundClasses(),
          className
        )}
        {...props}
      >
        <div
          className={cn(
            'h-2 rounded-full transition-all duration-300 ease-out',
            getVariantClasses()
          )}
          style={{
            transform: `translateX(-${100 - Math.min(100, Math.max(0, value))}%)`,
          }}
        />
      </div>
    );
  }
);

Progress.displayName = 'Progress';

export { Progress };