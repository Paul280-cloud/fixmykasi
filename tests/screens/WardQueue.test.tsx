import { fireEvent, screen, within } from '@testing-library/react';
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
    streetAddress: `${reference} street`,
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
});

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
});
