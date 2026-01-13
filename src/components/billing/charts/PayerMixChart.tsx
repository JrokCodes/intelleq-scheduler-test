import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { PayerMixData } from '@/types/billing';

interface PayerMixChartProps {
  data: PayerMixData[];
  className?: string;
}

const PAYER_COLORS: Record<string, string> = {
  'HMSA': '#3b82f6',      // Blue
  'Medicare': '#22c55e',   // Green
  'UHA': '#8b5cf6',        // Purple
  'HMAA': '#f59e0b',       // Amber
  'Kaiser': '#06b6d4',     // Cyan
  'AlohaCare': '#ec4899',  // Pink
  'Other': '#6b7280',      // Gray
};

const DEFAULT_COLORS = ['#3b82f6', '#22c55e', '#8b5cf6', '#f59e0b', '#06b6d4', '#ec4899', '#6b7280'];

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;

  const data = payload[0];
  return (
    <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
      <p className="font-medium text-foreground">{data.name}</p>
      <p className="text-sm text-muted-foreground">
        ${data.value.toLocaleString()} ({data.payload.percentage}%)
      </p>
    </div>
  );
};

const CustomLegend = ({ payload }: any) => {
  return (
    <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2">
      {payload?.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-1.5 text-xs">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground">
            {entry.value} ({entry.payload.percentage}%)
          </span>
        </div>
      ))}
    </div>
  );
};

export const PayerMixChart = ({ data, className }: PayerMixChartProps) => {
  const chartData = data.map((item, index) => ({
    ...item,
    color: item.color || PAYER_COLORS[item.payer_name] || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
  }));

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Payer Mix</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="amount"
                nameKey="payer_name"
                cx="50%"
                cy="45%"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={2}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
