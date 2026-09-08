import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProblems } from '../../context/ProblemContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { MaterialIcon } from '../../components/common/MaterialIcon';
import { StatusChip } from '../../components/common/StatusChip';
import { DEMO_TEAM_MEMBERS, DEMO_PROJECT } from '../../data/demoData';
import { cn } from '../../utils/cn';
import type { Problem, TeamMember } from '../../types';

const POOL: Omit<TeamMember, 'id'>[] = [
  { name: 'Kavya Shah', role: 'student_engineer', department: 'B.Tech CSE', skills: ['Dashboard', 'Full-stack', 'Figma'] },
  { name: 'Arjun Mehta', role: 'tech_lead', department: 'B.Tech ECE', skills: ['Data Pipelines', 'Cloud Analytics', 'Alerting Systems'] },
  { name: 'Sneha Iyer', role: 'gis_lead', department: 'M.Tech GIS', skills: ['QGIS', 'Field Survey', 'Cartography'] },
  { name: 'Rahul Desai', role: 'field_ops_lead', department: 'B.Tech Civil', skills: ['Site Ops', 'Safety', 'Logistics'] },
  { name: 'Fatima Noor', role: 'ai_ml_lead', department: 'M.Tech AI', skills: ['PyTorch', 'Forecasting', 'MLOps'] },
  { name: 'Vikram Jha', role: 'project_manager', department: 'MBA Tech', skills: ['Agile', 'Stakeholders', 'Reporting'] },
  { name: 'Priya Nair', role: 'student_engineer', department: 'B.Tech EEE', skills: ['Reliability', 'Testing', 'QA'] },
  { name: 'Aditya Rao', role: 'domain_expert', department: 'Disaster Mgmt Cert.', skills: ['NDMA SOPs', 'Training', 'Drills'] },
];

export function UniversityTeamsPage() {
  const navigate = useNavigate();
  const { problems } = useProblems();
  const [toggle, setToggle] = useState<Record<string, boolean>>({});
  const [formed, setFormed] = useState<Record<string, TeamMember[]>>({});

  const availableProblems = problems.filter((p) => p.status === 'matched' || p.status === 'collaborating' || p.status === 'ai_analyzed' || p.status === 'verified');

  const currentTeam = DEMO_TEAM_MEMBERS;
  const currentProblem = DECLARED_PROBLEM(problems);

  const toggleMember = (id: string) => setToggle((t) => ({ ...t, [id]: !t[id] }));

  return (
    <div className="max-w-[1440px] mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-headline-lg text-on-surface mb-1">Student Teams</h1>
          <p className="text-body-md text-on-surface-variant">Assemble interdisciplinary teams against matched challenges.</p>
        </div>
        <Badge variant="secondary" size="lg" icon="groups">{availableProblems.length} challenges open</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current team */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-headline-sm text-on-surface">Team: <span className="text-secondary">Sabarmati Response Cell</span></h3>
              <p className="text-body-sm text-on-surface-variant">Assigned to: {currentProblem ? currentProblem.title : DEMO_PROJECT.title}</p>
            </div>
            <Badge variant="success" size="sm" icon="bolt">Formed</Badge>
          </div>

          {currentProblem && (
            <div className="flex items-center gap-2 mb-4">
              <StatusChip status={currentProblem.status} size="sm" />
              <Badge variant="surface" size="sm">Priority {currentProblem.priorityScore}</Badge>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
            {currentTeam.map((m) => (
              <div key={m.id} className="flex items-center gap-3 p-3 bg-surface-container-high/50 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-secondary-fixed flex items-center justify-center shrink-0">
                  <MaterialIcon icon="person" size={20} className="text-secondary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-label-lg text-on-surface">{m.name}</p>
                  <p className="text-body-sm text-on-surface-variant text-truncate-1">{m.role.replace(/_/g, ' ')} • {m.department}</p>
                </div>
                <Badge variant="surface" size="sm">{m.skills[0]}</Badge>
              </div>
            ))}
          </div>

          <Button variant="secondary" className="w-full" icon="groups" onClick={() => navigate(`/university/projects/${DEMO_PROJECT.id}`)}>
            Open project workspace
          </Button>
        </Card>

        {/* Talent pool */}
        <Card className="p-0">
          <div className="p-3 border-b border-outline-variant/20 flex items-center justify-between">
            <h3 className="font-headline-sm text-on-surface">Talent Pool</h3>
            <Badge variant="surface" size="sm">{POOL.length} available</Badge>
          </div>
          <div className="divide-y divide-outline-variant/10 max-h-[520px] overflow-y-auto">
            {POOL.map((candidate, i) => {
              const id = `pool-${i}`;
              const selected = toggle[id];
              return (
                <div key={id} className="p-3">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center shrink-0">
                      <MaterialIcon icon="person" size={18} className="text-on-surface-variant" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-label-lg text-on-surface">{candidate.name}</p>
                      <p className="text-body-sm text-on-surface-variant text-truncate-1">{candidate.role.replace(/_/g, ' ')}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={selected} onChange={() => toggleMember(id)} className="sr-only peer" />
                      <div className={cn('w-9 h-5 rounded-full transition-colors peer-checked:bg-secondary bg-surface-container-highest')} />
                      <div className={cn('absolute w-4 h-4 rounded-full bg-white shadow transition-transform left-0.5 peer-checked:translate-x-4', selected ? 'translate-x-4' : '')} />
                    </label>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {candidate.skills.map((s) => (
                      <Badge key={s} variant="surface" size="sm">{s}</Badge>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="p-3 border-t border-outline-variant/20">
            <Button
              variant="primary"
              className="w-full"
              icon="handshake"
              onClick={() => {
                const pool = POOL.map((p, i) => ({ ...p, id: `pool-${i}` }));
                const recs = pool.filter((m) => toggle[m.id]);
                if (recs.length === 0) {
                  window.alert('Select at least one candidate to add to the team.');
                  return;
                }
                const newTeam = [...currentTeam, ...recs];
                setFormed({ ...formed, [DEMO_PROJECT.id]: newTeam });
                setToggle({});
                window.alert(`Added ${recs.length} member(s) to the team. Team size is now ${newTeam.length}.`);
              }}
            >
              Add selected to team
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

function DECLARED_PROBLEM(problems: Problem[]) {
  return problems.find((p) => p.id === 'prob-26043') || problems[0];
}