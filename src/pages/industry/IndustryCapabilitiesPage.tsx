import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProblems } from '../../context/ProblemContext';
import { useNotifications } from '../../context/NotificationContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { MaterialIcon } from '../../components/common/MaterialIcon';
import { cn } from '../../utils/cn';

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
  { id: 'cap-8', name: 'Emergency Network Ops', description: 'Satellite bandwidth + network team for blackout zones', capacity: 1, unit: 'team', category: 'communication', eligible: false },
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
  const { problems } = useProblems();
  const { addManualNotification } = useNotifications();
  const [pledged, setPledged] = useState<Record<string, boolean>>({});
  const [category, setCategory] = useState<'all' | CapabilityCategory>('all');

  const filtered = category === 'all' ? CAPABILITIES : CAPABILITIES.filter((i) => i.category === category);
  const eligibleCount = CAPABILITIES.filter((i) => i.eligible).length;
  const pledgedCount = Object.values(pledged).filter(Boolean).length;
  const topProblem = problems[0];

  const pledgeItem = (item: CapabilityItem) => {
    setPledged({ ...pledged, [item.id]: true });
    addManualNotification({
      type: 'industry_joined',
      title: `${item.name} pledged`,
      message: `${item.capacity} ${item.unit} committed to ${topProblem?.location?.city || 'disaster'} response`,
      actionUrl: topProblem ? `/industry/opportunities/${topProblem.id}` : '/industry',
    });
  };

  return (
    <div className="max-w-[1440px] mx-auto space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-headline-lg text-on-surface mb-1">CSR Capabilities & Pledge Catalog</h1>
          <p className="text-body-md text-on-surface-variant">Capabilities that can be pledged to verified disaster responses.</p>
        </div>
        <Badge variant="secondary" size="lg" icon="account_balance">
          {pledgedCount}/{eligibleCount} pledged in session
        </Badge>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        {(['all', ...(Object.keys(CATEGORY_META) as CapabilityCategory[])] as const).map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={cn(
              'px-4 h-8 rounded-full text-label-md font-semibold uppercase tracking-wide transition-colors',
              category === c ? 'bg-secondary text-on-secondary-container' : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
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
            <Card key={item.id} className="flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <div className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center',
                  item.eligible ? 'bg-secondary-fixed/60' : 'bg-surface-container-high'
                )}>
                  <MaterialIcon
                    icon={meta.icon}
                    size={22}
                    className={item.eligible ? 'text-secondary' : 'text-on-surface-variant/50'}
                  />
                </div>
                {item.eligible ? (
                  <Badge variant="success" size="sm" icon="verified_user">Eligible</Badge>
                ) : (
                  <Badge variant="surface" size="sm">Pending docs</Badge>
                )}
              </div>

              <p className="font-headline-sm text-on-surface mb-1">{item.name}</p>
              <p className="text-body-sm text-on-surface-variant mb-3 flex-1">{item.description}</p>

              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-data-metric text-secondary">{item.capacity.toLocaleString()} {item.unit}</p>
                  <p className="text-body-sm text-on-surface-variant">available now</p>
                </div>
              </div>

              <Button
                variant={isPledged ? 'outline' : 'primary'}
                size="sm"
                className="w-full"
                icon={isPledged ? 'check_circle' : 'handshake'}
                disabled={!item.eligible || isPledged}
                onClick={() => pledgeItem(item)}
              >
                {isPledged ? 'Pledged' : 'Pledge to Response'}
              </Button>
            </Card>
          );
        })}
      </div>

      <Card className="bg-primary-container/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MaterialIcon icon="info" size={20} className="text-secondary" />
            <p className="text-body-sm text-on-surface">
              Pledges route directly to the <strong>{topProblem?.title || 'active verified'}</strong> response workspace. Schedule VII compliant.
            </p>
          </div>
          {topProblem && (
            <Button variant="secondary" size="sm" icon="chevron_right" onClick={() => navigate(`/industry/opportunities/${topProblem.id}`)}>
              View workspace
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}