interface MetricCardProps {
  title: string;
  value: string | number;
  className?: string;
}

export function MetricCard({ title, value, className }: MetricCardProps) {
  return (
    <div className={`bg-card p-6 rounded-lg border border-border shadow-sm ${className || ""}`}>
      <h3 className="text-base font-medium text-text-secondary">{title}</h3>
      <p className="text-3xl font-bold text-foreground mt-1">{value}</p>
    </div>
  );
}