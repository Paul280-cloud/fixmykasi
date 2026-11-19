import { fireEvent, screen, waitFor } from '@testing-library/react';
import * as auth from '../helpers/authMock';
import { renderApp } from '../helpers/renderApp';
import * as profile from '../../src/lib/profile';

vi.mock('../../src/lib/auth', () => import('../helpers/authMock'));

vi.mock('../../src/lib/profile', async () => {
  const actual = await vi.importActual<typeof import('../../src/lib/profile')>('../../src/lib/profile');
  return { ...actual, getMyProfile: vi.fn() };
});

// S11 Profile (PRD 8.2), the small version for #23. I wrote these before the screen.
// Left for later in #23: editing the form, changing the language and Delete account (M5).

const THANDEKA: profile.MyProfile = {
  fullName: 'Thandeka Mokoena',
  email: 'thandeka.m@example.com',
  phone: '+27825550134',
  role: 'resident',
  wardId: 'ward-a',
};

async function openS11() {
  renderApp('/profile');
  return screen.findByText('Thandeka Mokoena');
}

beforeEach(() => {
  auth.resetAuthMock('resident-1');
  auth.getRole.mockResolvedValue('resident');
  vi.mocked(profile.getMyProfile).mockResolvedValue(THANDEKA);
});

describe('S11 Profile', () => {
  it('shows the Profile title and my details instead of the placeholder', async () => {
    await openS11();
    expect(screen.getByRole('heading', { name: 'Profile' })).toBeInTheDocument();
    expect(screen.queryByText(/This screen is a placeholder/)).not.toBeInTheDocument();
    expect(profile.getMyProfile).toHaveBeenCalledWith('resident-1');
  });

  it('shows the initials, name, email, role, phone and home ward from the PRD', async () => {
    await openS11();
    expect(screen.getByText('TM')).toBeInTheDocument();
    expect(screen.getByText('thandeka.m@example.com')).toBeInTheDocument();
    expect(screen.getByText('Resident')).toBeInTheDocument();
    expect(screen.getByText('+27 82 555 0134')).toBeInTheDocument();
    expect(screen.getByText('Ward A: Orlando West')).toBeInTheDocument();
  });

  it('says "Ward admin" for a ward admin', async () => {
    auth.getRole.mockResolvedValue('ward_admin');
    vi.mocked(profile.getMyProfile).mockResolvedValue({ ...THANDEKA, role: 'ward_admin' });
    await openS11();
    expect(screen.getByText('Ward admin')).toBeInTheDocument();
  });

  it('says "Field team" and hides the phone and ward rows when they are empty', async () => {
    auth.getRole.mockResolvedValue('field_team');
    vi.mocked(profile.getMyProfile).mockResolvedValue({ ...THANDEKA, role: 'field_team', phone: null, wardId: null });
    await openS11();
    expect(screen.getByText('Field team')).toBeInTheDocument();
    expect(screen.queryByText('Phone number')).not.toBeInTheDocument();
    expect(screen.queryByText('Home ward')).not.toBeInTheDocument();
  });

  it('opens the Privacy Notice (M7) and closes it again', async () => {
    await openS11();
    fireEvent.click(screen.getByRole('button', { name: 'Privacy Notice' }));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole('button', { name: 'Close' })[0]);
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('logs out with Log out', async () => {
    await openS11();
    fireEvent.click(screen.getByRole('button', { name: 'Log out' }));
    await waitFor(() => expect(auth.logOut).toHaveBeenCalled());
  });

  it('sends a visitor to log in', async () => {
    auth.resetAuthMock(null);
    renderApp('/profile');
    expect(await screen.findByRole('heading', { name: 'Log in' })).toBeInTheDocument();
  });

  it('shows Try again when loading fails, and it loads again', async () => {
    vi.mocked(profile.getMyProfile).mockRejectedValueOnce(new Error('offline'));
    renderApp('/profile');
    fireEvent.click(await screen.findByRole('button', { name: 'Try again' }));
    expect(await screen.findByText('Thandeka Mokoena')).toBeInTheDocument();
  });
});
