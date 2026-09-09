import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProblems } from '../../context/ProblemContext';
import { useNotifications } from '../../context/NotificationContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { StatusChip } from '../../components/common/StatusChip';
import { MaterialIcon } from '../../components/common/MaterialIcon';
import { cn } from '../../utils/cn';
import { CATEGORY_LABELS } from '../../data/demoData';
import type { Problem } from '../../types';

export function GovernmentPriorityQueue() {
  const navigate = useNavigate();
  const { problems, updateProblemStatus } = useProblems();
  const { addManualNotification } = useNotifications();
  const [tab, setTab] = useState<'pending' | 'verified' | 'full'>('pending');
  const [expanded, setExpanded] = useState<string | null>(null);

  const sorted = [...problems].sort((a, b) => b.priorityScore - a.priorityScore);
  const pending = sorted.filter((p) => p.status === 'reported' || p.status === 'ai_analyzed');
  const verified = sorted.filter((p) => p.status === 'verified' || p.status === 'matched');
  const visible = tab === 'pending' ? pending : tab === 'verified' ? verified : sorted;

  const handleVerify = (p: Problem) => {
    updateProblemStatus(p.id, 'verified');
    addManualNotification({
      type: 'problem_verified',
      title: 'Verified by government',
      message: `${p.title} — routed for university/industry matching`,
      actionUrl: `/government/problems/${p.id}`,
      relatedEntityId: p.id,
    });
  };

  return (
    <div className="max-w-[1440px] mx-auto space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-headline-lg text-on-surface mb-1">Priority Verification Queue</h1>
          <p className="text-body-md text-on-surface-variant">
            {pending.length} problems awaiting government verification
          </p>
        </div>
        <Badge variant="secondary" size="lg" icon="verified">Verify workflow active</Badge>
      </div>

      <div className="flex items-center gap-1.5">
        {(['pending', 'verified', 'full'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'px-4 h-8 rounded-full text-label-md font-semibold uppercase tracking-wide transition-colors',
              tab === t ? 'bg-secondary text-on-secondary-container' : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
            )}
          >
            {t === 'pending' ? `To Verify (${pending.length})` : t === 'verified' ? `Verified (${verified.length})` : 'All'}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {visible.length === 0 && (
          <Card>
            <div className="py-16 text-center">
              <MaterialIcon icon="task_alt" size={40} className="text-on-surface-variant/40 mb-3" />
              <p className="font-headline-sm text-on-surface">Queue clear</p>
              <p className="text-body-sm text-on-surface-variant">No problems in this view.</p>
            </div>
          </Card>
        )}

        {visible.map((problem) => (
          <Card key={problem.id}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className={cn(
                      'text-data-metric',
                      problem.severity === 'critical' ? 'text-error' : problem.severity === 'high' ? 'text-warning' : 'text-secondary'
                    )}
                  >
                    {problem.priorityScore}
                  </span>
                  <span className="text-label-md text-on-surface-variant uppercase">AI Score</span>
                  <StatusChip severity={problem.severity} size="sm" />
                  <StatusChip status={problem.status} size="sm" />
                  {problem.priorityScore >= 90 && <Badge variant="error" size="sm" pulse icon="crisis_alert">Critical</Badge>}
                </div>

                <p className="font-headline-sm text-on-surface mb-0.5">{problem.title}</p>
                <p className="text-body-sm text-on-surface-variant mb-2">
                  {problem.location.city}, {problem.location.state} • {CATEGORY_LABELS[problem.category]} • {problem.affectedPopulation.toLocaleString()} affected • {problem.location.address}
                </p>

                {problem.aiAnalysis && expanded === problem.id && (
                  <div className="bg-surface-container-high/60 rounded-xl p-3 mb-3 space-y-1">
                    <p className="text-label-md text-on-surface-variant uppercase tracking-wide">AI Assessment</p>
                    <p className="text-body-sm text-on-surface">
                      Confidence {problem.aiAnalysis.confidence}% • Recommended: {problem.aiAnalysis.recommendedExpertise.join(', ')}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {problem.aiAnalysis.potentialImpact.riskFactors.map((rf) => (
                        <Badge key={rf} variant="outline" size="sm">{rf}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <button
                    className="text-label-md text-secondary flex items-center gap-1 hover:underline"
                    onClick={() => setExpanded(expanded === problem.id ? null : problem.id)}
                  >
                    <MaterialIcon icon={expanded === problem.id ? 'expand_less' : 'expand_more'} size={16} />
                    {expanded === problem.id ? 'Hide AI assessment' : 'Show AI assessment'}
                  </button>
                  <button className="text-label-md text-on-surface-variant hover:text-on-surface" onClick={() => navigate(`/government/problems/${problem.id}`)}>
                    Open detail →
                  </button>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2 shrink-0">
                {problem.status === 'reported' || problem.status === 'ai_analyzed' ? (
                  <>
                    <Button variant="primary" size="sm" icon="verified" onClick={() => handleVerify(problem)}>
                      Verify
                    </Button>
                    <Button variant="ghost" size="sm" icon="thumb_down" onClick={() => updateProblemStatus(problem.id, 'closed')}>
                      Reject
                    </Button>
                  </>
                ) : (
                  <Badge variant="success" size="md" icon="check_circle">Verified</Badge>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}