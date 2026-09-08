import { useNavigate } from 'react-router-dom';
import { useProblems } from '../../context/ProblemContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { StatusChip } from '../../components/common/StatusChip';
import { MaterialIcon } from '../../components/common/MaterialIcon';
import { KpiCard } from '../../components/common/KpiCard';
import { PriorityDistributionChart, WeekTrendChart, PipelineRadialChart } from '../../components/dashboard/Charts';
import { DEMO_INDUSTRY_MATCHES, DEMO_PROJECT } from '../../data/demoData';

export function IndustryDashboard() {
  const navigate = useNavigate();
  const { problems, getProblemById } = useProblems();

  const tierOne = problems[0];
  const activeProject = DEMO_PROJECT;
  const activeProblem = getProblemById(activeProject.problemId);
  const committed = DEMO_INDUSTRY_MATCHES.filter((m) => m.status === 'committed');
  const suggested = DEMO_INDUSTRY_MATCHES.filter((m) => m.status !== 'committed');

  return (
    <div className="max-w-[1440px] mx-auto space-y-6">
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiCard label="CSR Capital Deployed" value="₹4.2 Cr" trend="+18.4%" trendType="up" detail="This fiscal quarter" icon="account_balance" />
        <KpiCard label="Active Field Deployments" value="16" detail="Across 9 vulnerable basins" icon="radar" />
        <KpiCard label="Enterprise Engineers" value="34" detail="1,480 pro-bono hours" icon="engineering" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <PriorityDistributionChart />
        <WeekTrendChart />
        <PipelineRadialChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Committed Deployments */}
        <Card className="lg:col-span-2 p-0">
          <div className="p-4 flex items-center justify-between border-b border-outline-variant/20">
            <div>
              <h2 className="font-headline-md text-on-surface">My Committed Responsibilities</h2>
              <p className="text-body-sm text-on-surface-variant">Contributions matched to disaster challenges</p>
            </div>
            <Button variant="secondary" size="sm" icon="link">Link Capability</Button>
          </div>
          <div className="divide-y divide-outline-variant/10">
            {committed.map((match) => (
              <div key={match.industryId} className="p-4 hover:bg-surface-container-high/30 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <MaterialIcon icon="corporate_fare" size={20} className="text-secondary" />
                      <p className="font-headline-sm text-on-surface">{match.industryName}</p>
                      <Badge variant="success" size="sm" icon="check_circle">Committed</Badge>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-3 mt-2">
                      {match.contributions.map((c) => (
                        <div key={c.type} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-surface-container-high/60 rounded-lg">
                          <MaterialIcon icon="inventory_2" size={14} className="text-secondary" />
                          <span className="text-body-sm text-on-surface font-medium">{c.type}</span>
                          <Badge variant="surface" size="sm">{c.quantity} {c.unit || ''}</Badge>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-4 text-body-sm text-on-surface-variant">
                      <span className="flex items-center gap-1"><MaterialIcon icon="radar" size={14} /> {tierOne.title.length > 30 ? `${tierOne.title.slice(0, 30)}...` : tierOne.title}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <Badge variant="secondary" size="sm">{match.matchScore}% Match</Badge>
                    <Button variant="outline" size="sm" icon="assignment_turned_in" onClick={() => navigate(`/industry/opportunities/${tierOne.id}`)}>
                      Manage Delivery
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Active Deployment */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-headline-sm text-on-surface">Active Field Deployment</h3>
              <Badge variant="success" size="sm" dot pulse>LIVE</Badge>
            </div>
            <p className="font-headline-md text-on-surface mb-0.5">{activeProject.title}</p>
            <p className="text-body-sm text-on-surface-variant mb-3">{tierOne.location.address || tierOne.location.city}</p>
            {activeProblem && (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <StatusChip severity={activeProblem.severity} size="sm" />
                  <StatusChip status={activeProblem.status} size="sm" />
                </div>
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-label-md text-on-surface-variant">Alert Delivery</span>
                    <span className="text-label-md text-secondary font-semibold">98% uptime</span>
                  </div>
                  <div className="h-2 bg-surface-container-high rounded-full overflow-hidden">
                    <div className="h-full bg-secondary rounded-full" style={{ width: '98%' }} />
                  </div>
                </div>
              </>
            )}
            <div className="space-y-2 mb-4">
              {committed[0]?.contributions.map((c) => (
                <div key={c.type} className="flex items-center justify-between p-2.5 bg-surface-container-high/50 rounded-lg">
                  <p className="text-body-sm text-on-surface text-truncate-1">{c.description}</p>
                  <Badge variant={c.status === 'delivered' ? 'success' : c.status === 'pledged' ? 'secondary' : 'surface'} size="sm">{c.status}</Badge>
                </div>
              ))}
            </div>
            <Button variant="primary" className="w-full" icon="radar" onClick={() => navigate(`/industry/projects/${activeProject.id}`)}>
              View Project
            </Button>
          </Card>

          {/* Suggested Opportunities */}
          <Card>
            <h3 className="font-headline-sm text-on-surface mb-3">Suggested Opportunities</h3>
            <div className="space-y-2">
              {suggested.map((match) => (
                <div key={match.industryId} className="flex items-center justify-between p-3 bg-surface-container-high/50 rounded-lg">
                  <div className="flex items-center gap-2 min-w-0">
                    <MaterialIcon icon="corporate_fare" size={18} className="text-secondary shrink-0" />
                    <div className="min-w-0">
                      <p className="text-label-lg text-on-surface text-truncate-1">{match.industryName}</p>
                      <p className="text-body-sm text-on-surface-variant">{match.matchScore}% match</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Review</Button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* CSR Impact Lounge */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MaterialIcon icon="leaderboard" size={22} className="text-secondary" />
            <h3 className="font-headline-md text-on-surface">Impact Lounge</h3>
          </div>
          <Badge variant="secondary" size="sm">Verified Metrics</Badge>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-surface-container-high/50 rounded-lg text-center">
            <MaterialIcon icon="people" size={28} className="text-secondary mx-auto mb-2" />
            <p className="text-data-metric text-on-surface">45K+</p>
            <p className="text-body-sm text-on-surface-variant">Citizens Protected</p>
          </div>
          <div className="p-4 bg-surface-container-high/50 rounded-lg text-center">
            <MaterialIcon icon="sync_alt" size={28} className="text-secondary mx-auto mb-2" />
            <p className="text-data-metric text-on-surface">300+</p>
            <p className="text-body-sm text-on-surface-variant">Alerts Channeled</p>
          </div>
          <div className="p-4 bg-surface-container-high/50 rounded-lg text-center">
            <MaterialIcon icon="flash_on" size={28} className="text-secondary mx-auto mb-2" />
            <p className="text-data-metric text-on-surface">45 Min</p>
            <p className="text-body-sm text-on-surface-variant">Avg. Response Time</p>
          </div>
          <div className="p-4 bg-surface-container-high/50 rounded-lg text-center">
            <MaterialIcon icon="verified" size={28} className="text-secondary mx-auto mb-2" />
            <p className="text-data-metric text-on-surface">18</p>
            <p className="text-body-sm text-on-surface-variant">CSR Reports Filed</p>
          </div>
        </div>
      </Card>
    </div>
  );
}