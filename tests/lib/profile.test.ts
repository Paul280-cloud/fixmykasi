import { getMyProfile, initials } from '../../src/lib/profile';
import { supabase } from '../../src/lib/supabase';

vi.mock('../../src/lib/supabase', () => ({
  supabase: { from: vi.fn() },
}));

// S11 Profile, the small version for #23. I wrote these first, then src/lib/profile.ts.

describe('initials (S11 initials circle)', () => {
  it('takes the first letter of the first and last name', () => {
    expect(initials('Thandeka Mokoena')).toBe('TM');
    expect(initials('  sipho  dube  ')).toBe('SD');
  });

  it('uses one letter for one name, and the first and last for three names', () => {
    expect(initials('Lerato')).toBe('L');
    expect(initials('Nomsa Grace Sithole')).toBe('NS');
  });
});

describe('getMyProfile', () => {
  it('reads only my own profile row and maps the columns', async () => {
    const maybeSingle = vi.fn().mockResolvedValue({
      data: {
        full_name: 'Thandeka Mokoena',
        email: 'thandeka.m@example.com',
        phone: '+27825550134',
        role: 'resident',
        ward_id: 'ward-a',
      },
      error: null,
    });
    const eq = vi.fn(() => ({ maybeSingle }));
    const select = vi.fn(() => ({ eq }));
    vi.mocked(supabase.from).mockReturnValue({ select } as never);

    expect(await getMyProfile('user-1')).toEqual({
      fullName: 'Thandeka Mokoena',
      email: 'thandeka.m@example.com',
      phone: '+27825550134',
      role: 'resident',
      wardId: 'ward-a',
    });
    expect(supabase.from).toHaveBeenCalledWith('profiles');
    expect(select).toHaveBeenCalledWith('full_name, email, phone, role, ward_id');
    expect(eq).toHaveBeenCalledWith('id', 'user-1');
  });

  it('throws when the database gives an error, so the screen can show Try again', async () => {
    vi.mocked(supabase.from).mockReturnValue({
      select: () => ({ eq: () => ({ maybeSingle: vi.fn().mockResolvedValue({ data: null, error: new Error('offline') }) }) }),
    } as never);
    await expect(getMyProfile('user-1')).rejects.toThrow('offline');
  });

  it('throws when there is no profile row', async () => {
    vi.mocked(supabase.from).mockReturnValue({
      select: () => ({ eq: () => ({ maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }) }) }),
    } as never);
    await expect(getMyProfile('user-1')).rejects.toThrow();
  });
});
