import { useNavigate } from 'react-router-dom';
import { useProblems } from '../../context/ProblemContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { StatusChip } from '../../components/common/StatusChip';
import { MaterialIcon } from '../../components/common/MaterialIcon';
import { CATEGORY_LABELS } from '../../data/demoData';
import type { Role } from '../../types';

export function ListPage({ role }: { role: Role }) {
  const navigate = useNavigate();
  const { problems } = useProblems();

  const sorted = [...problems].sort((a, b) => b.priorityScore - a.priorityScore);

  const getDetailPath = (id: string) => {
    switch (role) {
      case 'citizen': return `/citizen/reports/${id}`;
      case 'university': return `/university/challenges/${id}`;
      case 'industry': return `/industry/opportunities/${id}`;
      case 'government': return `/government/problems/${id}`;
    }
  };

  const getTitle = () => {
    switch (role) {
      case 'citizen': return 'My Reports';
      case 'university': return 'Challenge Queue';
      case 'industry': return 'CSR Opportunities';
      case 'government': return 'All Problems';
    }
  };

  const getSubtitle = () => {
    switch (role) {
      case 'citizen': return 'Track the status of your reported problems';
      case 'university': return 'AI-recommended challenges matched to capabilities';
      case 'industry': return 'Disaster challenges with open contribution needs';
      case 'government': return 'Full problem lifecycle across all sectors';
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto space-y-5">
      <div>
        <h1 className="font-headline-lg text-on-surface mb-1">{getTitle()}</h1>
        <p className="text-body-md text-on-surface-variant">{getSubtitle()}</p>
      </div>

      {sorted.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <MaterialIcon icon="inbox" size={40} className="text-on-surface-variant/40 mb-3" />
            <h3 className="font-headline-sm text-on-surface mb-1">No problems yet</h3>
            <p className="text-body-md text-on-surface-variant">New challenges will appear here once reported.</p>
          </div>
        </Card>
      ) : (
        <Card className="p-0">
          <div className="divide-y divide-outline-variant/10">
            {sorted.map((problem) => (
              <div key={problem.id} className="p-4 hover:bg-surface-container-high/30 transition-colors cursor-pointer" onClick={() => navigate(getDetailPath(problem.id))}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-data-metric text-secondary">{problem.priorityScore}</span>
                      <span className="text-label-md text-on-surface-variant uppercase">Score</span>
                      <StatusChip severity={problem.severity} size="sm" />
                      <StatusChip status={problem.status} size="sm" />
                    </div>
                    <p className="font-headline-sm text-on-surface mb-0.5">{problem.title}</p>
                    <p className="text-body-sm text-on-surface-variant mb-2">
                      {problem.location.city}, {problem.location.state} • {CATEGORY_LABELS[problem.category]}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {problem.requiredExpertise.slice(0, 4).map((exp) => (
                        <Badge key={exp} variant="surface" size="sm">{exp}</Badge>
                      ))}
                      {problem.requiredExpertise.length > 4 && (
                        <Badge variant="outline" size="sm">+{problem.requiredExpertise.length - 4}</Badge>
                      )}
                    </div>
                  </div>
                  <MaterialIcon icon="chevron_right" size={20} className="text-on-surface-variant/40 mt-1 shrink-0" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}