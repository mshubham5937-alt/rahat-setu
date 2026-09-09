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
import { DEMO_PROJECT, DEMO_EVIDENCE, CATEGORY_LABELS, DEMO_PROBLEMS } from '../../data/demoData';

export function CitizenDashboard() {
  const navigate = useNavigate();
  const { problems, getCriticalCount } = useProblems();
  const { unreadCount } = useNotifications();

  const activeProblem = problems[0] || DEMO_PROBLEMS[0];
  const project = DEMO_PROJECT;

  const myReports = problems.slice(0, 4);
  const myReportCount = myReports.length;

  const formatDate = (d: Date | string | undefined) => {
    if (!d) return 'Just now';
    const dateObj = d instanceof Date ? d : new Date(d);
    return isNaN(dateObj.getTime())
      ? 'Recent'
      : dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

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
          urgent={`${getCriticalCount()} critical in your sector`}
          icon="coronavirus"
          detail="Ahmedabad & North Basin"
        />
        <KpiCard
          label="Active Relief Teams"
          value="14"
          icon="volunteer_activism"
          detail="NDRF & Civil Defense Units"
        />
        <KpiCard
          label="Citizens Protected"
          value="1.4M"
          trend="+50K"
          trendType="up"
          icon="shield"
          detail="Live across Gujarat"
        />
      </div>

      {/* Hero: Active Problem Tracking */}
      {activeProblem && (
        <Card className="border-primary/20 bg-gradient-to-br from-surface-container-lowest to-secondary-fixed/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge variant="secondary" dot pulse>
                  Live Tracking
                </Badge>
                <StatusChip severity={activeProblem.severity} />
                <StatusChip status={activeProblem.status} />
              </div>
              <h2 className="font-headline-lg text-on-surface">{activeProblem.title}</h2>
              <p className="text-body-md text-on-surface-variant mt-1">
                {activeProblem.location.address || 'Sabarmati Riverfront Zone'} •{' '}
                {activeProblem.location.city || 'Ahmedabad'}, {activeProblem.location.state || 'Gujarat'}
              </p>
            </div>
            <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
              <div className="text-right">
                <p className="text-data-metric text-secondary font-bold">
                  {activeProblem.priorityScore}
                  <span className="text-body-md">/100</span>
                </p>
                <p className="text-label-md text-on-surface-variant uppercase">AI Priority Score</p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                icon="open_in_new"
                onClick={() => navigate(`/citizen/reports/${activeProblem.id}`)}
              >
                Track Live
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Lifecycle */}
            <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant/30 p-5 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-headline-sm text-on-surface">Problem Lifecycle</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  iconPosition="right"
                  icon="arrow_forward"
                  onClick={() => navigate(`/citizen/reports/${activeProblem.id}`)}
                >
                  View Details
                </Button>
              </div>
              <LifecycleTracker currentStage={activeProblem.currentStage} />
            </div>

            {/* Evidence Preview */}
            <div className="bg-surface-container-lowest border border-outline-variant/30 p-5 rounded-2xl">
              <h3 className="font-headline-sm text-on-surface mb-4">Field Evidence</h3>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {DEMO_EVIDENCE.filter((e) => e.type === 'photo').map((ev) => (
                  <a
                    key={ev.id}
                    href={ev.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="aspect-square bg-surface-container-high rounded-lg overflow-hidden relative group block"
                    title="Open photo"
                  >
                    <img src={ev.url} alt={ev.caption} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                      <MaterialIcon
                        icon="zoom_in"
                        size={20}
                        className="text-white opacity-0 group-hover:opacity-100"
                      />
                    </div>
                  </a>
                ))}
                <div
                  className="aspect-square bg-secondary-fixed/30 rounded-lg flex items-center justify-center cursor-pointer hover:bg-secondary-fixed/60 transition-colors"
                  onClick={() => navigate('/citizen/report/new')}
                  title="Add photo evidence"
                >
                  <MaterialIcon icon="add_a_photo" size={20} className="text-secondary" />
                </div>
              </div>
              <div className="flex items-center gap-2 text-on-surface-variant text-body-sm">
                <MaterialIcon icon="mic" size={16} />
                <span>Voice telemetry recorded</span>
                <Badge variant="surface" size="sm">
                  Verified
                </Badge>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Project Progress + Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Progress */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-headline-sm text-on-surface">Community Action Plan</h3>
            <Badge variant="surface" size="sm">
              Cross-Sector
            </Badge>
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
                <span className="text-label-md text-on-surface-variant">Stage {activeProblem.currentStage} of 9</span>
                <span className="text-label-md text-secondary font-semibold">
                  {((activeProblem.currentStage / 9) * 100).toFixed(0)}%
                </span>
              </div>
              <div className="h-2 bg-surface-container-high rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-secondary to-primary rounded-full transition-all duration-700"
                  style={{ width: `${((activeProblem.currentStage / 9) * 100).toFixed(0)}%` }}
                />
              </div>
            </div>

            {/* Milestones preview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {project.milestones.map((ms) => (
                <div
                  key={ms.id}
                  className="bg-surface-container-high/60 border border-outline-variant/20 p-3 rounded-xl"
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-label-lg text-on-surface text-truncate-1">{ms.title}</p>
                    <Badge
                      variant={
                        ms.status === 'completed'
                          ? 'success'
                          : ms.status === 'in_progress'
                            ? 'secondary'
                            : 'outline'
                      }
                      size="sm"
                      icon={
                        ms.status === 'completed'
                          ? 'check'
                          : ms.status === 'in_progress'
                            ? 'schedule'
                            : 'pending'
                      }
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
            <h3 className="font-headline-sm text-on-surface">Recent Field Events</h3>
            {unreadCount > 0 && (
              <Badge variant="error" size="sm" dot>
                {unreadCount} new
              </Badge>
            )}
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-secondary-fixed flex items-center justify-center shrink-0">
                <MaterialIcon icon="crisis_alert" size={16} className="text-secondary" />
              </div>
              <div>
                <p className="text-label-lg text-on-surface">AI Risk Scored</p>
                <p className="text-body-sm text-on-surface-variant">Severe flooding telemetry confirmed</p>
                <p className="text-body-sm text-on-surface-variant/50">15 min ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-secondary-fixed flex items-center justify-center shrink-0">
                <MaterialIcon icon="verified" size={16} className="text-secondary" />
              </div>
              <div>
                <p className="text-label-lg text-on-surface">SDMA Verified</p>
                <p className="text-body-sm text-on-surface-variant">Emergency relief assigned</p>
                <p className="text-body-sm text-on-surface-variant/50">1 hour ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-secondary-fixed flex items-center justify-center shrink-0">
                <MaterialIcon icon="school" size={16} className="text-secondary" />
              </div>
              <div>
                <p className="text-label-lg text-on-surface">Engineering Lab Matched</p>
                <p className="text-body-sm text-on-surface-variant">IIT Gandhinagar taskforce on site</p>
                <p className="text-body-sm text-on-surface-variant/50">3 hours ago</p>
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
            <h3 className="font-headline-sm text-on-surface">AI Safety & Evacuation Recommendations</h3>
            <Badge variant="secondary" size="sm" icon="auto_awesome">
              Live Advisory
            </Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-error-container/40 border border-error/20 p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <MaterialIcon icon="warning" size={18} className="text-error" />
                <p className="text-label-lg text-error font-medium">Immediate Action</p>
              </div>
              <p className="text-body-md text-on-surface">
                Avoid underpass roads along Sabarmati perimeter. Water level is 1.4m & rising. Use Satellite
                Road alternate.
              </p>
            </div>
            <div className="bg-secondary-fixed/40 border border-secondary/20 p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <MaterialIcon icon="campaign" size={18} className="text-secondary" />
                <p className="text-label-lg text-secondary font-medium">Community Alert</p>
              </div>
              <p className="text-body-md text-on-surface">
                Drainage pumps energized. Reserve pump backup generators activated for next 18 hours.
              </p>
            </div>
            <div className="bg-surface-container-high border border-outline-variant/30 p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <MaterialIcon icon="support_agent" size={18} className="text-on-surface-variant" />
                <p className="text-label-lg text-on-surface-variant font-medium">Volunteer Relief Camps</p>
              </div>
              <p className="text-body-md text-on-surface">
                Join 18 volunteers distributing clean potable water packets & sandbags at Vasna Barrage.
              </p>
            </div>
            <div className="bg-surface-container-high border border-outline-variant/30 p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <MaterialIcon icon="health_and_safety" size={18} className="text-on-surface-variant" />
                <p className="text-label-lg text-on-surface-variant font-medium">Health Advisory</p>
              </div>
              <p className="text-body-md text-on-surface">
                Boil municipal water before consumption. Waterborne disease prevention kits available at relief
                depots.
              </p>
            </div>
          </div>
        </Card>

        {/* Safety Resources */}
        <Card>
          <h3 className="font-headline-sm text-on-surface mb-4">Emergency Dispatch Channels</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-surface-container-high/50 rounded-xl">
              <MaterialIcon icon="local_phone" size={20} className="text-secondary shrink-0" />
              <div>
                <p className="text-label-lg text-on-surface font-medium">Disaster Helpline</p>
                <p className="text-body-sm text-secondary font-bold">112 / 1070 (SDMA Control)</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-surface-container-high/50 rounded-xl">
              <MaterialIcon icon="apartment" size={20} className="text-secondary shrink-0" />
              <div>
                <p className="text-label-lg text-on-surface font-medium">Designated Shelters</p>
                <p className="text-body-sm text-on-surface-variant">4 civic shelters active within 2km</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-surface-container-high/50 rounded-xl">
              <MaterialIcon icon="volunteer_activism" size={20} className="text-secondary shrink-0" />
              <div>
                <p className="text-label-lg text-on-surface font-medium">Civil Defense Volunteers</p>
                <p className="text-body-sm text-on-surface-variant">Direct rescue line: 108</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* My Reports Table */}
      <Card className="p-0 overflow-hidden">
        <div className="p-4 flex items-center justify-between border-b border-outline-variant/20">
          <h3 className="font-headline-sm text-on-surface">All Tracked Disaster Incidents</h3>
          <Button
            variant="ghost"
            size="sm"
            iconPosition="right"
            icon="arrow_forward"
            onClick={() => navigate('/citizen/reports')}
          >
            View Full List
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-surface-container-high/50 text-left">
                <th className="px-4 py-2.5 text-label-md text-on-surface-variant uppercase tracking-wider">
                  Incident
                </th>
                <th className="px-4 py-2.5 text-label-md text-on-surface-variant uppercase tracking-wider">
                  Category
                </th>
                <th className="px-4 py-2.5 text-label-md text-on-surface-variant uppercase tracking-wider">
                  Severity
                </th>
                <th className="px-4 py-2.5 text-label-md text-on-surface-variant uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-2.5 text-label-md text-on-surface-variant uppercase tracking-wider">
                  Reported
                </th>
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
                    <p className="text-label-lg text-on-surface text-truncate-1 max-w-[300px] font-medium">
                      {problem.title}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="surface" size="sm">
                      {CATEGORY_LABELS[problem.category] || problem.category}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <StatusChip severity={problem.severity} size="sm" />
                  </td>
                  <td className="px-4 py-3">
                    <StatusChip status={problem.status} size="sm" />
                  </td>
                  <td className="px-4 py-3 text-body-sm text-on-surface-variant">
                    {formatDate(problem.reportedAt)}
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
