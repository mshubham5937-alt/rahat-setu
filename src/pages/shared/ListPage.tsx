import { useState, useMemo } from 'react';
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

  const [search, setSearch] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filtered = useMemo(() => {
    return [...problems]
      .filter((p) => {
        if (selectedSeverity !== 'all' && p.severity !== selectedSeverity) return false;
        if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchTitle = p.title.toLowerCase().includes(q);
          const matchCity = (p.location?.city || '').toLowerCase().includes(q);
          const matchDesc = (p.description || '').toLowerCase().includes(q);
          return matchTitle || matchCity || matchDesc;
        }
        return true;
      })
      .sort((a, b) => b.priorityScore - a.priorityScore);
  }, [problems, search, selectedSeverity, selectedCategory]);

  const getDetailPath = (id: string) => {
    switch (role) {
      case 'citizen':
        return `/citizen/reports/${id}`;
      case 'university':
        return `/university/challenges/${id}`;
      case 'industry':
        return `/industry/opportunities/${id}`;
      case 'government':
        return `/government/problems/${id}`;
    }
  };

  const getTitle = () => {
    switch (role) {
      case 'citizen':
        return 'Disaster Incident Reports';
      case 'university':
        return 'Academic Challenge Queue';
      case 'industry':
        return 'CSR Resource & Relief Opportunities';
      case 'government':
        return 'Unified Incident Directory';
    }
  };

  const getSubtitle = () => {
    switch (role) {
      case 'citizen':
        return 'Track field status and telemetry for reported community hazards';
      case 'university':
        return 'AI-matched disaster challenges requiring research taskforces';
      case 'industry':
        return 'High-urgency disaster incidents with open capability requirements';
      case 'government':
        return 'Complete incident lifecycle across state, NDRF, and academia';
    }
  };

  const categories = Object.keys(CATEGORY_LABELS);

  return (
    <div className="max-w-[1440px] mx-auto space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline-lg text-on-surface mb-1">{getTitle()}</h1>
          <p className="text-body-md text-on-surface-variant">{getSubtitle()}</p>
        </div>
        {role === 'citizen' && (
          <button
            onClick={() => navigate('/citizen/report/new')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-on-secondary rounded-xl text-label-lg font-medium hover:bg-secondary/90 transition-colors shadow-sm shrink-0 self-start sm:self-auto"
          >
            <MaterialIcon icon="add_alert" size={20} />
            Report New Hazard
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="relative">
          <MaterialIcon
            icon="search"
            size={20}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
          />
          <input
            type="text"
            placeholder="Search incident, location, keywords…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-surface-container rounded-xl border border-outline-variant/30 text-on-surface text-body-md focus:outline-none focus:border-secondary transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          {(['all', 'critical', 'high', 'medium', 'low'] as const).map((sev) => (
            <button
              key={sev}
              onClick={() => setSelectedSeverity(sev)}
              className={`px-3 py-1.5 rounded-lg text-label-md font-medium capitalize transition-colors shrink-0 ${
                selectedSeverity === sev
                  ? 'bg-secondary text-on-secondary shadow-xs'
                  : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2.5 bg-surface-container rounded-xl border border-outline-variant/30 text-on-surface text-body-md focus:outline-none focus:border-secondary transition-colors capitalize"
          >
            <option value="all">All Disaster Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABELS[c as keyof typeof CATEGORY_LABELS] || c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <MaterialIcon icon="inbox" size={44} className="text-on-surface-variant/40 mb-3" />
            <h3 className="font-headline-sm text-on-surface mb-1">No matching incidents</h3>
            <p className="text-body-md text-on-surface-variant max-w-md">
              No reports match your selected filters. Try clearing your search or switching filter categories.
            </p>
          </div>
        </Card>
      ) : (
        <Card className="p-0">
          <div className="divide-y divide-outline-variant/10">
            {filtered.map((problem) => {
              const expertise = problem.requiredExpertise || problem.aiAnalysis?.recommendedExpertise || [];
              return (
                <div
                  key={problem.id}
                  className="p-4 hover:bg-surface-container-high/30 transition-colors cursor-pointer"
                  onClick={() => navigate(getDetailPath(problem.id))}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="text-data-metric text-secondary font-bold">{problem.priorityScore}</span>
                        <span className="text-label-md text-on-surface-variant uppercase">Score</span>
                        <StatusChip severity={problem.severity} size="sm" />
                        <StatusChip status={problem.status} size="sm" />
                        {problem.governmentVerification?.verified && (
                          <Badge variant="success" size="sm" icon="verified">
                            SDMA Verified
                          </Badge>
                        )}
                        <span className="text-body-sm text-on-surface-variant ml-auto hidden sm:inline">
                          Stage {problem.currentStage}/9
                        </span>
                      </div>
                      <p className="font-headline-sm text-on-surface mb-1">{problem.title}</p>
                      <p className="text-body-sm text-on-surface-variant mb-2.5">
                        {problem.location.city || 'Gujarat'}, {problem.location.state || 'India'} •{' '}
                        {CATEGORY_LABELS[problem.category] || problem.category} •{' '}
                        <span className="font-medium text-on-surface">
                          {problem.affectedPopulation.toLocaleString()} citizens impacted
                        </span>
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {expertise.slice(0, 4).map((exp) => (
                          <Badge key={exp} variant="surface" size="sm">
                            {exp}
                          </Badge>
                        ))}
                        {expertise.length > 4 && (
                          <Badge variant="outline" size="sm">
                            +{expertise.length - 4} more
                          </Badge>
                        )}
                      </div>
                    </div>
                    <MaterialIcon
                      icon="chevron_right"
                      size={24}
                      className="text-on-surface-variant/40 mt-1 shrink-0 self-center"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
