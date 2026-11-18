import { submitReport, type NewFault } from '../../src/lib/faults';
import { supabase } from '../../src/lib/supabase';

vi.mock('../../src/lib/supabase', () => ({
  supabase: { rpc: vi.fn(), storage: { from: vi.fn() } },
}));

// submitReport (S6, plan question 8): upload the photos, then save the fault
// and link its photos in one call to submit_fault().

const FAULT: NewFault = {
  wardId: 'ward-a',
  faultTypeId: 'pothole',
  isUrgent: false,
  noPhotoSafe: false,
  description: '  Big pothole in the left lane since Monday.  ',
  streetAddress: ' 23 Vilakazi Street, Orlando West ',
  landmark: '  ',
  latitude: null,
  longitude: null,
};

const PHOTO = new Blob(['x'], { type: 'image/jpeg' });

function setUp({
  uploadError = null,
  rpcResult = { data: 'FMK-2026-00125', error: null },
}: {
  uploadError?: { message: string } | null;
  rpcResult?: { data: string | null; error: { message: string } | null };
} = {}) {
  const upload = vi.fn().mockResolvedValue({ error: uploadError });
  vi.mocked(supabase.storage.from).mockReturnValue({ upload } as never);
  vi.mocked(supabase.rpc).mockResolvedValue(rpcResult as never);
  return { upload };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('submitReport', () => {
  it('uploads the photo, then saves the fault and its photo in one submit_fault call', async () => {
    const { upload } = setUp();

    const result = await submitReport(FAULT, [PHOTO]);

    expect(result).toEqual({ reference: 'FMK-2026-00125' });
    const path = upload.mock.calls[0][0] as string;
    expect(path).toMatch(/^before\/[0-9a-f-]{36}\.jpg$/);
    expect(supabase.rpc).toHaveBeenCalledTimes(1);
    expect(supabase.rpc).toHaveBeenCalledWith(
      'submit_fault',
      expect.objectContaining({
        p_ward_id: 'ward-a',
        p_fault_type_id: 'pothole',
        p_no_photo_safe: false,
        p_description: 'Big pothole in the left lane since Monday.',
        p_street_address: '23 Vilakazi Street, Orlando West',
        p_landmark: null,
        p_photo_paths: [path],
      }),
    );
  });

  it('does not save anything when a photo upload fails', async () => {
    setUp({ uploadError: { message: 'network' } });

    const result = await submitReport(FAULT, [PHOTO]);

    expect(result).toEqual({ error: 'upload_failed' });
    expect(supabase.rpc).not.toHaveBeenCalled();
  });

  it('returns photo_required when the database refuses a report with no photo (BR2)', async () => {
    setUp({ rpcResult: { data: null, error: { message: 'photo_required' } } });

    expect(await submitReport(FAULT, [])).toEqual({ error: 'photo_required' });
  });

  it('returns too_many_reports at the 5-a-day limit (BR17)', async () => {
    setUp({ rpcResult: { data: null, error: { message: 'too_many_reports' } } });

    expect(await submitReport(FAULT, [PHOTO])).toEqual({ error: 'too_many_reports' });
  });

  it('returns save_failed for any other error, e.g. a photo that cannot be linked', async () => {
    setUp({ rpcResult: { data: null, error: { message: 'new row violates check constraint' } } });

    expect(await submitReport(FAULT, [PHOTO])).toEqual({ error: 'save_failed' });
  });

  it('sends no photos for a "not safe" report', async () => {
    const { upload } = setUp();

    await submitReport({ ...FAULT, noPhotoSafe: true }, []);

    expect(upload).not.toHaveBeenCalled();
    expect(supabase.rpc).toHaveBeenCalledWith(
      'submit_fault',
      expect.objectContaining({ p_no_photo_safe: true, p_photo_paths: [] }),
    );
  });
});
