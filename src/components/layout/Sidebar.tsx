import { useNavigate, useLocation } from 'react-router-dom';
import { useRole } from '../../context/RoleContext';
import { useNotifications } from '../../context/NotificationContext';
import { cn } from '../../utils/cn';
import { ROLE_CONFIG } from '../../data/demoData';
import { MaterialIcon } from '../common/MaterialIcon';
import type { Role } from '../../types';

interface NavItem {
  icon: string;
  label: string;
  path: string;
  badge?: number;
}

const ROLE_NAV: Record<Role, NavItem[]> = {
  citizen: [
    { icon: 'dashboard', label: 'Dashboard', path: '/citizen' },
    { icon: 'flag', label: 'Report Problem', path: '/citizen/report/new' },
    { icon: 'list_alt', label: 'My Reports', path: '/citizen/reports' },
    { icon: 'map', label: 'Live Map', path: '/citizen/map' },
  ],
  university: [
    { icon: 'dashboard', label: 'Dashboard', path: '/university' },
    { icon: 'science', label: 'Challenge Queue', path: '/university/challenges' },
    { icon: 'groups', label: 'Student Teams', path: '/university/teams' },
    { icon: 'rocket_launch', label: 'Active Projects', path: '/university/projects' },
  ],
  industry: [
    { icon: 'dashboard', label: 'Dashboard', path: '/industry' },
    { icon: 'handshake', label: 'CSR Opportunities', path: '/industry/opportunities' },
    { icon: 'precision_manufacturing', label: 'CSR Capabilities', path: '/industry/capabilities' },
    { icon: 'engineering', label: 'Active Deployments', path: '/industry/projects' },
  ],
  government: [
    { icon: 'dashboard', label: 'Command Center', path: '/government' },
    { icon: 'verified', label: 'Priority Queue', path: '/government/priority' },
    { icon: 'list_alt', label: 'All Problems', path: '/government/problems' },
    { icon: 'rocket_launch', label: 'Project Tracker', path: '/government/projects' },
    { icon: 'crisis_alert', label: 'SOS Monitor', path: '/government/sos' },
  ],
};

export function Sidebar() {
  const { currentRole } = useRole();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  if (!currentRole) return null;

  const navItems = ROLE_NAV[currentRole];
  const config = ROLE_CONFIG[currentRole];

  return (
    <aside className="w-60 bg-surface-container-lowest border-r border-outline-variant/30 flex flex-col min-h-0 shrink-0">
      <div className="p-4 border-b border-outline-variant/20">
        <div className="flex items-center gap-2 mb-1">
          <MaterialIcon icon={config.icon} size={20} className="text-secondary" />
          <h2 className="font-headline-sm text-on-surface">{config.label}</h2>
        </div>
        <p className="text-body-sm text-on-surface-variant">{config.description}</p>
      </div>

      <nav className="flex-1 p-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path ||
            (item.path !== `/${currentRole}` && location.pathname.startsWith(item.path));
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                'w-full flex items-center gap-3 h-10 px-3 text-left rounded-xl transition-all duration-150 mb-0.5',
                isActive
                  ? 'bg-secondary-fixed text-on-secondary-fixed font-semibold'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              )}
            >
              <MaterialIcon icon={item.icon} size={20} />
              <span className="text-label-lg flex-1">{item.label}</span>
              {item.badge && item.badge > 0 && (
                <span className="bg-error text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {item.badge}
                </span>
              )}
              {item.path === '/citizen' && currentRole === 'citizen' && unreadCount > 0 && (
                <span className="bg-error text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-outline-variant/20">
        <div className="bg-surface-container-high rounded-xl p-3">
          <p className="text-label-md text-on-surface-variant uppercase tracking-wider mb-1">Prototype</p>
          <p className="text-body-sm text-on-surface">Smart India Hackathon 2026</p>
          <p className="text-body-sm text-secondary font-semibold">PS 26043</p>
        </div>
      </div>
    </aside>
  );
}