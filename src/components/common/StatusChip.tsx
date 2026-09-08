import { cn } from '../../utils/cn';
import { STATUS_CONFIG, SEVERITY_CONFIG } from '../../data/demoData';
import type { ProblemStatus, Severity } from '../../types';

interface StatusChipProps {
  status?: ProblemStatus;
  severity?: Severity;
  size?: 'sm' | 'md';
  className?: string;
}

export function StatusChip({ status, severity, size = 'md', className }: StatusChipProps) {
  if (severity) {
    const config = SEVERITY_CONFIG[severity];
    return (
      <span
        className={cn(
          'inline-flex items-center font-semibold whitespace-nowrap',
          size === 'sm' ? 'h-5 px-1.5 text-[10px] gap-1 rounded-full' : 'h-6 px-2 text-[11px] gap-1.5 rounded-full',
          config.bgColor,
          config.color,
          className
        )}
      >
        <span className="material-symbols-outlined text-[14px]">{config.icon}</span>
        {config.label}
      </span>
    );
  }

  if (!status) return null;
  const config = STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        'inline-flex items-center font-semibold whitespace-nowrap',
        size === 'sm' ? 'h-5 px-1.5 text-[10px] gap-1 rounded-full' : 'h-6 px-2 text-[11px] gap-1.5 rounded-full',
        config.bgColor,
        config.color,
        className
      )}
    >
      {config.label}
    </span>
  );
}