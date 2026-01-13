import { Badge } from '@/components/ui/badge';
import { CLAIM_STATUS_CONFIG, type ClaimStatusKey } from '@/lib/constants';
import type { ClaimStatus } from '@/types/billing';
import { cn } from '@/lib/utils';

interface ClaimStatusBadgeProps {
  status: ClaimStatus | ClaimStatusKey;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
  className?: string;
}

export function ClaimStatusBadge({
  status,
  size = 'md',
  showDot = true,
  className,
}: ClaimStatusBadgeProps) {
  const config = CLAIM_STATUS_CONFIG[status as ClaimStatusKey];

  if (!config) {
    return (
      <Badge variant="outline" className={className}>
        Unknown
      </Badge>
    );
  }

  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0',
    md: 'text-xs px-2.5 py-0.5',
    lg: 'text-sm px-3 py-1',
  };

  const dotSizeClasses = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  };

  return (
    <Badge
      className={cn(
        'border-transparent font-medium',
        config.bgColor,
        config.textColor,
        sizeClasses[size],
        className
      )}
    >
      {showDot && (
        <span
          className={cn('rounded-full mr-1.5', dotSizeClasses[size])}
          style={{ backgroundColor: config.color }}
        />
      )}
      {config.label}
    </Badge>
  );
}

// Simplified version for calendar dots
interface BillingStatusDotProps {
  status?: ClaimStatus | ClaimStatusKey | null;
  className?: string;
}

export function BillingStatusDot({ status, className }: BillingStatusDotProps) {
  // If no status, show unbilled (yellow)
  if (!status) {
    return (
      <span
        className={cn('w-2 h-2 rounded-full bg-yellow-500', className)}
        title="Unbilled"
      />
    );
  }

  const config = CLAIM_STATUS_CONFIG[status as ClaimStatusKey];
  if (!config) {
    return (
      <span
        className={cn('w-2 h-2 rounded-full bg-gray-400', className)}
        title="Unknown"
      />
    );
  }

  return (
    <span
      className={cn('w-2 h-2 rounded-full', className)}
      style={{ backgroundColor: config.color }}
      title={config.label}
    />
  );
}

export default ClaimStatusBadge;
