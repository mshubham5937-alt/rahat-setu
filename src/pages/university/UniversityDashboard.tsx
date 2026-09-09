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

  const recommended = problems.slice(0, 4);
  const activeCount = problems.filter((p) => p.currentStage >= 4).length;
  const pilotsCount = problems.filter((p) => p.currentStage >= 7).length;
  const activeProblem = problems.find((p) => p.currentStage >= 4) || problems[0];
  const acceptedMatch = DEMO_UNIVERSITY_MATCHES.find((m) => m.status === 'active') || DEMO_UNIVERSITY_MATCHES[0];

  return (
    <div className="max-w-[1440px] mx-auto space-y-6">
      {/* Top Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Disaster Queue"
          value={String(problems.length)}
          icon="crisis_alert"
          detail="Pending Academic Triage"
        />
        <KpiCard
          label="Active R&D Taskforces"
          value={String(Math.max(1, activeCount))}
          icon="science"
          detail="Collaborating Labs"
        />
        <KpiCard
          label="Student Engineers"
          value={String(32 + activeCount * 6)}
          icon="groups"
          detail="Deployed in Research"
        />
        <KpiCard
          label="TRL Pilots"
          value={String(Math.max(1, pilotsCount))}
          icon="rocket_launch"
          detail="Field Trials Active"
        />
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
              <p className="text-body-sm text-on-surface-variant">
                AI-matched to IIT Gandhinagar & National Innovation Cells
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              icon="open_in_new"
              onClick={() => navigate('/university/challenges')}
            >
              View Full Queue
            </Button>
          </div>
          <div className="divide-y divide-outline-variant/10">
            {recommended.map((problem, idx) => {
              const expertise = problem.requiredExpertise || problem.aiAnalysis?.recommendedExpertise || [];
              const matchPercentage = 95 - idx * 4;
              return (
                <div
                  key={problem.id}
                  className="p-4 hover:bg-surface-container-high/30 transition-colors cursor-pointer"
                  onClick={() => navigate(`/university/challenges/${problem.id}`)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-data-metric text-secondary font-bold">{problem.priorityScore}</span>
                        <span className="text-label-md text-on-surface-variant uppercase">Priority</span>
                        <StatusChip severity={problem.severity} size="sm" />
                        <StatusChip status={problem.status} size="sm" />
                        <Badge variant="secondary" size="sm" icon="thumb_up">
                          {matchPercentage}% Match
                        </Badge>
                      </div>
                      <p className="font-headline-sm text-on-surface mb-0.5">{problem.title}</p>
                      <p className="text-body-sm text-on-surface-variant mb-2">
                        {problem.location.city || 'Gujarat'}, {problem.location.state || 'India'} •{' '}
                        {CATEGORY_LABELS[problem.category] || problem.category}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {expertise.slice(0, 4).map((exp) => (
                          <Badge key={exp} variant="surface" size="sm">
                            {exp}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
                      <Button
                        variant={idx === 0 ? 'secondary' : 'outline'}
                        size="sm"
                        icon="handshake"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/university/challenges/${problem.id}`);
                        }}
                      >
                        {idx === 0 ? 'Accept Challenge' : 'Inspect R&D'}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Active Project */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-headline-sm text-on-surface">Active R&D Taskforce</h3>
              <Badge variant="success" size="sm">
                Active
              </Badge>
            </div>
            <p className="font-headline-md text-on-surface mb-0.5">
              {activeProblem?.title || DEMO_PROJECT.title}
            </p>
            <p className="text-body-sm text-on-surface-variant mb-3">
              Lead: Prof. {acceptedMatch?.facultyLead || 'Anand Verma'} • {acceptedMatch?.studentCount || 8}{' '}
              Student Engineers
            </p>
            <div className="space-y-2 mb-4">
              <div className="p-2.5 bg-surface-container-high/50 rounded-lg flex items-center justify-between">
                <p className="text-body-sm text-on-surface font-medium">Stage {activeProblem?.currentStage || 5}/9</p>
                <Badge variant="secondary" size="sm">
                  {Math.round(((activeProblem?.currentStage || 5) / 9) * 100)}% Progress
                </Badge>
              </div>
            </div>
            <div className="space-y-2">
              <Button
                variant="primary"
                className="w-full"
                icon="rocket_launch"
                onClick={() =>
                  navigate(activeProblem ? `/university/challenges/${activeProblem.id}` : '/university/projects')
                }
              >
                Open Project Workspace
              </Button>
              <Button
                variant="outline"
                className="w-full"
                icon="groups"
                onClick={() => navigate('/university/teams')}
              >
                Manage Research Team
              </Button>
            </div>
          </Card>

          {/* Team Snapshot */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-headline-sm text-on-surface">Team Roster</h3>
              <Badge variant="surface" size="sm">
                {DEMO_TEAM_MEMBERS.length} assigned
              </Badge>
            </div>
            <div className="space-y-2">
              {DEMO_TEAM_MEMBERS.map((m) => (
                <div key={m.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-secondary-fixed flex items-center justify-center shrink-0">
                    <MaterialIcon icon="person" size={16} className="text-secondary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-label-md text-on-surface font-medium">{m.name}</p>
                    <p className="text-body-sm text-on-surface-variant text-truncate-1">
                      {m.role.replace(/_/g, ' ')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
