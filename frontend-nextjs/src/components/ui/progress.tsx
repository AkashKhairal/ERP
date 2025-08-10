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
          return 'bg-red-500';
        case 'warning':
          return 'bg-yellow-500';
        case 'success':
          return 'bg-green-500';
        default:
          return 'bg-primary';
      }
    };

    const getBackgroundClasses = () => {
      switch (variant) {
        case 'destructive':
          return 'bg-red-100';
        case 'warning':
          return 'bg-yellow-100';
        case 'success':
          return 'bg-green-100';
        default:
          return 'bg-secondary';
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          'relative h-4 w-full overflow-hidden rounded-full',
          getBackgroundClasses(),
          className
        )}
        {...props}
      >
        <div
          className={cn(
            'h-full w-full flex-1 transition-all duration-300 ease-in-out',
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