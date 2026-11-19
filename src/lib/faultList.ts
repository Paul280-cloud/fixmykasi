// The only place S4 Fault list talks to the database (#12, small version).
// faults_public is readable by everyone, visitors too, and has no reporter
// details (BR16). The tests mock this file.
import type { FaultStatus } from './faults';
import { supabase } from './supabase';

export type ListFault = {
  id: string;
  reference: string;
  faultTypeId: string;
  wardId: string;
  streetAddress: string;
  status: FaultStatus;
  isUrgent: boolean;
  isOverdue: boolean;
  upvotes: number;
  createdAt: string;
};

// BR6: 20 faults at a time. "Load more" comes later in #12.
export const PAGE_SIZE = 20;

/** The newest 20 faults (BR6 default sort "Newest"). */
export async function getFaultList(): Promise<ListFault[]> {
  const { data, error } = await supabase
    .from('faults_public')
    .select('id, reference_number, fault_type_id, ward_id, street_address, status, is_urgent, is_overdue, upvote_count, created_at')
    .order('created_at', { ascending: false })
    .limit(PAGE_SIZE);
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    reference: row.reference_number,
    faultTypeId: row.fault_type_id,
    wardId: row.ward_id,
    streetAddress: row.street_address,
    status: row.status as FaultStatus,
    isUrgent: row.is_urgent,
    isOverdue: row.is_overdue,
    upvotes: row.upvote_count,
    createdAt: row.created_at,
  }));
}
