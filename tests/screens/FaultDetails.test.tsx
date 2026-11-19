
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { vi } from 'vitest';
import * as auth from '../helpers/authMock';
import { renderApp } from '../helpers/renderApp';

const mocks = vi.hoisted(() => ({
  getFaultDetails: vi.fn(),
}));

vi.mock('../../src/lib/auth', () => import('../helpers/authMock'));

vi.mock('../../src/lib/faultDetails', () => mocks);

const REFERENCE = 'FMK-2026-00123';

const DETAIL = {
  id: 'fault-123',
  reference: REFERENCE,
  faultTypeName: 'Burst clean water pipe',
  category: 'clean_water',
  status: 'scheduled',
  isUrgent: true,
  isOverdue: true,
  isDelayed: true,
  delayReason: 'Waiting for replacement parts',
  description:
    'Clean drinking water is bursting through the pavement near the corner.',
  streetAddress: '23 Vilakazi Street',
  landmark: 'Opposite Mandela House museum',
  wardName: 'Ward A: Orlando West',
  municipality: 'City of Johannesburg',
  dueDate: '2026-11-18',
  estimatedDays: 2,
  fieldTeam: {
    name: 'Sample Plumbing Services (Pty) Ltd',
    kind: 'contractor',
  },
  photos: [
    {
      id: 'photo-1',
      kind: 'before',
      url: 'https://example.com/before.jpg',
      createdAt: '2026-11-10T08:00:00Z',
    },
    {
      id: 'photo-2',
      kind: 'after',
      url: 'https://example.com/after.jpg',
      createdAt: '2026-11-12T06:00:00Z',
    },
  ],
  timeline: [
    {
      id: 'status-2',
      fromStatus: 'assigned',
      toStatus: 'scheduled',
      note: 'Parts ordered and crew booked',
      createdAt: '2026-11-12T06:00:00Z',
      fieldTeamName: 'Sample Plumbing Services (Pty) Ltd',
    },
    {
      id: 'status-1',
      fromStatus: null,
      toStatus: 'received',
      note: null,
      createdAt: '2026-11-10T08:00:00Z',
      fieldTeamName: null,
    },
  ],
};

beforeEach(() => {
  auth.resetAuthMock(null);
  mocks.getFaultDetails.mockResolvedValue(DETAIL);
});

describe('S5 Fault Details', () => {
  it('allows a visitor to open a fault without logging in', async () => {
    renderApp(`/faults/${REFERENCE}`);

    expect(
      await screen.findByRole('heading', { name: REFERENCE }),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole('heading', { name: 'Log in' }),
    ).not.toBeInTheDocument();

    expect(mocks.getFaultDetails).toHaveBeenCalledWith(REFERENCE);
  });

  it('shows the fault description, location, status and responsibility details', async () => {
    renderApp(`/faults/${REFERENCE}`);

    expect(
      await screen.findByText('Burst clean water pipe'),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        'Clean drinking water is bursting through the pavement near the corner.',
      ),
    ).toBeInTheDocument();

    expect(screen.getByText('23 Vilakazi Street')).toBeInTheDocument();
    expect(
      screen.getByText('Opposite Mandela House museum'),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Ward A: Orlando West/),
    ).toBeInTheDocument();

    expect(screen.getAllByText('Scheduled')).toHaveLength(2);
    expect(screen.getByText('Urgent')).toBeInTheDocument();
    expect(screen.getByText('Overdue')).toBeInTheDocument();
    expect(screen.getByText('Delayed')).toBeInTheDocument();

    expect(
      screen.getByText('Sample Plumbing Services (Pty) Ltd'),
    ).toBeInTheDocument();
    expect(screen.getByText('18 Nov 2026')).toBeInTheDocument();
    expect(screen.getByText('2 days')).toBeInTheDocument();
  });

  it('shows the fault photos', async () => {
    renderApp(`/faults/${REFERENCE}`);

    expect(
      await screen.findByRole('img', { name: 'Fault photo 1' }),
    ).toHaveAttribute('src', 'https://example.com/before.jpg');

    expect(
      screen.getByRole('img', { name: 'Fault photo 2' }),
    ).toHaveAttribute('src', 'https://example.com/after.jpg');
  });

  it('shows the status timeline newest first, with SAST date and time', async () => {
    renderApp(`/faults/${REFERENCE}`);

    expect(
      await screen.findByTestId('fault-timeline'),
    ).toBeInTheDocument();

    const history = screen.getByTestId('fault-timeline');

    const statuses = within(history)
      .getAllByTestId('timeline-status')
      .map((item) => item.textContent);

    expect(statuses).toEqual(['Scheduled', 'Received']);

    // 12 Nov 2026, 06:00 UTC = 12 Nov 2026, 08:00 SAST.
    expect(
      within(history).getByText('12 Nov 2026, 08:00'),
    ).toBeInTheDocument();

    // 10 Nov 2026, 08:00 UTC = 10 Nov 2026, 10:00 SAST.
    expect(
      within(history).getByText('10 Nov 2026, 10:00'),
    ).toBeInTheDocument();

    expect(
      within(history).getByText('Parts ordered and crew booked'),
    ).toBeInTheDocument();
  });

  it('shows "Not assigned yet" when no field team has been assigned', async () => {
    mocks.getFaultDetails.mockResolvedValue({
      ...DETAIL,
      fieldTeam: null,
      dueDate: null,
      estimatedDays: null,
    });

    renderApp(`/faults/${REFERENCE}`);

    expect(
      await screen.findByText('Not assigned yet'),
    ).toBeInTheDocument();
  });

  it('shows a not-found message for an unknown reference', async () => {
    mocks.getFaultDetails.mockResolvedValue(null);

    renderApp(`/faults/${REFERENCE}`);

    expect(
      await screen.findByText("We couldn't find this fault."),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('link', { name: 'Back to faults' }),
    ).toHaveAttribute('href', '/faults');
  });

  it('shows an error and allows the user to retry loading', async () => {
    mocks.getFaultDetails
      .mockRejectedValueOnce(new Error('network'))
      .mockResolvedValueOnce(DETAIL);

    renderApp(`/faults/${REFERENCE}`);

    expect(
      await screen.findByText("We couldn't load this fault. Try again."),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', { name: 'Try again' }),
    );

    expect(
      await screen.findByRole('heading', { name: REFERENCE }),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(mocks.getFaultDetails).toHaveBeenCalledTimes(2);
    });
  });

  it('shows loading placeholders while the fault is being loaded', async () => {
    mocks.getFaultDetails.mockReturnValue(new Promise(() => {}));

    renderApp(`/faults/${REFERENCE}`);

    expect(
      await screen.findAllByTestId('fault-details-placeholder'),
    ).toHaveLength(5);
  });

  it('does not display confirmation, reopening, upvoting or assignment actions', async () => {
    renderApp(`/faults/${REFERENCE}`);

    await screen.findByRole('heading', { name: REFERENCE });

    expect(
      screen.queryByRole('button', { name: /confirm/i }),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByRole('button', { name: /reopen/i }),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByRole('button', { name: /affects me too/i }),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByRole('button', { name: /^assign$/i }),
    ).not.toBeInTheDocument();
  });
});
