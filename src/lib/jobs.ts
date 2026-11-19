// The only place S10 My jobs and M3 talk to the database (#20). The screens get
// simple results and error codes back, and the tests mock this file.
import type { FaultStatus } from './faults';
import { supabase } from './supabase';

export type JobFault = {
  id: string;
  reference: string;
  faultTypeId: string;
  streetAddress: string;
  landmark: string | null;
  status: FaultStatus;
  isUrgent: boolean;
  isOverdue: boolean;
  isDelayed: boolean;
  dueDate: string | null; // YYYY-MM-DD
};

export type JobError = 'not_your_team' | 'note_too_long' | 'unknown';

export const MAX_NOTE = 200;

// 10.3: the steps a field team can take. Everything else (assigning, closing,
// reopening) belongs to the ward admin or the resident, so it's not here.
// Same rules as change_fault_status in #16, which checks them again.
export const NEXT_STATUSES: Record<FaultStatus, FaultStatus[]> = {
  received: [],
  viewed: [],
  reopened: [],
  assigned: ['scheduled', 'in_progress'],
  scheduled: ['in_progress'],
  in_progress: ['fixed'],
  fixed: [],
  closed: [],
};

// S10 tabs: "To do" is Assigned, Scheduled, In progress; "Done" is Fixed, Closed.
export const TO_DO: FaultStatus[] = ['assigned', 'scheduled', 'in_progress'];
export const DONE: FaultStatus[] = ['fixed', 'closed'];

/** My field team (id and name), from my profile. null if I'm not in a team. */
export async function getMyTeam(userId: string): Promise<{ id: string; name: string } | null> {
  const profile = await supabase.from('profiles').select('field_team_id').eq('id', userId).maybeSingle();
  if (profile.error) throw profile.error;
  const teamId = profile.data?.field_team_id;
  if (!teamId) return null;

  const team = await supabase.from('field_teams').select('id, name').eq('id', teamId).maybeSingle();
  if (team.error) throw team.error;
  return team.data ? { id: team.data.id, name: team.data.name } : null;
}

/** All the faults assigned to my team. faults_public, so no reporter details (BR16). */
export async function getMyJobs(teamId: string): Promise<JobFault[]> {
  const { data, error } = await supabase
    .from('faults_public')
    .select('id, reference_number, fault_type_id, street_address, landmark, status, is_urgent, is_overdue, is_delayed, due_date')
    .eq('field_team_id', teamId)
    .in('status', [...TO_DO, ...DONE]);
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    reference: row.reference_number,
    faultTypeId: row.fault_type_id,
    streetAddress: row.street_address,
    landmark: row.landmark,
    status: row.status as FaultStatus,
    isUrgent: row.is_urgent,
    isOverdue: row.is_overdue,
    isDelayed: row.is_delayed,
    dueDate: row.due_date,
  }));
}

/** S10 order: overdue jobs at the top, then the soonest due date. No date goes last. */
export function sortJobs(jobs: JobFault[]): JobFault[] {
  return [...jobs].sort((a, b) => {
    if (a.isOverdue !== b.isOverdue) return a.isOverdue ? -1 : 1;
    // YYYY-MM-DD strings sort the same as the dates.
    if (a.dueDate === b.dueDate) return 0;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return a.dueDate < b.dueDate ? -1 : 1;
  });
}

/** M3 Save: change_fault_status from #16 checks the team and the step again. */
export async function updateJobStatus(faultId: string, toStatus: FaultStatus, note: string): Promise<{ error?: JobError }> {
  const { error } = await supabase.rpc('change_fault_status', {
    p_fault_id: faultId,
    p_to_status: toStatus,
    // An empty note goes as null, not as an empty string.
    p_note: note.trim() || null,
  });
  if (!error) return {};
  if (error.message.includes('not_assigned_field_team')) return { error: 'not_your_team' };
  if (error.message.includes('note_too_long')) return { error: 'note_too_long' };
  return { error: 'unknown' };
}
