import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProblems } from '../../context/ProblemContext';
import { useNotifications } from '../../context/NotificationContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { MaterialIcon } from '../../components/common/MaterialIcon';
import { cn } from '../../utils/cn';
import type { Contribution } from '../../types';

type CapabilityCategory = 'cloud' | 'expertise' | 'logistics' | 'communication' | 'funding' | 'operations';

interface CapabilityItem {
  id: string;
  name: string;
  description: string;
  capacity: number;
  unit: string;
  category: CapabilityCategory;
  eligible: boolean;
}

const CAPABILITIES: CapabilityItem[] = [
  { id: 'cap-1', name: 'Cloud Analytics Credits', description: 'Credits for AI flood forecasting & alert pipelines', capacity: 50000, unit: 'USD', category: 'cloud', eligible: true },
  { id: 'cap-2', name: 'AI/ML Model Support', description: 'Data scientists for severity classification & forecasting', capacity: 8, unit: 'engineers', category: 'expertise', eligible: true },
  { id: 'cap-3', name: 'Public Alert Broadcasting', description: 'Bulk SMS/voice alert channel for 100k citizens', capacity: 1, unit: 'license', category: 'communication', eligible: true },
  { id: 'cap-4', name: 'Field Response Teams', description: 'On-ground volunteers & coordination staff', capacity: 40, unit: 'personnel', category: 'operations', eligible: true },
  { id: 'cap-5', name: 'Evacuation & Relief Logistics', description: 'Fleet support for evacuation & supply movement', capacity: 25, unit: 'vehicles', category: 'logistics', eligible: true },
  { id: 'cap-6', name: 'CSR Grant Funding', description: 'Reserved disaster-response grants, Schedule VII eligible', capacity: 2, unit: 'Cr', category: 'funding', eligible: true },
  { id: 'cap-7', name: 'Community Relief Distribution', description: 'Meal & water distribution network', capacity: 5, unit: 'units', category: 'operations', eligible: true },
  { id: 'cap-8', name: 'Emergency Network Ops', description: 'Satellite bandwidth + network team for blackout zones', capacity: 1, unit: 'team', category: 'communication', eligible: true },
];

const CATEGORY_META: Record<CapabilityCategory, { icon: string; label: string }> = {
  cloud: { icon: 'cloud', label: 'Cloud' },
  expertise: { icon: 'psychology', label: 'Expertise' },
  logistics: { icon: 'local_shipping', label: 'Logistics' },
  communication: { icon: 'campaign', label: 'Communication' },
  funding: { icon: 'account_balance_wallet', label: 'Funding' },
  operations: { icon: 'support_agent', label: 'Operations' },
};

