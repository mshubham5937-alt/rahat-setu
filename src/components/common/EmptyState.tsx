import { type ReactNode } from 'react';
import { MaterialIcon } from './MaterialIcon';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon = 'inbox', title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center mb-4">
        <MaterialIcon icon={icon} size={32} className="text-on-surface-variant/40" />
      </div>
      <h3 className="font-headline-md text-on-surface mb-1">{title}</h3>
      <p className="text-body-md text-on-surface-variant max-w-sm mb-4">{description}</p>
      {action}
    </div>
  );
}