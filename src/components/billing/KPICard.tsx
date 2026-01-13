import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: number;           // Percentage change (positive = good for most metrics)
  trendLabel?: string;      // e.g., "vs last month"
  invertTrend?: boolean;    // If true, negative is good (e.g., AR days)
  icon?: React.ReactNode;
  iconColor?: string;
  className?: string;
}

const formatTrend = (trend: number, isInverted: boolean): string => {
  const absValue = Math.abs(trend);
  if (absValue < 0.1) return '0%';
  return `${absValue.toFixed(1)}%`;
};

export const KPICard = ({
  title,
  value,
  subtitle,
  trend,
  trendLabel,
  invertTrend = false,
  icon,
  iconColor,
  className,
}: KPICardProps) => {
  // Determine if trend is positive (good) or negative (bad)
  const hasTrend = trend !== undefined && trend !== 0;
  const isPositive = invertTrend ? trend < 0 : trend > 0;
  const isNegative = invertTrend ? trend > 0 : trend < 0;

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          {icon && (
            <div className={cn('p-2 rounded-md bg-muted/50', iconColor)}>
              {icon}
            </div>
          )}
        </div>

        {hasTrend && (
          <div className="flex items-center gap-1 mt-2">
            {isPositive && (
              <>
                <TrendingUp className="h-3.5 w-3.5 text-green-500" />
                <span className="text-xs font-medium text-green-500">
                  {formatTrend(trend, invertTrend)}
                </span>
              </>
            )}
            {isNegative && (
              <>
                <TrendingDown className="h-3.5 w-3.5 text-red-500" />
                <span className="text-xs font-medium text-red-500">
                  {formatTrend(trend, invertTrend)}
                </span>
              </>
            )}
            {!isPositive && !isNegative && (
              <>
                <Minus className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">
                  0%
                </span>
              </>
            )}
            {trendLabel && (
              <span className="text-xs text-muted-foreground ml-1">
                {trendLabel}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
