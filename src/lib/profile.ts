// The only place S11 Profile talks to the database (#23, small version).
// RLS only lets me read my own profile row. The tests mock this file.
import type { Role } from './auth';
import { supabase } from './supabase';

export type MyProfile = {
  fullName: string;
  email: string;
  phone: string | null; // +27825550134
  role: Role;
  wardId: string | null; // field teams have no ward
};

/** My own profile row. Throws if it can't load, so S11 can show Try again. */
export async function getMyProfile(userId: string): Promise<MyProfile> {
  const { data, error } = await supabase
    .from('profiles')
    .select('full_name, email, phone, role, ward_id')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('profile_not_found');
  return {
    fullName: data.full_name,
    email: data.email,
    phone: data.phone,
    role: data.role as Role,
    wardId: data.ward_id,
  };
}

/** "Thandeka Mokoena" -> "TM" for the initials circle. First and last name only. */
export function initials(fullName: string): string {
  const names = fullName.trim().split(/\s+/);
  const first = names[0]?.[0] ?? '';
  const last = names.length > 1 ? names[names.length - 1][0] : '';
  return (first + last).toUpperCase();
}
