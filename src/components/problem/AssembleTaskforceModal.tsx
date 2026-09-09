import { useState } from 'react';
import { useProblems } from '../../context/ProblemContext';
import { useNotifications } from '../../context/NotificationContext';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { MaterialIcon } from '../common/MaterialIcon';
import type { Role, Problem, ProblemCategory, Severity } from '../../types';

interface AssembleTaskforceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (taskforceName: string, problemTitle: string) => void;
  role: Role;
  initialProblemId?: string;
}

const ACADEMIC_PARTNERS = [
  { name: 'IIT Gandhinagar — Disaster Innovation Hub', lead: 'Prof. Anand Verma (Dean of R&D)', focus: 'HydroSense & AI Telemetry' },
  { name: 'SVNIT Surat — Disaster Engineering Lab', lead: 'Dr. Sneha Joshi (Hydraulics)', focus: 'River Basin & Flood Modelling' },
  { name: 'IIT Delhi — Structural Resilience Cell', lead: 'Dr. Rajesh Khurana (Civil & Sensors)', focus: 'Structural Integrity & Alert Systems' },
  { name: 'Gujarat University — Geo-Informatics Cell', lead: 'Prof. Meena Shah (GIS Mapping)', focus: 'Urban Survey & Spatial Telemetry' },
  { name: 'CEPT University — Urban Resilience Centre', lead: 'Ar. Devendra Dave (Urban Infra)', focus: 'Drainage & Evacuation Corridors' },
];

const INDUSTRY_PARTNERS = [
  { name: 'Reliance Foundation Disaster Relief', resource: '50,000 L/hr High-Volume Dewatering Pumps & Rapid Fleet' },
  { name: 'Tata Consultancy Services Humanitarian Tech', resource: 'Satellite Mesh Telemetry Units & Real-time Sensor Hubs' },
  { name: 'L&T Heavy Civil Engineering & Infra', resource: 'Mobile Amphibious Excavator Fleet & Berm Reinforcements' },
  { name: 'AWS India Disaster Response', resource: 'Cloud Compute Credits, GPU Telemetry & Edge AI Devices' },
  { name: 'Adani Total Infrastructure Logistics', resource: 'Emergency Heavy Earthmovers & Evacuation Tankers' },
];

const GOVERNMENT_AGENCIES = [
  'Gujarat State Disaster Management Authority (GSDMA)',
  'NDRF 6th Battalion (Vadodara/Ahmedabad)',
  'Ahmedabad Municipal Corporation (AMC) Disaster Cell',
  'State Emergency Operation Centre (SEOC Gandhinagar)',
  'Gujarat Water Infrastructure Limited (GWIL)',
];

