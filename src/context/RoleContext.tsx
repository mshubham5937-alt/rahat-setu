import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { Role } from '../types';
import { ROLE_CONFIG } from '../data/demoData';

interface RoleContextValue {
  currentRole: Role | null;
  setCurrentRole: (role: Role) => void;
  roleConfig: typeof ROLE_CONFIG[Role] | null;
  isRoleSelected: boolean;
  clearRole: () => void;
}

const RoleContext = createContext<RoleContextValue | null>(null);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [currentRole, setCurrentRoleState] = useState<Role | null>(() => {
    const saved = localStorage.getItem('rahatsetu_role');
    return (saved as Role) || null;
  });

  const setCurrentRole = useCallback((role: Role) => {
    setCurrentRoleState(role);
    localStorage.setItem('rahatsetu_role', role);
  }, []);

  const clearRole = useCallback(() => {
    setCurrentRoleState(null);
    localStorage.removeItem('rahatsetu_role');
  }, []);

  return (
    <RoleContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        roleConfig: currentRole ? ROLE_CONFIG[currentRole] : null,
        isRoleSelected: currentRole !== null,
        clearRole,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error('useRole must be used within RoleProvider');
  return ctx;
}