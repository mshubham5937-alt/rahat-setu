import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { useProblems } from '../../context/ProblemContext';
import { useRole } from '../../context/RoleContext';
import { useNotifications } from '../../context/NotificationContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { StatusChip } from '../../components/common/StatusChip';
import { MaterialIcon } from '../../components/common/MaterialIcon';
import { LifecycleTracker } from '../../components/problem/LifecycleTracker';
import { DEMO_PROJECT, DEMO_UNIVERSITY_MATCHES, DEMO_TEAM_MEMBERS, CATEGORY_LABELS } from '../../data/demoData';

export function ProblemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentRole } = useRole();
  const { getProblemById, advanceStage } = useProblems();
  const { addManualNotification } = useNotifications();

  const problem = id ? getProblemById(id) : undefined;
  if (!problem) return <Navigate to="/" replace />;

  const project = DEMO_PROJECT;
  const activeMatch = DEMO_UNIVERSITY_MATCHES.find((m) => m.status === 'active');

  const handleAdvance = () => {
    advanceStage(problem.id);
    addManualNotification({
      type: 'system',
      title: 'Stage Advanced',
      message: `${problem.title} moved to next lifecycle stage`,
      actionUrl: `/projects/${problem.id}`,
    });
  };

  const roleLabel = currentRole ? currentRole.charAt(0).toUpperCase() + currentRole.slice(1) : '';

  return (
    <div className="max-w-[1440px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <button onClick={() => navigate(-1)} className="text-on-surface-variant hover:text-on-surface transition-colors">
              <MaterialIcon icon="arrow_back" size={20} />
            </button>
            <StatusChip severity={problem.severity} />
            <StatusChip status={problem.status} />
            <Badge variant="secondary" size="sm">Priority {problem.priorityScore}/100</Badge>
          </div>
          <h1 className="font-headline-lg text-on-surface mb-1">{problem.title}</h1>
          <p className="text-body-md text-on-surface-variant">
            {problem.location.address} • {problem.location.city}, {problem.location.state}
          </p>
        </div>
        <Button variant="primary" icon="forward" onClick={handleAdvance}>
          Advance Stage
        </Button>
      </div>

      {/* Lifecycle Tracker */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-headline-sm text-on-surface">Problem Lifecycle</h3>
            <p className="text-body-sm text-on-surface-variant">Stage {problem.currentStage} of 9 • {LIFECYCLE_LABEL[problem.currentStage]}</p>
          </div>
          <Badge variant="success" size="sm" dot>Shared across all roles</Badge>
        </div>
        <LifecycleTracker currentStage={problem.currentStage} />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main detail column */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Analysis */}
          {problem.aiAnalysis && (
            <Card>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <MaterialIcon icon="auto_awesome" size={20} className="text-secondary" />
                  <h3 className="font-headline-sm text-on-surface">AI Analysis</h3>
                </div>
                <Badge variant="secondary" size="sm" icon="science">Demo Simulation</Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
                <div className="p-3 bg-surface-container-high/50 rounded-lg">
                  <p className="text-label-md text-on-surface-variant uppercase">Category</p>
                  <p className="text-label-lg text-on-surface">{CATEGORY_LABELS[problem.aiAnalysis.category]}</p>
                </div>
                <div className="p-3 bg-surface-container-high/50 rounded-lg">
                  <p className="text-label-md text-on-surface-variant uppercase">Confidence</p>
                  <p className="text-data-metric text-secondary">{problem.aiAnalysis.confidence}%</p>
                </div>
                <div className="p-3 bg-surface-container-high/50 rounded-lg">
                  <p className="text-label-md text-on-surface-variant uppercase">Affected</p>
                  <p className="text-data-metric text-on-surface">{problem.affectedPopulation.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-surface-container-high/50 rounded-lg">
                  <p className="text-label-md text-on-surface-variant uppercase">Model</p>
                  <p className="text-body-sm text-on-surface text-truncate-2">{problem.aiAnalysis.modelVersion}</p>
                </div>
              </div>

              <div className="mb-5">
                <p className="text-label-lg text-on-surface mb-2">Recommended Expertise</p>
                <div className="flex flex-wrap gap-1.5">
                  {problem.aiAnalysis.recommendedExpertise.map((exp) => (
                    <Badge key={exp} variant="surface">{exp}</Badge>
                  ))}
                </div>
              </div>

              <div className="bg-error-container/40 border border-error/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MaterialIcon icon="warning" size={18} className="text-error" />
                  <p className="text-label-lg text-error">Risk Factors</p>
                </div>
                <ul className="space-y-1">
                  {problem.aiAnalysis.potentialImpact.riskFactors.map((rf) => (
                    <li key={rf} className="flex items-start gap-2 text-body-sm text-on-surface">
                      <span className="text-error mt-0.5">•</span>
                      {rf}
                    </li>
                  ))}
                </ul>
                <p className="text-body-sm text-on-surface-variant mt-2">
                  Est. Damage: <span className="font-semibold text-on-surface">{problem.aiAnalysis.potentialImpact.estimatedDamage}</span>
                </p>
              </div>
            </Card>
          )}

          {/* University Matches */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MaterialIcon icon="school" size={20} className="text-secondary" />
                <h3 className="font-headline-sm text-on-surface">University Matches</h3>
              </div>
              <Badge variant="secondary" size="sm">{activeMatch ? activeMatch.status : 'Recommended'}</Badge>
            </div>
            <div className="space-y-3">
              {problem.universityMatches.map((match) => (
                <div key={match.universityId} className="border border-outline-variant/30 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-headline-sm text-on-surface">{match.universityName}</p>
                      <p className="text-body-sm text-on-surface-variant">Faculty: {match.facultyLead} • {match.studentCount} Students</p>
                    </div>
                    <div className="text-right">
                      <p className="text-data-metric text-secondary">{match.matchScore}%</p>
                      <Badge variant={match.status === 'active' ? 'success' : match.status === 'accepted' ? 'success' : 'outline'} size="sm">{match.status}</Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {match.rationale.map((r) => (
                      <div key={r.factor} className="flex items-center gap-3">
                        <span className="text-body-sm text-on-surface w-48 shrink-0">{r.factor}</span>
                        <div className="flex-1 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                          <div className="h-full bg-secondary rounded-full" style={{ width: `${r.score}%` }} />
                        </div>
                        <span className="text-body-sm text-on-surface-variant text-right w-8">{r.score}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {match.labCapabilities.map((cap) => (
                      <Badge key={cap} variant="surface" size="sm" icon="precision_manufacturing">{cap}</Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Industry Matches */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MaterialIcon icon="corporate_fare" size={20} className="text-secondary" />
                <h3 className="font-headline-sm text-on-surface">Industry Contributions</h3>
              </div>
            </div>
            <div className="space-y-3">
              {problem.industryMatches.map((match) => (
                <div key={match.industryId} className="border border-outline-variant/30 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-headline-sm text-on-surface">{match.industryName}</p>
                      <p className="text-body-sm text-on-surface-variant">{match.contributions.length} contributions committed</p>
                    </div>
                    <Badge variant={match.status === 'committed' ? 'success' : 'outline'} size="sm">{match.status}</Badge>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {match.contributions.map((c) => (
                      <div key={c.type} className="flex items-center justify-between p-2.5 bg-surface-container-high/50 rounded-lg">
                        <div className="flex items-center gap-2 min-w-0">
                          <MaterialIcon icon="inventory_2" size={16} className="text-secondary shrink-0" />
                          <div className="min-w-0">
                            <p className="text-body-sm text-on-surface font-medium text-truncate-1">{c.type}</p>
                            <p className="text-body-sm text-on-surface-variant text-truncate-1">{c.description}</p>
                          </div>
                        </div>
                        <Badge variant={c.status === 'delivered' ? 'success' : 'secondary'} size="sm">{c.status}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Government Verification */}
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <MaterialIcon icon="verified" size={20} className="text-secondary" />
              <h3 className="font-headline-sm text-on-surface">Government Verification</h3>
            </div>
            {problem.governmentVerification?.verified ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-success">
                  <MaterialIcon icon="check_circle" size={18} />
                  <p className="text-label-lg">Verified</p>
                </div>
                <p className="text-body-sm text-on-surface-variant">By: {problem.governmentVerification.verifiedBy}</p>
                <p className="text-body-sm text-on-surface-variant">Agency: {problem.governmentVerification.assignedAgency}</p>
                <p className="text-body-sm text-on-surface-variant">Officer: {problem.governmentVerification.assignedOfficer}</p>
                <div className="bg-surface-container-high/50 rounded-lg p-3 mt-2">
                  <p className="text-body-sm text-on-surface">Important: Field verification confirms critical flooding. All evacuation advisories remain active.</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-warning">
                <MaterialIcon icon="hourglass_empty" size={18} />
                <p className="text-label-lg">Awaiting Verification</p>
              </div>
            )}
          </Card>

          {/* Project Overview */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <MaterialIcon icon="rocket_launch" size={20} className="text-secondary" />
                <h3 className="font-headline-sm text-on-surface">Project Formation</h3>
              </div>
              <Badge variant="success" size="sm">Active</Badge>
            </div>
            <p className="font-headline-md text-on-surface mb-1">{project.title}</p>
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-body-sm text-on-surface-variant">
                <MaterialIcon icon="school" size={16} className="text-secondary" />
                {project.universityName}
              </div>
              <div className="flex items-center gap-2 text-body-sm text-on-surface-variant">
                <MaterialIcon icon="corporate_fare" size={16} className="text-secondary" />
                {project.industryNames.join(', ')}
              </div>
              <div className="flex items-center gap-2 text-body-sm text-on-surface-variant">
                <MaterialIcon icon="account_balance" size={16} className="text-secondary" />
                {project.governmentContact}
              </div>
            </div>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-label-md text-on-surface-variant">Stage {project.currentStage}/9</span>
                <span className="text-label-md text-secondary font-semibold">{(project.currentStage / 9 * 100).toFixed(0)}%</span>
              </div>
              <div className="h-2 bg-surface-container-high rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-secondary to-primary rounded-full" style={{ width: `${(project.currentStage / 9 * 100).toFixed(0)}%` }} />
              </div>
            </div>
            <div className="space-y-2">
              {DEMO_TEAM_MEMBERS.map((m) => (
                <div key={m.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-secondary-fixed flex items-center justify-center shrink-0">
                    <MaterialIcon icon="person" size={16} className="text-secondary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-label-md text-on-surface">{m.name}</p>
                    <p className="text-body-sm text-on-surface-variant text-truncate-1">{m.role.replace(/_/g, ' ')}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Report actions based on role */}
          <Card>
            <h3 className="font-headline-sm text-on-surface mb-3">Actions ({roleLabel})</h3>
            <div className="space-y-2">
              {currentRole === 'citizen' && (
                <Button variant="outline" className="w-full" icon="support_agent">Contact NGO Support</Button>
              )}
              {currentRole === 'university' && (
                <Button variant="primary" className="w-full" icon="handshake">Accept & Form Team</Button>
              )}
              {currentRole === 'industry' && (
                <Button variant="primary" className="w-full" icon="assignment_turned_in">Commit Contribution</Button>
              )}
              {currentRole === 'government' && (
                <>
                  <Button variant="primary" className="w-full" icon="verified">Mark Verified</Button>
                  <Button variant="outline" className="w-full" icon="account_balance_wallet">Allocate Resources</Button>
                </>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

const LIFECYCLE_LABEL: Record<number, string> = {
  1: 'Reported',
  2: 'AI Analyzed',
  3: 'Verified',
  4: 'Matched',
  5: 'Collaborating',
  6: 'Prototype',
  7: 'Pilot',
  8: 'Deployed',
  9: 'Impact Measured',
};