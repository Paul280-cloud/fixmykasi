import { createContext, useContext } from 'react';
import type { Role } from './auth';

export type AuthState = {
  userId: string | null;
  // null for visitors, and while the role is still loading.
  role: Role | null;
  // True once we know who this is and their role: straight away for a
  // visitor, and only after the role has loaded for a logged-in user. Screens
  // wait for it so a page refresh does not send people to S3 or flash the
  // wrong tabs.
  ready: boolean;
};

export const AuthContext = createContext<AuthState>({ userId: null, role: null, ready: false });

export function useAuth(): AuthState {
  return useContext(AuthContext);
}
