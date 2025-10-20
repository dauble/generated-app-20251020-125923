import * as React from 'react';
import { useDraftStore, TOTAL_BUDGET } from '@/hooks/useDraftStore';
import { Progress } from '@/components/ui/progress';
export function BudgetTracker() {
  const remainingBudget = useDraftStore((s) => s.remainingBudget());
  const totalCost = useDraftStore((s) => s.totalCost());
  const budgetSpentPercentage = (totalCost / TOTAL_BUDGET) * 100;
  const progressColorValue = React.useMemo(() => {
    if (budgetSpentPercentage > 90) return 'hsl(var(--destructive))';
    if (budgetSpentPercentage > 70) return '#f59e0b'; // yellow-500
    return 'hsl(var(--primary))';
  }, [budgetSpentPercentage]);
  return (
    <div className="w-full max-w-xs bg-background/50 p-3 rounded-lg border border-border">
      <div className="flex justify-between items-baseline mb-1">
        <span className="text-sm font-medium text-muted-foreground">BUDGET</span>
        <span className="text-lg font-bold text-foreground">
          ${remainingBudget.toFixed(1)}M <span className="text-xs text-muted-foreground">/ ${TOTAL_BUDGET}M</span>
        </span>
      </div>
      <Progress
        value={budgetSpentPercentage}
        className="progress-indicator-custom"
        style={{ '--progress-color': progressColorValue } as React.CSSProperties}
      />
    </div>
  );
}