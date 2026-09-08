import { cn } from '../../utils/cn';

interface MaterialIconProps {
  icon: string;
  size?: number;
  className?: string;
  filled?: boolean;
  onClick?: () => void;
}

export function MaterialIcon({ icon, size = 24, className, filled = false, onClick }: MaterialIconProps) {
  return (
    <span
      className={cn(
        'material-symbols-outlined select-none',
        onClick && 'cursor-pointer hover:opacity-70 transition-opacity',
        className
      )}
      style={{
        fontSize: `${size}px`,
        fontVariationSettings: filled ? "'FILL' 1" : "'FILL' 0",
      }}
      onClick={onClick}
    >
      {icon}
    </span>
  );
}