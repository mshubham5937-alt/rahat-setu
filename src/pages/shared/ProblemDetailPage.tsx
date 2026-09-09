import { useState } from 'react';
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
import { AssembleTaskforceModal } from '../../components/problem/AssembleTaskforceModal';
import { DEMO_PROJECT, DEMO_TEAM_MEMBERS, CATEGORY_LABELS } from '../../data/demoData';
import type { Contribution, Severity } from '../../types';

export function ProblemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentRole } = useRole();
  const {
    getProblemById,
    advanceStage,
    verifyProblem,
    upvoteProblem,
    commitIndustryContribution,
    acceptUniversityChallenge,
    updatePriorityScore,
  } = useProblems();
  const { addManualNotification } = useNotifications();

  // Dialog state for industry pledge and government priority adjustment
  const [showPledgeModal, setShowPledgeModal] = useState(false);
  const [pledgeType, setPledgeType] = useState('IoT Water Sensors & Drones');
  const [pledgeDesc, setPledgeDesc] = useState('Deploying 50 telemetry sensor nodes and real-time mesh transceivers');
  const [pledgeQty, setPledgeQty] = useState(50);
  const [pledgeVal, setPledgeVal] = useState(125000);
  const [industryName, setIndustryName] = useState('Reliance Foundation Disaster Relief');

  const [showPriorityModal, setShowPriorityModal] = useState(false);
  const [showAssembleModal, setShowAssembleModal] = useState(false);
  const [tempScore, setTempScore] = useState(90);
  const [tempSeverity, setTempSeverity] = useState<Severity>('critical');

  const problem = id ? getProblemById(id) : undefined;
  if (!problem) return <Navigate to="/" replace />;

  const isDemo = problem.id === DEMO_PROJECT.problemId;
  const projectTitle = isDemo ? DEMO_PROJECT.title : `${problem.title} — Rapid Response Solution`;
  const activeUni = problem.universityMatches.find((m) => m.status === 'active' || m.status === 'accepted') || problem.universityMatches[0];
  const uniName = activeUni?.universityName || 'IIT Gandhinagar Innovation Cell';
  const indNames = problem.industryMatches.length > 0 ? problem.industryMatches.map((m) => m.industryName).join(', ') : 'Reliance Foundation, Tata Consultancy Services';
  const govContact = problem.governmentVerification?.assignedAgency || 'Gujarat State Disaster Management Authority';
  const progressPercent = Math.min(100, Math.round((problem.currentStage / 9) * 100));

  const notifyAction = (title: string, message: string) => {
    addManualNotification({
      type: 'system',
      title,
      message,
      actionUrl: `/projects/${problem.id}`,
    });
  };

  const handleAdvance = async () => {
    await advanceStage(problem.id);
    notifyAction('Stage Advanced', `${problem.title} transitioned to Stage ${Math.min(problem.currentStage + 1, 9)}.`);
  };

  const handleContactNgo = () => {
    notifyAction('NGO Support Dispatched', `Support request routed to Red Cross & Goonj field units for "${problem.title}".`);
  };

  const handleUpvote = async () => {
    await upvoteProblem(problem.id);
    notifyAction('Occurrence Confirmed', `Your field confirmation was registered. Affected community count +25.`);
  };

  const handleAcceptAndFormTeam = async () => {
    await acceptUniversityChallenge(problem.id, 'IIT Gandhinagar — Disaster Innovation Hub');
    notifyAction('Challenge Accepted & R&D Initialized', `"${problem.title}" accepted by IIT Gandhinagar. Lifecycle moved to Collaborating.`);
    navigate('/university/teams');
  };

  const handlePledgeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newContrib: Contribution = {
      type: pledgeType,
      description: pledgeDesc,
      quantity: pledgeQty,
      unit: 'Units',
      estimatedValue: pledgeVal,
      status: 'pledged',
    };
    await commitIndustryContribution(problem.id, industryName, newContrib);
    setShowPledgeModal(false);
    notifyAction('CSR Pledge Committed', `${pledgeType} committed by ${industryName} to incident.`);
  };

  const handleMarkVerified = async () => {
    await verifyProblem(problem.id, {
      verifiedBy: 'Gujarat State Disaster Management Authority (GSDMA)',
      assignedAgency: 'NDRF 6th Battalion / SDRF Quick Reaction Cell',
      assignedOfficer: 'Shri R. K. Patel (Commandant)',
      verificationNotes: 'Ground telemetry verified. Emergency relief and academic taskforce activated.',
    });
    notifyAction('Report Field-Verified', `"${problem.title}" verified by GSDMA/NDRF. Lifecycle advanced to Stage 3.`);
  };

  const handleSavePriority = async (e: React.FormEvent) => {
    e.preventDefault();
    await updatePriorityScore(problem.id, tempScore, tempSeverity);
    setShowPriorityModal(false);
    notifyAction('Priority Adjusted', `Priority score set to ${tempScore} (${tempSeverity.toUpperCase()}).`);
  };

  const roleLabel = currentRole ? currentRole.charAt(0).toUpperCase() + currentRole.slice(1) : '';

  return (
    <div className="max-w-[1440px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <button
              onClick={() => navigate(-1)}
              className="text-on-surface-variant hover:text-on-surface transition-colors p-1"
              title="Go Back"
            >
              <MaterialIcon icon="arrow_back" size={20} />
            </button>
            <StatusChip severity={problem.severity} />
            <StatusChip status={problem.status} />
            <Badge variant="secondary" size="sm">
              Priority {problem.priorityScore}/100
            </Badge>
            {problem.governmentVerification?.verified && (
              <Badge variant="success" size="sm" icon="verified">
                SDMA Verified
              </Badge>
            )}
          </div>
          <h1 className="font-headline-lg text-on-surface mb-1">{problem.title}</h1>
          <p className="text-body-md text-on-surface-variant">
            {problem.location.address || 'Disaster Sector'} • {problem.location.city}, {problem.location.state}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Button variant="primary" icon="forward" onClick={handleAdvance}>
            Advance Lifecycle
          </Button>
        </div>
      </div>

      {/* Lifecycle Tracker */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-headline-sm text-on-surface">Problem Lifecycle</h3>
            <p className="text-body-sm text-on-surface-variant">
              Stage {problem.currentStage} of 9 • {LIFECYCLE_LABEL[problem.currentStage]}
            </p>
          </div>
          <Badge variant="success" size="sm" dot>
            Shared across Citizen, University, Industry & Government
          </Badge>
        </div>
        <LifecycleTracker currentStage={problem.currentStage} />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main detail column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Problem Overview & Description */}
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <MaterialIcon icon="info" size={20} className="text-secondary" />
              <h3 className="font-headline-sm text-on-surface">Incident Overview</h3>
            </div>
            <p className="text-body-md text-on-surface mb-4 leading-relaxed">{problem.description}</p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-surface-container-high/30 rounded-xl">
              <div>
                <p className="text-label-md text-on-surface-variant uppercase">Category</p>
                <p className="text-label-lg text-on-surface capitalize font-medium">
                  {CATEGORY_LABELS[problem.category] || problem.category.replace(/_/g, ' ')}
                </p>
              </div>
              <div>
                <p className="text-label-md text-on-surface-variant uppercase">Reported</p>
                <p className="text-label-lg text-on-surface font-medium">
                  {new Date(problem.reportedAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-label-md text-on-surface-variant uppercase">Impact Zone</p>
                <p className="text-label-lg text-on-surface font-medium">{problem.location.city}</p>
              </div>
              <div>
                <p className="text-label-md text-on-surface-variant uppercase">Affected Population</p>
                <p className="text-data-metric text-secondary font-bold">
                  {problem.affectedPopulation.toLocaleString()}
                </p>
              </div>
            </div>
          </Card>

          {/* AI Analysis */}
          {problem.aiAnalysis && (
            <Card>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <MaterialIcon icon="auto_awesome" size={20} className="text-secondary" />
                  <h3 className="font-headline-sm text-on-surface">AI Risk & Triaging Telemetry</h3>
                </div>
                <Badge variant="secondary" size="sm" icon="science">
                  Gemini & Geospatial Engine
                </Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
                <div className="p-3 bg-surface-container-high/50 rounded-lg">
                  <p className="text-label-md text-on-surface-variant uppercase">Category</p>
                  <p className="text-label-lg text-on-surface">{CATEGORY_LABELS[problem.aiAnalysis.category]}</p>
                </div>
                <div className="p-3 bg-surface-container-high/50 rounded-lg">
                  <p className="text-label-md text-on-surface-variant uppercase">AI Confidence</p>
                  <p className="text-data-metric text-secondary">{problem.aiAnalysis.confidence}%</p>
                </div>
                <div className="p-3 bg-surface-container-high/50 rounded-lg">
                  <p className="text-label-md text-on-surface-variant uppercase">Priority Rating</p>
                  <p className="text-data-metric text-on-surface">{problem.priorityScore}/100</p>
                </div>
                <div className="p-3 bg-surface-container-high/50 rounded-lg">
                  <p className="text-label-md text-on-surface-variant uppercase">Duplicate Check</p>
                  <p className="text-label-lg text-success font-medium">
                    {problem.aiAnalysis.duplicateDetected ? 'Duplicate Flagged' : 'Unique Incident'}
                  </p>
                </div>
              </div>

              <div className="mb-5">
                <p className="text-label-lg text-on-surface mb-2">Recommended Academic & Engineering Expertise</p>
                <div className="flex flex-wrap gap-1.5">
                  {problem.aiAnalysis.recommendedExpertise.map((exp) => (
                    <Badge key={exp} variant="surface">
                      {exp}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="bg-error-container/30 border border-error/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MaterialIcon icon="warning" size={18} className="text-error" />
                  <p className="text-label-lg text-error">Identified Risk Factors</p>
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
                  Estimated Damage Assessment:{' '}
                  <span className="font-semibold text-on-surface">
                    {problem.aiAnalysis.potentialImpact.estimatedDamage}
                  </span>
                </p>
              </div>
            </Card>
          )}

          {/* University Matches */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MaterialIcon icon="school" size={20} className="text-secondary" />
                <h3 className="font-headline-sm text-on-surface">University Research Matches</h3>
              </div>
              <Badge variant="secondary" size="sm">
                AI Matched
              </Badge>
            </div>
            <div className="space-y-3">
              {problem.universityMatches.length === 0 ? (
                <div className="text-center p-6 text-on-surface-variant text-body-md">
                  No university team assigned yet. Click below to accept and form a research taskforce.
                </div>
              ) : (
                problem.universityMatches.map((match) => (
                  <div key={match.universityId} className="border border-outline-variant/30 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-headline-sm text-on-surface">{match.universityName}</p>
                        <p className="text-body-sm text-on-surface-variant">
                          Faculty Lead: {match.facultyLead || 'Prof. Anand Verma'} •{' '}
                          {match.studentCount || 6} Student Researchers
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-data-metric text-secondary">{match.matchScore}%</p>
                        <Badge
                          variant={
                            match.status === 'active' || match.status === 'accepted' ? 'success' : 'outline'
                          }
                          size="sm"
                        >
                          {match.status}
                        </Badge>
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
                        <Badge key={cap} variant="surface" size="sm" icon="precision_manufacturing">
                          {cap}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Industry Matches & Contributions */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MaterialIcon icon="corporate_fare" size={20} className="text-secondary" />
                <h3 className="font-headline-sm text-on-surface">Industry CSR & Resource Pledges</h3>
              </div>
              <Button variant="secondary" size="sm" icon="add" onClick={() => setShowPledgeModal(true)}>
                Pledge Capability
              </Button>
            </div>
            <div className="space-y-3">
              {problem.industryMatches.length === 0 ? (
                <div className="text-center p-6 text-on-surface-variant text-body-md">
                  No industry contributions pledged yet. Industry partners can pledge equipment or cloud resources.
                </div>
              ) : (
                problem.industryMatches.map((match) => (
                  <div key={match.industryId} className="border border-outline-variant/30 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-headline-sm text-on-surface">{match.industryName}</p>
                        <p className="text-body-sm text-on-surface-variant">
                          {match.contributions.length} resources committed
                        </p>
                      </div>
                      <Badge variant={match.status === 'committed' ? 'success' : 'outline'} size="sm">
                        {match.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {match.contributions.map((c, idx) => (
                        <div
                          key={`${c.type}-${idx}`}
                          className="flex items-center justify-between p-2.5 bg-surface-container-high/50 rounded-lg"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <MaterialIcon icon="inventory_2" size={16} className="text-secondary shrink-0" />
                            <div className="min-w-0">
                              <p className="text-body-sm text-on-surface font-medium text-truncate-1">{c.type}</p>
                              <p className="text-body-sm text-on-surface-variant text-truncate-1">{c.description}</p>
                            </div>
                          </div>
                          <Badge variant={c.status === 'delivered' ? 'success' : 'secondary'} size="sm">
                            {c.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Government Verification */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <MaterialIcon icon="verified" size={20} className="text-secondary" />
                <h3 className="font-headline-sm text-on-surface">State Verification</h3>
              </div>
              {problem.governmentVerification?.verified && (
                <Badge variant="success" size="sm">
                  Active Order
                </Badge>
              )}
            </div>

            {problem.governmentVerification?.verified ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-success">
                  <MaterialIcon icon="check_circle" size={18} />
                  <p className="text-label-lg font-semibold">Field Verified by Authority</p>
                </div>
                <p className="text-body-sm text-on-surface">
                  Authority:{' '}
                  <span className="font-medium text-on-surface">{problem.governmentVerification.verifiedBy}</span>
                </p>
                <p className="text-body-sm text-on-surface">
                  Assigned Agency:{' '}
                  <span className="font-medium text-on-surface">
                    {problem.governmentVerification.assignedAgency || 'NDRF 6th Bn'}
                  </span>
                </p>
                <p className="text-body-sm text-on-surface">
                  Officer In-Charge:{' '}
                  <span className="font-medium text-on-surface">
                    {problem.governmentVerification.assignedOfficer || 'Commandant'}
                  </span>
                </p>
                <div className="bg-surface-container-high/50 rounded-lg p-3 mt-2 border-l-2 border-secondary">
                  <p className="text-body-sm text-on-surface font-medium">
                    {problem.governmentVerification.verificationNotes ||
                      'Field reconnaissance complete. Priority disaster response protocol active.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-warning">
                  <MaterialIcon icon="hourglass_empty" size={18} />
                  <p className="text-label-lg">Awaiting State Verification</p>
                </div>
                <p className="text-body-sm text-on-surface-variant">
                  This report is in triage queue. Government officers can verify and dispatch response battalions.
                </p>
                {currentRole === 'government' && (
                  <Button variant="primary" size="sm" icon="verified" className="w-full" onClick={handleMarkVerified}>
                    Verify Incident Now
                  </Button>
                )}
              </div>
            )}
          </Card>

          {/* Project Overview */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <MaterialIcon icon="rocket_launch" size={20} className="text-secondary" />
                <h3 className="font-headline-sm text-on-surface">R&D Taskforce</h3>
              </div>
              <Badge variant="success" size="sm">
                Live
              </Badge>
            </div>
            <p className="font-headline-md text-on-surface mb-2">{projectTitle}</p>
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-body-sm text-on-surface-variant">
                <MaterialIcon icon="school" size={16} className="text-secondary shrink-0" />
                <span className="text-truncate-1">{uniName}</span>
              </div>
              <div className="flex items-center gap-2 text-body-sm text-on-surface-variant">
                <MaterialIcon icon="corporate_fare" size={16} className="text-secondary shrink-0" />
                <span className="text-truncate-1">{indNames}</span>
              </div>
              <div className="flex items-center gap-2 text-body-sm text-on-surface-variant">
                <MaterialIcon icon="account_balance" size={16} className="text-secondary shrink-0" />
                <span className="text-truncate-1">{govContact}</span>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-label-md text-on-surface-variant">
                  Stage {problem.currentStage}/9 • {LIFECYCLE_LABEL[problem.currentStage]}
                </span>
                <span className="text-label-md text-secondary font-semibold">{progressPercent}%</span>
              </div>
              <div className="h-2 bg-surface-container-high rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-secondary to-primary rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-label-md text-on-surface-variant uppercase font-medium">Field Personnel</p>
              {DEMO_TEAM_MEMBERS.slice(0, 3).map((m) => (
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

          {/* Report actions based on role */}
          <Card>
            <h3 className="font-headline-sm text-on-surface mb-3">Role Actions ({roleLabel})</h3>
            <div className="space-y-2">
              {currentRole === 'citizen' && (
                <>
                  <Button
                    variant="primary"
                    className="w-full"
                    icon="add_circle"
                    onClick={handleUpvote}
                  >
                    I Am Affected (+1 Confirm)
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    icon="support_agent"
                    onClick={handleContactNgo}
                  >
                    Contact NGO Support
                  </Button>
                </>
              )}

              {currentRole === 'university' && (
                <>
                  <Button
                    variant="primary"
                    className="w-full"
                    icon="handshake"
                    onClick={handleAcceptAndFormTeam}
                  >
                    Accept Challenge & Form Team
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    icon="science"
                    onClick={() => navigate('/university/teams')}
                  >
                    Manage Research Lab Team
                  </Button>
                </>
              )}

              {currentRole === 'industry' && (
                <>
                  <Button
                    variant="primary"
                    className="w-full"
                    icon="assignment_turned_in"
                    onClick={() => setShowPledgeModal(true)}
                  >
                    Pledge CSR Resource
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    icon="inventory"
                    onClick={() => navigate('/industry/capabilities')}
                  >
                    View Capabilities Catalog
                  </Button>
                </>
              )}

              {currentRole === 'government' && (
                <>
                  {!problem.governmentVerification?.verified && (
                    <Button
                      variant="primary"
                      className="w-full"
                      icon="verified"
                      onClick={handleMarkVerified}
                    >
                      Mark Official Verified
                    </Button>
                  )}
                  <Button
                    variant="secondary"
                    className="w-full"
                    icon="tune"
                    onClick={() => {
                      setTempScore(problem.priorityScore);
                      setTempSeverity(problem.severity);
                      setShowPriorityModal(true);
                    }}
                  >
                    Adjust Priority Score
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    icon="group_add"
                    onClick={() => setShowAssembleModal(true)}
                  >
                    Assemble Joint Taskforce
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    icon="account_balance_wallet"
                    onClick={() => navigate('/government/projects')}
                  >
                    Allocate SDRF Resources
                  </Button>
                </>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Industry Pledge Modal */}
      {showPledgeModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-surface-container-high rounded-2xl p-6 max-w-md w-full space-y-4 border border-outline-variant shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MaterialIcon icon="assignment_turned_in" size={24} className="text-secondary" />
                <h3 className="font-headline-sm text-on-surface">Pledge CSR Capability</h3>
              </div>
              <button
                onClick={() => setShowPledgeModal(false)}
                className="text-on-surface-variant hover:text-on-surface p-1"
              >
                <MaterialIcon icon="close" size={20} />
              </button>
            </div>

            <form onSubmit={handlePledgeSubmit} className="space-y-4">
              <div>
                <label className="block text-label-md text-on-surface-variant mb-1">Pledging Organization</label>
                <input
                  type="text"
                  value={industryName}
                  onChange={(e) => setIndustryName(e.target.value)}
                  className="w-full px-3 py-2 bg-surface rounded-lg border border-outline-variant text-on-surface text-body-md focus:border-secondary focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-label-md text-on-surface-variant mb-1">Capability Type</label>
                <select
                  value={pledgeType}
                  onChange={(e) => setPledgeType(e.target.value)}
                  className="w-full px-3 py-2 bg-surface rounded-lg border border-outline-variant text-on-surface text-body-md focus:border-secondary focus:outline-none"
                >
                  <option value="IoT Water Sensors & Drones">IoT Water Sensors & Drones</option>
                  <option value="Heavy Fleet & Amphibious Trucks">Heavy Fleet & Amphibious Trucks</option>
                  <option value="Satellite Mesh Telemetry Units">Satellite Mesh Telemetry Units</option>
                  <option value="Emergency Water Purification Kits">Emergency Water Purification Kits</option>
                  <option value="Cloud Compute Credits (GPU/AI)">Cloud Compute Credits (GPU/AI)</option>
                  <option value="Disaster Relief Grant Funds">Disaster Relief Grant Funds</option>
                </select>
              </div>

              <div>
                <label className="block text-label-md text-on-surface-variant mb-1">Description / Spec</label>
                <textarea
                  value={pledgeDesc}
                  onChange={(e) => setPledgeDesc(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 bg-surface rounded-lg border border-outline-variant text-on-surface text-body-md focus:border-secondary focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-label-md text-on-surface-variant mb-1">Quantity</label>
                  <input
                    type="number"
                    value={pledgeQty}
                    onChange={(e) => setPledgeQty(Number(e.target.value))}
                    min={1}
                    className="w-full px-3 py-2 bg-surface rounded-lg border border-outline-variant text-on-surface text-body-md focus:border-secondary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-label-md text-on-surface-variant mb-1">Value (₹ INR)</label>
                  <input
                    type="number"
                    value={pledgeVal}
                    onChange={(e) => setPledgeVal(Number(e.target.value))}
                    min={0}
                    step={5000}
                    className="w-full px-3 py-2 bg-surface rounded-lg border border-outline-variant text-on-surface text-body-md focus:border-secondary focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" type="button" onClick={() => setShowPledgeModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" icon="check">
                  Commit Contribution
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Government Priority Adjustment Modal */}
      {showPriorityModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-surface-container-high rounded-2xl p-6 max-w-md w-full space-y-4 border border-outline-variant shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MaterialIcon icon="tune" size={24} className="text-secondary" />
                <h3 className="font-headline-sm text-on-surface">Adjust Priority Rating</h3>
              </div>
              <button
                onClick={() => setShowPriorityModal(false)}
                className="text-on-surface-variant hover:text-on-surface p-1"
              >
                <MaterialIcon icon="close" size={20} />
              </button>
            </div>

            <form onSubmit={handleSavePriority} className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-label-md text-on-surface-variant">Priority Score</label>
                  <span className="text-data-metric text-secondary font-bold">{tempScore}/100</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={tempScore}
                  onChange={(e) => setTempScore(Number(e.target.value))}
                  className="w-full accent-secondary"
                />
              </div>

              <div>
                <label className="block text-label-md text-on-surface-variant mb-1">Severity Classification</label>
                <select
                  value={tempSeverity}
                  onChange={(e) => setTempSeverity(e.target.value as Severity)}
                  className="w-full px-3 py-2 bg-surface rounded-lg border border-outline-variant text-on-surface text-body-md focus:border-secondary focus:outline-none capitalize"
                >
                  <option value="critical">Critical (Immediate Evacuation)</option>
                  <option value="high">High (Active Hazard)</option>
                  <option value="medium">Medium (Monitoring Alert)</option>
                  <option value="low">Low (Standard Triage)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" type="button" onClick={() => setShowPriorityModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" icon="check">
                  Update Rating
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assemble Taskforce Modal */}
      <AssembleTaskforceModal
        isOpen={showAssembleModal}
        onClose={() => setShowAssembleModal(false)}
        onSuccess={(taskforceName) => {
          addManualNotification({
            type: 'team_created',
            title: `Taskforce Mobilized: ${taskforceName}`,
            message: `Cross-sector team assembled for ${problem.title}. Project is now collaborating in Stage 5.`,
            relatedEntityId: problem.id,
            relatedEntityType: 'problem',
          });
        }}
        role={currentRole || 'government'}
        initialProblemId={problem.id}
      />
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
