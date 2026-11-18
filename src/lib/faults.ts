// The only place S6 talks to the faults tables (#11) and the fault-photos
// bucket (#14). Screens get simple results and error codes back, and tests
// mock this module.
import { supabase } from './supabase';

export type FaultCategory =
  | 'roads'
  | 'clean_water'
  | 'sewer'
  | 'electricity'
  | 'waste'
  | 'public_spaces';

export const CATEGORIES: FaultCategory[] = [
  'roads',
  'clean_water',
  'sewer',
  'electricity',
  'waste',
  'public_spaces',
];

export type FaultType = {
  id: string;
  category: FaultCategory;
  name: string;
  autoUrgent: boolean;
};

export type NewFault = {
  wardId: string;
  faultTypeId: string;
  isUrgent: boolean;
  noPhotoSafe: boolean;
  description: string;
  streetAddress: string;
  landmark: string;
  latitude: number | null;
  longitude: number | null;
};

export type ReportError = 'too_many_reports' | 'photo_required' | 'upload_failed' | 'save_failed';

export async function getFaultTypes(): Promise<FaultType[]> {
  const { data, error } = await supabase
    .from('fault_types')
    .select('id, category, name, auto_urgent')
    .order('name');
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    category: row.category as FaultCategory,
    name: row.name,
    autoUrgent: row.auto_urgent,
  }));
}

/** The resident's home ward, used as the default ward on S6 (BR3). */
export async function getHomeWardId(userId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('ward_id')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  return data?.ward_id ?? null;
}

/** Uploads one photo to the fault-photos bucket. Paths come from the screen. */
export async function uploadPhoto(path: string, photo: Blob): Promise<void> {
  const { error } = await supabase.storage
    .from('fault-photos')
    .upload(path, photo, { contentType: 'image/jpeg', upsert: false });
  if (error) throw error;
}

/**
 * Saves a report (plan question 8). The photos are uploaded first to
 * before/<uuid>.jpg. Then submit_fault() saves the fault and links its photos
 * in one database transaction: either both are saved or neither is, so
 * "Try again" never makes a second fault. The database also refuses a fault
 * with no photo unless it is "not safe" (BR2), and sets the reference number
 * (BR1), the 5-a-day limit (BR17) and auto urgent (BR19).
 */
export async function submitReport(
  fault: NewFault,
  photos: Blob[],
): Promise<{ reference?: string; error?: ReportError }> {
  const paths = photos.map(() => `before/${crypto.randomUUID()}.jpg`);
  try {
    await Promise.all(photos.map((photo, index) => uploadPhoto(paths[index], photo)));
  } catch {
    return { error: 'upload_failed' };
  }

  const { data, error } = await supabase.rpc('submit_fault', {
    p_id: crypto.randomUUID(),
    p_ward_id: fault.wardId,
    p_fault_type_id: fault.faultTypeId,
    p_is_urgent: fault.isUrgent,
    p_no_photo_safe: fault.noPhotoSafe,
    p_description: fault.description.trim(),
    p_street_address: fault.streetAddress.trim(),
    p_landmark: fault.landmark.trim() || null,
    p_latitude: fault.latitude,
    p_longitude: fault.longitude,
    p_photo_paths: paths,
  });
  if (error) {
    if (error.message.includes('too_many_reports')) return { error: 'too_many_reports' };
    if (error.message.includes('photo_required')) return { error: 'photo_required' };
    return { error: 'save_failed' };
  }
  return { reference: data as string };
}

// ---- S8 Ward queue (#19) ----------------------------------------------------------

export type FaultStatus =
  | 'received'
  | 'viewed'
  | 'assigned'
  | 'scheduled'
  | 'in_progress'
  | 'fixed'
  | 'closed'
  | 'reopened';

/** One row of the S8 list. Only what the screen shows, nothing private (BR16). */
export type QueueFault = {
  id: string;
  reference: string;
  faultTypeId: string;
  streetAddress: string;
  status: FaultStatus;
  isUrgent: boolean;
  isOverdue: boolean;
  createdAt: string;
};

/** Every fault in one ward that is not Closed, in BR7 order. */
export async function getWardQueue(wardId: string): Promise<QueueFault[]> {
  const { data, error } = await supabase
    .from('faults_public')
    .select('id, reference_number, fault_type_id, street_address, status, is_urgent, is_overdue, created_at')
    .eq('ward_id', wardId)
    .neq('status', 'closed')
    // BR7: urgent first, then most upvotes, then oldest report first.
    .order('is_urgent', { ascending: false })
    .order('upvote_count', { ascending: false })
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    reference: row.reference_number,
    faultTypeId: row.fault_type_id,
    streetAddress: row.street_address,
    status: row.status as FaultStatus,
    isUrgent: row.is_urgent,
    isOverdue: row.is_overdue,
    createdAt: row.created_at,
  }));
}
