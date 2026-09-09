import { useNavigate } from 'react-router-dom';
import { useProblems } from '../../context/ProblemContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { StatusChip } from '../../components/common/StatusChip';
import { MaterialIcon } from '../../components/common/MaterialIcon';
import { KpiCard } from '../../components/common/KpiCard';
import { CategoryBreakdownChart, WeekTrendChart } from '../../components/dashboard/Charts';
import { DEMO_UNIVERSITY_MATCHES, DEMO_TEAM_MEMBERS, DEMO_PROJECT, CATEGORY_LABELS } from '../../data/demoData';

export function UniversityDashboard() {
  const navigate = useNavigate();
  const { problems } = useProblems();

  const recommended = problems.slice(0, 3);
  const activeProject = DEMO_PROJECT;
  const acceptedMatch = DEMO_UNIVERSITY_MATCHES.find((m) => m.status === 'active');

  return (
    <div className="max-w-[1440px] mx-auto space-y-6">
      {/* Top Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Disaster Queue" value="18" icon="crisis_alert" detail="Recommended Challenges" />
        <KpiCard label="Active R&D" value="6" icon="science" detail="Active Lab Projects" />
        <KpiCard label="Field Engineers" value="48" icon="groups" detail="Students Deployed" />
        <KpiCard label="TRL Readiness" value="3" icon="rocket_launch" detail="Patent/Prototype Pilots" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CategoryBreakdownChart />
        <WeekTrendChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recommended Challenges */}
        <Card className="lg:col-span-2 p-0">
          <div className="p-4 flex items-center justify-between border-b border-outline-variant/20">
            <div>
              <h2 className="font-headline-md text-on-surface">Recommended Challenges</h2>
              <p className="text-body-sm text-on-surface-variant">AI-matched to IIT Gandhinagar capabilities</p>
            </div>
            <Button variant="secondary" size="sm" icon="auto_awesome">AI Matched</Button>
          </div>
          <div className="divide-y divide-outline-variant/10">
            {recommended.map((problem, idx) => (
              <div key={problem.id} className="p-4 hover:bg-surface-container-high/30 transition-colors cursor-pointer" onClick={() => navigate(`/university/challenges/${problem.id}`)}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-data-metric text-secondary">{problem.priorityScore}</span>
                      <span className="text-label-md text-on-surface-variant uppercase">Priority</span>
                      <StatusChip severity={problem.severity} size="sm" />
                      <StatusChip status={problem.status} size="sm" />
                      {idx === 0 && <Badge variant="secondary" size="sm" icon="thumb_up">94% Match</Badge>}
                    </div>
                    <p className="font-headline-sm text-on-surface mb-0.5">{problem.title}</p>
                    <p className="text-body-sm text-on-surface-variant mb-2">{problem.location.city}, {problem.location.state} • {CATEGORY_LABELS[problem.category]}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {problem.requiredExpertise.map((exp) => (
                        <Badge key={exp} variant="surface" size="sm">{exp}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <Button variant={idx === 0 ? 'secondary' : 'outline'} size="sm" icon="handshake" onClick={(e) => { e.stopPropagation(); navigate(`/university/challenges/${problem.id}`); }}>
                      {idx === 0 ? 'Accept Challenge' : 'Review'}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Right Column */}
        <div className="space-y-6">
          {/* My Active Project */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-headline-sm text-on-surface">Active Project</h3>
              <Badge variant="success" size="sm">Active</Badge>
            </div>
            <p className="font-headline-md text-on-surface mb-0.5">{activeProject.title}</p>
            <p className="text-body-sm text-on-surface-variant mb-3">
              Prof. {acceptedMatch?.facultyLead} • {acceptedMatch?.studentCount} Student Engineers
            </p>
            <div className="space-y-2 mb-4">
              {activeProject.milestones.slice(0, 2).map((ms) => (
                <div key={ms.id} className="flex items-center justify-between p-2.5 bg-surface-container-high/50 rounded-lg">
                  <p className="text-body-sm text-on-surface text-truncate-1">{ms.title}</p>
                  <Badge variant={ms.status === 'completed' ? 'success' : ms.status === 'in_progress' ? 'secondary' : 'outline'} size="sm">
                    {ms.status.replace('_', ' ')}
                  </Badge>
                </div>
              ))}
            </div>
            <Button variant="primary" className="w-full" icon="rocket_launch" onClick={() => navigate(`/university/challenges/${activeProject.problemId}`)}>
              Open R&D Hub
            </Button>
          </Card>

          {/* Team Snapshot */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-headline-sm text-on-surface">Team Snapshot</h3>
              <Badge variant="surface" size="sm">{DEMO_TEAM_MEMBERS.length} members</Badge>
            </div>
            <div className="space-y-2">
              {DEMO_TEAM_MEMBERS.map((m) => (
                <div key={m.id} className="flex items-center gap-3 p-2.5 bg-surface-container-high/50 rounded-lg">
                  <div className="w-9 h-9 rounded-full bg-secondary-fixed flex items-center justify-center shrink-0">
                    <MaterialIcon icon="person" size={18} className="text-secondary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-label-lg text-on-surface">{m.name}</p>
                    <p className="text-body-sm text-on-surface-variant text-truncate-1">{m.role.replace(/_/g, ' ')}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Capabilities + Lab Assets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <MaterialIcon icon="precision_manufacturing" size={22} className="text-secondary" />
            <h3 className="font-headline-sm text-on-surface">Research Capabilities</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-surface-container-high/50 rounded-lg">
              <p className="text-label-lg text-on-surface mb-1">Hydrological Modelling</p>
              <p className="text-data-metric text-secondary">32</p>
              <p className="text-body-sm text-on-surface-variant">research-grade model runs ready</p>
            </div>
            <div className="p-3 bg-surface-container-high/50 rounded-lg">
              <p className="text-label-lg text-on-surface mb-1">Flood-Risk Group</p>
              <p className="text-data-metric text-secondary">6</p>
              <p className="text-body-sm text-on-surface-variant">domain researchers on call</p>
            </div>
            <div className="p-3 bg-surface-container-high/50 rounded-lg">
              <p className="text-label-lg text-on-surface mb-1">Civil & Hydrology Lab</p>
              <p className="text-body-sm text-on-surface-variant">Validation of flood-risk models and alert thresholds</p>
            </div>
            <div className="p-3 bg-surface-container-high/50 rounded-lg">
              <p className="text-label-lg text-on-surface mb-1">Cloud Credits</p>
              <p className="text-data-metric text-secondary">$50K</p>
              <p className="text-body-sm text-on-surface-variant">sponsored by AWS India</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <MaterialIcon icon="cognition" size={22} className="text-secondary" />
            <h3 className="font-headline-sm text-on-surface">Sponsored AI Skills & Capabilities</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-surface-container-high/50 rounded-lg">
              <div className="flex items-center gap-3">
                <MaterialIcon icon="flood" size={20} className="text-secondary" />
                <p className="text-label-lg text-on-surface">Flood Water Level Prediction</p>
              </div>
              <MaterialIcon icon="chevron_right" size={18} className="text-on-surface-variant/40" />
            </div>
            <div className="flex items-center justify-between p-3 bg-surface-container-high/50 rounded-lg">
              <div className="flex items-center gap-3">
                <MaterialIcon icon="landslide" size={20} className="text-secondary" />
                <p className="text-label-lg text-on-surface">Landslide Early Warning</p>
              </div>
              <MaterialIcon icon="chevron_right" size={18} className="text-on-surface-variant/40" />
            </div>
            <div className="flex items-center justify-between p-3 bg-surface-container-high/50 rounded-lg">
              <div className="flex items-center gap-3">
                <MaterialIcon icon="volcano" size={20} className="text-secondary" />
                <p className="text-label-lg text-on-surface">Cyclone Path Prediction</p>
              </div>
              <MaterialIcon icon="chevron_right" size={18} className="text-on-surface-variant/40" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}