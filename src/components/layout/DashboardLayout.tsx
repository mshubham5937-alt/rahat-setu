import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useRole } from '../../context/RoleContext';
import { RoleSwitcher } from './RoleSwitcher';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';
import { Navigate } from 'react-router-dom';

export function DashboardLayout() {
  const { isRoleSelected } = useRole();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (!isRoleSelected) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <RoleSwitcher />
      <div className="flex flex-1 min-h-0">
        {sidebarOpen && <Sidebar />}
        <div className="flex flex-col flex-1 min-w-0">
          <TopBar onMenuClick={() => setSidebarOpen((v) => !v)} />
          <main className="flex-1 overflow-y-auto bg-surface p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}