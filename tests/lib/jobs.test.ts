import { getMyJobs, getMyTeam, NEXT_STATUSES, sortJobs, updateJobStatus, type JobFault } from '../../src/lib/jobs';
import { supabase } from '../../src/lib/supabase';

vi.mock('../../src/lib/supabase', () => ({
  supabase: { from: vi.fn(), rpc: vi.fn() },
}));

// S10 My jobs + M3 Update status (#20, US8). I wrote these first, then src/lib/jobs.ts.

function job(reference: string, extra: Partial<JobFault> = {}): JobFault {
  return {
    id: reference,
    reference,
    faultTypeId: 'pothole',
    streetAddress: '12 Main Road',
    landmark: null,
    status: 'assigned',
    isUrgent: false,
    isOverdue: false,
    isDelayed: false,
    dueDate: '2026-11-20',
    ...extra,
  };
}

describe('NEXT_STATUSES (10.3, only the field team steps)', () => {
  it('lets a field team go Assigned -> Scheduled or In progress, Scheduled -> In progress, In progress -> Fixed', () => {
    expect(NEXT_STATUSES.assigned).toEqual(['scheduled', 'in_progress']);
    expect(NEXT_STATUSES.scheduled).toEqual(['in_progress']);
    expect(NEXT_STATUSES.in_progress).toEqual(['fixed']);
  });

  it('has nothing for statuses the field team does not move', () => {
    expect(NEXT_STATUSES.fixed).toEqual([]);
    expect(NEXT_STATUSES.closed).toEqual([]);
    expect(NEXT_STATUSES.received).toEqual([]);
  });
});

describe('sortJobs (S10: overdue at the top, then due date soonest first)', () => {
  it('puts overdue jobs first, then the soonest due date, and jobs with no date last', () => {
    const sorted = sortJobs([
      job('FMK-2026-00003', { dueDate: '2026-11-25' }),
      job('FMK-2026-00004', { dueDate: null }),
      job('FMK-2026-00001', { dueDate: '2026-11-15', isOverdue: true }),
      job('FMK-2026-00002', { dueDate: '2026-11-18' }),
    ]);
    expect(sorted.map((j) => j.reference)).toEqual([
      'FMK-2026-00001',
      'FMK-2026-00002',
      'FMK-2026-00003',
      'FMK-2026-00004',
    ]);
  });
});

describe('getMyTeam', () => {
  it("reads my field team from my profile, then the team's name", async () => {
    const profileSingle = vi.fn().mockResolvedValue({ data: { field_team_id: 'team-1' }, error: null });
    const teamSingle = vi.fn().mockResolvedValue({ data: { id: 'team-1', name: 'Sample Plumbing Services (Pty) Ltd' }, error: null });
    vi.mocked(supabase.from).mockImplementation(
      (table: string) =>
        ({
          select: () => ({
            eq: () => ({ maybeSingle: table === 'profiles' ? profileSingle : teamSingle }),
          }),
        }) as never,
    );

    expect(await getMyTeam('user-1')).toEqual({ id: 'team-1', name: 'Sample Plumbing Services (Pty) Ltd' });
  });

  it('gives null when my profile has no team', async () => {
    vi.mocked(supabase.from).mockReturnValue({
      select: () => ({ eq: () => ({ maybeSingle: vi.fn().mockResolvedValue({ data: { field_team_id: null }, error: null }) }) }),
    } as never);
    expect(await getMyTeam('user-1')).toBeNull();
  });
});

describe('getMyJobs', () => {
  it("asks faults_public only for my team's jobs and maps the columns", async () => {
    const inFn = vi.fn().mockResolvedValue({
      data: [
        {
          id: 'f1',
          reference_number: 'FMK-2026-00123',
          fault_type_id: 'pothole',
          street_address: '23 Vilakazi Street',
          landmark: 'Next to the clinic',
          status: 'scheduled',
          is_urgent: true,
          is_overdue: false,
          is_delayed: false,
          due_date: '2026-11-18',
        },
      ],
      error: null,
    });
    const eq = vi.fn(() => ({ in: inFn }));
    const select = vi.fn(() => ({ eq }));
    vi.mocked(supabase.from).mockReturnValue({ select } as never);

    const jobs = await getMyJobs('team-1');

    expect(supabase.from).toHaveBeenCalledWith('faults_public');
    expect(eq).toHaveBeenCalledWith('field_team_id', 'team-1');
    expect(inFn).toHaveBeenCalledWith('status', ['assigned', 'scheduled', 'in_progress', 'fixed', 'closed']);
    expect(jobs).toEqual([
      {
        id: 'f1',
        reference: 'FMK-2026-00123',
        faultTypeId: 'pothole',
        streetAddress: '23 Vilakazi Street',
        landmark: 'Next to the clinic',
        status: 'scheduled',
        isUrgent: true,
        isOverdue: false,
        isDelayed: false,
        dueDate: '2026-11-18',
      },
    ]);
  });
});

describe('updateJobStatus (calls change_fault_status from #16)', () => {
  it('sends the new status and the note (empty note as null)', async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({ error: null } as never);

    expect(await updateJobStatus('f1', 'in_progress', '  Crew on site, road dug up  ')).toEqual({});
    expect(supabase.rpc).toHaveBeenCalledWith('change_fault_status', {
      p_fault_id: 'f1',
      p_to_status: 'in_progress',
      p_note: 'Crew on site, road dug up',
    });

    await updateJobStatus('f1', 'fixed', '   ');
    expect(supabase.rpc).toHaveBeenLastCalledWith('change_fault_status', {
      p_fault_id: 'f1',
      p_to_status: 'fixed',
      p_note: null,
    });
  });

  it('gives back not_your_team when the job is not assigned to my team (T-US8-3)', async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({ error: { message: 'not_assigned_field_team' } } as never);
    expect(await updateJobStatus('f1', 'fixed', '')).toEqual({ error: 'not_your_team' });
  });

  it('gives back unknown for anything else', async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({ error: { message: 'invalid_status_transition' } } as never);
    expect(await updateJobStatus('f1', 'fixed', '')).toEqual({ error: 'unknown' });
  });
});
