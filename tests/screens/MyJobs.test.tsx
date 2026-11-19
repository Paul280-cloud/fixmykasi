import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import * as auth from '../helpers/authMock';
import { renderApp, setOnline } from '../helpers/renderApp';
import * as faults from '../../src/lib/faults';
import * as jobs from '../../src/lib/jobs';

vi.mock('../../src/lib/auth', () => import('../helpers/authMock'));

vi.mock('../../src/lib/faults', async () => {
  const actual = await vi.importActual<typeof import('../../src/lib/faults')>('../../src/lib/faults');
  return { CATEGORIES: actual.CATEGORIES, getFaultTypes: vi.fn() };
});

vi.mock('../../src/lib/jobs', async () => {
  const actual = await vi.importActual<typeof import('../../src/lib/jobs')>('../../src/lib/jobs');
  return { ...actual, getMyTeam: vi.fn(), getMyJobs: vi.fn(), updateJobStatus: vi.fn() };
});

// S10 My jobs + a small M3 Update status (#20, US8). I wrote these before the screen.
// Left for later: the delay checkbox (BR12) and after photos (F6).

const FAULT_TYPES: faults.FaultType[] = [
  { id: 'pothole', category: 'roads', name: 'Pothole', autoUrgent: false },
  { id: 'pipe', category: 'clean_water', name: 'Burst clean water pipe', autoUrgent: false },
];

function job(reference: string, extra: Partial<jobs.JobFault> = {}): jobs.JobFault {
  return {
    id: reference,
    reference,
    faultTypeId: 'pothole',
    streetAddress: '12 Main Road, Orlando West',
    landmark: null,
    status: 'assigned',
    isUrgent: false,
    isOverdue: false,
    isDelayed: false,
    dueDate: '2026-11-25',
    ...extra,
  };
}

const JOBS: jobs.JobFault[] = [
  job('FMK-2026-00123', {
    faultTypeId: 'pipe',
    status: 'scheduled',
    streetAddress: '23 Vilakazi Street',
    landmark: 'Next to the clinic',
    dueDate: '2026-11-18',
    isUrgent: true,
  }),
  job('FMK-2026-00115', { isOverdue: true, dueDate: '2026-11-10' }),
  job('FMK-2026-00130', { status: 'in_progress' }),
  job('FMK-2026-00101', { status: 'fixed' }),
];

function card(reference: string) {
  return screen.getByText(reference).closest('li') as HTMLElement;
}

async function openS10() {
  renderApp('/my-jobs');
  return screen.findByRole('tablist');
}

async function openM3(reference: string) {
  await openS10();
  fireEvent.click(within(card(reference)).getByRole('button', { name: 'Update' }));
  return screen.findByRole('heading', { name: `Update ${reference}` });
}

beforeEach(() => {
  auth.resetAuthMock('team-member-1');
  auth.getRole.mockResolvedValue('field_team');
  vi.mocked(faults.getFaultTypes).mockResolvedValue(FAULT_TYPES);
  vi.mocked(jobs.getMyTeam).mockResolvedValue({ id: 'team-1', name: 'Sample Plumbing Services (Pty) Ltd' });
  vi.mocked(jobs.getMyJobs).mockResolvedValue(JOBS);
  vi.mocked(jobs.updateJobStatus).mockResolvedValue({});
  setOnline(true);
});

