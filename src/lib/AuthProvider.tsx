import { useEffect, useState, type ReactNode } from 'react';
import { getRole, onAuthChange, type Role } from './auth';
import { AuthContext } from './authContext';

// Keeps the logged-in user and their role for the tab bar (PRD 7.2).
export function AuthProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [role, setRole] = useState<{ userId: string; role: Role | null } | null>(null);

  useEffect(() => onAuthChange(setUserId), []);

  useEffect(() => {
    if (!userId) return;
    let active = true;
    void getRole(userId).then((found) => {
      if (active) setRole({ userId, role: found });
    });
    return () => {
      active = false;
    };
  }, [userId]);

  const currentRole = userId && role?.userId === userId ? role.role : null;
  return (
    <AuthContext.Provider value={{ userId, role: currentRole }}>{children}</AuthContext.Provider>
  );
}
