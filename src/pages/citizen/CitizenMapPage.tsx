import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LiveMap } from '../../components/map/LiveMap';
import { useProblems } from '../../context/ProblemContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { StatusChip } from '../../components/common/StatusChip';
import { Button } from '../../components/common/Button';
import { MaterialIcon } from '../../components/common/MaterialIcon';
import type { Problem } from '../../types';

export function CitizenMapPage() {
  const { problems } = useProblems();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Problem | null>(problems[0] ?? null);

  return (
    <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <LiveMap height={560} onSelect={setSelected} />
      </div>

      <div className="space-y-5">
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-headline-sm text-on-surface">Selected Report</h3>
            <Badge variant="surface" size="sm">Nearest to you</Badge>
          </div>
          {selected ? (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <StatusChip severity={selected.severity} size="sm" />
                <StatusChip status={selected.status} size="sm" />
              </div>
              <p className="font-headline-md text-on-surface mb-1">{selected.title}</p>
              <p className="text-body-sm text-on-surface-variant mb-3">
                {selected.location.address || selected.location.city} — {selected.affectedPopulation.toLocaleString()} affected
              </p>
              <div className="flex items-center justify-between mb-4">
                <span className="text-label-md text-on-surface-variant uppercase">AI Priority</span>
                <span className="text-data-metric text-secondary">{selected.priorityScore}</span>
              </div>
              <Button variant="primary" className="w-full" icon="chevron_right" onClick={() => navigate(`/citizen/reports/${selected.id}`)}>
                Track this report
              </Button>
            </div>
          ) : (
            <p className="text-body-sm text-on-surface-variant">Select a marker on the map to see details.</p>
          )}
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-3">
            <MaterialIcon icon="layers" size={20} className="text-secondary" />
            <h3 className="font-headline-sm text-on-surface">Legend</h3>
          </div>
          <div className="space-y-2 text-body-sm text-on-surface-variant">
            <p className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-error" /> Critical — immediate action</p>
            <p className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-warning" /> High — urgent response</p>
            <p className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-secondary" /> Medium — monitored</p>
            <p className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-on-surface-variant/60" /> Low — tracking</p>
          </div>
        </Card>
      </div>
    </div>
  );
}