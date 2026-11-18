// The only place M2 Assign Fault talks to the database (#18). The screen gets
// simple results and error codes back, and the tests mock this file.
import type { FaultCategory } from './faults';
import { supabase } from './supabase';

export type FieldTeamOption = {
  id: string;
  name: string;
  kind: 'municipal' | 'contractor';
};

// I keep the form as strings, the same as the inputs give them to me.
export type AssignForm = {
  fieldTeamId: string;
  dueDate: string; // YYYY-MM-DD from the date input
  estimatedDays: string;
  municipalReference: string;
  note: string;
};

export type AssignErrors = Partial<
  Record<'fieldTeam' | 'dueDate' | 'estimatedDays' | 'municipalReference' | 'note', true>
>;

// Same codes as the assign_fault function in the database.
export type AssignError =
  | 'not_your_ward'
  | 'wrong_team_category'
  | 'bad_due_date'
  | 'bad_estimated_days'
  | 'municipal_reference_too_long'
  | 'note_too_long'
  | 'unknown';

const KNOWN_ERRORS: AssignError[] = [
  'not_your_ward',
  'wrong_team_category',
  'bad_due_date',
  'bad_estimated_days',
  'municipal_reference_too_long',
  'note_too_long',
];

export const MAX_DAYS = 90;
export const MAX_REFERENCE = 30;
export const MAX_NOTE = 200;

/** Today's date in SAST as YYYY-MM-DD. BR8 counts the 90 days from here. */
export function todaySast(now: Date = new Date()): string {
  // en-CA writes dates as YYYY-MM-DD, which is what the date input uses.
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Johannesburg' }).format(now);
}

/** Adds whole days to a YYYY-MM-DD date. */
export function addDays(isoDate: string, days: number): string {
  // I do the sum in UTC so a time zone can never push it to the wrong day.
  const date = new Date(`${isoDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/** BR8 and the M2 field rules. An empty object means the form is fine. */
export function validateAssign(form: AssignForm, today: string = todaySast()): AssignErrors {
  const errors: AssignErrors = {};

  if (!form.fieldTeamId) errors.fieldTeam = true;

  // YYYY-MM-DD strings sort the same as the dates, so I can compare them directly.
  if (!form.dueDate || form.dueDate < today || form.dueDate > addDays(today, MAX_DAYS)) {
    errors.dueDate = true;
  }

  // Whole number from 1 to 90, so "1.5" and "0" are both wrong.
  const days = form.estimatedDays.trim();
  if (!/^\d+$/.test(days) || Number(days) < 1 || Number(days) > MAX_DAYS) {
    errors.estimatedDays = true;
  }

  if (form.municipalReference.trim().length > MAX_REFERENCE) errors.municipalReference = true;
  if (form.note.trim().length > MAX_NOTE) errors.note = true;

  return errors;
}

/** Field teams for the dropdown: only the fault's category (BR8). No phone numbers here. */
export async function getFieldTeams(category: FaultCategory): Promise<FieldTeamOption[]> {
  const { data, error } = await supabase
    .from('field_teams')
    .select('id, name, kind')
    .eq('category', category)
    .order('name');
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    kind: row.kind as FieldTeamOption['kind'],
  }));
}

/**
 * Saves M2 through the assign_fault function (#18). The database checks
 * everything again, so even if someone skips the screen the rules still hold.
 */
export async function assignFault(faultId: string, form: AssignForm): Promise<{ error?: AssignError }> {
  const { error } = await supabase.rpc('assign_fault', {
    p_fault_id: faultId,
    p_field_team_id: form.fieldTeamId,
    p_due_date: form.dueDate,
    p_estimated_days: Number(form.estimatedDays),
    // Empty optional fields go as null, not as an empty string.
    p_municipal_reference: form.municipalReference.trim() || null,
    p_note: form.note.trim() || null,
  });
  if (!error) return {};
  const code = KNOWN_ERRORS.find((known) => error.message.includes(known));
  return { error: code ?? 'unknown' };
}
