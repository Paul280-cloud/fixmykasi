
import { supabase } from './supabase';
import type { FaultCategory, FaultStatus } from './faults';

export type FaultPhoto = {
  id: string;
  kind: 'before' | 'after';
  url: string;
  createdAt: string;
};

export type FaultTimelineEvent = {
  id: string;
  fromStatus: FaultStatus | null;
  toStatus: FaultStatus;
  note: string | null;
  createdAt: string;
  fieldTeamName: string | null;
};

export type FaultDetails = {
  id: string;
  reference: string;
  faultTypeName: string;
  category: FaultCategory;
  status: FaultStatus;
  isUrgent: boolean;
  isOverdue: boolean;
  isDelayed: boolean;
  delayReason: string | null;
  description: string;
  streetAddress: string;
  landmark: string | null;
  wardName: string;
  municipality: string;
  dueDate: string | null;
  estimatedDays: number | null;
  fieldTeam: {
    name: string;
    kind: 'municipal' | 'contractor';
  } | null;
  photos: FaultPhoto[];
  timeline: FaultTimelineEvent[];
};

/**
 * Public S5 data only.
 *
 * This service deliberately does not request:
 * - faults.reporter_id
 * - status_changes.changed_by
 * - status_changes.reopen_reason
 * - field_teams.contact_phone
 *
 * Those fields are private under BR16.
 */
export async function getFaultDetails(
  reference: string,
): Promise<FaultDetails | null> {
  // 1. Load the public fault record using its reference number.
  const { data: fault, error: faultError } = await supabase
    .from('faults_public')
    .select(
      `id,
       reference_number,
       ward_id,
       fault_type_id,
       is_urgent,
       description,
       street_address,
       landmark,
       status,
       field_team_id,
       due_date,
       estimated_days,
       is_delayed,
       delay_reason,
       is_overdue`,
    )
    .eq('reference_number', reference)
    .maybeSingle();

  if (faultError) throw faultError;
  if (!fault) return null;

  // 2. Load the public related records in parallel.
  const [typeResult, wardResult, photoResult, historyResult] =
    await Promise.all([
      supabase
        .from('fault_types')
        .select('id, name, category')
        .eq('id', fault.fault_type_id)
        .maybeSingle(),

      supabase
        .from('wards')
        .select('id, name, municipality')
        .eq('id', fault.ward_id)
        .maybeSingle(),

      supabase
        .from('fault_photos')
        .select('id, kind, storage_path, created_at')
        .eq('fault_id', fault.id)
        .order('created_at', { ascending: true }),

      supabase
        .from('status_changes')
        .select(
          'id, from_status, to_status, note, created_at, field_team_id',
        )
        .eq('fault_id', fault.id)
        .order('created_at', { ascending: false }),
    ]);

  if (typeResult.error) throw typeResult.error;
  if (wardResult.error) throw wardResult.error;
  if (photoResult.error) throw photoResult.error;
  if (historyResult.error) throw historyResult.error;

  const faultType = typeResult.data;
  const ward = wardResult.data;
  const photos = photoResult.data ?? [];
  const history = historyResult.data ?? [];

  // 3. Collect the current and historical team IDs.
  // Historical IDs let the timeline identify the team for each change.
  const teamIds = [
    ...new Set(
      [
        fault.field_team_id,
        ...history.map((event) => event.field_team_id),
      ].filter((id): id is string => Boolean(id)),
    ),
  ];

  // Only safe public team columns are selected. Never request contact_phone.
  let teams: {
    id: string;
    name: string;
    kind: 'municipal' | 'contractor';
  }[] = [];

  if (teamIds.length > 0) {
    const { data, error } = await supabase
      .from('field_teams')
      .select('id, name, kind')
      .in('id', teamIds);

    if (error) throw error;

    teams = (data ?? []).map((team) => ({
      id: team.id,
      name: team.name,
      kind: team.kind as 'municipal' | 'contractor',
    }));
  }

  const teamById = new Map(teams.map((team) => [team.id, team]));

  // 4. Convert stored photo paths into public image URLs.
  const mappedPhotos: FaultPhoto[] = photos.map((photo) => ({
    id: photo.id,
    kind: photo.kind as 'before' | 'after',
    url: supabase.storage
      .from('fault-photos')
      .getPublicUrl(photo.storage_path).data.publicUrl,
    createdAt: photo.created_at,
  }));

  // 5. Map status history. The query is already newest first.
  // changed_by and reopen_reason are intentionally never selected.
  const timeline: FaultTimelineEvent[] = history.map((event) => ({
    id: event.id,
    fromStatus: event.from_status as FaultStatus | null,
    toStatus: event.to_status as FaultStatus,
    note: event.note,
    createdAt: event.created_at,
    fieldTeamName: event.field_team_id
      ? teamById.get(event.field_team_id)?.name ?? null
      : null,
  }));

  const currentTeam = fault.field_team_id
    ? teamById.get(fault.field_team_id)
    : undefined;

  // 6. Return the screen-friendly model.
  return {
    id: fault.id,
    reference: fault.reference_number,
    faultTypeName: faultType?.name ?? 'Unknown fault type',
    category: (faultType?.category ?? 'public_spaces') as FaultCategory,
    status: fault.status as FaultStatus,
    isUrgent: fault.is_urgent,
    isOverdue: fault.is_overdue,
    isDelayed: fault.is_delayed,
    delayReason: fault.delay_reason,
    description: fault.description,
    streetAddress: fault.street_address,
    landmark: fault.landmark,
    wardName: ward?.name ?? 'Unknown ward',
    municipality: ward?.municipality ?? '',
    dueDate: fault.due_date,
    estimatedDays: fault.estimated_days,
    fieldTeam: currentTeam
      ? {
          name: currentTeam.name,
          kind: currentTeam.kind,
        }
      : null,
    photos: mappedPhotos,
    timeline,
  };
}
