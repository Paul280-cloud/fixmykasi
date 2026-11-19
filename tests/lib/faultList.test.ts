import { getFaultList, PAGE_SIZE } from '../../src/lib/faultList';
import { supabase } from '../../src/lib/supabase';

vi.mock('../../src/lib/supabase', () => ({
  supabase: { from: vi.fn() },
}));

// S4 Fault list, the small version for #12. I wrote these first, then src/lib/faultList.ts.

describe('getFaultList (S4, BR6 "Newest", 20 at a time)', () => {
  it('reads faults_public, newest first, 20 at a time, and maps the columns', async () => {
    const limit = vi.fn().mockResolvedValue({
      data: [
        {
          id: 'f1',
          reference_number: 'FMK-2026-00123',
          fault_type_id: 'pipe',
          ward_id: 'ward-a',
          street_address: '23 Vilakazi Street',
          status: 'assigned',
          is_urgent: true,
          is_overdue: false,
          upvote_count: 14,
          created_at: '2026-11-12T08:00:00Z',
        },
      ],
      error: null,
    });
    const order = vi.fn(() => ({ limit }));
    const select = vi.fn(() => ({ order }));
    vi.mocked(supabase.from).mockReturnValue({ select } as never);

    const faults = await getFaultList();

    expect(supabase.from).toHaveBeenCalledWith('faults_public');
    expect(order).toHaveBeenCalledWith('created_at', { ascending: false });
    expect(limit).toHaveBeenCalledWith(PAGE_SIZE);
    expect(PAGE_SIZE).toBe(20);
    expect(faults).toEqual([
      {
        id: 'f1',
        reference: 'FMK-2026-00123',
        faultTypeId: 'pipe',
        wardId: 'ward-a',
        streetAddress: '23 Vilakazi Street',
        status: 'assigned',
        isUrgent: true,
        isOverdue: false,
        upvotes: 14,
        createdAt: '2026-11-12T08:00:00Z',
      },
    ]);
  });

  it('throws when the database fails, so the screen can show Try again', async () => {
    const limit = vi.fn().mockResolvedValue({ data: null, error: new Error('offline') });
    vi.mocked(supabase.from).mockReturnValue({ select: () => ({ order: () => ({ limit }) }) } as never);
    await expect(getFaultList()).rejects.toThrow('offline');
  });
});
