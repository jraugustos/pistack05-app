import * as React from 'react';
import { cn } from '@/lib/utils';

export interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
}

const CardBody = React.forwardRef<HTMLDivElement, CardBodyProps>(
  ({ children, className, padding = 'md' }, ref) => {
    const paddingClasses = {
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'flex-1 min-h-0',
          paddingClasses[padding],
          className
        )}
      >
        {children}
      </div>
    );
  }
);

CardBody.displayName = 'CardBody';

export { CardBody };


