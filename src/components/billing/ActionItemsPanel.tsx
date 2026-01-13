import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, FileX, ShieldX, CreditCard, ChevronRight } from 'lucide-react';
import type { ActionItemsData } from '@/types/billing';
import { cn } from '@/lib/utils';

interface ActionItemsPanelProps {
  data: ActionItemsData;
  onViewAll?: () => void;
  className?: string;
}

interface ActionItemProps {
  icon: React.ReactNode;
  label: string;
  count: number;
  color: string;
  bgColor: string;
  onClick?: () => void;
}

const ActionItem = ({ icon, label, count, color, bgColor, onClick }: ActionItemProps) => {
  if (count === 0) return null;

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 w-full p-2 rounded-lg transition-colors',
        'hover:bg-muted/50 text-left'
      )}
    >
      <div className={cn('p-1.5 rounded-md', bgColor)}>
        <span className={color}>{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium text-foreground">{count}</span>
        <span className="text-sm text-muted-foreground ml-1.5">{label}</span>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </button>
  );
};

export const ActionItemsPanel = ({ data, onViewAll, className }: ActionItemsPanelProps) => {
  const totalItems =
    data.claims_attention +
    data.denials_to_work +
    data.eligibility_failures +
    data.payments_to_post;

  const actionItems = [
    {
      icon: <AlertCircle className="h-4 w-4" />,
      label: 'claims need attention',
      count: data.claims_attention,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
    },
    {
      icon: <FileX className="h-4 w-4" />,
      label: 'denials to work',
      count: data.denials_to_work,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
    },
    {
      icon: <ShieldX className="h-4 w-4" />,
      label: 'eligibility failures',
      count: data.eligibility_failures,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
    {
      icon: <CreditCard className="h-4 w-4" />,
      label: 'payments to post',
      count: data.payments_to_post,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
  ];

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">Action Items</CardTitle>
          {totalItems > 0 && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">
              {totalItems}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {totalItems === 0 ? (
          <div className="py-6 text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-green-500/10 mb-2">
              <svg
                className="h-5 w-5 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="text-sm text-muted-foreground">All caught up!</p>
          </div>
        ) : (
          <div className="space-y-1">
            {actionItems.map((item, index) => (
              <ActionItem key={index} {...item} />
            ))}
          </div>
        )}

        {totalItems > 0 && onViewAll && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full mt-3 text-muted-foreground hover:text-foreground"
            onClick={onViewAll}
          >
            View All Tasks
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
