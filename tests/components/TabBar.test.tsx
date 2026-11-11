import { screen, within } from '@testing-library/react';
import * as auth from '../helpers/authMock';
import { renderApp } from '../helpers/renderApp';

vi.mock('../../src/lib/auth', () => import('../helpers/authMock'));

// Tab bar tabs by role (PRD 7.2, 8.3).
async function tabNames() {
  const nav = await screen.findByRole('navigation', { name: 'Main menu' });
  return within(nav)
    .getAllByRole('link')
    .map((link) => link.textContent);
}

describe('Tab bar', () => {
  it('Visitor: Faults, Log in', async () => {
    auth.resetAuthMock(null);
    renderApp('/faults');
    expect(await tabNames()).toEqual(['Faults', 'Log in']);
  });

  it('Resident: Faults, Report, My reports, Profile, with Faults active', async () => {
    auth.resetAuthMock('user-1');
    auth.getRole.mockResolvedValue('resident');
    renderApp('/faults');
    await screen.findByRole('link', { name: 'Report' });
    expect(await tabNames()).toEqual(['Faults', 'Report', 'My reports', 'Profile']);
    expect(screen.getByRole('link', { name: 'Faults' })).toHaveAttribute('aria-current', 'page');
  });

  it('Ward admin: Queue, Dashboard, Faults, Profile', async () => {
    auth.resetAuthMock('user-2');
    auth.getRole.mockResolvedValue('ward_admin');
    renderApp('/queue');
    await screen.findByRole('link', { name: 'Queue' });
    expect(await tabNames()).toEqual(['Queue', 'Dashboard', 'Faults', 'Profile']);
  });

  it('Field team: My jobs, Faults, Profile', async () => {
    auth.resetAuthMock('user-3');
    auth.getRole.mockResolvedValue('field_team');
    renderApp('/my-jobs');
    await screen.findByRole('link', { name: 'My jobs' });
    expect(await tabNames()).toEqual(['My jobs', 'Faults', 'Profile']);
  });
});
