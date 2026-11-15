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

export type ReportError = 'too_many_reports' | 'upload_failed' | 'unknown';

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
 * Saves a report (plan question 8): the photos are uploaded first to
 * before/<uuid>.jpg, then the fault row is saved with an id made here, then
 * the photo rows link the two. The database sets the reference number (BR1),
 * the 5-a-day limit (BR17) and auto urgent (BR19).
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

  const id = crypto.randomUUID();
  const { data, error } = await supabase
    .from('faults')
    .insert({
      id,
      ward_id: fault.wardId,
      fault_type_id: fault.faultTypeId,
      is_urgent: fault.isUrgent,
      no_photo_safe: fault.noPhotoSafe,
      description: fault.description.trim(),
      street_address: fault.streetAddress.trim(),
      landmark: fault.landmark.trim() || null,
      latitude: fault.latitude,
      longitude: fault.longitude,
    })
    .select('reference_number')
    .single();
  if (error) {
    return { error: error.message.includes('too_many_reports') ? 'too_many_reports' : 'unknown' };
  }

  if (paths.length > 0) {
    const { error: photoError } = await supabase
      .from('fault_photos')
      .insert(paths.map((storage_path) => ({ fault_id: id, kind: 'before', storage_path })));
    // The fault is saved, so still give the reference number. Trying again
    // would make a second fault and count towards the 5-a-day limit.
    if (photoError) console.error('Fault saved but its photos were not linked', photoError);
  }

  return { reference: data.reference_number };
}
