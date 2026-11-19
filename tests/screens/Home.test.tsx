import { fireEvent, screen } from '@testing-library/react';
import * as auth from '../helpers/authMock';
import { renderApp } from '../helpers/renderApp';

vi.mock('../../src/lib/auth', () => import('../helpers/authMock'));

// S8 loads the ward queue when a ward admin lands there. Keep it loading,
// because these tests only check which screen opens.
vi.mock('../../src/lib/faults', async () => {
  const actual = await vi.importActual<typeof import('../../src/lib/faults')>('../../src/lib/faults');
  return {
    CATEGORIES: actual.CATEGORIES,
    getFaultTypes: vi.fn(() => new Promise(() => {})),
    getHomeWardId: vi.fn(() => new Promise(() => {})),
    getWardQueue: vi.fn(() => new Promise(() => {})),
  };
});

// S1 Welcome (PRD 8.2). Part of #23: the language picker, logo and
// illustration come later.

beforeEach(() => {
  auth.resetAuthMock(null);
});

describe('S1 Welcome', () => {
  it('shows a visitor the PRD title, text and the three ways in, in order', async () => {
    renderApp('/');
    expect(await screen.findByRole('heading', { name: 'Report it. Track it. Get it fixed.' })).toBeInTheDocument();
    expect(
      screen.getByText('Report potholes, burst pipes, broken streetlights and more, and see who is fixing them.'),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('link').map((link) => link.textContent)).toEqual([
      'Create account',
      'Log in',
      'Browse faults without an account',
    ]);
  });

  it.each([
    ['Create account', '/sign-up', 'Create account'],
    ['Log in', '/log-in', 'Log in'],
    ['Browse faults without an account', '/faults', 'Fault list'],
  ])('"%s" goes to %s', async (name, href, heading) => {
    renderApp('/');
    const link = await screen.findByRole('link', { name });
    expect(link).toHaveAttribute('href', href);

    fireEvent.click(link);
    expect(await screen.findByRole('heading', { name: heading })).toBeInTheDocument();
  });

  it.each([
    ['resident', 'Fault list'],
    ['ward_admin', 'Ward queue'],
    ['field_team', 'My jobs'],
  ] as const)('sends a logged-in %s to their own home screen', async (role, heading) => {
    auth.resetAuthMock('user-1');
    auth.getRole.mockResolvedValue(role);
    renderApp('/');
    expect(await screen.findByRole('heading', { name: heading })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Create account' })).not.toBeInTheDocument();
  });

  it('keeps a logged-in user with no role on S1, so it never loops with the role guards', async () => {
    auth.resetAuthMock('user-1'); // getRole gives null
    renderApp('/');
    expect(await screen.findByRole('link', { name: 'Create account' })).toBeInTheDocument();
  });

  it('shows nothing until it knows who is logged in', () => {
    // Supabase has not reported the session yet.
    auth.onAuthChange.mockImplementation(() => () => {});
    renderApp('/');
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
