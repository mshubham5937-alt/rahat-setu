import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import type { ReactElement } from 'react';
import { RoleProvider } from './context/RoleContext';
import { ProblemProvider } from './context/ProblemContext';
import { NotificationProvider } from './context/NotificationContext';
import { RoleSelectPage } from './pages/role-select/RoleSelectPage';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { useRole } from './context/RoleContext';

const lazyPage = (importFn: () => Promise<{ [key: string]: unknown }>, name: string) =>
  lazy(() => importFn().then((m) => ({ default: m[name] as React.ComponentType })));

const CitizenDashboard = lazyPage(() => import('./pages/citizen/CitizenDashboard'), 'CitizenDashboard');
const ReportProblemPage = lazyPage(() => import('./pages/citizen/ReportProblemPage'), 'ReportProblemPage');
const CitizenMapPage = lazyPage(() => import('./pages/citizen/CitizenMapPage'), 'CitizenMapPage');
const GovernmentDashboard = lazyPage(() => import('./pages/government/GovernmentDashboard'), 'GovernmentDashboard');
const GovernmentPriorityQueue = lazyPage(() => import('./pages/government/GovernmentPriorityQueue'), 'GovernmentPriorityQueue');
const SosMonitorPage = lazyPage(() => import('./pages/government/SosMonitorPage'), 'SosMonitorPage');
const UniversityDashboard = lazyPage(() => import('./pages/university/UniversityDashboard'), 'UniversityDashboard');
const UniversityTeamsPage = lazyPage(() => import('./pages/university/UniversityTeamsPage'), 'UniversityTeamsPage');
const IndustryDashboard = lazyPage(() => import('./pages/industry/IndustryDashboard'), 'IndustryDashboard');
const IndustryCapabilitiesPage = lazyPage(() => import('./pages/industry/IndustryCapabilitiesPage'), 'IndustryCapabilitiesPage');
import { ListPage } from './pages/shared/ListPage';
import { ProjectsPage } from './pages/shared/ProjectsPage';
import { ProblemDetailPage } from './pages/shared/ProblemDetailPage';

function RequireRole({ role, children }: { role: string; children: ReactElement }) {
  const { currentRole } = useRole();
  if (!currentRole) return <Navigate to="/" replace />;
  if (role !== 'shared' && currentRole !== role) return <Navigate to={`/${currentRole}`} replace />;
  return children;
}

function App() {
  return (
    <RoleProvider>
      <ProblemProvider>
        <NotificationProvider>
          <BrowserRouter>
              <Suspense
                fallback={
                  <div className="h-screen w-screen flex items-center justify-center bg-surface">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
                      <span className="text-label-lg text-on-surface-variant">Loading RahatSetu…</span>
                    </div>
                  </div>
                }
              >
                <Routes>
                  <Route path="/" element={<RoleSelectPage />} />

                  {/* Citizen */}
                  <Route path="/citizen" element={<RequireRole role="shared"><DashboardLayout /></RequireRole>}>
                    <Route index element={<RequireRole role="citizen"><CitizenDashboard /></RequireRole>} />
                    <Route path="report/new" element={<RequireRole role="citizen"><ReportProblemPage /></RequireRole>} />
                    <Route path="reports" element={<RequireRole role="citizen"><ListPage role="citizen" /></RequireRole>} />
                    <Route path="reports/:id" element={<RequireRole role="citizen"><ProblemDetailPage /></RequireRole>} />
                    <Route path="map" element={<RequireRole role="citizen"><CitizenMapPage /></RequireRole>} />
                  </Route>

                  {/* University */}
                  <Route path="/university" element={<RequireRole role="shared"><DashboardLayout /></RequireRole>}>
                    <Route index element={<RequireRole role="university"><UniversityDashboard /></RequireRole>} />
                    <Route path="challenges" element={<RequireRole role="university"><ListPage role="university" /></RequireRole>} />
                    <Route path="challenges/:id" element={<RequireRole role="university"><ProblemDetailPage /></RequireRole>} />
                    <Route path="teams" element={<RequireRole role="university"><UniversityTeamsPage /></RequireRole>} />
                    <Route path="projects" element={<RequireRole role="university"><ProjectsPage role="university" /></RequireRole>} />
                    <Route path="projects/:id" element={<RequireRole role="university"><ProblemDetailPage /></RequireRole>} />
                  </Route>

                  {/* Industry */}
                  <Route path="/industry" element={<RequireRole role="shared"><DashboardLayout /></RequireRole>}>
                    <Route index element={<RequireRole role="industry"><IndustryDashboard /></RequireRole>} />
                    <Route path="opportunities" element={<RequireRole role="industry"><ListPage role="industry" /></RequireRole>} />
                    <Route path="opportunities/:id" element={<RequireRole role="industry"><ProblemDetailPage /></RequireRole>} />
                    <Route path="capabilities" element={<RequireRole role="industry"><IndustryCapabilitiesPage /></RequireRole>} />
                    <Route path="projects" element={<RequireRole role="industry"><ProjectsPage role="industry" /></RequireRole>} />
                    <Route path="projects/:id" element={<RequireRole role="industry"><ProblemDetailPage /></RequireRole>} />
                  </Route>

                  {/* Government */}
                  <Route path="/government" element={<RequireRole role="shared"><DashboardLayout /></RequireRole>}>
                    <Route index element={<RequireRole role="government"><GovernmentDashboard /></RequireRole>} />
                    <Route path="priority" element={<RequireRole role="government"><GovernmentPriorityQueue /></RequireRole>} />
                    <Route path="problems" element={<RequireRole role="government"><ListPage role="government" /></RequireRole>} />
                    <Route path="problems/:id" element={<RequireRole role="government"><ProblemDetailPage /></RequireRole>} />
                    <Route path="projects" element={<RequireRole role="government"><ProjectsPage role="government" /></RequireRole>} />
                    <Route path="projects/:id" element={<RequireRole role="government"><ProblemDetailPage /></RequireRole>} />
                    <Route path="sos" element={<RequireRole role="government"><SosMonitorPage /></RequireRole>} />
                  </Route>

                  {/* Shared project route */}
                  <Route path="/projects/:id" element={<ProblemDetailPage />} />

                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </NotificationProvider>
      </ProblemProvider>
    </RoleProvider>
  );
}

export default App;