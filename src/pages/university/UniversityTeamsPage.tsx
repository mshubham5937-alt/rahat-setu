import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProblems } from '../../context/ProblemContext';
import { useNotifications } from '../../context/NotificationContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { MaterialIcon } from '../../components/common/MaterialIcon';
import { StatusChip } from '../../components/common/StatusChip';
import { DEMO_TEAM_MEMBERS, DEMO_PROJECT } from '../../data/demoData';
import { cn } from '../../utils/cn';
import type { TeamMember } from '../../types';

const INITIAL_POOL: TeamMember[] = [
  { id: 'pool-1', name: 'Kavya Shah', role: 'student_engineer', department: 'B.Tech CSE', skills: ['Dashboard', 'Full-stack', 'Figma'] },
  { id: 'pool-2', name: 'Arjun Mehta', role: 'tech_lead', department: 'B.Tech ECE', skills: ['Data Pipelines', 'Cloud Analytics', 'Alerting Systems'] },
  { id: 'pool-3', name: 'Sneha Iyer', role: 'gis_lead', department: 'M.Tech GIS', skills: ['QGIS', 'Field Survey', 'Cartography'] },
  { id: 'pool-4', name: 'Rahul Desai', role: 'field_ops_lead', department: 'B.Tech Civil', skills: ['Site Ops', 'Safety', 'Logistics'] },
  { id: 'pool-5', name: 'Fatima Noor', role: 'ai_ml_lead', department: 'M.Tech AI', skills: ['PyTorch', 'Forecasting', 'MLOps'] },
  { id: 'pool-6', name: 'Vikram Jha', role: 'project_manager', department: 'MBA Tech', skills: ['Agile', 'Stakeholders', 'Reporting'] },
  { id: 'pool-7', name: 'Priya Nair', role: 'student_engineer', department: 'B.Tech EEE', skills: ['Reliability', 'Testing', 'QA'] },
  { id: 'pool-8', name: 'Aditya Rao', role: 'domain_expert', department: 'Disaster Mgmt Cert.', skills: ['NDMA SOPs', 'Training', 'Drills'] },
  { id: 'pool-9', name: 'Meera Patel', role: 'student_engineer', department: 'B.Tech IT', skills: ['IoT Sensors', 'Telemetry', 'Python'] },
  { id: 'pool-10', name: 'Devendra Joshi', role: 'domain_expert', department: 'Hydrology Lab', skills: ['Flood Basin Modeling', 'ArcGIS', 'Risk Scoring'] },
];