export function AssembleTaskforceModal({
  isOpen,
  onClose,
  onSuccess,
  role,
  initialProblemId,
}: AssembleTaskforceModalProps) {
  const { problems, assembleTaskforce, addProblem } = useProblems();
  const { addManualNotification } = useNotifications();

  // Find candidate problem
  const defaultProblem = problems.find((p) => p.id === initialProblemId) || problems[0];

  const [selectedProblemId, setSelectedProblemId] = useState<string>(
    defaultProblem?.id || 'new'
  );
  const [isCustomProblem, setIsCustomProblem] = useState<boolean>(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customLocation, setCustomLocation] = useState('Ahmedabad, Gujarat');
  const [customCategory, setCustomCategory] = useState<ProblemCategory>('urban_flooding');

  const [taskforceName, setTaskforceName] = useState(
    defaultProblem ? `${defaultProblem.title.slice(0, 32)} Response Taskforce` : 'Rapid Flood & Hazard Taskforce'
  );

  const [selectedAcademic, setSelectedAcademic] = useState(ACADEMIC_PARTNERS[0].name);
  const [facultyLead, setFacultyLead] = useState(ACADEMIC_PARTNERS[0].lead);

  const [selectedIndustry, setSelectedIndustry] = useState(INDUSTRY_PARTNERS[0].name);
  const [industryResource, setIndustryResource] = useState(INDUSTRY_PARTNERS[0].resource);

  const [governmentAgency, setGovernmentAgency] = useState(
    role === 'government' ? GOVERNMENT_AGENCIES[0] : GOVERNMENT_AGENCIES[0]
  );
  const [commandingOfficer, setCommandingOfficer] = useState('Commandant R. K. Patel (SDRF Cell)');
  const [urgencyLevel, setUrgencyLevel] = useState<'critical' | 'high' | 'medium'>('critical');
  const [mobilizationTimeline, setMobilizationTimeline] = useState('Immediate (0-2 hrs)');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleProblemChange = (val: string) => {
    if (val === 'NEW_INITIATIVE') {
      setIsCustomProblem(true);
      setSelectedProblemId('NEW_INITIATIVE');
      setTaskforceName('Rapid Disaster Emergency Response Taskforce');
    } else {
      setIsCustomProblem(false);
      setSelectedProblemId(val);
      const chosen = problems.find((p) => p.id === val);
      if (chosen) {
        setTaskforceName(`${chosen.title.slice(0, 32)} Response Taskforce`);
      }
    }
  };

  const handleAcademicChange = (name: string) => {
    setSelectedAcademic(name);
    const found = ACADEMIC_PARTNERS.find((a) => a.name === name);
    if (found) setFacultyLead(found.lead);
  };

  const handleIndustryChange = (name: string) => {
    setSelectedIndustry(name);
    const found = INDUSTRY_PARTNERS.find((i) => i.name === name);
    if (found) setIndustryResource(found.resource);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let targetProblemId = selectedProblemId;
      let targetProblemTitle = '';

      if (isCustomProblem || selectedProblemId === 'NEW_INITIATIVE') {
        const newId = `prob-taskforce-${Date.now()}`;
        const newProb: Problem = {
          id: newId,
          title: customTitle.trim() || 'Rapid Urban Hazard Initiative',
          description: `Joint cross-sector taskforce initiative assembled under ${governmentAgency} coordination. Mobilized in response to emergency ground assessment.`,
          category: customCategory,
          severity: urgencyLevel as Severity,
          urgency: urgencyLevel === 'critical' ? 'immediate' : 'urgent',
          location: {
            latitude: 23.0225,
            longitude: 72.5714,
            address: customLocation.trim() || 'Ahmedabad, Gujarat',
            city: 'Ahmedabad',
            state: 'Gujarat',
          },
          status: 'collaborating',
          currentStage: 5,
          affectedPopulation: urgencyLevel === 'critical' ? 12000 : 5000,
          priorityScore: urgencyLevel === 'critical' ? 95 : urgencyLevel === 'high' ? 82 : 68,
          reportedBy: commandingOfficer,
          reportedAt: new Date(),
          evidence: [],
          requiredExpertise: ['Disaster Management', 'Sensors & Telemetry', 'Hydrology'],
          createdAt: new Date(),
          updatedAt: new Date(),
          universityMatches: [],
          industryMatches: [],
        };
        await addProblem(newProb);
        targetProblemId = newId;
        targetProblemTitle = newProb.title;
      } else {
        const existing = problems.find((p) => p.id === selectedProblemId) || problems[0];
        targetProblemTitle = existing ? existing.title : 'Emergency Incident';
      }

      // Execute Assemble Taskforce logic
      await assembleTaskforce({
        problemId: targetProblemId,
        taskforceName: taskforceName.trim() || 'Disaster Response Taskforce',
        universityName: selectedAcademic,
        facultyLead: facultyLead.trim(),
        industryName: selectedIndustry,
        industryContribution: industryResource.trim(),
        governmentAgency,
        commandingOfficer: commandingOfficer.trim(),
        priorityScore: urgencyLevel === 'critical' ? 95 : urgencyLevel === 'high' ? 82 : 70,
      });

      // Issue manual notification to alert system
      addManualNotification({
        type: 'team_created',
        title: `Taskforce Assembled: ${taskforceName}`,
        message: `${selectedAcademic} & ${selectedIndustry} mobilized under ${governmentAgency} command for ${targetProblemTitle}.`,
        relatedEntityId: targetProblemId,
        relatedEntityType: 'problem',
      });

      onSuccess(taskforceName, targetProblemTitle);
      onClose();
    } catch (err) {
      console.error('Failed to assemble taskforce:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-surface-container-high rounded-2xl max-w-2xl w-full border border-outline-variant shadow-2xl my-6 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-outline-variant/20 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary-fixed flex items-center justify-center text-secondary shrink-0">
              <MaterialIcon icon="group_add" size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-headline-md text-on-surface">Assemble Taskforce</h3>
                <Badge variant="secondary" size="sm">
                  Tri-Sector Rapid Unit
                </Badge>
              </div>
              <p className="text-body-sm text-on-surface-variant">
                Mobilize coordinated engineering & relief units across Government, Academia, and Corporate CSR
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface p-1.5 rounded-lg hover:bg-surface-container-highest transition-colors"
            title="Close modal"
          >
            <MaterialIcon icon="close" size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5 overflow-y-auto flex-1 text-on-surface">
          {/* 1. Target Incident */}
          <div className="bg-surface rounded-xl p-4 border border-outline-variant/30 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-label-lg font-semibold text-on-surface flex items-center gap-2">
                <MaterialIcon icon="crisis_alert" size={18} className="text-secondary" />
                Target Disaster Incident
              </label>
              <span className="text-label-sm text-on-surface-variant">Choose incident or create initiative</span>
            </div>

            <select
              value={isCustomProblem ? 'NEW_INITIATIVE' : selectedProblemId}
              onChange={(e) => handleProblemChange(e.target.value)}
              className="w-full px-3 py-2.5 bg-surface-container-high rounded-lg border border-outline-variant text-on-surface text-body-md focus:border-secondary focus:outline-none"
            >
              {problems.map((p) => (
                <option key={p.id} value={p.id}>
                  [{p.severity.toUpperCase()}] {p.title} ({p.location.address})
                </option>
              ))}
              <option value="NEW_INITIATIVE">+ Assemble for New Emergency Initiative</option>
            </select>

            {isCustomProblem && (
              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-label-sm text-on-surface-variant mb-1">Initiative Title</label>
                    <input
                      type="text"
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      placeholder="e.g. Sabarmati South Embankment Breach"
                      className="w-full px-3 py-2 bg-surface-container-high rounded-lg border border-outline-variant text-on-surface text-body-sm focus:border-secondary focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-label-sm text-on-surface-variant mb-1">Hazard Category</label>
                    <select
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value as ProblemCategory)}
                      className="w-full px-3 py-2 bg-surface-container-high rounded-lg border border-outline-variant text-on-surface text-body-sm focus:border-secondary focus:outline-none"
                    >
                      <option value="urban_flooding">Urban Flooding</option>
                      <option value="water_contamination">Water Contamination</option>
                      <option value="infrastructure_collapse">Infrastructure Failure</option>
                      <option value="cyclone">Cyclone / Severe Storm</option>
                      <option value="landslide">Landslide</option>
                      <option value="other">Other Emergency</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-label-sm text-on-surface-variant mb-1">Location / District</label>
                  <input
                    type="text"
                    value={customLocation}
                    onChange={(e) => setCustomLocation(e.target.value)}
                    placeholder="e.g. Sabarmati Riverfront, Ahmedabad, Gujarat"
                    className="w-full px-3 py-2 bg-surface-container-high rounded-lg border border-outline-variant text-on-surface text-body-sm focus:border-secondary focus:outline-none"
                    required
                  />
                </div>
              </div>
            )}
          </div>

          {/* 2. Taskforce Identity */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-label-md text-on-surface font-medium mb-1">Taskforce Mission Name</label>
              <input
                type="text"
                value={taskforceName}
                onChange={(e) => setTaskforceName(e.target.value)}
                placeholder="e.g. Ahmedabad Urban Flood Rapid Relief Taskforce"
                className="w-full px-3 py-2 bg-surface rounded-lg border border-outline-variant text-on-surface text-body-md focus:border-secondary focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-label-md text-on-surface font-medium mb-1">Operational Urgency</label>
              <select
                value={urgencyLevel}
                onChange={(e) => setUrgencyLevel(e.target.value as 'critical' | 'high' | 'medium')}
                className="w-full px-3 py-2 bg-surface rounded-lg border border-outline-variant text-on-surface text-body-md focus:border-secondary focus:outline-none"
              >
                <option value="critical">Critical (Priority 95+)</option>
                <option value="high">High (Priority 82+)</option>
                <option value="medium">Standard (Priority 70+)</option>
              </select>
            </div>
          </div>

          {/* 3. Tri-Sector Configuration */}
          <div className="space-y-4">
            {/* Government Command */}
            <div className="p-3.5 bg-surface rounded-xl border border-outline-variant/30 space-y-2.5">
              <div className="flex items-center gap-2 text-label-md font-semibold text-on-surface">
                <MaterialIcon icon="account_balance" size={18} className="text-secondary" />
                <span>1. Authorizing Government Authority</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-label-sm text-on-surface-variant mb-1">Command Agency</label>
                  <select
                    value={governmentAgency}
                    onChange={(e) => setGovernmentAgency(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container-high rounded-lg border border-outline-variant text-on-surface text-body-sm focus:border-secondary focus:outline-none"
                  >
                    {GOVERNMENT_AGENCIES.map((gov) => (
                      <option key={gov} value={gov}>
                        {gov}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-label-sm text-on-surface-variant mb-1">Commanding Officer / Lead</label>
                  <input
                    type="text"
                    value={commandingOfficer}
                    onChange={(e) => setCommandingOfficer(e.target.value)}
                    placeholder="e.g. Commandant R. K. Patel"
                    className="w-full px-3 py-2 bg-surface-container-high rounded-lg border border-outline-variant text-on-surface text-body-sm focus:border-secondary focus:outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Academic Lead */}
            <div className="p-3.5 bg-surface rounded-xl border border-outline-variant/30 space-y-2.5">
              <div className="flex items-center gap-2 text-label-md font-semibold text-on-surface">
                <MaterialIcon icon="school" size={18} className="text-secondary" />
                <span>2. Academic R&D Taskforce Partner</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-label-sm text-on-surface-variant mb-1">University / Institute</label>
                  <select
                    value={selectedAcademic}
                    onChange={(e) => handleAcademicChange(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container-high rounded-lg border border-outline-variant text-on-surface text-body-sm focus:border-secondary focus:outline-none"
                  >
                    {ACADEMIC_PARTNERS.map((a) => (
                      <option key={a.name} value={a.name}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-label-sm text-on-surface-variant mb-1">Faculty Mentor / R&D Lead</label>
                  <input
                    type="text"
                    value={facultyLead}
                    onChange={(e) => setFacultyLead(e.target.value)}
                    placeholder="Faculty or Lab Director"
                    className="w-full px-3 py-2 bg-surface-container-high rounded-lg border border-outline-variant text-on-surface text-body-sm focus:border-secondary focus:outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Corporate CSR Partner */}
            <div className="p-3.5 bg-surface rounded-xl border border-outline-variant/30 space-y-2.5">
              <div className="flex items-center gap-2 text-label-md font-semibold text-on-surface">
                <MaterialIcon icon="corporate_fare" size={18} className="text-secondary" />
                <span>3. Corporate CSR & Equipment Partner</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-label-sm text-on-surface-variant mb-1">Industry Partner</label>
                  <select
                    value={selectedIndustry}
                    onChange={(e) => handleIndustryChange(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container-high rounded-lg border border-outline-variant text-on-surface text-body-sm focus:border-secondary focus:outline-none"
                  >
                    {INDUSTRY_PARTNERS.map((i) => (
                      <option key={i.name} value={i.name}>
                        {i.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-label-sm text-on-surface-variant mb-1">Pledged Capability / Fleet</label>
                  <input
                    type="text"
                    value={industryResource}
                    onChange={(e) => setIndustryResource(e.target.value)}
                    placeholder="Pledged equipment or technology"
                    className="w-full px-3 py-2 bg-surface-container-high rounded-lg border border-outline-variant text-on-surface text-body-sm focus:border-secondary focus:outline-none"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Mobilization Timeline preview */}
          <div className="p-3 bg-secondary/10 rounded-xl border border-secondary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-body-sm">
            <div className="flex items-center gap-2 text-secondary font-medium">
              <MaterialIcon icon="speed" size={20} />
              <span>Mobilization Dispatch:</span>
              <span className="font-bold">{mobilizationTimeline}</span>
            </div>
            <div className="flex gap-2">
              {['Immediate (0-2 hrs)', 'Within 6 hrs', '24-hr Deployment'].map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => setMobilizationTimeline(time)}
                  className={`px-2 py-1 rounded text-label-sm font-semibold transition-colors ${
                    mobilizationTimeline === time
                      ? 'bg-secondary text-on-secondary-container'
                      : 'bg-surface text-on-surface-variant hover:bg-surface-container-highest'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          {/* Footer actions */}
          <div className="pt-3 border-t border-outline-variant/20 flex items-center justify-end gap-3">
            <Button variant="ghost" type="button" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              variant="secondary"
              type="submit"
              icon={isSubmitting ? 'progress_activity' : 'send'}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Mobilizing Taskforce...' : 'Assemble & Mobilize Taskforce'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
