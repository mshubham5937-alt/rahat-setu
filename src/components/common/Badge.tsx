import { type ReactNode } from 'react';
import { cn } from '../../utils/cn';

type BadgeVariant = 'primary' | 'secondary' | 'error' | 'warning' | 'success' | 'outline' | 'surface';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  pulse?: boolean;
  icon?: string;
  children: ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  primary: 'bg-primary-container text-on-primary-container',
  secondary: 'bg-secondary-container text-on-secondary-container',
  error: 'bg-error-container text-error',
  warning: 'bg-tertiary-fixed-dim/50 text-tertiary-container',
  success: 'bg-secondary-fixed text-on-secondary-fixed',
  outline: 'border border-outline-variant text-on-surface-variant',
  surface: 'bg-surface-container-high text-on-surface',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'h-5 px-1.5 text-[10px] gap-1 rounded-full',
  md: 'h-6 px-2 text-[11px] gap-1.5 rounded-full',
  lg: 'h-7 px-2.5 text-[12px] gap-1.5 rounded-full',
};

export function Badge({
  variant = 'surface',
  size = 'md',
  dot = false,
  pulse = false,
  icon,
  children,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-semibold whitespace-nowrap leading-none',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {dot && (
        <span className="relative flex h-2 w-2">
          {pulse && (
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-75" />
          )}
          <span className="relative inline-flex h-2 w-2 rounded-full bg-current" />
        </span>
      )}
      {icon && <span className="material-symbols-outlined text-[14px]">{icon}</span>}
      {children}
    </span>
  );
}