export function UniversityTeamsPage() {
  const navigate = useNavigate();
  const { problems, acceptUniversityChallenge } = useProblems();
  const { addManualNotification } = useNotifications();

  const [selectedProblemId, setSelectedProblemId] = useState<string>(
    problems[0]?.id || DEMO_PROJECT.problemId
  );
  const [poolMembers, setPoolMembers] = useState<TeamMember[]>(INITIAL_POOL);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(DEMO_TEAM_MEMBERS);
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<Record<string, boolean>>({});
  const [feedback, setFeedback] = useState<string | null>(null);

  const activeProblem = problems.find((p) => p.id === selectedProblemId) || problems[0];

  const toggleCandidate = (id: string) => {
    setSelectedCandidateIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const selectedCount = poolMembers.filter((m) => selectedCandidateIds[m.id]).length;

  const handleAddSelected = async () => {
    const selected = poolMembers.filter((m) => selectedCandidateIds[m.id]);

    if (selected.length === 0) {
      setFeedback('Please select at least one candidate from the talent pool.');
      setTimeout(() => setFeedback(null), 4000);
      return;
    }

    // Remove recruited candidates from the available pool list
    const selectedIdsSet = new Set(selected.map((m) => m.id));
    setPoolMembers((prev) => prev.filter((m) => !selectedIdsSet.has(m.id)));

    // Add to active team roster
    const updated = [...teamMembers, ...selected];
    setTeamMembers(updated);
    setSelectedCandidateIds({});

    if (activeProblem) {
      await acceptUniversityChallenge(activeProblem.id, 'IIT Gandhinagar — Innovation Cell');
    }

    const recruitedNames = selected.map((s) => s.name).join(', ');
    const msg = `Recruited ${selected.length} member(s) (${recruitedNames}) to ${activeProblem?.title || 'taskforce'}. Removed from available talent pool.`;
    setFeedback(msg);
    addManualNotification({
      type: 'team_created',
      title: 'Research Team Expanded',
      message: msg,
      actionUrl: activeProblem ? `/university/challenges/${activeProblem.id}` : undefined,
    });
    setTimeout(() => setFeedback(null), 5000);
  };

  const handleRemoveFromTeam = (member: TeamMember) => {
    setTeamMembers((prev) => prev.filter((m) => m.id !== member.id));
    // Return back to available talent pool
    setPoolMembers((prev) => {
      if (prev.some((p) => p.id === member.id)) return prev;
      return [member, ...prev];
    });
    const msg = `${member.name} removed from taskforce and returned to available talent pool.`;
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <div className="max-w-[1440px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="font-headline-lg text-on-surface mb-1">Research & Engineering Taskforces</h1>
          <p className="text-body-md text-on-surface-variant">
            Assemble interdisciplinary university teams across computing, GIS, civil and AI labs.
          </p>
        </div>
        <div className="shrink-0">
          <label className="block text-label-md text-on-surface-variant mb-1">Target Incident Challenge</label>
          <select
            value={selectedProblemId}
            onChange={(e) => setSelectedProblemId(e.target.value)}
            className="px-3 py-2 bg-surface-container-high rounded-xl border border-outline-variant text-on-surface text-body-md font-medium max-w-xs focus:outline-none focus:border-secondary"
          >
            {problems.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title} (Priority {p.priorityScore})
              </option>
            ))}
          </select>
        </div>
      </div>

      {feedback && (
        <div className="p-4 bg-secondary-fixed/20 border border-secondary/40 text-on-surface rounded-xl flex items-center gap-3">
          <MaterialIcon icon="check_circle" size={20} className="text-secondary" />
          <p className="text-body-md font-medium">{feedback}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current team */}
        <Card className="lg:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="font-headline-sm text-on-surface">
                Assigned Taskforce: <span className="text-secondary">{activeProblem ? activeProblem.title : 'Sabarmati Unit'}</span>
              </h3>
              <p className="text-body-sm text-on-surface-variant">
                IIT Gandhinagar & Partner Universities • {teamMembers.length} active researchers
              </p>
            </div>
            <Badge variant="success" size="sm" icon="bolt">
              Active Roster
            </Badge>
          </div>

          {activeProblem && (
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <StatusChip status={activeProblem.status} size="sm" />
              <StatusChip severity={activeProblem.severity} size="sm" />
              <Badge variant="surface" size="sm">
                Priority {activeProblem.priorityScore}/100
              </Badge>
              <Badge variant="surface" size="sm">
                Stage {activeProblem.currentStage}/9
              </Badge>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
            {teamMembers.map((m) => (
              <div key={m.id} className="flex items-center gap-3 p-3 bg-surface-container-high/50 rounded-xl group relative">
                <div className="w-10 h-10 rounded-full bg-secondary-fixed flex items-center justify-center shrink-0">
                  <MaterialIcon icon="person" size={20} className="text-secondary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-label-lg text-on-surface font-medium">{m.name}</p>
                  <p className="text-body-sm text-on-surface-variant text-truncate-1">
                    {m.role.replace(/_/g, ' ')} • {m.department || 'Engineering'}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {m.skills[0] && (
                    <Badge variant="surface" size="sm">
                      {m.skills[0]}
                    </Badge>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveFromTeam(m)}
                    className="p-1 rounded-lg text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors opacity-60 hover:opacity-100"
                    title="Remove member and return to available talent pool"
                    aria-label={`Remove ${m.name} from team`}
                  >
                    <MaterialIcon icon="close" size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {activeProblem && (
            <Button
              variant="secondary"
              className="w-full"
              icon="open_in_new"
              onClick={() => navigate(`/university/challenges/${activeProblem.id}`)}
            >
              Open Incident Challenge Lifecycle
            </Button>
          )}
        </Card>

        {/* Talent pool */}
        <Card className="p-0 flex flex-col">
          <div className="p-3 border-b border-outline-variant/20 flex items-center justify-between">
            <div>
              <h3 className="font-headline-sm text-on-surface">Available Talent Pool</h3>
              <p className="text-body-sm text-on-surface-variant">Select students & specialists to recruit</p>
            </div>
            <Badge variant="surface" size="sm">
              {poolMembers.length} available
            </Badge>
          </div>

          {poolMembers.length === 0 ? (
            <div className="p-8 text-center text-on-surface-variant flex-1 flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center mb-3">
                <MaterialIcon icon="check" size={24} className="text-secondary" />
              </div>
              <p className="text-label-lg text-on-surface font-semibold mb-1">All Candidates Recruited</p>
              <p className="text-body-sm max-w-xs">
                All specialists from the talent pool have been assigned to active taskforces. You can return members from the active roster at any time.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-outline-variant/10 max-h-[520px] overflow-y-auto flex-1">
              {poolMembers.map((candidate) => {
                const selected = !!selectedCandidateIds[candidate.id];
                return (
                  <div
                    key={candidate.id}
                    onClick={() => toggleCandidate(candidate.id)}
                    className={cn(
                      'p-3 transition-colors cursor-pointer',
                      selected ? 'bg-secondary/10' : 'hover:bg-surface-container-high/20'
                    )}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center shrink-0">
                        <MaterialIcon icon="person" size={18} className="text-on-surface-variant" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-label-lg text-on-surface font-medium">{candidate.name}</p>
                        <p className="text-body-sm text-on-surface-variant text-truncate-1">
                          {candidate.role.replace(/_/g, ' ')} • {candidate.department}
                        </p>
                      </div>
                      <label
                        className="relative inline-flex items-center cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => toggleCandidate(candidate.id)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 rounded-full transition-colors peer-checked:bg-secondary bg-surface-container-highest" />
                        <div
                          className={cn(
                            'absolute w-4 h-4 rounded-full bg-white shadow transition-transform left-0.5',
                            selected ? 'translate-x-4' : ''
                          )}
                        />
                      </label>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {candidate.skills.map((s) => (
                        <Badge key={s} variant="surface" size="sm">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="p-3 border-t border-outline-variant/20">
            <Button
              variant="primary"
              className="w-full"
              icon="group_add"
              disabled={selectedCount === 0}
              onClick={handleAddSelected}
            >
              {selectedCount > 0
                ? `Recruit Selected (${selectedCount}) to Taskforce`
                : 'Select Candidates from Pool'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
