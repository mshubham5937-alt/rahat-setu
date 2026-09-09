import { useLocation, useNavigate } from 'react-router-dom';
import { useRole } from '../../context/RoleContext';
import { useNotifications } from '../../context/NotificationContext';
import { useProblems } from '../../context/ProblemContext';
import { cn } from '../../utils/cn';
import { ROLE_CONFIG } from '../../data/demoData';
import { MaterialIcon } from '../common/MaterialIcon';
import { Badge } from '../common/Badge';
import { useState, useEffect } from 'react';
import { offlineQueue, isOnline } from '../../services/persistence';

export function TopBar({ onMenuClick }: { onMenuClick?: () => void }) {
  const { currentRole } = useRole();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { firestoreStatus, firestoreError } = useProblems();
  const [showNotifications, setShowNotifications] = useState(false);
  const [online, setOnline] = useState(isOnline());
  const [pendingSync, setPendingSync] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  const handleNotificationClick = (notif: { id: string; actionUrl?: string }) => {
    markAsRead(notif.id);
    setShowNotifications(false);
    if (notif.actionUrl) navigate(notif.actionUrl);
  };

  useEffect(() => {
    const update = () => {
      setOnline(isOnline());
      offlineQueue.countPending().then(setPendingSync);
    };
    update();
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);

  if (!currentRole) return null;
  const config = ROLE_CONFIG[currentRole];

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === `/${currentRole}` || path === `/${currentRole}/`) {
      return config.label === 'Government' ? 'Command Center' : 'Dashboard';
    }
    if (path.includes('/report/new')) return 'Report Problem';
    if (path.includes('/reports/')) return 'Report Detail';
    if (path.includes('/reports')) return 'My Reports';
    if (path.includes('/map')) return 'Live Map';
    if (path.includes('/challenges')) return 'Challenge Queue';
    if (path.includes('/teams')) return 'Student Teams';
    if (path.includes('/opportunities')) return 'CSR Opportunities';
    if (path.includes('/capabilities')) return 'CSR Capabilities';
    if (path.includes('/priority')) return 'Priority Queue';
    if (path.includes('/problems/')) return 'Problem Detail';
    if (path.includes('/problems')) return 'All Problems';
    if (path.includes('/projects/')) return 'Project Detail';
    if (path.includes('/projects')) return 'Active Projects';
    if (path.includes('/sos')) return 'SOS Monitor';
    return config.label;
  };

  return (
    <header className="h-14 border-b border-outline-variant/30 bg-surface-container-lowest flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-2">
        <MaterialIcon icon="menu" size={20} className="text-on-surface-variant cursor-pointer hover:text-on-surface" onClick={onMenuClick} />
        <h1 className="font-headline-sm text-on-surface">{getPageTitle()}</h1>
        <Badge variant="secondary" size="sm" icon="science">Prototype</Badge>
      </div>

      <div className="flex items-center gap-2.5">
        {pendingSync > 0 && (
          <button
            className="flex items-center gap-1.5 h-9 px-3 rounded-full bg-warning/10 text-warning border border-warning/30 text-label-md font-semibold hover:bg-warning/20 transition-colors"
            title="Pending offline items will sync on reconnect"
          >
            <MaterialIcon icon="cloud_off" size={16} />
            {pendingSync} syncing
          </button>
        )}

        <div
          className={cn(
            'flex items-center gap-1.5 h-9 px-3 rounded-full text-label-sm font-semibold border transition-colors',
            firestoreStatus === 'connected'
              ? 'bg-secondary/10 text-secondary border-secondary/30'
              : firestoreStatus === 'connecting'
              ? 'bg-surface-container-high text-on-surface-variant border-outline-variant/30'
              : 'bg-warning/10 text-warning border-warning/30'
          )}
          title={
            firestoreStatus === 'connected'
              ? 'Connected to Firestore (rahat-setu) — Real-time synchronization active'
              : firestoreStatus === 'error'
              ? `Firestore: ${firestoreError || 'check security rules'} (using offline cache)`
              : 'Connecting to Firestore...'
          }
        >
          <span
            className={cn(
              'w-2 h-2 rounded-full',
              firestoreStatus === 'connected'
                ? 'bg-secondary animate-pulse'
                : firestoreStatus === 'error'
                ? 'bg-warning'
                : 'bg-outline-variant'
            )}
          />
          <span className="hidden md:inline">
            {firestoreStatus === 'connected'
              ? 'Firestore Live'
              : firestoreStatus === 'error'
              ? 'Local Cache'
              : 'Connecting…'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 h-9 px-2.5 bg-surface-container-high rounded-full" title="Network status">
          <span className={cn('w-2 h-2 rounded-full', online ? 'bg-success' : 'bg-warning')} />
          <span className="sr-only">{online ? 'online' : 'offline'}</span>
          <MaterialIcon icon={online ? 'cloud_done' : 'cloud_off'} size={15} className={online ? 'text-success' : 'text-warning'} />
        </div>

        <div className="relative">
          <div
            className="flex items-center gap-1.5 h-9 px-3 bg-surface-container-high rounded-full cursor-pointer hover:bg-surface-container-highest transition-colors"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <MaterialIcon icon="notifications" size={18} className="text-on-surface-variant" />
            {unreadCount > 0 && (
              <span className="bg-error text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </div>

          {showNotifications && (
            <div className="absolute right-0 top-12 w-96 bg-surface-container-lowest border border-outline-variant/30 shadow-lg z-50 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between p-3 border-b border-outline-variant/20">
                <h3 className="font-headline-sm text-on-surface">Notifications</h3>
                <button
                  onClick={() => markAllAsRead()}
                  className="text-secondary text-label-md hover:underline"
                >
                  Mark all read
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.slice(0, 8).map((notif) => (
                  <div
                    key={notif.id}
                    className={cn(
                      'p-3 border-b border-outline-variant/10 hover:bg-surface-container-high cursor-pointer transition-colors',
                      !notif.read && 'bg-secondary-fixed/20'
                    )}
                    onClick={() => {
                      handleNotificationClick(notif);
                    }}
                  >
                    <div className="flex items-start gap-2">
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-secondary mt-1.5 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-label-lg text-on-surface">{notif.title}</p>
                        <p className="text-body-sm text-on-surface-variant mt-0.5 text-truncate-2">{notif.message}</p>
                        <p className="text-body-sm text-on-surface-variant/60 mt-1">
                          {new Date(notif.createdAt).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div
          className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center cursor-pointer hover:bg-secondary/30 transition-colors"
          title="Go to dashboard home"
          onClick={() => currentRole && navigate(`/${currentRole}`)}
        >
          <MaterialIcon icon="person" size={18} className="text-on-surface" />
        </div>
      </div>
    </header>
  );
}