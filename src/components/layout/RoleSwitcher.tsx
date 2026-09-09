import { useNavigate } from 'react-router-dom';
import { useRole } from '../../context/RoleContext';
import { cn } from '../../utils/cn';
import { ROLE_CONFIG } from '../../data/demoData';
import { MaterialIcon } from '../common/MaterialIcon';
import { Badge } from '../common/Badge';
import type { Role } from '../../types';

const roleOrder: Role[] = ['citizen', 'university', 'industry', 'government'];

export function RoleSwitcher() {
  const { currentRole, setCurrentRole, clearRole } = useRole();
  const navigate = useNavigate();

  const handleRoleSwitch = (role: Role) => {
    setCurrentRole(role);
    navigate(ROLE_CONFIG[role].routes[0]);
  };

  return (
    <div className="bg-primary-container border-b border-outline-variant/20">
      <div className="max-w-[1440px] mx-auto px-4 h-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => { clearRole(); navigate('/'); }}>
            <MaterialIcon icon="hub" size={20} className="text-secondary" />
            <span className="font-display-lg text-[14px] text-on-primary-container font-bold tracking-tight">RAHATSETU</span>
            <Badge variant="surface" size="sm">SIH 2026</Badge>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {roleOrder.map((role) => {
            const config = ROLE_CONFIG[role];
            const isActive = currentRole === role;
            return (
              <button
                key={role}
                onClick={() => handleRoleSwitch(role)}
                className={cn(
                  'h-8 px-3 text-[11px] font-semibold uppercase tracking-wider rounded-full transition-all duration-200',
                  isActive
                    ? 'bg-secondary text-on-secondary-container shadow-md'
                    : 'bg-transparent text-on-primary-container/60 hover:bg-surface-container-high/20 hover:text-on-primary-container'
                )}
              >
                {config.shortLabel}
              </button>
            );
          })}
        </div>

        </div>
    </div>
  );
}