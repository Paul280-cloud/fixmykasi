import { fireEvent, screen, within } from '@testing-library/react';
import * as auth from '../helpers/authMock';
import { renderApp, setOnline } from '../helpers/renderApp';
import { act } from 'react';

vi.mock('../../src/lib/auth', () => import('../helpers/authMock'));

// S12 Set New Password (PRD 8.2), story T-US2-4.

function fill(newPassword: string, confirm: string) {
  fireEvent.change(screen.getByLabelText(/^new password/i), { target: { value: newPassword } });
  fireEvent.change(screen.getByLabelText(/^confirm password/i), { target: { value: confirm } });
  fireEvent.click(screen.getByRole('button', { name: 'Save password' }));
}

beforeEach(() => {
  auth.resetAuthMock();
  setOnline(true);
});

describe('S12 Set New Password', () => {
  it('shows the header "Choose a new password", no back arrow and no tab bar', async () => {
    renderApp('/reset-password');
    expect(screen.getByRole('heading', { name: 'Choose a new password' })).toBeInTheDocument();
    await screen.findByLabelText(/^new password/i);
    expect(screen.queryByRole('button', { name: 'Go back' })).not.toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: 'Main menu' })).not.toBeInTheDocument();
  });

  it('T-US2-4: an expired link shows the message and "Send new link" opens M1', async () => {
    auth.getRecoveryState.mockResolvedValue('expired');
    renderApp('/reset-password');

    expect(await screen.findByText('This link has expired. Request a new one.')).toBeInTheDocument();
    expect(screen.queryByLabelText(/^new password/i)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Send new link' }));
    expect(screen.getByRole('dialog', { name: 'Reset your password' })).toBeInTheDocument();
  });

  it('saves the new password and goes to S3 with "Password changed. Please log in."', async () => {
    renderApp('/reset-password');
    await screen.findByLabelText(/^new password/i);
    fill('kasi2027', 'kasi2027');

    expect(await screen.findByText('Password changed. Please log in.')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Log in' })).toBeInTheDocument();
    expect(auth.updatePassword).toHaveBeenCalledWith('kasi2027');
  });

  it('shows the password rule for a weak password', async () => {
    renderApp('/reset-password');
    await screen.findByLabelText(/^new password/i);
    fill('kasikasi', 'kasikasi');

    expect(
      screen.getByText('Use at least 8 characters with a letter and a number.'),
    ).toBeInTheDocument();
    expect(auth.updatePassword).not.toHaveBeenCalled();
  });

  it('shows "The passwords don\'t match." when the two differ', async () => {
    renderApp('/reset-password');
    await screen.findByLabelText(/^new password/i);
    fill('kasi2027', 'kasi2028');

    expect(screen.getByText("The passwords don't match.")).toBeInTheDocument();
    expect(auth.updatePassword).not.toHaveBeenCalled();
  });

  it('shows the general error when saving fails', async () => {
    auth.updatePassword.mockResolvedValue({ error: 'unknown' });
    renderApp('/reset-password');
    await screen.findByLabelText(/^new password/i);
    fill('kasi2027', 'kasi2027');

    expect(await screen.findByText('Something went wrong. Try again.')).toBeInTheDocument();
  });

  it('Offline: disables "Save password"', async () => {
    renderApp('/reset-password');
    await screen.findByLabelText(/^new password/i);
    act(() => setOnline(false));
    expect(screen.getByRole('button', { name: 'Save password' })).toBeDisabled();
  });
});
