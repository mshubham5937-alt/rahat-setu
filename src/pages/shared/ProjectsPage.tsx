import { useNavigate } from 'react-router-dom';
import { useProblems } from '../../context/ProblemContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { StatusChip } from '../../components/common/StatusChip';
import { MaterialIcon } from '../../components/common/MaterialIcon';
import { DEMO_PROJECT, DEMO_TEAM_MEMBERS, DEMO_MILESTONES } from '../../data/demoData';
import { cn } from '../../utils/cn';
import type { Role } from '../../types';

export function ProjectsPage({ role }: { role: Role }) {
  const navigate = useNavigate();
  const { problems } = useProblems();

  const linkedProblem = problems.find((p) => p.id === DEMO_PROJECT.problemId) || problems[0];

  const titleByRole: Record<Role, string> = {
    citizen: 'Active Projects',
    university: 'Active Research Projects',
    industry: 'Active Deployments',
    government: 'Cross-Sector Project Tracker',
  };

  const projects = [DEMO_PROJECT];

  const startCollaborationPath: string =
    role === 'citizen'
      ? '/citizen/report/new'
      : role === 'university'
        ? '/university/challenges'
        : role === 'industry'
          ? '/industry/opportunities'
          : '/government/problems';

  const lifecyclePath = `/projects/${linkedProblem?.id ?? DEMO_PROJECT.problemId}`;

  return (
    <div className="max-w-[1440px] mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-headline-lg text-on-surface mb-1">{titleByRole[role]}</h1>
          <p className="text-body-md text-on-surface-variant">
            {projects.length} project{projects.length > 1 ? 's' : ''} in flight • shared lifecycle across all roles
          </p>
        </div>
        <Button variant="secondary" icon="add" onClick={() => navigate(startCollaborationPath)}>
          {role === 'citizen' ? 'Report a problem' : 'Start collaboration'}
        </Button>
      </div>

      <div className="space-y-6">
        {projects.map((project) => {
          const progress = Math.round((project.currentStage / 9) * 100);
          const done = project.milestones.filter((m) => m.status === 'completed').length;

          return (
            <Card key={project.id} className="p-0 overflow-hidden">
              <div className="p-5 border-b border-outline-variant/20">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Badge variant="success" size="sm" icon="experiment">Active</Badge>
                      {linkedProblem && <StatusChip status={linkedProblem.status} size="sm" />}
                    </div>
                    <h2 className="font-headline-md text-on-surface mb-1">{project.title}</h2>
                    <p className="text-body-sm text-on-surface-variant mb-2">{project.description}</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="surface" size="sm" icon="school">{project.universityName}</Badge>
                      {project.industryNames.map((i) => (
                        <Badge key={i} variant="surface" size="sm" icon="corporate_fare">{i}</Badge>
                      ))}
                      <Badge variant="surface" size="sm" icon="account_balance">{project.governmentContact}</Badge>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-data-metric text-secondary">{progress}%</p>
                    <p className="text-body-sm text-on-surface-variant">Stage {project.currentStage}/9</p>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="h-2 bg-surface-container-high rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-secondary to-primary rounded-full transition-all duration-700" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3">
                {/* Milestones */}
                <div className="lg:col-span-2 p-5 border-r border-outline-variant/20">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-headline-sm text-on-surface">Milestones</h3>
                    <Badge variant="surface" size="sm">{done}/{project.milestones.length} done</Badge>
                  </div>
                  <div className="space-y-2">
                    {DEMO_MILESTONES.map((ms) => (
                      <div key={ms.id} className="flex items-center gap-3 p-3 bg-surface-container-high/50 rounded-xl">
                        <div className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
                          ms.status === 'completed' ? 'bg-success text-on-secondary-container' : ms.status === 'in_progress' ? 'bg-secondary-fixed text-secondary' : 'bg-surface-container-highest text-on-surface-variant'
                        )}>
                          <MaterialIcon icon={ms.status === 'completed' ? 'check' : ms.status === 'in_progress' ? 'schedule' : 'pending'} size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-label-lg text-on-surface">{ms.title}</p>
                          <p className="text-body-sm text-on-surface-variant text-truncate-2">{ms.description}</p>
                        </div>
                        <Badge variant={ms.status === 'completed' ? 'success' : ms.status === 'in_progress' ? 'secondary' : 'outline'} size="sm">
                          {ms.status.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Team */}
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-headline-sm text-on-surface">Team</h3>
                    <Badge variant="surface" size="sm">{DEMO_TEAM_MEMBERS.length} members</Badge>
                  </div>
                  <div className="space-y-2">
                    {DEMO_TEAM_MEMBERS.map((m) => (
                      <div key={m.id} className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-secondary-fixed flex items-center justify-center shrink-0">
                          <MaterialIcon icon="person" size={18} className="text-secondary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-label-lg text-on-surface">{m.name}</p>
                          <p className="text-body-sm text-on-surface-variant text-truncate-1">{m.role.replace(/_/g, ' ')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full mt-4" icon="open_in_new" onClick={() => navigate(lifecyclePath)}>
                    Open lifecycle
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}