import { cn } from '../../utils/cn';

interface KpiCardProps {
  label: string;
  value: string;
  icon?: string;
  trend?: string;
  trendType?: 'up' | 'down' | 'neutral';
  detail?: string;
  urgent?: string;
  color?: string;
  className?: string;
}

export function KpiCard({ label, value, icon, trend, trendType, detail, urgent, color = 'secondary', className }: KpiCardProps) {
  return (
    <div
      className={cn(
        'bg-surface-container-lowest border border-outline-variant/30 p-4 relative overflow-hidden',
        className
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">{label}</p>
        {icon && (
          <span className="material-symbols-outlined text-on-surface-variant/60 text-[18px]">{icon}</span>
        )}
      </div>

      <div className="flex items-end gap-2 mb-1">
        <span className={cn('font-display-lg text-on-surface', color === 'error' && 'text-error', color === 'secondary' && 'text-secondary')}>
          {value}
        </span>
        {trend && (
          <span
            className={cn(
              'text-[11px] font-semibold mb-1',
              trendType === 'up' && 'text-secondary',
              trendType === 'down' && 'text-error',
              trendType === 'neutral' && 'text-on-surface-variant'
            )}
          >
            {trendType === 'up' && '↑'} {trendType === 'down' && '↓'} {trend}
          </span>
        )}
      </div>

      {urgent && (
        <p className="text-error text-[11px] font-semibold mb-1">{urgent}</p>
      )}

      {detail && (
        <p className="text-on-surface-variant text-[11px] mt-1">{detail}</p>
      )}
    </div>
  );
}