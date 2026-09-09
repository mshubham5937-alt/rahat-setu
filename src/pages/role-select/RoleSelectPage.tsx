import { useNavigate } from 'react-router-dom';
import { useRole } from '../../context/RoleContext';
import { cn } from '../../utils/cn';
import { ROLE_CONFIG, DEMO_PROBLEMS } from '../../data/demoData';
import { MaterialIcon } from '../../components/common/MaterialIcon';
import { Badge } from '../../components/common/Badge';
import type { Role } from '../../types';

const roleCards: { role: Role; icon: string; gradient: string; borderHover: string }[] = [
  { role: 'citizen', icon: 'shield_person', gradient: 'from-secondary/10 to-secondary/5', borderHover: 'hover:border-secondary' },
  { role: 'university', icon: 'school', gradient: 'from-secondary/10 to-secondary/5', borderHover: 'hover:border-secondary' },
  { role: 'industry', icon: 'corporate_fare', gradient: 'from-secondary/10 to-secondary/5', borderHover: 'hover:border-secondary' },
  { role: 'government', icon: 'account_balance', gradient: 'from-primary-container/50 to-surface-container-high', borderHover: 'hover:border-primary' },
];

export function RoleSelectPage() {
  const { setCurrentRole } = useRole();
  const navigate = useNavigate();

  const handleSelectRole = (role: Role) => {
    setCurrentRole(role);
    navigate(ROLE_CONFIG[role].routes[0]);
  };

  const totalAffected = DEMO_PROBLEMS.reduce((sum, p) => sum + p.affectedPopulation, 0);
  const activeProblems = DEMO_PROBLEMS.length;

  return (
    <div className="min-h-screen bg-surface grid-bg relative overflow-hidden">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-surface via-surface to-surface-container-high/30 pointer-events-none" />
      
      {/* Radar sweep background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] opacity-[0.03] pointer-events-none">
        <div className="radar-sweep w-full h-full rounded-full border-2 border-secondary" />
      </div>

      <div className="relative z-10 max-w-[1440px] mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <MaterialIcon icon="hub" size={40} className="text-secondary" />
            <h1 className="font-display-lg text-primary tracking-tight">RAHATSETU</h1>
          </div>
          <p className="font-headline-xl text-on-surface mb-2">
            Unified Disaster Response Platform
          </p>
          <p className="text-body-lg text-on-surface-variant max-w-2xl mx-auto mb-3">
            Select your role to access your personalized disaster response dashboard. 
            Each role provides specialized tools and workflows for collaborative crisis management.
          </p>
          <div className="flex items-center justify-center gap-4 mt-4">
            <Badge variant="secondary" size="lg" icon="science">Prototype Demo</Badge>
            <Badge variant="outline" size="lg" icon="emoji_events">SIH 2026 • PS 26043</Badge>
          </div>
        </div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto mb-16">
          {roleCards.map(({ role, icon, gradient, borderHover }) => {
            const config = ROLE_CONFIG[role];
            return (
              <button
                key={role}
                onClick={() => handleSelectRole(role)}
                className={cn(
                  'group relative bg-surface-container-lowest border-2 border-outline-variant/30 p-6 text-left transition-all duration-300',
                  'hover:shadow-lg hover:-translate-y-1',
                  borderHover,
                  role === 'government' && 'md:col-span-2 lg:col-span-1'
                )}
              >
                <div className={cn('absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300', gradient)} />
                
                <div className="relative z-10">
                  <div className={cn(
                    'w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300',
                    role === 'government'
                      ? 'bg-primary-container group-hover:bg-primary group-hover:text-white'
                      : 'bg-secondary-fixed group-hover:bg-secondary group-hover:text-on-secondary-container'
                  )}>
                    <MaterialIcon icon={icon} size={28} className={role === 'government' ? 'text-on-primary-container group-hover:text-white' : 'text-on-secondary-fixed group-hover:text-on-secondary-container'} />
                  </div>

                  <h3 className="font-headline-md text-on-surface mb-1">{config.label}</h3>
                  <p className="text-body-md text-on-surface-variant mb-4 leading-relaxed">{config.description}</p>

                  <div className="flex items-center gap-1.5 text-secondary group-hover:translate-x-1 transition-transform duration-200">
                    <span className="text-label-lg">Enter Portal</span>
                    <MaterialIcon icon="arrow_forward" size={18} className="text-secondary" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Live Stats */}
        <div className="max-w-5xl mx-auto">
          <div className="bg-primary-container border border-outline-variant/20 p-6 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-secondary text-[20px]">radar</span>
              <h3 className="font-headline-sm text-on-primary-container">Live Status — Demo Simulation</h3>
              <span className="w-2 h-2 rounded-full bg-secondary ml-1" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-data-metric text-secondary">{activeProblems}</p>
                <p className="text-body-sm text-on-primary-container/60">Active Problems Tracked</p>
              </div>
              <div>
                <p className="text-data-metric text-secondary">{(totalAffected / 1000).toFixed(0)}K+</p>
                <p className="text-body-sm text-on-primary-container/60">Citizens Protected</p>
              </div>
              <div>
                <p className="text-data-metric text-secondary">12</p>
                <p className="text-body-sm text-on-primary-container/60">University Teams Active</p>
              </div>
              <div>
                <p className="text-data-metric text-secondary">8</p>
                <p className="text-body-sm text-on-primary-container/60">Field Deployments Live</p>
              </div>
            </div>
          </div>

          {/* Core Workflow */}
          <div className="bg-surface-container-lowest border border-outline-variant/30 p-6">
            <h3 className="font-headline-sm text-on-surface mb-4">Core Response Workflow</h3>
            <div className="flex items-center gap-2 flex-wrap">
              {['REPORT', 'AI ANALYZE', 'VERIFY', 'MATCH', 'COLLABORATE', 'DEPLOY', 'MEASURE'].map((step, i) => (
                <div key={step} className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 h-8 px-3 bg-surface-container-high text-on-surface text-label-md">
                    <span className="text-secondary font-bold text-[10px]">{String(i + 1).padStart(2, '0')}</span>
                    {step}
                  </div>
                  {i < 6 && (
                    <MaterialIcon icon="arrow_forward" size={16} className="text-on-surface-variant/40" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}