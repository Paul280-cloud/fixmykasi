import { fireEvent, screen, within } from '@testing-library/react';
import * as auth from '../helpers/authMock';
import { renderApp } from '../helpers/renderApp';
import * as faults from '../../src/lib/faults';
import * as faultList from '../../src/lib/faultList';

vi.mock('../../src/lib/auth', () => import('../helpers/authMock'));

vi.mock('../../src/lib/faults', async () => {
  const actual = await vi.importActual<typeof import('../../src/lib/faults')>('../../src/lib/faults');
  return { CATEGORIES: actual.CATEGORIES, getFaultTypes: vi.fn() };
});

vi.mock('../../src/lib/faultList', async () => {
  const actual = await vi.importActual<typeof import('../../src/lib/faultList')>('../../src/lib/faultList');
  return { ...actual, getFaultList: vi.fn() };
});

// S4 Fault list (PRD 8.2), the small version for #12. I wrote these before the screen.
// Left for later in #12: search, filter chips, sort, "load more" and the photo thumbnail.

const FAULT_TYPES: faults.FaultType[] = [
  { id: 'pipe', category: 'clean_water', name: 'Burst clean water pipe', autoUrgent: false },
  { id: 'pothole', category: 'roads', name: 'Pothole', autoUrgent: false },
];

function fault(reference: string, extra: Partial<faultList.ListFault> = {}): faultList.ListFault {
  return {
    id: reference,
    reference,
    faultTypeId: 'pothole',
    wardId: 'ward-a',
    streetAddress: '12 Main Road',
    status: 'received',
    isUrgent: false,
    isOverdue: false,
    upvotes: 0,
    createdAt: '2026-11-12T08:00:00Z',
    ...extra,
  };
}

// Newest first, as the database returns it.
const LIST: faultList.ListFault[] = [
  fault('FMK-2026-00123', {
    faultTypeId: 'pipe',
    streetAddress: '23 Vilakazi Street',
    status: 'assigned',
    isUrgent: true,
    upvotes: 14,
    // 22:30 UTC on 11 Nov is 00:30 on 12 Nov in SAST.
    createdAt: '2026-11-11T22:30:00Z',
  }),
  fault('FMK-2026-00121', { isOverdue: true, upvotes: 1, wardId: 'ward-b' }),
  fault('FMK-2026-00118'),
];

function card(reference: string) {
  return screen.getByText(reference).closest('li') as HTMLElement;
}

async function openS4() {
  renderApp('/faults');
  return screen.findByText('FMK-2026-00123');
}

beforeEach(() => {
  auth.resetAuthMock('resident-1');
  auth.getRole.mockResolvedValue('resident');
  vi.mocked(faults.getFaultTypes).mockResolvedValue(FAULT_TYPES);
  vi.mocked(faultList.getFaultList).mockResolvedValue(LIST);
});

describe('S4 Fault list', () => {
  it('shows the Fault list title and the faults instead of the placeholder', async () => {
    await openS4();
    expect(screen.getByRole('heading', { name: 'Fault list' })).toBeInTheDocument();
    expect(screen.queryByText(/This screen is a placeholder/)).not.toBeInTheDocument();
    expect(screen.getAllByRole('listitem').length).toBeGreaterThanOrEqual(3);
  });

  it('shows the card details from the PRD (type, status, Urgent, address and ward, reference, upvotes, date)', async () => {
    await openS4();
    const pipe = within(card('FMK-2026-00123'));
    expect(pipe.getByText('Burst clean water pipe')).toBeInTheDocument();
    expect(pipe.getByText('Assigned')).toBeInTheDocument();
    expect(pipe.getByText('Urgent')).toBeInTheDocument();
    expect(pipe.getByText('23 Vilakazi Street, Ward A: Orlando West')).toBeInTheDocument();
    expect(pipe.getByText('14 upvotes')).toBeInTheDocument();
    expect(pipe.getByText('12 Nov 2026')).toBeInTheDocument();
  });

  it('says "1 upvote", shows Overdue, and hides the upvotes at 0', async () => {
    await openS4();
    expect(within(card('FMK-2026-00121')).getByText('1 upvote')).toBeInTheDocument();
    expect(within(card('FMK-2026-00121')).getByText('Overdue')).toBeInTheDocument();
    expect(within(card('FMK-2026-00118')).queryByText(/upvote/)).not.toBeInTheDocument();
  });

  it('links each card to its Fault details page (S5)', async () => {
    await openS4();
    expect(within(card('FMK-2026-00123')).getByRole('link')).toHaveAttribute('href', '/faults/FMK-2026-00123');
  });

  it('works for a visitor too (S4 is for everyone)', async () => {
    auth.resetAuthMock(null);
    await openS4();
    expect(screen.getByText('FMK-2026-00118')).toBeInTheDocument();
  });

  it('shows the empty state with "Report a fault" for a resident', async () => {
    vi.mocked(faultList.getFaultList).mockResolvedValue([]);
    renderApp('/faults');
    expect(await screen.findByText('No faults reported yet. Be the first to report one.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Report a fault' })).toHaveAttribute('href', '/report');
  });

  it('sends a visitor to Log in from the empty state', async () => {
    auth.resetAuthMock(null);
    vi.mocked(faultList.getFaultList).mockResolvedValue([]);
    renderApp('/faults');
    expect(await screen.findByRole('link', { name: 'Report a fault' })).toHaveAttribute('href', '/log-in');
  });

  it('shows Try again when loading fails, and it loads again', async () => {
    vi.mocked(faultList.getFaultList).mockRejectedValueOnce(new Error('offline'));
    renderApp('/faults');
    fireEvent.click(await screen.findByRole('button', { name: 'Try again' }));
    expect(await screen.findByText('FMK-2026-00123')).toBeInTheDocument();
  });
});