export function IndustryCapabilitiesPage() {
  const navigate = useNavigate();
  const { problems, commitIndustryContribution } = useProblems();
  const { addManualNotification } = useNotifications();

  const [selectedProblemId, setSelectedProblemId] = useState<string>(problems[0]?.id || 'prob-26043');
  const [pledged, setPledged] = useState<Record<string, boolean>>({});
  const [category, setCategory] = useState<'all' | CapabilityCategory>('all');
  const [feedback, setFeedback] = useState<string | null>(null);

  const targetProblem = problems.find((p) => p.id === selectedProblemId) || problems[0];

  const filtered = category === 'all' ? CAPABILITIES : CAPABILITIES.filter((i) => i.category === category);
  const eligibleCount = CAPABILITIES.filter((i) => i.eligible).length;
  const pledgedCount = Object.values(pledged).filter(Boolean).length;

  const pledgeItem = async (item: CapabilityItem) => {
    setPledged((prev) => ({ ...prev, [item.id]: true }));

    if (targetProblem) {
      const contribution: Contribution = {
        type: item.name,
        description: item.description,
        quantity: item.capacity,
        unit: item.unit,
        status: 'pledged',
      };
      await commitIndustryContribution(targetProblem.id, 'Corporate Relief Alliance', contribution);
    }

    const msg = `${item.name} (${item.capacity} ${item.unit}) pledged to ${targetProblem?.title || 'incident'}!`;
    setFeedback(msg);
    addManualNotification({
      type: 'industry_joined',
      title: `${item.name} Pledged`,
      message: msg,
      actionUrl: targetProblem ? `/industry/opportunities/${targetProblem.id}` : '/industry',
    });
    setTimeout(() => setFeedback(null), 5000);
  };

  return (
    <div className="max-w-[1440px] mx-auto space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="font-headline-lg text-on-surface mb-1">CSR Capabilities & Pledge Catalog</h1>
          <p className="text-body-md text-on-surface-variant">
            Pledge industrial capabilities directly to active disaster incidents.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div>
            <label className="block text-label-md text-on-surface-variant mb-1">Target Incident</label>
            <select
              value={selectedProblemId}
              onChange={(e) => setSelectedProblemId(e.target.value)}
              className="px-3 py-2 bg-surface-container-high rounded-xl border border-outline-variant text-on-surface text-body-md font-medium max-w-xs focus:outline-none focus:border-secondary"
            >
              {problems.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.location.city || 'Gujarat'})
                </option>
              ))}
            </select>
          </div>
          <Badge variant="secondary" size="lg" icon="account_balance" className="self-end mb-1">
            {pledgedCount}/{eligibleCount} Pledged
          </Badge>
        </div>
      </div>

      {feedback && (
        <div className="p-4 bg-secondary-fixed/20 border border-secondary/40 text-on-surface rounded-xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <MaterialIcon icon="check_circle" size={20} className="text-secondary" />
            <p className="text-body-md font-medium">{feedback}</p>
          </div>
          {targetProblem && (
            <Button
              variant="outline"
              size="sm"
              icon="open_in_new"
              onClick={() => navigate(`/industry/opportunities/${targetProblem.id}`)}
            >
              View Incident
            </Button>
          )}
        </div>
      )}

      <div className="flex items-center gap-1.5 flex-wrap">
        {(['all', ...(Object.keys(CATEGORY_META) as CapabilityCategory[])] as const).map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={cn(
              'px-4 h-8 rounded-full text-label-md font-semibold uppercase tracking-wide transition-colors',
              category === c
                ? 'bg-secondary text-on-secondary-container'
                : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
            )}
          >
            {c === 'all' ? 'All' : CATEGORY_META[c].label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filtered.map((item) => {
          const isPledged = pledged[item.id];
          const meta = CATEGORY_META[item.category];
          return (
            <Card key={item.id} className="flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-secondary-fixed text-secondary">
                    <MaterialIcon icon={meta.icon} size={22} />
                  </div>
                  {isPledged ? (
                    <Badge variant="success" size="sm" icon="check">
                      Pledged
                    </Badge>
                  ) : item.eligible ? (
                    <Badge variant="surface" size="sm">
                      CSR Ready
                    </Badge>
                  ) : (
                    <Badge variant="outline" size="sm">
                      Restricted
                    </Badge>
                  )}
                </div>

                <h3 className="font-headline-sm text-on-surface mb-1">{item.name}</h3>
                <p className="text-body-sm text-on-surface-variant mb-4 leading-relaxed">{item.description}</p>
              </div>

              <div>
                <div className="p-3 bg-surface-container-high/60 rounded-xl mb-4">
                  <p className="text-label-md text-on-surface-variant uppercase">Available Capacity</p>
                  <p className="text-data-metric text-on-surface font-bold">
                    {typeof item.capacity === 'number' && item.capacity > 1000
                      ? item.capacity.toLocaleString()
                      : item.capacity}{' '}
                    <span className="text-body-sm text-on-surface-variant font-normal">{item.unit}</span>
                  </p>
                </div>

                <Button
                  variant={isPledged ? 'outline' : 'primary'}
                  size="sm"
                  className="w-full"
                  icon={isPledged ? 'check' : 'assignment_turned_in'}
                  onClick={() => pledgeItem(item)}
                  disabled={!item.eligible || isPledged}
                >
                  {isPledged ? 'Pledge Committed' : `Pledge to ${targetProblem?.location?.city || 'Disaster'}`}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
