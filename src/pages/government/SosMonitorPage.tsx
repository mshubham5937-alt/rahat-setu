import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProblems } from '../../context/ProblemContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { StatusChip } from '../../components/common/StatusChip';
import { MaterialIcon } from '../../components/common/MaterialIcon';
import { LiveMap } from '../../components/map/LiveMap';
import { cn } from '../../utils/cn';

export function SosMonitorPage() {
  const navigate = useNavigate();
  const { problems, advanceStage } = useProblems();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 4000);
    return () => clearInterval(t);
  }, []);

  const critical = problems
    .filter((p) => p.severity === 'critical' || p.priorityScore >= 85)
    .sort((a, b) => b.priorityScore - a.priorityScore);

  const nextToDeploy = critical.find((p) => p.currentStage < 8);

  return (
    <div className="max-w-[1440px] mx-auto space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-headline-lg text-on-surface mb-1 flex items-center gap-2">
            SOS Monitor
            <Badge variant="error" size="lg" dot pulse>LIVE</Badge>
          </h1>
          <p className="text-body-md text-on-surface-variant">
            Auto-refreshing watch on critical problems • tick #{tick + 1}
          </p>
        </div>
        {nextToDeploy && (
          <button
            onClick={() => advanceStage(nextToDeploy.id)}
            className="group flex items-center gap-2 px-4 h-11 rounded-xl bg-secondary text-on-secondary-container text-label-lg font-semibold hover:bg-secondary/90 transition-colors shadow-md"
          >
            <MaterialIcon icon="rocket_launch" size={18} />
            Advance '{nextToDeploy.title.slice(0, 24)}' to next stage
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-3 p-0 overflow-hidden">
          <LiveMap problems={critical.length > 0 ? critical : problems} height={440} />
        </Card>

        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-error-container/50 rounded-xl p-3 text-center">
              <p className="text-data-metric text-error">{critical.length}</p>
              <p className="text-body-sm text-on-surface-variant">Critical</p>
            </div>
            <div className="bg-secondary-fixed/50 rounded-xl p-3 text-center">
              <p className="text-data-metric text-secondary">{problems.length}</p>
              <p className="text-body-sm text-on-surface-variant">Active</p>
            </div>
            <div className="bg-surface-container-high rounded-xl p-3 text-center">
              <p className="text-data-metric text-on-surface">{problems.reduce((s, p) => s + p.affectedPopulation, 0).toLocaleString()}</p>
              <p className="text-body-sm text-on-surface-variant">Affected</p>
            </div>
          </div>

          <Card className="p-0 overflow-hidden">
            <div className="p-3 border-b border-outline-variant/20 flex items-center justify-between">
              <h3 className="font-headline-sm text-on-surface">Critical Incidents</h3>
              <Badge variant="error" size="sm" pulse>Priority feed</Badge>
            </div>
            <div className="divide-y divide-outline-variant/10">
              {critical.slice(0, 5).map((p) => (
                <div
                  key={p.id}
                  className="p-3 hover:bg-surface-container-high/40 transition-colors cursor-pointer"
                  onClick={() => navigate(`/government/problems/${p.id}`)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={cn('w-2 h-2 rounded-full', p.priorityScore >= 95 ? 'bg-error' : 'bg-warning')} />
                      <p className="text-label-lg text-on-surface text-truncate-1">{p.title}</p>
                    </div>
                    <span className="text-data-metric text-error text-[18px]">{p.priorityScore}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <StatusChip status={p.status} size="sm" />
                    <span className="text-body-sm text-on-surface-variant">{p.location.city}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}