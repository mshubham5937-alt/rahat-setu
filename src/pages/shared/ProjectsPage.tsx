import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProblems } from '../../context/ProblemContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { StatusChip } from '../../components/common/StatusChip';
import { MaterialIcon } from '../../components/common/MaterialIcon';
import { AssembleTaskforceModal } from '../../components/problem/AssembleTaskforceModal';
import { DEMO_PROJECT } from '../../data/demoData';
import { cn } from '../../utils/cn';
import type { Role } from '../../types';

export function ProjectsPage({ role }: { role: Role }) {
  const navigate = useNavigate();
  const { problems } = useProblems();
  const [isAssembleModalOpen, setIsAssembleModalOpen] = useState(false);
  const [successBanner, setSuccessBanner] = useState<{ taskforce: string; problem: string } | null>(null);

  const titleByRole: Record<Role, string> = {
    citizen: 'Community Active Projects',
    university: 'Active Research & Engineering Projects',
    industry: 'Active CSR & Field Deployments',
    government: 'Cross-Sector Project Tracker',
  };

  const handleActionClick = () => {
    if (role === 'citizen') {
      navigate('/citizen/report/new');
    } else {
      setIsAssembleModalOpen(true);
    }
  };

  const handleTaskforceSuccess = (taskforceName: string, problemTitle: string) => {
    setSuccessBanner({ taskforce: taskforceName, problem: problemTitle });
    setTimeout(() => {
      setSuccessBanner(null);
    }, 9000);
  };

  // Include DEMO_PROJECT plus all problems in stages 3-9, sorted by newest first
  const collaboratingProblems = problems.filter((p) => p.currentStage >= 3 || p.id === DEMO_PROJECT.problemId);
  const rawList = collaboratingProblems.length > 0 ? collaboratingProblems : problems.slice(0, 3);
  const displayList = [...rawList].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  return (
    <div className="max-w-[1440px] mx-auto space-y-6">
      {/* Success Notification Banner */}
      {successBanner && (
        <div className="p-4 bg-secondary/15 border border-secondary/30 rounded-2xl flex items-center justify-between gap-3 text-on-surface shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-secondary text-on-secondary-container flex items-center justify-center shrink-0">
              <MaterialIcon icon="check_circle" size={24} />
            </div>
            <div>
              <p className="font-headline-sm text-on-surface">Joint Taskforce Mobilized Successfully</p>
              <p className="text-body-sm text-on-surface-variant">
                <span className="font-semibold text-secondary">{successBanner.taskforce}</span> has been assembled for{' '}
                <span className="font-semibold text-on-surface">{successBanner.problem}</span>. Project has entered Stage 5 (Collaborating) with cross-sector telemetry active.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSuccessBanner(null)}
            className="text-on-surface-variant hover:text-on-surface p-1.5 rounded-lg hover:bg-surface-container-highest transition-colors"
          >
            <MaterialIcon icon="close" size={20} />
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="font-headline-lg text-on-surface mb-1">{titleByRole[role]}</h1>
          <p className="text-body-md text-on-surface-variant">
            {displayList.length} active cross-sector initiatives • tracking lifecycle, milestones & R&D teams
          </p>
        </div>
        <Button variant="secondary" icon={role === 'citizen' ? 'add' : 'group_add'} onClick={handleActionClick}>
          {role === 'citizen' ? 'Report New Hazard' : 'Assemble Taskforce'}
        </Button>
      </div>

      <div className="space-y-6">
        {displayList.map((problem) => {
          const isDemo = problem.id === DEMO_PROJECT.problemId;
          const projectTitle = isDemo ? DEMO_PROJECT.title : `${problem.title} — Rapid Solution Deployment`;
          const uniMatch = problem.universityMatches.find((m) => m.status === 'active' || m.status === 'accepted') || problem.universityMatches[0];
          const uniName = uniMatch?.universityName || 'IIT Gandhinagar Innovation Cell';
          const indNames = problem.industryMatches.length > 0
            ? problem.industryMatches.map((i) => i.industryName)
            : ['Reliance Foundation Disaster Relief', 'Tata Consultancy Services'];
          const govAgency = problem.governmentVerification?.assignedAgency || 'Gujarat State Disaster Management Authority';
          const progress = Math.min(100, Math.round((problem.currentStage / 9) * 100));

          const milestones = [
            {
              id: 'ms-1',
              title: 'Incident Telemetry & AI Triaging',
              description: 'AI model categorization, duplicate check, and satellite risk profiling.',
              status: problem.currentStage >= 2 ? 'completed' : 'in_progress',
            },
            {
              id: 'ms-2',
              title: 'SDMA Field Verification & Order',
              description: 'Ground disaster authority validation and relief unit allocation.',
              status: problem.currentStage >= 3 ? 'completed' : problem.currentStage === 2 ? 'in_progress' : 'pending',
            },
            {
              id: 'ms-3',
              title: 'Academic & Industry Taskforce Matching',
              description: 'Pairing specialized engineering labs with corporate CSR capability pledges.',
              status: problem.currentStage >= 5 ? 'completed' : problem.currentStage >= 3 ? 'in_progress' : 'pending',
            },
            {
              id: 'ms-4',
              title: 'Hardware & Sensor Prototyping',
              description: 'Lab bench-testing of telemetry, alert networks, and water purification rigs.',
              status: problem.currentStage >= 6 ? 'completed' : problem.currentStage === 5 ? 'in_progress' : 'pending',
            },
            {
              id: 'ms-5',
              title: 'Pilot Deployment & Field Telemetry',
              description: 'Live field deployment in the affected perimeter with community testing.',
              status: problem.currentStage >= 7 ? 'completed' : problem.currentStage === 6 ? 'in_progress' : 'pending',
            },
            {
              id: 'ms-6',
              title: 'Disaster Mitigation & Impact Audit',
              description: 'Full regional rollout with audited protection metrics and post-action review.',
              status: problem.currentStage >= 8 ? 'completed' : problem.currentStage === 7 ? 'in_progress' : 'pending',
            },
          ];

          const doneCount = milestones.filter((m) => m.status === 'completed').length;

          return (
            <Card key={problem.id} className="p-0 overflow-hidden">
              <div className="p-5 border-b border-outline-variant/20">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <Badge variant="success" size="sm" icon="experiment">
                        Active Initiative
                      </Badge>
                      <StatusChip status={problem.status} size="sm" />
                      <StatusChip severity={problem.severity} size="sm" />
                    </div>
                    <h2 className="font-headline-md text-on-surface mb-1">{projectTitle}</h2>
                    <p className="text-body-sm text-on-surface-variant mb-3 leading-relaxed">
                      {problem.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="surface" size="sm" icon="school">
                        {uniName}
                      </Badge>
                      {indNames.map((ind) => (
                        <Badge key={ind} variant="surface" size="sm" icon="corporate_fare">
                          {ind}
                        </Badge>
                      ))}
                      <Badge variant="surface" size="sm" icon="account_balance">
                        {govAgency}
                      </Badge>
                    </div>
                  </div>
                  <div className="shrink-0 sm:text-right">
                    <p className="text-data-metric text-secondary font-bold">{progress}%</p>
                    <p className="text-body-sm text-on-surface-variant">Stage {problem.currentStage}/9</p>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="h-2 bg-surface-container-high rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-secondary to-primary rounded-full transition-all duration-700"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3">
                {/* Milestones */}
                <div className="lg:col-span-2 p-5 border-r border-outline-variant/20">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-headline-sm text-on-surface">Execution Milestones</h3>
                    <Badge variant="surface" size="sm">
                      {doneCount}/{milestones.length} completed
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    {milestones.map((ms) => (
                      <div
                        key={ms.id}
                        className="flex items-center gap-3 p-3 bg-surface-container-high/50 rounded-xl"
                      >
                        <div
                          className={cn(
                            'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
                            ms.status === 'completed'
                              ? 'bg-success text-on-secondary-container'
                              : ms.status === 'in_progress'
                                ? 'bg-secondary-fixed text-secondary'
                                : 'bg-surface-container-highest text-on-surface-variant'
                          )}
                        >
                          <MaterialIcon
                            icon={
                              ms.status === 'completed'
                                ? 'check'
                                : ms.status === 'in_progress'
                                  ? 'schedule'
                                  : 'pending'
                            }
                            size={18}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-label-lg text-on-surface">{ms.title}</p>
                          <p className="text-body-sm text-on-surface-variant text-truncate-2">
                            {ms.description}
                          </p>
                        </div>
                        <Badge
                          variant={
                            ms.status === 'completed'
                              ? 'success'
                              : ms.status === 'in_progress'
                                ? 'secondary'
                                : 'outline'
                          }
                          size="sm"
                        >
                          {ms.status.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Team & Navigation */}
                <div className="p-5 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-headline-sm text-on-surface mb-3">Taskforce Leads</h3>
                    <div className="space-y-3 mb-4">
                      {/* Government Incident Command */}
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-secondary-fixed flex items-center justify-center shrink-0">
                          <MaterialIcon icon="account_balance" size={16} className="text-secondary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-label-md text-on-surface font-medium">
                            {problem.governmentVerification?.assignedOfficer || 'Commandant R. K. Patel'}
                          </p>
                          <p className="text-body-sm text-on-surface-variant text-truncate-1">
                            {govAgency} (Lead Command)
                          </p>
                        </div>
                      </div>

                      {/* Academic Lead */}
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center shrink-0">
                          <MaterialIcon icon="school" size={16} className="text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-label-md text-on-surface font-medium">
                            {uniMatch?.facultyLead || 'Prof. Anand Verma'}
                          </p>
                          <p className="text-body-sm text-on-surface-variant text-truncate-1">
                            {uniName} (R&D Lead)
                          </p>
                        </div>
                      </div>

                      {/* Industry Partner */}
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center shrink-0">
                          <MaterialIcon icon="corporate_fare" size={16} className="text-on-surface-variant" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-label-md text-on-surface font-medium">
                            {indNames[0] || 'Reliance Foundation Disaster Relief'}
                          </p>
                          <p className="text-body-sm text-on-surface-variant text-truncate-1">
                            CSR Fleet & Equipment Partner
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-outline-variant/20">
                    <Button
                      variant="primary"
                      className="w-full"
                      icon="open_in_new"
                      onClick={() => navigate(`/projects/${problem.id}`)}
                    >
                      Open Lifecycle Detail
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <AssembleTaskforceModal
        isOpen={isAssembleModalOpen}
        onClose={() => setIsAssembleModalOpen(false)}
        onSuccess={handleTaskforceSuccess}
        role={role}
      />
    </div>
  );
}
