import { useEffect, useState, type ReactNode } from 'react';
import { getRole, onAuthChange, type Role } from './auth';
import { AuthContext } from './authContext';

// Keeps the logged-in user and their role for the tab bar (PRD 7.2).
export function AuthProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  // True once Supabase has reported the session (a user or nobody).
  const [sessionKnown, setSessionKnown] = useState(false);
  const [role, setRole] = useState<{ userId: string; role: Role | null } | null>(null);

  useEffect(
    () =>
      onAuthChange((id) => {
        setUserId(id);
        setSessionKnown(true);
      }),
    [],
  );

  useEffect(() => {
    if (!userId) return;
    let active = true;
    // A failed fetch still counts as finished ("no role"), so ready never sticks at false.
    void getRole(userId)
      .catch(() => null)
      .then((found) => {
        if (active) setRole({ userId, role: found });
      });
    return () => {
      active = false;
    };
  }, [userId]);

  const roleLoaded = userId !== null && role?.userId === userId;
  const currentRole = roleLoaded ? role.role : null;
  // Ready = we know who this is and their role: straight away for visitors,
  // and only after the role fetch has finished for a logged-in user.
  const ready = sessionKnown && (userId === null || roleLoaded);

  return (
    <AuthContext.Provider value={{ userId, role: currentRole, ready }}>{children}</AuthContext.Provider>
  );
}
