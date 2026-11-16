import { submitReport, type NewFault } from '../../src/lib/faults';
import { supabase } from '../../src/lib/supabase';

vi.mock('../../src/lib/supabase', () => ({
  supabase: { from: vi.fn(), storage: { from: vi.fn() } },
}));

// submitReport (S6, plan question 8): upload photos, save the fault, link the photos.

const FAULT: NewFault = {
  wardId: 'ward-a',
  faultTypeId: 'pothole',
  isUrgent: false,
  noPhotoSafe: false,
  description: 'Big pothole in the left lane since Monday.',
  streetAddress: '23 Vilakazi Street, Orlando West',
  landmark: '',
  latitude: null,
  longitude: null,
};

const PHOTO = new Blob(['x'], { type: 'image/jpeg' });

function setUp({ photoRowsError = null }: { photoRowsError?: { message: string } | null } = {}) {
  const upload = vi.fn().mockResolvedValue({ error: null });
  vi.mocked(supabase.storage.from).mockReturnValue({ upload } as never);

  const insertPhotos = vi.fn().mockResolvedValue({ error: photoRowsError });
  const single = vi.fn().mockResolvedValue({ data: { reference_number: 'FMK-2026-00125' }, error: null });
  const insertFault = vi.fn(() => ({ select: () => ({ single }) }));
  vi.mocked(supabase.from).mockImplementation(
    (table: string) => ({ insert: table === 'faults' ? insertFault : insertPhotos }) as never,
  );
  return { upload, insertFault, insertPhotos };
}

describe('submitReport', () => {
  it('uploads the photo, saves the fault and links the photo to it', async () => {
    const { upload, insertFault, insertPhotos } = setUp();

    const result = await submitReport(FAULT, [PHOTO]);

    expect(result).toEqual({ reference: 'FMK-2026-00125' });
    const path = upload.mock.calls[0][0] as string;
    expect(path).toMatch(/^before\/[0-9a-f-]{36}\.jpg$/);
    const savedId = (insertFault.mock.calls[0] as unknown as [{ id: string }])[0].id;
    expect(insertPhotos).toHaveBeenCalledWith([{ fault_id: savedId, kind: 'before', storage_path: path }]);
  });

  it('reports photosNotAttached when the fault saves but linking the photos fails', async () => {
    setUp({ photoRowsError: { message: 'new row violates row-level security policy' } });

    const result = await submitReport(FAULT, [PHOTO]);

    expect(result).toEqual({ reference: 'FMK-2026-00125', photosNotAttached: true });
  });

  it('does not try to link photos for a "not safe" report with no photos', async () => {
    const { upload, insertPhotos } = setUp();

    const result = await submitReport({ ...FAULT, noPhotoSafe: true }, []);

    expect(result).toEqual({ reference: 'FMK-2026-00125' });
    expect(upload).not.toHaveBeenCalled();
    expect(insertPhotos).not.toHaveBeenCalled();
  });
});
