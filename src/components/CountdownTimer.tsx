import { useCountdown } from '@/hooks/use-countdown';
import { cn } from '@/lib/utils';

interface CountdownTimerProps {
  endTime: Date;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function CountdownTimer({ endTime, className, size = 'md' }: CountdownTimerProps) {
  const { days, hours, minutes, seconds, total } = useCountdown(endTime);
  
  const isUrgent = total < 3600000; // Less than 1 hour
  const isEnded = total <= 0;

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  if (isEnded) {
    return (
      <div className={cn(
        'font-medium text-destructive',
        sizeClasses[size],
        className
      )}>
        Auction Ended
      </div>
    );
  }

  return (
    <div className={cn(
      'font-medium flex items-center gap-1',
      isUrgent ? 'text-accent animate-pulse' : 'text-foreground',
      sizeClasses[size],
      className
    )}>
      {days > 0 && (
        <>
          <span className="tabular-nums">{days}d</span>
          <span className="text-muted-foreground">:</span>
        </>
      )}
      <span className="tabular-nums">{hours.toString().padStart(2, '0')}h</span>
      <span className="text-muted-foreground">:</span>
      <span className="tabular-nums">{minutes.toString().padStart(2, '0')}m</span>
      <span className="text-muted-foreground">:</span>
      <span className="tabular-nums">{seconds.toString().padStart(2, '0')}s</span>
    </div>
  );
}