import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ARAgingData } from '@/types/billing';

interface ARAgingChartProps {
  data: ARAgingData;
  className?: string;
}

const AGING_COLORS = {
  current: '#22c55e',     // Green (healthy)
  days_31_60: '#eab308',  // Yellow (warning)
  days_61_90: '#f97316',  // Orange (concern)
  days_90_plus: '#ef4444', // Red (critical)
};

const formatCurrency = (value: number) => {
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}k`;
  }
  return `$${value}`;
};

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;

  const data = payload[0];
  return (
    <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
      <p className="font-medium text-foreground">{data.payload.name}</p>
      <p className="text-sm text-muted-foreground">
        ${data.value.toLocaleString()}
      </p>
    </div>
  );
};

export const ARAgingChart = ({ data, className }: ARAgingChartProps) => {
  const chartData = [
    { name: '0-30 days', value: data.current, color: AGING_COLORS.current },
    { name: '31-60 days', value: data.days_31_60, color: AGING_COLORS.days_31_60 },
    { name: '61-90 days', value: data.days_61_90, color: AGING_COLORS.days_61_90 },
    { name: '90+ days', value: data.days_90_plus, color: AGING_COLORS.days_90_plus },
  ];

  const total = data.current + data.days_31_60 + data.days_61_90 + data.days_90_plus;

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">A/R Aging</CardTitle>
          <span className="text-sm text-muted-foreground">
            Total: ${total.toLocaleString()}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 10, left: 70, bottom: 5 }}
            >
              <XAxis
                type="number"
                tickFormatter={formatCurrency}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                width={65}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={30}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
