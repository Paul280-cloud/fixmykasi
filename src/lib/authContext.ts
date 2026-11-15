import { createContext, useContext } from 'react';
import type { Role } from './auth';

export type AuthState = {
  userId: string | null;
  // null for visitors, and while the role is still loading.
  role: Role | null;
  // False until Supabase has said who is logged in (or that nobody is), so
  // screens for logged-in users do not send them to S3 on a page refresh.
  ready: boolean;
};

export const AuthContext = createContext<AuthState>({ userId: null, role: null, ready: false });

export function useAuth(): AuthState {
  return useContext(AuthContext);
}
