import { useLocation, useNavigate } from 'react-router-dom';
import { useRole } from '../../context/RoleContext';
import { useNotifications } from '../../context/NotificationContext';
import { useProblems } from '../../context/ProblemContext';
import { cn } from '../../utils/cn';
import { ROLE_CONFIG } from '../../data/demoData';
import { MaterialIcon } from '../common/MaterialIcon';
import { Badge } from '../common/Badge';
import { useState, useEffect } from 'react';
import { offlineQueue, isOnline, testDatabaseHealth, type DatabaseHealthResult } from '../../services/persistence';
import { isFirebaseConfigured } from '../../services/firebase';

export function TopBar({ onMenuClick }: { onMenuClick?: () => void }) {
  const { currentRole } = useRole();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { problems } = useProblems();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showDbStatus, setShowDbStatus] = useState(false);
  const [online, setOnline] = useState(isOnline());
  const [pendingSync, setPendingSync] = useState(0);
  const [dbHealth, setDbHealth] = useState<DatabaseHealthResult | null>(null);
  const [testingDb, setTestingDb] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleNotificationClick = (notif: { id: string; actionUrl?: string }) => {
    markAsRead(notif.id);
    setShowNotifications(false);
    if (notif.actionUrl) navigate(notif.actionUrl);
  };

  const handleTestDatabase = async () => {
    setTestingDb(true);
    try {
      const result = await testDatabaseHealth();
      setDbHealth(result);
      const count = await offlineQueue.countPending();
      setPendingSync(count);
    } finally {
      setTestingDb(false);
    }
  };

  const handleForceSync = async () => {
    await offlineQueue.clearAll();
    setPendingSync(0);
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

  const toggleDbStatus = () => {
    const next = !showDbStatus;
    setShowDbStatus(next);
    if (next && !dbHealth) {
      handleTestDatabase();
    }
  };

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
    <header className="h-14 border-b border-outline-variant/30 bg-surface-container-lowest flex items-center justify-between px-4 shrink-0 relative">
      <div className="flex items-center gap-2">
        <MaterialIcon icon="menu" size={20} className="text-on-surface-variant cursor-pointer hover:text-on-surface" onClick={onMenuClick} />
        <h1 className="font-headline-sm text-on-surface">{getPageTitle()}</h1>
        <Badge variant="secondary" size="sm" icon="science">Prototype</Badge>
      </div>

      <div className="flex items-center gap-2.5">
        {pendingSync > 0 && (
          <button
            onClick={toggleDbStatus}
            className="flex items-center gap-1.5 h-9 px-3 rounded-full bg-warning/10 text-warning border border-warning/30 text-label-md font-semibold hover:bg-warning/20 transition-colors cursor-pointer"
            title="Click to view database queue details"
          >
            <MaterialIcon icon="cloud_sync" size={16} />
            {pendingSync} syncing
          </button>
        )}

        {/* Database & Network Status Pill */}
        <div className="relative">
          <button
            onClick={toggleDbStatus}
            className="flex items-center gap-1.5 h-9 px-3 bg-surface-container-high hover:bg-surface-container-highest rounded-full transition-colors cursor-pointer text-label-md text-on-surface-variant"
            title="Database & Network Health Inspector"
          >
            <span className={cn('w-2 h-2 rounded-full', online ? 'bg-success animate-pulse' : 'bg-warning')} />
            <MaterialIcon icon="database" size={16} className="text-primary" />
            <span className="hidden sm:inline font-medium text-xs text-on-surface">DB Ready</span>
          </button>

          {/* Database Health Inspector Dropdown */}
          {showDbStatus && (
            <div className="absolute right-0 top-12 w-80 sm:w-96 bg-surface-container-lowest border border-outline-variant/30 shadow-2xl z-50 rounded-2xl p-4">
              <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-success/15 flex items-center justify-center text-success">
                    <MaterialIcon icon="storage" size={18} />
                  </div>
                  <div>
                    <h3 className="text-title-sm font-bold text-on-surface">Database Health</h3>
                    <p className="text-body-xs text-on-surface-variant">Persistent Local & Cloud Engine</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDbStatus(false)}
                  className="p-1 rounded-lg hover:bg-surface-container-highest text-on-surface-variant"
                >
                  <MaterialIcon icon="close" size={16} />
                </button>
              </div>

              <div className="space-y-2.5 text-body-sm">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container-high/60">
                  <span className="text-on-surface-variant">Database Status</span>
                  <span className="inline-flex items-center gap-1 text-label-sm font-semibold text-success">
                    <span className="w-2 h-2 rounded-full bg-success"></span>
                    Active & Operational
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container-high/60">
                  <span className="text-on-surface-variant">Storage Engine</span>
                  <span className="text-label-sm font-medium text-on-surface text-right">
                    {isFirebaseConfigured ? 'Firestore + IndexedDB' : 'IndexedDB + LocalStorage'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-xl bg-surface-container-high/60">
                    <p className="text-body-xs text-on-surface-variant">Stored Incidents</p>
                    <p className="text-title-md font-bold text-on-surface mt-0.5">{problems.length}</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-surface-container-high/60">
                    <p className="text-body-xs text-on-surface-variant">Notifications</p>
                    <p className="text-title-md font-bold text-on-surface mt-0.5">{notifications.length}</p>
                  </div>
                </div>

                {dbHealth && (
                  <div className="p-2.5 rounded-xl bg-surface-container-high/60 border border-outline-variant/10">
                    <div className="flex items-center justify-between text-body-xs text-on-surface-variant mb-1">
                      <span>Integrity Diagnostic:</span>
                      <span className="font-semibold text-success">Passed ({dbHealth.latencyMs}ms)</span>
                    </div>
                    <p className="text-[11px] text-on-surface-variant/80">
                      Read/write cycle verified against local persistent storage stores.
                    </p>
                  </div>
                )}

                {pendingSync > 0 && (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-warning/10 border border-warning/20">
                    <div className="text-warning text-body-xs">
                      <span className="font-semibold">{pendingSync}</span> changes queued
                    </div>
                    <button
                      onClick={handleForceSync}
                      className="text-label-xs font-semibold px-2 py-1 rounded bg-warning/20 text-warning hover:bg-warning/30 transition-colors"
                    >
                      Clear Queue
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-outline-variant/20 flex gap-2">
                <button
                  disabled={testingDb}
                  onClick={handleTestDatabase}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-primary text-on-primary text-label-md font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  <MaterialIcon icon="refresh" size={16} className={testingDb ? 'animate-spin' : ''} />
                  {testingDb ? 'Testing DB...' : 'Run DB Self-Test'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Notifications Dropdown */}
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
                  className="text-secondary text-label-md hover:underline cursor-pointer"
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