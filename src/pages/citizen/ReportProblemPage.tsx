import { useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from 'react-router-dom';
import { useProblems } from '../../context/ProblemContext';
import { useNotifications } from '../../context/NotificationContext';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Card } from '../../components/common/Card';
import { MaterialIcon } from '../../components/common/MaterialIcon';
import { cn } from '../../utils/cn';
import { aiService } from '../../services/aiService';
import { matchingService } from '../../services/matchingService';
import { offlineQueue } from '../../services/persistence';
import { CATEGORY_LABELS } from '../../data/demoData';
import { StatusChip } from '../../components/common/StatusChip';
import type { ProblemCategory, Evidence, Location } from '../../types';
import type { AIAnalysis } from '../../types';

const CATEGORIES = Object.keys(CATEGORY_LABELS) as ProblemCategory[];

function LocationPicker({ onPick, initial }: { onPick: (loc: Location) => void; initial?: Location }) {
  const [pos, setPos] = useState<[number, number] | null>(
    initial ? [initial.latitude, initial.longitude] : null
  );

  function ClickHandler() {
    useMapEvents({
      click(e) {
        const loc: Location = {
          latitude: Math.round(e.latlng.lat * 100000) / 100000,
          longitude: Math.round(e.latlng.lng * 100000) / 100000,
          city: 'Ahmedabad',
          state: 'Gujarat',
          address: 'Selected drop location',
        };
        setPos([loc.latitude, loc.longitude]);
        onPick(loc);
      },
    });
    return null;
  }

  function UseMyLocation() {
    useMapEvents({
      locationfound(e) {
        const loc: Location = {
          latitude: Math.round(e.latlng.lat * 100000) / 100000,
          longitude: Math.round(e.latlng.lng * 100000) / 100000,
          city: 'Ahmedabad',
          state: 'Gujarat',
          address: 'My current location',
        };
        setPos([loc.latitude, loc.longitude]);
        onPick(loc);
      },
    });
    return null;
  }

  const icon = L.divIcon({
    className: '',
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    html: `<div style="width:24px;height:24px;background:#06B6D4;border:3px solid #fff;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 6px rgba(0,0,0,.3)"></div>`,
  });

  return (
    <div className="relative h-[320px] rounded-xl overflow-hidden border border-outline-variant/30 z-0">
      <MapContainer center={pos ?? [23.0225, 72.5714]} zoom={12} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler />
        <UseMyLocation />
        {pos && <Marker position={pos} icon={icon} />}
      </MapContainer>
      <button
        type="button"
        onClick={() => navigator.geolocation.getCurrentPosition((p) => {
          const loc: Location = { latitude: p.coords.latitude, longitude: p.coords.longitude, city: 'Ahmedabad', state: 'Gujarat', address: 'My location' };
          setPos([loc.latitude, loc.longitude]);
          onPick(loc);
        })}
        className="absolute bottom-3 right-3 z-[1000] h-9 px-3 rounded-full bg-secondary text-white text-label-md font-semibold shadow-lg flex items-center gap-1.5"
      >
        <span className="material-symbols-outlined text-[16px]">my_location</span>
        Use my location
      </button>
    </div>
  );
}

interface NewReport {
  title: string;
  category: ProblemCategory;
  description: string;
  location: Location | null;
  evidence: Evidence[];
}

