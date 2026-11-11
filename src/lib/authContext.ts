import { createContext, useContext } from 'react';
import type { Role } from './auth';

export type AuthState = {
  userId: string | null;
  // null for visitors, and while the role is still loading.
  role: Role | null;
};

export const AuthContext = createContext<AuthState>({ userId: null, role: null });

export function useAuth(): AuthState {
  return useContext(AuthContext);
}
