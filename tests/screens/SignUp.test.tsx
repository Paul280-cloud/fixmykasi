import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import * as auth from '../helpers/authMock';
import { renderApp, setOnline } from '../helpers/renderApp';

vi.mock('../../src/lib/auth', () => import('../helpers/authMock'));

// S2 Sign Up (PRD 8.2), stories T-US1-1 to T-US1-3.

function type(label: RegExp, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
}

async function fillValidForm() {
  await screen.findByRole('option', { name: 'Ward A: Orlando West' });
  type(/^full name/i, 'Thandeka Mokoena');
  type(/^email/i, 'thandeka.m@example.com');
  type(/^phone number/i, '+27 82 555 0134');
  fireEvent.change(screen.getByLabelText(/^home ward/i), { target: { value: 'ward-a' } });
  type(/^password/i, 'kasi2026');
  fireEvent.click(screen.getByLabelText(/i am 18 or older/i));
  fireEvent.click(screen.getByRole('checkbox', { name: /i agree to the privacy notice/i }));
}

function submit() {
  fireEvent.click(screen.getByRole('button', { name: 'Create account' }));
}

beforeEach(() => {
  auth.resetAuthMock();
  setOnline(true);
});

describe('S2 Sign Up', () => {
  it('shows the header "Create account" and no tab bar', async () => {
    renderApp('/sign-up');
    expect(screen.getByRole('heading', { name: 'Create account' })).toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: 'Main menu' })).not.toBeInTheDocument();
    await screen.findByRole('option', { name: 'Ward A: Orlando West' });
  });

  it('T-US1-1: a valid form creates the account and goes to S3 with the banner', async () => {
    renderApp('/sign-up');
    await fillValidForm();
    submit();

    expect(await screen.findByText('Check your email to confirm your account.')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Log in' })).toBeInTheDocument();
    expect(auth.signUp).toHaveBeenCalledWith({
      fullName: 'Thandeka Mokoena',
      email: 'thandeka.m@example.com',
      phone: '+27 82 555 0134',
      wardId: 'ward-a',
      password: 'kasi2026',
      isAdult: true,
      language: 'en',
    });
  });

  it('T-US1-2: an email that already has an account shows the message under the email field', async () => {
    auth.signUp.mockResolvedValue({ error: 'email_taken' });
    renderApp('/sign-up');
    await fillValidForm();
    submit();

    const email = screen.getByLabelText(/^email/i);
    await waitFor(() => expect(email).toHaveAttribute('aria-invalid', 'true'));
    const error = document.getElementById(email.getAttribute('aria-describedby')!.split(' ')[0])!;
    expect(error).toHaveTextContent('This email already has an account. Log in instead.');
    expect(within(error).getByRole('link', { name: 'Log in instead.' })).toHaveAttribute(
      'href',
      '/log-in',
    );
  });

  it('T-US1-3: "kasikasi" shows the password rule and does not sign up', async () => {
    renderApp('/sign-up');
    await fillValidForm();
    type(/^password/i, 'kasikasi');
    submit();

    expect(
      screen.getByText('Use at least 8 characters with a letter and a number.'),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/^password/i)).toHaveAttribute('aria-invalid', 'true');
    expect(auth.signUp).not.toHaveBeenCalled();
  });

  it('shows the exact error for every required field when the form is empty', async () => {
    renderApp('/sign-up');
    await screen.findByRole('option', { name: 'Ward A: Orlando West' });
    submit();

    for (const message of [
      'Enter your full name.',
      'Enter a valid email address.',
      'Choose your ward.',
      'Use at least 8 characters with a letter and a number.',
      'You must be 18 or older to use FixMyKasi.',
      'Please agree to the Privacy Notice to continue.',
    ]) {
      expect(screen.getByText(message)).toBeInTheDocument();
    }
    expect(auth.signUp).not.toHaveBeenCalled();
  });

  it('rejects a phone number that is not +27 followed by 9 digits', async () => {
    renderApp('/sign-up');
    await fillValidForm();
    type(/^phone number/i, '082555');
    submit();

    expect(
      screen.getByText('Enter a South African number, like +27 82 123 4567.'),
    ).toBeInTheDocument();
    expect(auth.signUp).not.toHaveBeenCalled();
  });

  it('shows and hides the password with the eye button', async () => {
    renderApp('/sign-up');
    await screen.findByRole('option', { name: 'Ward A: Orlando West' });
    const password = screen.getByLabelText(/^password/i);
    expect(password).toHaveAttribute('type', 'password');
    fireEvent.click(screen.getByRole('button', { name: 'Show password' }));
    expect(password).toHaveAttribute('type', 'text');
    fireEvent.click(screen.getByRole('button', { name: 'Hide password' }));
    expect(password).toHaveAttribute('type', 'password');
  });

  it('Loading: disables "Create account" while the account is created', async () => {
    let finish: (value: object) => void = () => {};
    auth.signUp.mockReturnValue(new Promise((resolve) => (finish = resolve)));
    renderApp('/sign-up');
    await fillValidForm();
    submit();

    expect(screen.getByRole('button', { name: 'Create account' })).toBeDisabled();
    await act(async () => finish({}));
  });

  it('Error: shows the general error and keeps what the user typed', async () => {
    auth.signUp.mockResolvedValue({ error: 'unknown' });
    renderApp('/sign-up');
    await fillValidForm();
    submit();

    expect(await screen.findByText('Something went wrong. Try again.')).toBeInTheDocument();
    expect(screen.getByLabelText(/^full name/i)).toHaveValue('Thandeka Mokoena');
    expect(screen.getByLabelText(/^email/i)).toHaveValue('thandeka.m@example.com');
  });

  it('Offline: shows the offline banner and disables "Create account"', async () => {
    renderApp('/sign-up');
    await screen.findByRole('option', { name: 'Ward A: Orlando West' });
    act(() => setOnline(false));

    expect(screen.getByText("You're offline. Changes will not be saved.")).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create account' })).toBeDisabled();
  });

  it('"Privacy Notice" opens M7 and "Close" closes it', async () => {
    renderApp('/sign-up');
    await screen.findByRole('option', { name: 'Ward A: Orlando West' });
    fireEvent.click(screen.getByRole('button', { name: 'Privacy Notice' }));

    const dialog = screen.getByRole('dialog', { name: 'Privacy Notice' });
    expect(within(dialog).getByText(/Europe \(Stockholm, Sweden\)/)).toBeInTheDocument();
    // The X in the corner and the "Close" button at the bottom both close M7.
    const closeButtons = within(dialog).getAllByRole('button', { name: 'Close' });
    expect(closeButtons).toHaveLength(2);
    fireEvent.click(closeButtons[1]);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('"Log in" goes to S3', async () => {
    renderApp('/sign-up');
    await screen.findByRole('option', { name: 'Ward A: Orlando West' });
    fireEvent.click(screen.getByRole('link', { name: 'Log in' }));
    expect(screen.getByRole('heading', { name: 'Log in' })).toBeInTheDocument();
  });
});
