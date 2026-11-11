// Mock of src/lib/auth for screen tests. Use it with
//   vi.mock('../../src/lib/auth', () => import('../helpers/authMock'));
import { vi } from 'vitest';
import type * as Auth from '../../src/lib/auth';

const actual = await vi.importActual<typeof Auth>('../../src/lib/auth');

export const homeByRole = actual.homeByRole;
export const CONFIRMED_PATH = actual.CONFIRMED_PATH;
export const toErrorCode = actual.toErrorCode;
export const linkHasError = vi.fn<typeof Auth.linkHasError>();
export const getWards = vi.fn<typeof Auth.getWards>();
export const signUp = vi.fn<typeof Auth.signUp>();
export const getRole = vi.fn<typeof Auth.getRole>();
export const logIn = vi.fn<typeof Auth.logIn>();
export const resendConfirmation = vi.fn<typeof Auth.resendConfirmation>();
export const sendPasswordReset = vi.fn<typeof Auth.sendPasswordReset>();
export const getRecoveryState = vi.fn<typeof Auth.getRecoveryState>();
export const updatePassword = vi.fn<typeof Auth.updatePassword>();
export const logOut = vi.fn<typeof Auth.logOut>();
export const onAuthChange = vi.fn<typeof Auth.onAuthChange>();
export const finishEmailConfirmation = vi.fn<typeof Auth.finishEmailConfirmation>();

export const WARDS = [
  { id: 'ward-a', name: 'Ward A: Orlando West' },
  { id: 'ward-b', name: 'Ward B: Diepkloof' },
  { id: 'ward-c', name: 'Ward C: Braamfontein' },
];

// Default behaviour: a visitor, wards load, every call succeeds.
export function resetAuthMock(userId: string | null = null) {
  vi.clearAllMocks();
  linkHasError.mockReturnValue(false);
  getWards.mockResolvedValue(WARDS);
  signUp.mockResolvedValue({});
  getRole.mockResolvedValue(null);
  logIn.mockResolvedValue({ role: 'resident' });
  resendConfirmation.mockResolvedValue({});
  sendPasswordReset.mockResolvedValue({});
  getRecoveryState.mockResolvedValue('ready');
  updatePassword.mockResolvedValue({});
  logOut.mockResolvedValue();
  finishEmailConfirmation.mockResolvedValue(true);
  onAuthChange.mockImplementation((callback) => {
    callback(userId);
    return () => {};
  });
}