describe('S10 My jobs', () => {
  it('sends a visitor to log in', async () => {
    auth.resetAuthMock(null);
    renderApp('/my-jobs');
    expect(await screen.findByRole('heading', { name: 'Log in' })).toBeInTheDocument();
  });

  it('sends a ward admin to their own home screen', async () => {
    auth.getRole.mockResolvedValue('ward_admin');
    vi.mocked(jobs.getMyJobs).mockResolvedValue([]);
    renderApp('/my-jobs');
    expect(await screen.findByRole('heading', { name: 'Ward queue' })).toBeInTheDocument();
  });

  it("shows the title, my team's name and loads my team's jobs", async () => {
    await openS10();
    expect(screen.getByRole('heading', { name: 'My jobs' })).toBeInTheDocument();
    expect(screen.getByText('Sample Plumbing Services (Pty) Ltd')).toBeInTheDocument();
    expect(jobs.getMyJobs).toHaveBeenCalledWith('team-1');
  });

  it('has the To do and Done tabs, To do first, with overdue jobs at the top', async () => {
    await openS10();
    expect(screen.getByRole('tab', { name: 'To do (3)' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Done (1)' })).toBeInTheDocument();

    const references = within(screen.getByRole('tabpanel'))
      .getAllByText(/^FMK-/)
      .map((el) => el.textContent);
    expect(references).toEqual(['FMK-2026-00115', 'FMK-2026-00123', 'FMK-2026-00130']);
  });

  it('shows the job card details from the PRD (type, status, labels, address, landmark, due date)', async () => {
    await openS10();
    const pipe = within(card('FMK-2026-00123'));
    expect(pipe.getByText('Burst clean water pipe')).toBeInTheDocument();
    expect(pipe.getByText('Scheduled')).toBeInTheDocument();
    expect(pipe.getByText('Urgent')).toBeInTheDocument();
    expect(pipe.getByText('23 Vilakazi Street, Next to the clinic')).toBeInTheDocument();
    expect(pipe.getByText('Due 18 Nov 2026')).toBeInTheDocument();
    expect(within(card('FMK-2026-00115')).getByText('Overdue')).toBeInTheDocument();
  });

  it('shows the fixed job in Done, without an Update button', async () => {
    await openS10();
    fireEvent.click(screen.getByRole('tab', { name: 'Done (1)' }));
    expect(within(card('FMK-2026-00101')).queryByRole('button', { name: 'Update' })).not.toBeInTheDocument();
  });

  it('shows the empty state when the team has no jobs', async () => {
    vi.mocked(jobs.getMyJobs).mockResolvedValue([]);
    await openS10();
    expect(screen.getByText('No jobs assigned to your team right now.')).toBeInTheDocument();
  });

  it('shows Try again when loading fails, and it loads again', async () => {
    vi.mocked(jobs.getMyJobs).mockRejectedValueOnce(new Error('offline'));
    renderApp('/my-jobs');
    fireEvent.click(await screen.findByRole('button', { name: 'Try again' }));
    expect(await screen.findByRole('tablist')).toBeInTheDocument();
  });
});

describe('M3 Update status', () => {
  it('offers only the next allowed statuses for an Assigned job (10.3)', async () => {
    await openM3('FMK-2026-00115');
    const dialog = within(screen.getByRole('dialog'));
    expect(dialog.getByRole('radio', { name: 'Scheduled' })).toBeInTheDocument();
    expect(dialog.getByRole('radio', { name: 'In progress' })).toBeInTheDocument();
    expect(dialog.queryByRole('radio', { name: 'Fixed' })).not.toBeInTheDocument();
  });

  it('asks for a status when Save is tapped with none chosen', async () => {
    await openM3('FMK-2026-00115');
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findByText('Choose a new status.')).toBeInTheDocument();
    expect(jobs.updateJobStatus).not.toHaveBeenCalled();
  });

  it('shows the privacy hint under the note and stops it at 200 characters (#51)', async () => {
    await openM3('FMK-2026-00130');
    expect(
      screen.getByText('This note is visible to everyone. Do not include phone numbers, emails or ID numbers.'),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/^note/i)).toHaveAttribute('maxlength', '200');
  });

  it('refuses a note over 200 characters', async () => {
    await openM3('FMK-2026-00130');
    fireEvent.click(screen.getByRole('radio', { name: 'Fixed' }));
    fireEvent.change(screen.getByLabelText(/^note/i), { target: { value: 'n'.repeat(201) } });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findByText('Keep the note under 200 characters.')).toBeInTheDocument();
    expect(jobs.updateJobStatus).not.toHaveBeenCalled();
  });

  it('saves the new status, closes M3, says "Status updated" and reloads (T-US8-1)', async () => {
    await openM3('FMK-2026-00123');
    fireEvent.click(screen.getByRole('radio', { name: 'In progress' }));
    fireEvent.change(screen.getByLabelText(/^note/i), { target: { value: 'Crew on site, road dug up' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findByText('Status updated')).toBeInTheDocument();
    expect(jobs.updateJobStatus).toHaveBeenCalledWith('FMK-2026-00123', 'in_progress', 'Crew on site, road dug up');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await waitFor(() => expect(jobs.getMyJobs).toHaveBeenCalledTimes(2));
  });

  it('shows "You can only update faults assigned to your team." when the database refuses (T-US8-3)', async () => {
    vi.mocked(jobs.updateJobStatus).mockResolvedValue({ error: 'not_your_team' });
    await openM3('FMK-2026-00130');
    fireEvent.click(screen.getByRole('radio', { name: 'Fixed' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findByText('You can only update faults assigned to your team.')).toBeInTheDocument();
  });

  it('shows "Something went wrong. Try again." for any other error', async () => {
    vi.mocked(jobs.updateJobStatus).mockResolvedValue({ error: 'unknown' });
    await openM3('FMK-2026-00130');
    fireEvent.click(screen.getByRole('radio', { name: 'Fixed' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findByText('Something went wrong. Try again.')).toBeInTheDocument();
  });

  it('disables Save while offline', async () => {
    await openM3('FMK-2026-00130');
    setOnline(false);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled());
  });

  it('closes on Cancel without saving', async () => {
    await openM3('FMK-2026-00130');
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(jobs.updateJobStatus).not.toHaveBeenCalled();
  });
});
