import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const LoadingSpinner = ({ size = 'md', className }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-muted border-t-primary',
        sizeClasses[size],
        className
      )}
    />
  );
};

interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const LoadingState = ({ 
  message = 'Loading...', 
  size = 'lg',
  className 
}: LoadingStateProps) => {
  return (
    <div className={cn('flex flex-col items-center justify-center space-y-4 p-8', className)}>
      <LoadingSpinner size={size} />
      <p className=\"text-muted-foreground text-center\">{message}</p>
    </div>
  );
};

interface PageLoadingProps {
  message?: string;
}

export const PageLoading = ({ message = 'Loading AuctionHub...' }: PageLoadingProps) => {
  return (
    <div className=\"fixed inset-0 bg-background flex items-center justify-center z-50\">
      <div className=\"text-center space-y-6\">
        {/* Logo placeholder with animation */}
        <div className=\"w-16 h-16 mx-auto relative\">
          <div className=\"absolute inset-0 bg-primary/20 rounded-full animate-ping\" />
          <div className=\"absolute inset-2 bg-primary/40 rounded-full animate-ping animation-delay-150\" />
          <div className=\"absolute inset-4 bg-primary rounded-full\" />
        </div>
        
        <div className=\"space-y-2\">
          <h2 className=\"text-xl font-semibold\">AuctionHub</h2>
          <p className=\"text-muted-foreground\">{message}</p>
        </div>
        
        <LoadingSpinner size=\"lg\" />
      </div>
    </div>
  );
};

interface SkeletonProps {
  className?: string;
}

export const Skeleton = ({ className }: SkeletonProps) => {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-muted',
        className
      )}
    />
  );
};

export const AuctionCardSkeleton = () => {
  return (
    <div className=\"bg-card border rounded-lg p-4 space-y-4\">
      <Skeleton className=\"h-48 w-full\" />
      <div className=\"space-y-2\">
        <Skeleton className=\"h-4 w-3/4\" />
        <Skeleton className=\"h-4 w-1/2\" />
      </div>
      <div className=\"flex justify-between items-center\">
        <Skeleton className=\"h-6 w-20\" />
        <Skeleton className=\"h-8 w-24\" />
      </div>
    </div>
  );
};

export const ProfileSkeleton = () => {
  return (
    <div className=\"space-y-6\">
      <div className=\"flex items-center space-x-4\">
        <Skeleton className=\"h-16 w-16 rounded-full\" />
        <div className=\"space-y-2\">
          <Skeleton className=\"h-4 w-32\" />
          <Skeleton className=\"h-4 w-24\" />
        </div>
      </div>
      
      <div className=\"space-y-4\">
        <Skeleton className=\"h-10 w-full\" />
        <Skeleton className=\"h-10 w-full\" />
        <Skeleton className=\"h-10 w-full\" />
      </div>
    </div>
  );
};