import { cn } from '../../utils/cn';
import { LIFECYCLE_STAGES } from '../../data/demoData';
import type { LifecycleStage } from '../../types';

interface LifecycleTrackerProps {
  currentStage: LifecycleStage;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export function LifecycleTracker({ currentStage, orientation = 'horizontal', className }: LifecycleTrackerProps) {
  if (orientation === 'vertical') {
    return (
      <div className={cn('flex flex-col gap-0', className)}>
        {LIFECYCLE_STAGES.map(({ stage, label, description }) => {
          const isCompleted = stage < currentStage;
          const isCurrent = stage === currentStage;
          const isPending = stage > currentStage;

          return (
            <div key={stage} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0 border-2 transition-all',
                    isCompleted && 'bg-secondary text-white border-secondary',
                    isCurrent && 'bg-primary-container text-on-primary-container border-secondary animate-siren',
                    isPending && 'bg-surface-container-high text-on-surface-variant border-outline-variant'
                  )}
                >
                  {isCompleted ? (
                    <span className="material-symbols-outlined text-[16px]">check</span>
                  ) : (
                    stage
                  )}
                </div>
                {stage < 9 && (
                  <div
                    className={cn(
                      'w-0.5 h-8',
                      stage < currentStage ? 'bg-secondary' : 'bg-outline-variant/40'
                    )}
                  />
                )}
              </div>
              <div className="pt-1 pb-2">
                <p className={cn(
                  'text-label-lg',
                  isCurrent ? 'text-secondary font-bold' : isCompleted ? 'text-on-surface' : 'text-on-surface-variant'
                )}>
                  {label}
                </p>
                <p className="text-body-sm text-on-surface-variant">{description}</p>
                {isCurrent && (
                  <span className="inline-flex items-center gap-1 text-secondary text-[10px] font-semibold mt-1 uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                    Active
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className={cn('flex items-start gap-0 w-full', className)}>
      {LIFECYCLE_STAGES.map(({ stage, shortLabel }) => {
        const isCompleted = stage < currentStage;
        const isCurrent = stage === currentStage;
        const isPending = stage > currentStage;

        return (
          <div key={stage} className="flex items-start flex-1 relative">
            <div className="flex flex-col items-center w-full">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0 border-2 transition-all',
                  isCompleted && 'bg-secondary text-white border-secondary',
                  isCurrent && 'bg-primary-container text-on-primary-container border-secondary animate-siren',
                  isPending && 'bg-surface-container-high text-on-surface-variant border-outline-variant'
                )}
              >
                {isCompleted ? (
                  <span className="material-symbols-outlined text-[16px]">check</span>
                ) : (
                  stage
                )}
              </div>
              <p className={cn(
                'text-[10px] font-semibold text-center mt-1 px-1',
                isCurrent ? 'text-secondary' : isCompleted ? 'text-on-surface' : 'text-on-surface-variant'
              )}>
                {shortLabel}
              </p>
              {isCurrent && (
                <span className="text-secondary text-[9px] font-bold uppercase tracking-wider">Active</span>
              )}
            </div>
            {stage < 9 && (
              <div
                className={cn(
                  'absolute top-4 left-1/2 w-full h-0.5',
                  stage < currentStage ? 'bg-secondary' : 'bg-outline-variant/30'
                )}
                style={{ transform: 'translateX(50%)', width: 'calc(100% - 1rem)' }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}