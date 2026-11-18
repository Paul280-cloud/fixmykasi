import {
  addDays,
  assignFault,
  getFieldTeams,
  todaySast,
  validateAssign,
  type AssignForm,
} from '../../src/lib/assign';
import { supabase } from '../../src/lib/supabase';

vi.mock('../../src/lib/supabase', () => ({
  supabase: { from: vi.fn(), rpc: vi.fn() },
}));

// M2 Assign Fault (#18): the BR8 form rules and the call to assign_fault.
// I wrote these first, then src/lib/assign.ts.

const TODAY = '2026-11-17';

function form(changes: Partial<AssignForm> = {}): AssignForm {
  return {
    fieldTeamId: 'team-roads',
    dueDate: '2026-11-19',
    estimatedDays: '2',
    municipalReference: '',
    note: '',
    ...changes,
  };
}

describe('todaySast (BR8 uses today in SAST)', () => {
  it('is already the next day in SAST at 23:30 UTC', () => {
    expect(todaySast(new Date('2026-11-16T23:30:00Z'))).toBe('2026-11-17');
  });

  it('is the same day at 08:00 UTC', () => {
    expect(todaySast(new Date('2026-11-17T08:00:00Z'))).toBe('2026-11-17');
  });
});

describe('addDays', () => {
  it('adds days across a month end', () => {
    expect(addDays('2026-11-17', 90)).toBe('2027-02-15');
  });
});

describe('validateAssign (BR8, M2 fields)', () => {
  it('accepts a normal assignment like the PRD sample (2 days, JW-778812)', () => {
    expect(validateAssign(form({ municipalReference: 'JW-778812' }), TODAY)).toEqual({});
  });

  it('needs a field team, a date and the days when the form is empty', () => {
    expect(validateAssign(form({ fieldTeamId: '', dueDate: '', estimatedDays: '' }), TODAY)).toEqual({
      fieldTeam: true,
      dueDate: true,
      estimatedDays: true,
    });
  });

  it('rejects a date 120 days away (T-US7-3)', () => {
    expect(validateAssign(form({ dueDate: addDays(TODAY, 120) }), TODAY)).toEqual({ dueDate: true });
  });

  it('rejects yesterday but accepts today and exactly 90 days away', () => {
    expect(validateAssign(form({ dueDate: '2026-11-16' }), TODAY)).toEqual({ dueDate: true });
    expect(validateAssign(form({ dueDate: TODAY }), TODAY)).toEqual({});
    expect(validateAssign(form({ dueDate: addDays(TODAY, 90) }), TODAY)).toEqual({});
  });

  it('only takes whole days from 1 to 90', () => {
    expect(validateAssign(form({ estimatedDays: '0' }), TODAY)).toEqual({ estimatedDays: true });
    expect(validateAssign(form({ estimatedDays: '91' }), TODAY)).toEqual({ estimatedDays: true });
    expect(validateAssign(form({ estimatedDays: '1.5' }), TODAY)).toEqual({ estimatedDays: true });
    expect(validateAssign(form({ estimatedDays: '90' }), TODAY)).toEqual({});
  });

  it('keeps the municipal reference to 30 and the note to 200 characters', () => {
    expect(validateAssign(form({ municipalReference: 'J'.repeat(31) }), TODAY)).toEqual({
      municipalReference: true,
    });
    expect(validateAssign(form({ note: 'n'.repeat(201) }), TODAY)).toEqual({ note: true });
    expect(validateAssign(form({ municipalReference: 'J'.repeat(30), note: 'n'.repeat(200) }), TODAY)).toEqual({});
  });
});

describe('getFieldTeams (BR8: only teams of the fault category)', () => {
  it('asks only for teams in that category, without the phone number', async () => {
    const order = vi.fn().mockResolvedValue({
      data: [{ id: 'team-1', name: 'Sample Plumbing Services (Pty) Ltd', kind: 'contractor' }],
      error: null,
    });
    const eq = vi.fn(() => ({ order }));
    const select = vi.fn(() => ({ eq }));
    vi.mocked(supabase.from).mockReturnValue({ select } as never);

    const teams = await getFieldTeams('clean_water');

    expect(supabase.from).toHaveBeenCalledWith('field_teams');
    expect(select).toHaveBeenCalledWith('id, name, kind');
    expect(eq).toHaveBeenCalledWith('category', 'clean_water');
    expect(teams).toEqual([{ id: 'team-1', name: 'Sample Plumbing Services (Pty) Ltd', kind: 'contractor' }]);
  });
});

describe('assignFault (calls the assign_fault function from #18)', () => {
  it('sends the form to assign_fault, with empty optional fields as null', async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({ error: null } as never);

    const result = await assignFault('fault-1', form({ note: '  Bring cones  ' }));

    expect(result).toEqual({});
    expect(supabase.rpc).toHaveBeenCalledWith('assign_fault', {
      p_fault_id: 'fault-1',
      p_field_team_id: 'team-roads',
      p_due_date: '2026-11-19',
      p_estimated_days: 2,
      p_municipal_reference: null,
      p_note: 'Bring cones',
    });
  });

  it('gives back not_your_ward when the database says so (T-US7-4)', async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({ error: { message: 'not_your_ward' } } as never);
    expect(await assignFault('fault-1', form())).toEqual({ error: 'not_your_ward' });
  });

  it('gives back the field rule the database refused', async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({ error: { message: 'bad_due_date' } } as never);
    expect(await assignFault('fault-1', form())).toEqual({ error: 'bad_due_date' });
  });

  it('gives back unknown for anything else', async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({ error: { message: 'cannot_assign_now' } } as never);
    expect(await assignFault('fault-1', form())).toEqual({ error: 'unknown' });
  });
});
