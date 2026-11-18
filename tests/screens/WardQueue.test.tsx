import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import * as assign from '../../src/lib/assign';
import * as auth from '../helpers/authMock';
import { renderApp } from '../helpers/renderApp';
import * as faults from '../../src/lib/faults';

vi.mock('../../src/lib/auth', () => import('../helpers/authMock'));

vi.mock('../../src/lib/faults', async () => {
  const actual = await vi.importActual<typeof import('../../src/lib/faults')>('../../src/lib/faults');
  return {
    CATEGORIES: actual.CATEGORIES,
    getFaultTypes: vi.fn(),
    getHomeWardId: vi.fn(),
    getWardQueue: vi.fn(),
  };
});

// The Assign button opens the real M2 (#61), so I only mock the two calls to the database.
vi.mock('../../src/lib/assign', async () => {
  const actual = await vi.importActual<typeof import('../../src/lib/assign')>('../../src/lib/assign');
  return { ...actual, getFieldTeams: vi.fn(), assignFault: vi.fn() };
});

// S8 Ward Queue (PRD 8.2, BR7, BR11). Part of #19: no filter chips, no desktop
// table, no ward name in the header (decided for this PR).

const FAULT_TYPES: faults.FaultType[] = [
  { id: 'pothole', category: 'roads', name: 'Pothole', autoUrgent: false },
  { id: 'streetlight', category: 'electricity', name: 'Faulty streetlight', autoUrgent: false },
];

function fault(reference: string, status: faults.FaultStatus, extra: Partial<faults.QueueFault> = {}) {
  return {
    id: reference,
    reference,
    faultTypeId: 'pothole',
    streetAddress: '12 Main Road, Orlando West',
    status,
    isUrgent: false,
    isOverdue: false,
    createdAt: '2026-11-12T08:00:00Z',
    ...extra,
  } satisfies faults.QueueFault;
}

// Already in BR7 order, as the database returns it.
const QUEUE: faults.QueueFault[] = [
  fault('FMK-2026-00120', 'received', {
    faultTypeId: 'streetlight',
    streetAddress: '5 Mooki Street, Orlando West',
    // 22:30 UTC on 11 Nov is 00:30 on 12 Nov in SAST.
    createdAt: '2026-11-11T22:30:00Z',
  }),
  fault('FMK-2026-00118', 'reopened', { isOverdue: true }),
  fault('FMK-2026-00115', 'assigned', { isOverdue: true }),
  fault('FMK-2026-00123', 'in_progress'),
  fault('FMK-2026-00101', 'fixed'),
];

async function openS8() {
  renderApp('/queue');
  return screen.findByRole('tablist');
}

function items() {
  return within(screen.getByRole('tabpanel')).queryAllByRole('link');
}

beforeEach(() => {
  auth.resetAuthMock('admin-1');
  auth.getRole.mockResolvedValue('ward_admin');
  vi.mocked(faults.getFaultTypes).mockResolvedValue(FAULT_TYPES);
  vi.mocked(faults.getHomeWardId).mockResolvedValue('ward-a');
  vi.mocked(faults.getWardQueue).mockResolvedValue(QUEUE);
  vi.mocked(assign.getFieldTeams).mockResolvedValue([
    { id: 'team-1', name: 'Orlando Electricity Team', kind: 'municipal' },
  ]);
  vi.mocked(assign.assignFault).mockResolvedValue({});
});

// The card for one reference, so I can look for its button.
function card(reference: string) {
  return screen.getByText(reference).closest('li') as HTMLElement;
}

