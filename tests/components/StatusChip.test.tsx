import { render, screen } from '@testing-library/react';
import '../../src/i18n';
import StatusChip from '../../src/components/StatusChip';
import type { FaultStatus } from '../../src/lib/faults';

// PRD 8.3 Status chip: the status name is always written, never colour alone.

const NAMES: [FaultStatus, string][] = [
  ['received', 'Received'],
  ['viewed', 'Viewed'],
  ['assigned', 'Assigned'],
  ['scheduled', 'Scheduled'],
  ['in_progress', 'In progress'],
  ['fixed', 'Fixed'],
  ['closed', 'Closed'],
  ['reopened', 'Reopened'],
];

describe('StatusChip', () => {
  it.each(NAMES)('writes the name of status %s', (status, name) => {
    render(<StatusChip status={status} />);
    expect(screen.getByText(name)).toBeInTheDocument();
  });
});
