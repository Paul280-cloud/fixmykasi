import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import * as auth from '../helpers/authMock';
import { renderApp, setOnline } from '../helpers/renderApp';

vi.mock('../../src/lib/auth', () => import('../helpers/authMock'));

// S3 Log In and M1 Forgot Password (PRD 5, 8.2), stories T-US2-1 to T-US2-3.

function logInWith(email: string, password: string) {
  fireEvent.change(screen.getByLabelText(/^email/i), { target: { value: email } });
  fireEvent.change(screen.getByLabelText(/^password/i), { target: { value: password } });
  fireEvent.click(screen.getByRole('button', { name: 'Log in' }));
}

beforeEach(() => {
  auth.resetAuthMock();
  setOnline(true);
});

describe('S3 Log In', () => {
  it('shows the header "Log in" and no tab bar', () => {
    renderApp('/log-in');
    expect(screen.getByRole('heading', { name: 'Log in' })).toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: 'Main menu' })).not.toBeInTheDocument();
  });

  it.each([
    ['resident', 'Fault list'],
    ['ward_admin', 'Ward queue'],
    ['field_team', 'My jobs'],
  ] as const)('T-US2-1: a %s goes to their home screen (%s)', async (role, heading) => {
    auth.logIn.mockResolvedValue({ role });
    renderApp('/log-in');
    logInWith('thandeka.m@example.com', 'TestResident1');

    expect(await screen.findByRole('heading', { name: heading })).toBeInTheDocument();
    expect(auth.logIn).toHaveBeenCalledWith('thandeka.m@example.com', 'TestResident1');
  });

  it('T-US2-2: a wrong password shows "Wrong email or password." and keeps the email', async () => {
    auth.logIn.mockResolvedValue({ error: 'invalid_credentials' });
    renderApp('/log-in');
    logInWith('thandeka.m@example.com', 'wrong-password1');

    expect(await screen.findByText('Wrong email or password.')).toBeInTheDocument();
    expect(screen.getByLabelText(/^email/i)).toHaveValue('thandeka.m@example.com');
  });

  it('shows the rate-limit message when Supabase refuses the attempt', async () => {
    auth.logIn.mockResolvedValue({ error: 'too_many_attempts' });
    renderApp('/log-in');
    logInWith('thandeka.m@example.com', 'kasi2026');

    expect(
      await screen.findByText('Too many attempts. Please wait a few minutes and try again.'),
    ).toBeInTheDocument();
  });

  it('an unconfirmed email shows the message with "Resend email"', async () => {
    auth.logIn.mockResolvedValue({ error: 'email_not_confirmed' });
    renderApp('/log-in');
    logInWith('thandeka.m@example.com', 'kasi2026');

    expect(
      await screen.findByText('Please confirm your email first. Check your inbox.'),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Resend email' }));
    expect(await screen.findByText('Check your email to confirm your account.')).toBeInTheDocument();
    expect(auth.resendConfirmation).toHaveBeenCalledWith('thandeka.m@example.com');
  });

  it('shows the field errors when the form is empty', () => {
    renderApp('/log-in');
    fireEvent.click(screen.getByRole('button', { name: 'Log in' }));

    expect(screen.getByText('Enter a valid email address.')).toBeInTheDocument();
    expect(screen.getByText('Enter your password.')).toBeInTheDocument();
    expect(auth.logIn).not.toHaveBeenCalled();
  });

  it('shows a banner passed in from another screen', () => {
    renderApp({ pathname: '/log-in', state: { banner: 'passwordChanged' } });
    expect(screen.getByText('Password changed. Please log in.')).toBeInTheDocument();
  });

  it('shows "Email confirmed. Please log in." after the confirm-email link', async () => {
    renderApp({ pathname: '/log-in', search: '?confirmed=1' });
    expect(await screen.findByText('Email confirmed. Please log in.')).toBeInTheDocument();
    expect(auth.finishEmailConfirmation).toHaveBeenCalled();
  });

  it('shows no banner when the confirm-email link failed', async () => {
    auth.finishEmailConfirmation.mockResolvedValue(false);
    renderApp({ pathname: '/log-in', search: '?confirmed=1' });
    await waitFor(() => expect(auth.finishEmailConfirmation).toHaveBeenCalled());
    expect(screen.queryByText('Email confirmed. Please log in.')).not.toBeInTheDocument();
  });

  it('Loading: disables "Log in" while logging in', async () => {
    let finish: (value: object) => void = () => {};
    auth.logIn.mockReturnValue(new Promise((resolve) => (finish = resolve)));
    renderApp('/log-in');
    logInWith('thandeka.m@example.com', 'kasi2026');

    expect(screen.getByRole('button', { name: 'Log in' })).toBeDisabled();
    await act(async () => finish({ error: 'invalid_credentials' }));
  });

  it('Offline: shows the banner and disables "Log in"', () => {
    renderApp('/log-in');
    act(() => setOnline(false));
    expect(screen.getByText("You're offline. Changes will not be saved.")).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Log in' })).toBeDisabled();
  });

  it('"Create account" goes to S2', async () => {
    renderApp('/log-in');
    fireEvent.click(screen.getByRole('link', { name: 'Create account' }));
    expect(screen.getByRole('heading', { name: 'Create account' })).toBeInTheDocument();
    await screen.findByRole('option', { name: 'Ward A: Orlando West' });
  });
});

describe('M1 Forgot Password', () => {
  function openM1() {
    renderApp('/log-in');
    fireEvent.click(screen.getByRole('button', { name: 'Forgot password?' }));
    return screen.getByRole('dialog', { name: 'Reset your password' });
  }

  it('T-US2-3: "Send link" shows the same message and the button becomes "Done"', async () => {
    const dialog = openM1();
    expect(
      within(dialog).getByText(
        "Enter your email and we'll send you a link to choose a new password.",
      ),
    ).toBeInTheDocument();
    fireEvent.change(within(dialog).getByLabelText(/^email/i), {
      target: { value: 'thandeka.m@example.com' },
    });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Send link' }));

    expect(
      await within(dialog).findByText("If this email has an account, we've sent a reset link."),
    ).toBeInTheDocument();
    expect(auth.sendPasswordReset).toHaveBeenCalledWith('thandeka.m@example.com');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Done' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows "Enter a valid email address." for a bad email', () => {
    const dialog = openM1();
    fireEvent.change(within(dialog).getByLabelText(/^email/i), {
      target: { value: 'thandeka.m@' },
    });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Send link' }));
    expect(within(dialog).getByText('Enter a valid email address.')).toBeInTheDocument();
    expect(auth.sendPasswordReset).not.toHaveBeenCalled();
  });

  it('shows the general error when sending fails', async () => {
    auth.sendPasswordReset.mockResolvedValue({ error: 'unknown' });
    const dialog = openM1();
    fireEvent.change(within(dialog).getByLabelText(/^email/i), {
      target: { value: 'thandeka.m@example.com' },
    });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Send link' }));
    expect(await within(dialog).findByText('Something went wrong. Try again.')).toBeInTheDocument();
  });

  it('"Cancel" closes M1', () => {
    const dialog = openM1();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('Offline: disables "Send link"', () => {
    const dialog = openM1();
    act(() => setOnline(false));
    expect(within(dialog).getByRole('button', { name: 'Send link' })).toBeDisabled();
  });
});
