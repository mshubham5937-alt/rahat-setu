import { type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../utils/cn';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: string;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  children: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-white hover:bg-primary-container active:bg-primary/90',
  secondary: 'bg-secondary text-on-secondary-container hover:bg-secondary/90 active:bg-secondary/80',
  outline: 'border border-outline bg-transparent text-on-surface hover:bg-surface-container-high active:bg-surface-container-highest',
  ghost: 'bg-transparent text-on-surface hover:bg-surface-container-high active:bg-surface-container-highest',
  danger: 'bg-error text-white hover:bg-error/90 active:bg-error/80',
  success: 'bg-success text-on-secondary-container hover:bg-success/90 active:bg-success/80',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-label-md rounded-lg gap-1.5',
  md: 'h-10 px-4 text-label-lg rounded-xl gap-2',
  lg: 'h-12 px-6 text-body-lg rounded-xl gap-2.5',
};

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  className,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-semibold transition-all duration-150 ease-out',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2',
        'disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
      )}
      {!loading && icon && iconPosition === 'left' && (
        <span className="material-symbols-outlined text-[18px]">{icon}</span>
      )}
      {children}
      {!loading && icon && iconPosition === 'right' && (
        <span className="material-symbols-outlined text-[18px]">{icon}</span>
      )}
    </button>
  );
}