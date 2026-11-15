import { act, render, screen } from '@testing-library/react';
import type { Role } from '../../src/lib/auth';
import { AuthProvider } from '../../src/lib/AuthProvider';
import { useAuth } from '../../src/lib/authContext';
import * as auth from '../helpers/authMock';

vi.mock('../../src/lib/auth', () => import('../helpers/authMock'));

// The ready flag (PR #48 review): it must mean "we know who this is AND their role".

function Probe() {
  const { userId, role, ready } = useAuth();
  return <p>{`ready=${ready} user=${userId ?? 'none'} role=${role ?? 'none'}`}</p>;
}

function renderProvider() {
  return render(
    <AuthProvider>
      <Probe />
    </AuthProvider>,
  );
}

beforeEach(() => {
  auth.resetAuthMock();
});

describe('AuthProvider ready flag', () => {
  it('is ready straight away when nobody is logged in', () => {
    renderProvider();
    expect(screen.getByText('ready=true user=none role=none')).toBeInTheDocument();
  });

  it('stays not ready while a logged-in user\'s role is still loading, then becomes ready with the role', async () => {
    auth.resetAuthMock('resident-1');
    let finishRole: (role: Role | null) => void = () => {};
    auth.getRole.mockReturnValue(new Promise((resolve) => (finishRole = resolve)));

    renderProvider();
    expect(screen.getByText('ready=false user=resident-1 role=none')).toBeInTheDocument();

    await act(async () => finishRole('resident'));
    expect(screen.getByText('ready=true user=resident-1 role=resident')).toBeInTheDocument();
  });

  it('becomes ready with no role if the role fetch fails', async () => {
    auth.resetAuthMock('resident-1');
    auth.getRole.mockRejectedValue(new Error('network'));

    renderProvider();
    expect(await screen.findByText('ready=true user=resident-1 role=none')).toBeInTheDocument();
  });

  it('is not ready before Supabase has reported the session', () => {
    auth.onAuthChange.mockImplementation(() => () => {});
    renderProvider();
    expect(screen.getByText('ready=false user=none role=none')).toBeInTheDocument();
  });
});