describe('S8 Ward Queue', () => {
  it('sends a visitor to log in', async () => {
    auth.resetAuthMock(null);
    renderApp('/queue');
    expect(await screen.findByRole('heading', { name: 'Log in' })).toBeInTheDocument();
  });

  it.each([
    ['resident', 'Fault list'],
    ['field_team', 'My jobs'],
  ] as const)('sends a %s to their own home screen', async (role, heading) => {
    auth.getRole.mockResolvedValue(role);
    renderApp('/queue');
    expect(await screen.findByRole('heading', { name: heading })).toBeInTheDocument();
    expect(faults.getWardQueue).not.toHaveBeenCalled();
  });

  it("loads the queue for the ward admin's own ward", async () => {
    await openS8();
    expect(screen.getByRole('heading', { name: 'Ward queue' })).toBeInTheDocument();
    expect(faults.getWardQueue).toHaveBeenCalledWith('ward-a');
  });

  it('shows the three BR7 tabs with full counts, New first and selected', async () => {
    await openS8();
    const tabs = screen.getAllByRole('tab');
    expect(tabs.map((tab) => tab.textContent)).toEqual(['New (2)', 'In progress (2)', 'Fixed (1)']);
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
  });

  it('puts each status in its BR7 tab and keeps the database order', async () => {
    await openS8();
    expect(items().map((item) => within(item).getByText(/^FMK-/).textContent)).toEqual([
      'FMK-2026-00120',
      'FMK-2026-00118',
    ]);

    fireEvent.click(screen.getByRole('tab', { name: 'In progress (2)' }));
    expect(screen.getByRole('tab', { name: 'In progress (2)' })).toHaveAttribute('aria-selected', 'true');
    expect(items().map((item) => within(item).getByText(/^FMK-/).textContent)).toEqual([
      'FMK-2026-00115',
      'FMK-2026-00123',
    ]);

    fireEvent.click(screen.getByRole('tab', { name: 'Fixed (1)' }));
    expect(items().map((item) => within(item).getByText(/^FMK-/).textContent)).toEqual(['FMK-2026-00101']);
  });

  it('shows reference, fault type, address, status and report date (SAST), and links to S5', async () => {
    await openS8();
    const first = items()[0];
    expect(first).toHaveAttribute('href', '/faults/FMK-2026-00120');
    expect(within(first).getByText('FMK-2026-00120')).toBeInTheDocument();
    expect(within(first).getByText('Faulty streetlight')).toBeInTheDocument();
    expect(within(first).getByText('5 Mooki Street, Orlando West')).toBeInTheDocument();
    expect(within(first).getByText('Received')).toBeInTheDocument();
    expect(within(first).getByText('12 Nov 2026')).toBeInTheDocument();
  });

  it('shows the Overdue label only on overdue faults (BR11)', async () => {
    await openS8();
    const [notOverdue, overdue] = items();
    expect(within(notOverdue).queryByText('Overdue')).not.toBeInTheDocument();
    expect(within(overdue).getByText('Overdue')).toBeInTheDocument();
  });

  it('shows the empty messages from the PRD', async () => {
    vi.mocked(faults.getWardQueue).mockResolvedValue([]);
    await openS8();
    expect(screen.getByText('No new faults in your ward.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'Fixed (0)' }));
    expect(screen.getByText('Nothing here right now.')).toBeInTheDocument();
  });

  it('shows 5 placeholder rows while loading', async () => {
    vi.mocked(faults.getWardQueue).mockReturnValue(new Promise(() => {}));
    renderApp('/queue');
    expect(await screen.findAllByTestId('queue-placeholder')).toHaveLength(5);
  });

  it('shows the error message, and "Try again" loads the queue again', async () => {
    vi.mocked(faults.getWardQueue).mockRejectedValueOnce(new Error('network'));
    renderApp('/queue');
    expect(await screen.findByText('Something went wrong. Try again.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(await screen.findByRole('tablist')).toBeInTheDocument();
    expect(faults.getWardQueue).toHaveBeenCalledTimes(2);
  });

  // ---- Assign / Reassign opens M2 (#18, US7) -------------------------------------------
  it('shows Assign on New faults and Reassign on Assigned ones, but not on In progress or Fixed', async () => {
    await openS8();
    expect(within(card('FMK-2026-00120')).getByRole('button', { name: 'Assign' })).toBeInTheDocument();
    expect(within(card('FMK-2026-00118')).getByRole('button', { name: 'Assign' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'In progress (2)' }));
    expect(within(card('FMK-2026-00115')).getByRole('button', { name: 'Reassign' })).toBeInTheDocument();
    expect(within(card('FMK-2026-00123')).queryByRole('button')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'Fixed (1)' }));
    expect(within(card('FMK-2026-00101')).queryByRole('button')).not.toBeInTheDocument();
  });

  it("opens M2 for that fault, with teams for the fault's category (BR8)", async () => {
    await openS8();
    fireEvent.click(within(card('FMK-2026-00120')).getByRole('button', { name: 'Assign' }));

    expect(await screen.findByRole('heading', { name: 'Assign FMK-2026-00120' })).toBeInTheDocument();
    expect(screen.getByText('Faulty streetlight, 5 Mooki Street, Orlando West')).toBeInTheDocument();
    expect(assign.getFieldTeams).toHaveBeenCalledWith('electricity');
  });

  it('after saving M2: closes it, says "Fault assigned" and reloads the queue (T-US7-2)', async () => {
    await openS8();
    fireEvent.click(within(card('FMK-2026-00120')).getByRole('button', { name: 'Assign' }));
    await screen.findByRole('option', { name: 'Orlando Electricity Team (Municipal team)' });

    fireEvent.change(screen.getByLabelText(/^field team/i), { target: { value: 'team-1' } });
    fireEvent.change(screen.getByLabelText(/^expected fix date/i), { target: { value: assign.todaySast() } });
    fireEvent.change(screen.getByLabelText(/^estimated time to fix/i), { target: { value: '2' } });
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Assign' }));

    expect(await screen.findByText('Fault assigned')).toBeInTheDocument();
    expect(assign.assignFault).toHaveBeenCalledWith('FMK-2026-00120', expect.objectContaining({ fieldTeamId: 'team-1' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await waitFor(() => expect(faults.getWardQueue).toHaveBeenCalledTimes(2));
  });

  it('Cancel closes M2 without saving', async () => {
    await openS8();
    fireEvent.click(within(card('FMK-2026-00120')).getByRole('button', { name: 'Assign' }));
    await screen.findByRole('heading', { name: 'Assign FMK-2026-00120' });

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(assign.assignFault).not.toHaveBeenCalled();
  });
});
