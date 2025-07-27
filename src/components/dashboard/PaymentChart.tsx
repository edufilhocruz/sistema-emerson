export function PaymentChart() {
  const percentage = 70;
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = `${(percentage * circumference) / 100} ${circumference}`;
  const strokeDashoffset = `-${(25 * circumference) / 100}`;

  return (
    <div className="bg-card p-6 rounded-lg border border-border shadow-sm flex flex-col">
      <h3 className="text-lg font-semibold text-foreground mb-4">Proporção de Pagamentos</h3>
      
      <div className="flex-grow flex items-center justify-center">
        <svg width="200" height="200" viewBox="0 0 200 200">
          {/* Background circle */}
          <circle 
            cx="100" 
            cy="100" 
            r={radius} 
            fill="hsl(var(--chart-secondary))"
          />
          
          {/* Progress circle */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="transparent"
            stroke="hsl(var(--primary-gold))"
            strokeWidth="20"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 100 100)"
          />
          
          {/* Center text */}
          <text 
            className="text-4xl font-bold fill-foreground" 
            textAnchor="middle" 
            x="100" 
            y="105"
          >
            {percentage}%
          </text>
          <text 
            className="text-sm fill-text-muted" 
            textAnchor="middle" 
            x="100" 
            y="130"
          >
            Pagos
          </text>
        </svg>
      </div>
      
      {/* Legend */}
      <div className="flex justify-around mt-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="size-3 rounded-full bg-gold"></span>
          <span>Pagos</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="size-3 rounded-full bg-chart-secondary"></span>
          <span>Inadimplentes</span>
        </div>
      </div>
    </div>
  );
}