export function ReportProblemPage() {
  const navigate = useNavigate();
  const { addProblem } = useProblems();
  const { addManualNotification } = useNotifications();

  const [step, setStep] = useState(1);
  const [report, setReport] = useState<NewReport>({
    title: '',
    category: 'urban_flooding',
    description: '',
    location: null,
    evidence: [],
  });
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [offlineSaved, setOfflineSaved] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const prevStep = () => setStep((s) => Math.max(1, s - 1));
  const nextStep = () => setStep((s) => Math.min(4, s + 1));

  const set = <K extends keyof NewReport>(key: K, value: NewReport[K]) =>
    setReport((r) => ({ ...r, [key]: value }));

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach((f, i) => {
      const url = URL.createObjectURL(f);
      set('evidence', [
        ...report.evidence,
        {
          id: `ev-${Date.now()}-${i}`,
          type: 'photo',
          url,
          thumbnailUrl: url,
          caption: f.name,
          timestamp: new Date(),
        },
      ]);
    });
    e.target.value = '';
  };

  const handleSubmit = async () => {
    setAnalyzing(true);
    try {
      const result = await aiService.analyze(report.description, report.category);
      setAnalysis(result);

      const problem = {
        id: `prob-${Date.now()}`,
        title: report.title,
        description: report.description,
        category: result.category,
        location: report.location || { latitude: 23.0225, longitude: 72.5714, city: 'Ahmedabad', state: 'Gujarat' },
        severity: result.severity,
        urgency: result.urgency,
        priorityScore: result.priorityScore,
        affectedPopulation: result.potentialImpact.affectedPopulation,
        evidence: report.evidence,
        reportedBy: 'citizen-001',
        reportedAt: new Date(),
        status: 'ai_analyzed' as const,
        currentStage: 2 as const,
        aiAnalysis: result,
        universityMatches: matchingService.scoreUniversities({ category: result.category, priorityScore: result.priorityScore }, 3),
        industryMatches: matchingService.scoreIndustries({ category: result.category, priorityScore: result.priorityScore, location: report.location ?? undefined }, 3),
        requiredExpertise: result.recommendedExpertise,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      addProblem(problem);

      addManualNotification({
        type: 'problem_analyzed',
        title: 'Report auto-analyzed by AI',
        message: `${report.title} — ${result.severity} severity, priority ${result.priorityScore}/100`,
        actionUrl: `/citizen/reports/${problem.id}`,
      });

      setTimeout(() => navigate(`/citizen/reports/${problem.id}`), 1800);
    } catch {
      // Offline fallback: queue for later sync
      await offlineQueue.add({ id: `q-${Date.now()}`, type: 'report_submission', data: report });
      setOfflineSaved(true);
    } finally {
      setAnalyzing(false);
    }
  };

  const stepValid =
    step === 1 ? report.title.trim().length > 4 && report.description.trim().length > 10
      : step === 2 ? !!report.location
        : step === 3 ? true
          : true;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Progress steps */}
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className="flex items-center gap-1 flex-1">
            <div
              className={cn(
                'h-9 flex-1 rounded-lg flex items-center justify-center gap-1.5 text-label-md font-semibold transition-colors',
                step >= n ? 'bg-secondary text-white' : 'bg-surface-container-high text-on-surface-variant'
              )}
            >
              <span className="material-symbols-outlined text-[16px]">
                {step > n ? 'check' : n === 1 ? 'edit' : n === 2 ? 'location_on' : n === 3 ? 'attach_file' : 'auto_awesome'}
              </span>
              <span className="hidden sm:inline">{n === 1 ? 'Describe' : n === 2 ? 'Location' : n === 3 ? 'Evidence' : 'AI Review'}</span>
            </div>
            {n < 4 && <div className="w-2 h-px bg-outline-variant" />}
          </div>
        ))}
      </div>

      {offlineSaved && (
        <div className="bg-warning/10 border border-warning/30 rounded-xl p-4 flex items-center gap-3">
          <MaterialIcon icon="cloud_off" size={20} className="text-warning" />
          <div>
            <p className="text-label-lg text-on-surface">You are offline — report saved to queue</p>
            <p className="text-body-sm text-on-surface-variant">It will sync automatically when you reconnect.</p>
          </div>
        </div>
      )}

      <Card>
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h2 className="font-headline-md text-on-surface mb-1">Describe the problem</h2>
              <p className="text-body-sm text-on-surface-variant">Be specific — our AI uses this text for triage.</p>
            </div>
            <div>
              <label className="text-label-md text-on-surface-variant uppercase tracking-wide mb-1.5 block">Category</label>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => set('category', c)}
                    className={cn(
                      'px-3 h-8 rounded-full text-body-sm font-semibold border transition-colors',
                      report.category === c
                        ? 'bg-secondary text-white border-secondary'
                        : 'bg-surface-container-high text-on-surface-variant border-outline-variant hover:border-secondary'
                    )}
                  >
                    {CATEGORY_LABELS[c]}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-label-md text-on-surface-variant uppercase tracking-wide mb-1.5 block">Title *</label>
              <input
                value={report.title}
                onChange={(e) => set('title', e.target.value)}
                placeholder="e.g. Waterlogging on Ellis Bridge approach road"
                className="w-full h-11 px-4 rounded-xl border border-outline-variant bg-surface-container-low focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
              />
            </div>
            <div>
              <label className="text-label-md text-on-surface-variant uppercase tracking-wide mb-1.5 block">Description *</label>
              <textarea
                value={report.description}
                onChange={(e) => set('description', e.target.value)}
                rows={5}
                placeholder="Describe what happened, where, how severe, and who is affected..."
                className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface-container-low focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 resize-none"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="font-headline-md text-on-surface mb-1">Pin the location</h2>
              <p className="text-body-sm text-on-surface-variant">Click on the map to drop a marker, or use your device location.</p>
            </div>
            <LocationPicker onPick={(loc) => set('location', loc)} initial={report.location ?? undefined} />
            {report.location && (
              <div className="flex items-center gap-2 text-on-surface-variant text-body-sm">
                <MaterialIcon icon="location_on" size={16} className="text-secondary" />
                {report.location.latitude.toFixed(4)}, {report.location.longitude.toFixed(4)} • {report.location.address}
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="font-headline-md text-on-surface mb-1">Attach evidence</h2>
              <p className="text-body-sm text-on-surface-variant">Photos and voice notes help verification verify faster.</p>
            </div>
            <div className="flex items-center gap-3">
              <input ref={fileInput} type="file" accept="image/*" multiple hidden onChange={handleFile} />
              <Button variant="outline" icon="add_a_photo" onClick={() => fileInput.current?.click()}>
                Add photos
              </Button>
              <button
                type="button"
                onClick={() => {
                  if (!('MediaRecorder' in globalThis)) {
                    globalThis.alert('Voice recording not supported in this browser preview.');
                    return;
                  }
                  globalThis.alert('Voice recording works in deployed browsers. In this prototype, evidence is simulated as a photo.');
                }}
                className="h-10 px-4 rounded-xl border border-outline-variant bg-transparent text-on-surface text-label-lg font-semibold flex items-center gap-2 hover:bg-surface-container-high transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">mic</span>
                Record voice
              </button>
            </div>
            {report.evidence.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {report.evidence.map((ev) => (
                  <div key={ev.id} className="relative aspect-square rounded-lg overflow-hidden bg-surface-container-high">
                    {ev.type === 'photo' ? (
                      <img src={ev.url} alt={ev.caption} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-secondary-fixed/40">
                        <MaterialIcon icon="mic" size={28} className="text-secondary" />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => set('evidence', report.evidence.filter((x) => x.id !== ev.id))}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[12px]">close</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-5">
            <div>
              <h2 className="font-headline-md text-on-surface mb-1">AI review</h2>
              <p className="text-body-sm text-on-surface-variant">
                Confirm your report. AI analysis runs automatically on submit.
              </p>
            </div>

            <div className="bg-surface-container-high/60 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-label-lg text-on-surface">{report.title}</p>
                <Badge variant="surface" size="sm">{CATEGORY_LABELS[report.category]}</Badge>
              </div>
              <p className="text-body-sm text-on-surface-variant">{report.description}</p>
              {report.location && (
                <p className="text-body-sm text-secondary flex items-center gap-1.5">
                  <MaterialIcon icon="location_on" size={14} />
                  {report.location.latitude.toFixed(4)}, {report.location.longitude.toFixed(4)}
                </p>
              )}
            </div>

            {analyzing ? (
              <div className="rounded-xl border border-secondary/30 bg-secondary-fixed/20 p-5">
                <div className="flex items-center gap-3 mb-3">
                  <span className="material-symbols-outlined animate-spin text-secondary text-[24px]">progress_activity</span>
                  <div>
                    <p className="text-label-lg text-on-surface">Our AI is analyzing your report</p>
                    <p className="text-body-sm text-on-surface-variant">Classifying category, severity, urgency and impact…</p>
                  </div>
                </div>
                <div className="h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                  <div className="h-full bg-secondary rounded-full animate-pulse" style={{ width: '70%' }} />
                </div>
              </div>
            ) : analysis ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="p-3 bg-surface-container-high/60 rounded-xl text-center">
                    <p className="text-label-md text-on-surface-variant uppercase">Severity</p>
                    <div className="mt-1"><StatusChip severity={analysis.severity} /></div>
                  </div>
                  <div className="p-3 bg-surface-container-high/60 rounded-xl text-center">
                    <p className="text-label-md text-on-surface-variant uppercase">Priority</p>
                    <p className="text-data-metric text-secondary">{analysis.priorityScore}</p>
                  </div>
                  <div className="p-3 bg-surface-container-high/60 rounded-xl text-center">
                    <p className="text-label-md text-on-surface-variant uppercase">Confidence</p>
                    <p className="font-headline-md text-on-surface">{analysis.confidence}%</p>
                  </div>
                  <div className="p-3 bg-surface-container-high/60 rounded-xl text-center">
                    <p className="text-label-md text-on-surface-variant uppercase">Affected</p>
                    <p className="font-headline-md text-on-surface">{analysis.potentialImpact.affectedPopulation.toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-success/5 border border-success/20 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <MaterialIcon icon="check_circle" size={24} className="text-success" />
                    <div>
                      <p className="text-label-lg text-on-surface">Report registered and live</p>
                      <p className="text-body-sm text-on-surface-variant">Matched to 3 universities and 3 industry partners. Routing you to the detail view…</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-on-surface-variant text-body-sm bg-surface-container-low rounded-xl p-3">
                <MaterialIcon icon="info" size={16} />
                Ready to submit — the AI pipeline will analyze and match in ~2 seconds.
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between mt-6 pt-5 border-t border-outline-variant/20">
          <Button variant="ghost" icon="arrow_back" onClick={prevStep} disabled={step === 1}>
            Back
          </Button>
          <div className="flex items-center gap-2">
            {step < 4 ? (
              <Button variant="primary" iconPosition="right" icon="arrow_forward" onClick={nextStep} disabled={!stepValid}>
                Continue
              </Button>
            ) : analyzing ? (
              <Button variant="primary" loading disabled>
                Analyzing…
              </Button>
            ) : (
              <Button variant="success" icon="rocket_launch" onClick={handleSubmit} disabled={analyzing}>
                Submit & Analyze
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}