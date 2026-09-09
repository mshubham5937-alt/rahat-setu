import { useNavigate } from 'react-router-dom';
import { useProblems } from '../../context/ProblemContext';
import { KpiCard } from '../../components/common/KpiCard';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { StatusChip } from '../../components/common/StatusChip';
import { MaterialIcon } from '../../components/common/MaterialIcon';
import { LifecycleTracker } from '../../components/problem/LifecycleTracker';
import { PriorityDistributionChart, CategoryBreakdownChart, WeekTrendChart, PipelineRadialChart } from '../../components/dashboard/Charts';
import { DEMO_PROJECT, DEMO_INDUSTRY_MATCHES, CATEGORY_LABELS } from '../../data/demoData';

export function GovernmentDashboard() {
  const navigate = useNavigate();
  const { problems, getProblemById } = useProblems();

  const priQueue = problems.slice().sort((a, b) => b.priorityScore - a.priorityScore);
  const activeProject = DEMO_PROJECT;
  const activeProblem = getProblemById(activeProject.problemId);

  return (
    <div className="max-w-[1440px] mx-auto space-y-6">
      {/* Top Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard
          label="Critical Problems"
          value="14"
          trend="+2"
          trendType="up"
          urgent="8 Urgent"
          color="error"
          detail="Ahmedabad #26043"
        />
        <KpiCard
          label="Awaiting Verification"
          value="28"
          trend="+5"
          trendType="up"
          color="warning"
          detail="Review Queue →"
        />
        <KpiCard
          label="Active University Projects"
          value="42"
          trend="+3"
          trendType="up"
          color="secondary"
          detail="18 Prototypes"
        />
        <KpiCard
          label="Pilot Deployments"
          value="9"
          trend="+1"
          trendType="up"
          color="secondary"
          detail="3 in Gujarat"
        />
        <KpiCard
          label="Beneficiaries Protected"
          value="1.2M"
          trend="+45K"
          trendType="up"
          color="primary"
          detail="Audited"
        />
      </div>

      {/* Analytics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <PriorityDistributionChart />
        <CategoryBreakdownChart />
        <WeekTrendChart />
        <PipelineRadialChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Priority Queue */}
        <Card className="lg:col-span-2 p-0">
          <div className="p-4 flex items-center justify-between border-b border-outline-variant/20">
            <div>
              <h2 className="font-headline-md text-on-surface">Priority Verification Queue</h2>
              <p className="text-body-sm text-on-surface-variant">AI-ranked problems awaiting government action</p>
            </div>
            <Button variant="secondary" size="sm" icon="filter_alt">Filter</Button>
          </div>
          <div className="divide-y divide-outline-variant/10">
            {priQueue.map((problem, idx) => {
              const isTop = idx === 0;
              return (
                <div key={problem.id} className="p-4 hover:bg-surface-container-high/30 transition-colors cursor-pointer" onClick={() => navigate(`/government/problems/${problem.id}`)}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-data-metric text-secondary">{problem.priorityScore}</span>
                        <span className="text-label-md text-on-surface-variant uppercase">Score</span>
                        <StatusChip severity={problem.severity} size="sm" />
                        <StatusChip status={problem.status} size="sm" />
                        {isTop && <Badge variant="error" size="sm" pulse icon="crisis_alert">Top Priority</Badge>}
                      </div>
                      <p className="font-headline-sm text-on-surface mb-0.5">{problem.title}</p>
                      <p className="text-body-sm text-on-surface-variant">
                        {problem.location.city}, {problem.location.state} • {CATEGORY_LABELS[problem.category]} • {problem.affectedPopulation.toLocaleString()} affected
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-body-sm text-on-surface-variant">
                        <span className="flex items-center gap-1"><MaterialIcon icon="schedule" size={14} /> {problem.reportedAt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                        <span className="flex items-center gap-1"><MaterialIcon icon="person" size={14} /> {problem.reportedBy}</span>
                        <span className="flex items-center gap-1"><MaterialIcon icon="verified" size={14} />{problem.governmentVerification?.verified ? 'Verified' : 'Pending'}</span>
                      </div>
                    </div>
                    <MaterialIcon icon="chevron_right" size={18} className="text-on-surface-variant/40 mt-1 shrink-0" />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Right Column */}
        <div className="space-y-6">
          {/* SOS / Live Feed */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-headline-sm text-on-surface">Live Event Feed</h3>
              <Badge variant="error" size="sm" pulse dot>LIVE</Badge>
            </div>
            <div className="relative overflow-hidden rounded-lg bg-primary-container border border-outline-variant/20 mb-3">
              {/* Radar-like viz placeholder */}
              <div className="aspect-[4/3] grid-bg relative flex items-center justify-center">
                <div className="absolute inset-0 radar-sweep rounded-full border border-secondary/30 opacity-40" style={{ transform: 'scale(0.8)' }} />
                <div className="text-center">
                  <MaterialIcon icon="radar" size={40} className="text-secondary mx-auto mb-1" />
                  <p className="text-label-md text-on-primary-container">Ahmedabad Zone 4</p>
                  <p className="text-body-sm text-on-primary-container/60">14 Live Alerts</p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-body-sm text-on-surface">
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                <span>Paldi Underpass water level rising 0.3m/hr</span>
              </div>
              <div className="flex items-center gap-2 text-body-sm text-on-surface-variant">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span>AMC pump backup: operating at 70% capacity</span>
              </div>
            </div>
          </Card>

          {/* Current Project Spotlight */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-headline-sm text-on-surface">Active Project Spotlight</h3>
              <Badge variant="success" size="sm">Active</Badge>
            </div>
            <p className="font-headline-md text-on-surface mb-1">{activeProject.title}</p>
            <p className="text-body-sm text-on-surface-variant mb-4">{activeProject.universityName} • {activeProject.industryNames.join(', ')}</p>
            {activeProblem && <LifecycleTracker currentStage={activeProblem.currentStage} />}
            <Button variant="primary" size="md" className="w-full mt-4" icon="insights" onClick={() => navigate(`/government/problems/${activeProject.problemId}`)}>
              View Command Brief
            </Button>
          </Card>
        </div>
      </div>

      {/* Partners Matrix */}
      <Card className="p-0">
        <div className="p-4 flex items-center justify-between border-b border-outline-variant/20">
          <h3 className="font-headline-md text-on-surface">Cross-Sector Partner Matrix</h3>
          <Button variant="secondary" size="sm" icon="handshake" onClick={() => navigate('/government/projects')}>Manage Partners</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-outline-variant/20">
          {/* University Partners */}
          <div className="p-4 bg-surface-container-lowest">
            <div className="flex items-center gap-2 mb-3">
              <MaterialIcon icon="school" size={20} className="text-secondary" />
              <h4 className="font-headline-sm text-on-surface">University Partners</h4>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-surface-container-high/50 rounded-lg">
                <div>
                  <p className="text-label-lg text-on-surface">IIT Gandhinagar</p>
                  <p className="text-body-sm text-on-surface-variant">HR: Prof. A. Mehta • 8 Students</p>
                </div>
                <Badge variant="success" size="sm">Active</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-surface-container-high/50 rounded-lg">
                <div>
                  <p className="text-label-lg text-on-surface">IIT Bhubaneswar</p>
                  <p className="text-body-sm text-on-surface-variant">HR: Prof. S. Nayak • 6 Students</p>
                </div>
                <Badge variant="outline" size="sm">Suggested</Badge>
              </div>
            </div>
          </div>

          {/* Industry Partners */}
          <div className="p-4 bg-surface-container-lowest">
            <div className="flex items-center gap-2 mb-3">
              <MaterialIcon icon="corporate_fare" size={20} className="text-secondary" />
              <h4 className="font-headline-sm text-on-surface">Industry Partners</h4>
            </div>
            <div className="space-y-2">
              {DEMO_INDUSTRY_MATCHES.map((part) => (
                <div key={part.industryId} className="flex items-center justify-between p-3 bg-surface-container-high/50 rounded-lg">
                  <div>
                    <p className="text-label-lg text-on-surface">{part.industryName}</p>
                    <p className="text-body-sm text-on-surface-variant">{part.contributions.length} contributions • {part.matchScore}% match</p>
                  </div>
                  <Badge variant={part.status === 'committed' ? 'success' : 'outline'} size="sm">{part.status}</Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Agency Partners */}
          <div className="p-4 bg-surface-container-lowest">
            <div className="flex items-center gap-2 mb-3">
              <MaterialIcon icon="account_balance" size={20} className="text-secondary" />
              <h4 className="font-headline-sm text-on-surface">Agency Partners</h4>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-surface-container-high/50 rounded-lg">
                <div>
                  <p className="text-label-lg text-on-surface">AMC Disaster Cell</p>
                  <p className="text-body-sm text-on-surface-variant">Shri R. Patel, Dy. Commissioner</p>
                </div>
                <Badge variant="success" size="sm">Active</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-surface-container-high/50 rounded-lg">
                <div>
                  <p className="text-label-lg text-on-surface">NDMA-GSDMA</p>
                  <p className="text-body-sm text-on-surface-variant">Early Warning Coordination</p>
                </div>
                <Badge variant="outline" size="sm">Advised</Badge>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Project Tracker Table */}
      <Card className="p-0">
        <div className="p-4 flex items-center justify-between border-b border-outline-variant/20">
          <h3 className="font-headline-md text-on-surface">Cross-Sector Project Tracker</h3>
          <Button variant="ghost" size="sm" iconPosition="right" icon="arrow_forward" onClick={() => navigate('/government/projects')}>
            View All
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-surface-container-high/50 text-left">
                <th className="px-4 py-2.5 text-label-md text-on-surface-variant uppercase tracking-wider">Project</th>
                <th className="px-4 py-2.5 text-label-md text-on-surface-variant uppercase tracking-wider">University</th>
                <th className="px-4 py-2.5 text-label-md text-on-surface-variant uppercase tracking-wider">Industry</th>
                <th className="px-4 py-2.5 text-label-md text-on-surface-variant uppercase tracking-wider">Status</th>
                <th className="px-4 py-2.5 text-label-md text-on-surface-variant uppercase tracking-wider">Progress</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-outline-variant/20 hover:bg-surface-container-high/30 cursor-pointer transition-colors" onClick={() => navigate(`/government/problems/${activeProblem?.id ?? activeProject.problemId}`)}>
                <td className="px-4 py-3">
                  <p className="text-label-lg text-on-surface text-truncate-1 max-w-[260px]">{activeProject.title}</p>
                </td>
                <td className="px-4 py-3 text-body-sm text-on-surface-variant">{activeProject.universityName}</td>
                <td className="px-4 py-3">
                  <Badge variant="surface" size="sm">{activeProject.industryNames[0]}</Badge>
                </td>
                <td className="px-4 py-3"><Badge variant="success" size="sm">{activeProject.status}</Badge></td>
                <td className="px-4 py-3">
                  <div className="w-24 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                    <div className="h-full bg-secondary rounded-full" style={{ width: `${(activeProject.currentStage / 9 * 100).toFixed(0)}%` }} />
                  </div>
                </td>
                <td className="px-4 py-3"><MaterialIcon icon="chevron_right" size={18} className="text-on-surface-variant/40" /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}