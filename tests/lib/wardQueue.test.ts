import { getWardQueue } from '../../src/lib/faults';
import { supabase } from '../../src/lib/supabase';

vi.mock('../../src/lib/supabase', () => ({
  supabase: { from: vi.fn(), storage: { from: vi.fn() } },
}));

// getWardQueue (S8, BR7): the ward admin's faults that are not Closed, in BR7 order.

const ROW = {
  id: 'f1',
  reference_number: 'FMK-2026-00123',
  fault_type_id: 'pothole',
  street_address: '23 Vilakazi Street, Orlando West',
  status: 'received',
  is_urgent: true,
  is_overdue: false,
  created_at: '2026-11-12T08:00:00Z',
};

// A fake query builder: every call is recorded and returns the builder, and
// awaiting it gives back `result` (that is how supabase-js queries work).
function setUp(result: { data: unknown; error: unknown }) {
  const calls: [string, ...unknown[]][] = [];
  const builder: Record<string, unknown> = {};
  for (const method of ['select', 'eq', 'neq', 'order']) {
    builder[method] = (...args: unknown[]) => {
      calls.push([method, ...args]);
      return builder;
    };
  }
  builder.then = (resolve: (value: unknown) => unknown) => Promise.resolve(result).then(resolve);
  vi.mocked(supabase.from).mockReturnValue(builder as never);
  return calls;
}

describe('getWardQueue', () => {
  it('reads faults_public for one ward, leaves out Closed, and never asks for reporter_id', async () => {
    const calls = setUp({ data: [], error: null });

    await getWardQueue('ward-a');

    expect(supabase.from).toHaveBeenCalledWith('faults_public');
    const select = calls.find(([method]) => method === 'select');
    expect(select?.[1]).not.toMatch(/\*|reporter/);
    expect(calls).toContainEqual(['eq', 'ward_id', 'ward-a']);
    expect(calls).toContainEqual(['neq', 'status', 'closed']);
  });

  it('orders by BR7: urgent first, then most upvotes, then oldest report first', async () => {
    const calls = setUp({ data: [], error: null });

    await getWardQueue('ward-a');

    expect(calls.filter(([method]) => method === 'order')).toEqual([
      ['order', 'is_urgent', { ascending: false }],
      ['order', 'upvote_count', { ascending: false }],
      ['order', 'created_at', { ascending: true }],
    ]);
  });

  it('turns each row into a queue item', async () => {
    setUp({ data: [ROW], error: null });

    expect(await getWardQueue('ward-a')).toEqual([
      {
        id: 'f1',
        reference: 'FMK-2026-00123',
        faultTypeId: 'pothole',
        streetAddress: '23 Vilakazi Street, Orlando West',
        status: 'received',
        isUrgent: true,
        isOverdue: false,
        createdAt: '2026-11-12T08:00:00Z',
      },
    ]);
  });

  it('throws when the database returns an error', async () => {
    setUp({ data: null, error: { message: 'boom' } });

    await expect(getWardQueue('ward-a')).rejects.toEqual({ message: 'boom' });
  });
});
