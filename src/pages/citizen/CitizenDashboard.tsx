import { useNavigate } from 'react-router-dom';
import { useProblems } from '../../context/ProblemContext';
import { useNotifications } from '../../context/NotificationContext';
import { KpiCard } from '../../components/common/KpiCard';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { StatusChip } from '../../components/common/StatusChip';
import { MaterialIcon } from '../../components/common/MaterialIcon';
import { LifecycleTracker } from '../../components/problem/LifecycleTracker';
import { DEMO_PROJECT, DEMO_EVIDENCE, CATEGORY_LABELS } from '../../data/demoData';

export function CitizenDashboard() {
  const navigate = useNavigate();
  const { problems, getCriticalCount } = useProblems();
  const { unreadCount } = useNotifications();

  const activeProblem = problems[0]; // prob-26043
  const project = DEMO_PROJECT;

  const myReports = problems.slice(0, 3);
  const myReportCount = myReports.length;

  return (
    <div className="max-w-[1440px] mx-auto space-y-6">
      {/* Top Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="My Reports Tracked"
          value={String(myReportCount)}
          trend="+1"
          trendType="up"
          icon="flag"
          detail={myReportCount > 0 ? `${myReportCount} in active tracking` : 'No reports yet'}
        />
        <KpiCard
          label="Area Verified Alerts"
          value={String(getCriticalCount())}
          urgent={`${getCriticalCount()} critical in your ward`}
          icon="coronavirus"
          detail="Ahmedabad – Zone 4"
        />
        <KpiCard
          label="NGO / Volunteer Support"
          value="12"
          icon="volunteer_activism"
          detail="5 near your locality"
        />
        <KpiCard
          label="Citizens Protected in Network"
          value="1.2M"
          trend="+45K"
          trendType="up"
          icon="shield"
          detail="Audited across Gujarat"
        />
      </div>

      {/* Hero: Active Problem Tracking */}
      <Card className="border-primary/20 bg-gradient-to-br from-surface-container-lowest to-secondary-fixed/20">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" dot pulse>Live Tracking</Badge>
              <StatusChip severity={activeProblem.severity} />
              <StatusChip status={activeProblem.status} />
            </div>
            <h2 className="font-headline-lg text-on-surface">{activeProblem.title}</h2>
            <p className="text-body-md text-on-surface-variant mt-1">
              {activeProblem.location.address} • {activeProblem.location.city}, {activeProblem.location.state}
            </p>
          </div>
          <div className="hidden md:flex flex-col items-end gap-2">
            <p className="text-data-metric text-secondary">{activeProblem.priorityScore}<span className="text-body-md">/100</span></p>
            <p className="text-label-md text-on-surface-variant uppercase">AI Priority Score</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lifecycle */}
          <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant/30 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-headline-sm text-on-surface">Problem Lifecycle</h3>
              <Button variant="ghost" size="sm" iconPosition="right" icon="arrow_forward" onClick={() => navigate(`/citizen/reports/${activeProblem.id}`)}>
                View Details
              </Button>
            </div>
            <LifecycleTracker currentStage={activeProblem.currentStage} />
          </div>

          {/* Evidence Preview */}
          <div className="bg-surface-container-lowest border border-outline-variant/30 p-5">
            <h3 className="font-headline-sm text-on-surface mb-4">Evidence Collected</h3>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {DEMO_EVIDENCE.filter((e) => e.type === 'photo').map((ev) => (
                <div key={ev.id} className="aspect-square bg-surface-container-high rounded-lg overflow-hidden relative group cursor-pointer">
                  <img src={ev.url} alt={ev.caption} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                    <MaterialIcon icon="zoom_in" size={20} className="text-white opacity-0 group-hover:opacity-100" />
                  </div>
                </div>
              ))}
              <div className="aspect-square bg-secondary-fixed/30 rounded-lg flex items-center justify-center cursor-pointer hover:bg-secondary-fixed/60 transition-colors">
                <MaterialIcon icon="add_a_photo" size={20} className="text-secondary" />
              </div>
            </div>
            <div className="flex items-center gap-2 text-on-surface-variant text-body-sm">
              <MaterialIcon icon="mic" size={16} />
              <span>Voice note: Gujarati description</span>
              <Badge variant="surface" size="sm">2:15</Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Project Progress + Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Progress */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-headline-sm text-on-surface">Community Project Progress</h3>
            <Badge variant="surface" size="sm">Collaborative</Badge>
          </div>

          <div className="space-y-4">
            {/* Project header */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-headline-md text-on-surface">{project.title}</p>
                <p className="text-body-sm text-on-surface-variant">
                  {project.universityName} • {project.industryNames.join(', ')}
                </p>
              </div>
              <MaterialIcon icon="groups" size={28} className="text-secondary" />
            </div>

            {/* Progress bar */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-label-md text-on-surface-variant">Stage {project.currentStage} of 9</span>
                <span className="text-label-md text-secondary font-semibold">
                  {(project.currentStage / 9 * 100).toFixed(0)}%
                </span>
              </div>
              <div className="h-2 bg-surface-container-high rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-secondary to-primary rounded-full transition-all duration-700"
                  style={{ width: `${(project.currentStage / 9 * 100).toFixed(0)}%` }}
                />
              </div>
            </div>

            {/* Milestones preview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {project.milestones.map((ms) => (
                <div key={ms.id} className="bg-surface-container-high/60 border border-outline-variant/20 p-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-label-lg text-on-surface text-truncate-1">{ms.title}</p>
                    <Badge
                      variant={ms.status === 'completed' ? 'success' : ms.status === 'in_progress' ? 'secondary' : 'outline'}
                      size="sm"
                      icon={ms.status === 'completed' ? 'check' : ms.status === 'in_progress' ? 'schedule' : 'pending'}
                    >
                      {ms.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-body-sm text-on-surface-variant text-truncate-2">{ms.description}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Recent Activity */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-headline-sm text-on-surface">Recent Activity</h3>
            {unreadCount > 0 && (
              <Badge variant="error" size="sm" dot>{unreadCount} new</Badge>
            )}
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-secondary-fixed flex items-center justify-center shrink-0">
                <MaterialIcon icon="crisis_alert" size={16} className="text-secondary" />
              </div>
              <div>
                <p className="text-label-lg text-on-surface">AI Analysis Complete</p>
                <p className="text-body-sm text-on-surface-variant">Flooding severity confirmed Critical</p>
                <p className="text-body-sm text-on-surface-variant/50">08:45 AM</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-secondary-fixed flex items-center justify-center shrink-0">
                <MaterialIcon icon="verified" size={16} className="text-secondary" />
              </div>
              <div>
                <p className="text-label-lg text-on-surface">Gov. Verified</p>
                <p className="text-body-sm text-on-surface-variant">AMC Field Officer confirmed flooding</p>
                <p className="text-body-sm text-on-surface-variant/50">10:15 AM</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-secondary-fixed flex items-center justify-center shrink-0">
                <MaterialIcon icon="school" size={16} className="text-secondary" />
              </div>
              <div>
                <p className="text-label-lg text-on-surface">University Matched</p>
                <p className="text-body-sm text-on-surface-variant">IIT Gandhinagar (94% match)</p>
                <p className="text-body-sm text-on-surface-variant/50">11:00 AM</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-secondary-fixed flex items-center justify-center shrink-0">
                <MaterialIcon icon="precision_manufacturing" size={16} className="text-secondary" />
              </div>
              <div>
                <p className="text-label-lg text-on-surface">Industry Joined</p>
                <p className="text-body-sm text-on-surface-variant">Tata Communications: alert platform + field team pledged</p>
                <p className="text-body-sm text-on-surface-variant/50">4:00 PM</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Recommendations + Safety Resources */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Recommendations */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-headline-sm text-on-surface">AI Safety Recommendations</h3>
            <Badge variant="secondary" size="sm" icon="auto_awesome">AI Generated</Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-error-container/40 border border-error/20 p-4">
              <div className="flex items-center gap-2 mb-2">
                <MaterialIcon icon="warning" size={18} className="text-error" />
                <p className="text-label-lg text-error">Immediate Action</p>
              </div>
              <p className="text-body-md text-on-surface">
                Avoid underpass roads. Water level 1.4m & rising. Use Satellite Road alternate.
              </p>
            </div>
            <div className="bg-secondary-fixed/40 border border-secondary/20 p-4">
              <div className="flex items-center gap-2 mb-2">
                <MaterialIcon icon="campaign" size={18} className="text-secondary" />
                <p className="text-label-lg text-secondary">Community Alert</p>
              </div>
              <p className="text-body-md text-on-surface">
                Drainage pumps restored. Reverse pump backup generator activated for 18h.
              </p>
            </div>
            <div className="bg-surface-container-high border border-outline-variant/30 p-4">
              <div className="flex items-center gap-2 mb-2">
                <MaterialIcon icon="support_agent" size={18} className="text-on-surface-variant" />
                <p className="text-label-lg text-on-surface-variant">Volunteer Coordination</p>
              </div>
              <p className="text-body-md text-on-surface">
                Join 12 volunteers distributing sandbags at Vasna Barrage. Sign up via portal.
              </p>
            </div>
            <div className="bg-surface-container-high border border-outline-variant/30 p-4">
              <div className="flex items-center gap-2 mb-2">
                <MaterialIcon icon="health_and_safety" size={18} className="text-on-surface-variant" />
                <p className="text-label-lg text-on-surface-variant">Health Advisory</p>
              </div>
              <p className="text-body-md text-on-surface">
                Boil water before use. Waterborne disease risk elevated in flooded zones.
              </p>
            </div>
          </div>
        </Card>

        {/* Safety Resources */}
        <Card>
          <h3 className="font-headline-sm text-on-surface mb-4">Safety Resources</h3>
          <div className="space-y-3">
            <a href="#" className="flex items-center gap-3 p-3 bg-surface-container-high/50 hover:bg-surface-container-high transition-colors no-underline">
              <MaterialIcon icon="local_phone" size={20} className="text-secondary" />
              <div>
                <p className="text-label-lg text-on-surface">Emergency Helpline</p>
                <p className="text-body-sm text-secondary font-bold">112 / 1800-AHD-MUNIC</p>
              </div>
            </a>
            <a href="#" className="flex items-center gap-3 p-3 bg-surface-container-high/50 hover:bg-surface-container-high transition-colors no-underline">
              <MaterialIcon icon="apartment" size={20} className="text-secondary" />
              <div>
                <p className="text-label-lg text-on-surface">Nearby Shelters</p>
                <p className="text-body-sm text-on-surface-variant">3 shelters within 2km</p>
              </div>
            </a>
            <a href="#" className="flex items-center gap-3 p-3 bg-surface-container-high/50 hover:bg-surface-container-high transition-colors no-underline">
              <MaterialIcon icon="volunteer_activism" size={20} className="text-secondary" />
              <div>
                <p className="text-label-lg text-on-surface">Volunteer Network</p>
                <p className="text-body-sm text-on-surface-variant">Join community response</p>
              </div>
            </a>
          </div>
        </Card>
      </div>

      {/* My Reports Table */}
      <Card className="p-0">
        <div className="p-4 flex items-center justify-between border-b border-outline-variant/20">
          <h3 className="font-headline-sm text-on-surface">My Reports</h3>
          <Button variant="ghost" size="sm" iconPosition="right" icon="arrow_forward" onClick={() => navigate('/citizen/reports')}>
            View All
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-surface-container-high/50 text-left">
                <th className="px-4 py-2.5 text-label-md text-on-surface-variant uppercase tracking-wider">Problem</th>
                <th className="px-4 py-2.5 text-label-md text-on-surface-variant uppercase tracking-wider">Category</th>
                <th className="px-4 py-2.5 text-label-md text-on-surface-variant uppercase tracking-wider">Severity</th>
                <th className="px-4 py-2.5 text-label-md text-on-surface-variant uppercase tracking-wider">Status</th>
                <th className="px-4 py-2.5 text-label-md text-on-surface-variant uppercase tracking-wider">Reported</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {myReports.map((problem) => (
                <tr
                  key={problem.id}
                  className="border-t border-outline-variant/20 hover:bg-surface-container-high/30 cursor-pointer transition-colors"
                  onClick={() => navigate(`/citizen/reports/${problem.id}`)}
                >
                  <td className="px-4 py-3">
                    <p className="text-label-lg text-on-surface text-truncate-1 max-w-[300px]">{problem.title}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="surface" size="sm">{CATEGORY_LABELS[problem.category]}</Badge>
                  </td>
                  <td className="px-4 py-3"><StatusChip severity={problem.severity} size="sm" /></td>
                  <td className="px-4 py-3"><StatusChip status={problem.status} size="sm" /></td>
                  <td className="px-4 py-3 text-body-sm text-on-surface-variant">
                    {problem.reportedAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <MaterialIcon icon="chevron_right" size={18} className="text-on-surface-variant/40" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}