import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '../../src/i18n';
import * as assign from '../../src/lib/assign';
import AssignFaultModal, { type FaultToAssign } from '../../src/screens/assign-fault/AssignFaultModal';
import { setOnline } from '../helpers/renderApp';

vi.mock('../../src/lib/assign', async () => {
  const actual = await vi.importActual<typeof import('../../src/lib/assign')>('../../src/lib/assign');
  return { ...actual, getFieldTeams: vi.fn(), assignFault: vi.fn() };
});

// M2 Assign Fault (PRD 8.2), stories T-US7-2 to T-US7-4. I wrote these
// before the modal. Bheki's S8 / S5 open it with the fault below.

const FAULT: FaultToAssign = {
  id: 'fault-123',
  referenceNumber: 'FMK-2026-00123',
  faultTypeName: 'Burst clean water pipe',
  streetAddress: '23 Vilakazi Street',
  category: 'clean_water',
  isAssigned: false,
};

const TEAMS: assign.FieldTeamOption[] = [
  { id: 'team-municipal', name: 'Orlando Water Team', kind: 'municipal' },
  { id: 'team-contractor', name: 'Sample Plumbing Services (Pty) Ltd', kind: 'contractor' },
];

const today = assign.todaySast();

function type(label: RegExp, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
}

async function openM2(fault: FaultToAssign = FAULT) {
  const onClose = vi.fn();
  const onAssigned = vi.fn();
  render(<AssignFaultModal fault={fault} onClose={onClose} onAssigned={onAssigned} />);
  await screen.findByRole('heading', { name: `Assign ${fault.referenceNumber}` });
  return { onClose, onAssigned };
}

async function fillForm() {
  await screen.findByRole('option', { name: 'Sample Plumbing Services (Pty) Ltd (Contractor)' });
  type(/^field team/i, 'team-contractor');
  type(/^expected fix date/i, assign.addDays(today, 1));
  type(/^estimated time to fix/i, '2');
  type(/^municipal reference/i, 'JW-778812');
}

beforeEach(() => {
  vi.mocked(assign.getFieldTeams).mockResolvedValue(TEAMS);
  vi.mocked(assign.assignFault).mockResolvedValue({});
  setOnline(true);
});

describe('M2 Assign Fault', () => {
  it('shows the reference in the title and the fault summary line', async () => {
    await openM2();
    expect(screen.getByText('Burst clean water pipe, 23 Vilakazi Street')).toBeInTheDocument();
    expect(assign.getFieldTeams).toHaveBeenCalledWith('clean_water');
  });

  it('lists only matching teams, each with "Municipal team" or "Contractor" (BR8)', async () => {
    await openM2();
    expect(await screen.findByRole('option', { name: 'Orlando Water Team (Municipal team)' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Sample Plumbing Services (Pty) Ltd (Contractor)' })).toBeInTheDocument();
  });

  it('shows the empty state when there is no team for the category', async () => {
    vi.mocked(assign.getFieldTeams).mockResolvedValue([]);
    await openM2();
    expect(await screen.findByText('No field teams for Clean water yet. Ask the admin to add one.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Assign' })).toBeDisabled();
  });

  it('shows the PRD errors when Assign is tapped on an empty form', async () => {
    await openM2();
    await screen.findByRole('option', { name: 'Orlando Water Team (Municipal team)' });
    fireEvent.click(screen.getByRole('button', { name: 'Assign' }));

    expect(await screen.findByText('Choose a field team.')).toBeInTheDocument();
    expect(screen.getByText('Choose a date within the next 90 days.')).toBeInTheDocument();
    expect(screen.getByText('Enter a number of days from 1 to 90.')).toBeInTheDocument();
    expect(assign.assignFault).not.toHaveBeenCalled();
  });

  it('refuses a due date 120 days away (T-US7-3)', async () => {
    await openM2();
    await fillForm();
    type(/^expected fix date/i, assign.addDays(today, 120));
    fireEvent.click(screen.getByRole('button', { name: 'Assign' }));

    expect(await screen.findByText('Choose a date within the next 90 days.')).toBeInTheDocument();
    expect(assign.assignFault).not.toHaveBeenCalled();
  });

  it('saves the assignment and tells S5 it worked (T-US7-2)', async () => {
    const { onAssigned } = await openM2();
    await fillForm();
    type(/^note to field team/i, 'The pipe is next to the clinic gate');
    fireEvent.click(screen.getByRole('button', { name: 'Assign' }));

    await waitFor(() => expect(onAssigned).toHaveBeenCalled());
    expect(assign.assignFault).toHaveBeenCalledWith('fault-123', {
      fieldTeamId: 'team-contractor',
      dueDate: assign.addDays(today, 1),
      estimatedDays: '2',
      municipalReference: 'JW-778812',
      note: 'The pipe is next to the clinic gate',
    });
  });

  it('shows "You can only manage faults in your ward." when the database refuses (T-US7-4)', async () => {
    vi.mocked(assign.assignFault).mockResolvedValue({ error: 'not_your_ward' });
    const { onAssigned } = await openM2();
    await fillForm();
    fireEvent.click(screen.getByRole('button', { name: 'Assign' }));

    expect(await screen.findByText('You can only manage faults in your ward.')).toBeInTheDocument();
    expect(onAssigned).not.toHaveBeenCalled();
  });

  it('shows "Something went wrong. Try again." for any other error', async () => {
    vi.mocked(assign.assignFault).mockResolvedValue({ error: 'unknown' });
    await openM2();
    await fillForm();
    fireEvent.click(screen.getByRole('button', { name: 'Assign' }));

    expect(await screen.findByText('Something went wrong. Try again.')).toBeInTheDocument();
  });

  it('says "Reassign" when the fault already has a team', async () => {
    await openM2({ ...FAULT, isAssigned: true });
    expect(screen.getByRole('button', { name: 'Reassign' })).toBeInTheDocument();
  });

  it('disables Assign while offline', async () => {
    setOnline(false);
    await openM2();
    expect(screen.getByRole('button', { name: 'Assign' })).toBeDisabled();
  });

  it('closes on Cancel', async () => {
    const { onClose } = await openM2();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalled();
  });
});
