import {
  addPhoto,
  checkPhoto,
  compressToTarget,
  fitWithin,
  MAX_PHOTO_BYTES,
  PHOTO_ERROR_TEXT,
  TARGET_BYTES,
} from '../../src/lib/photo';

function photo(name: string, type: string, size = 1000): File {
  const file = new File(['x'], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
}

function blobOfSize(size: number): Blob {
  const blob = new Blob(['x'], { type: 'image/jpeg' });
  Object.defineProperty(blob, 'size', { value: size });
  return blob;
}

describe('T-BR2-5: HEIC and HEIF photos are rejected (plan decision 3)', () => {
  it.each([
    ['image/heic type', photo('IMG_0001.heic', 'image/heic')],
    ['image/heif type', photo('IMG_0002.heif', 'image/heif')],
    ['.heic name with an empty type', photo('IMG_0003.heic', '')],
    ['.HEIF name with an empty type', photo('IMG_0004.HEIF', '')],
  ])('rejects a photo with %s and never resizes or uploads it', async (_label, file) => {
    const upload = vi.fn();
    const resize = vi.fn();

    const result = await addPhoto(file, upload, resize);

    expect(result.error).toBe('heic_not_supported');
    expect(PHOTO_ERROR_TEXT[result.error!]).toBe('Please choose a JPG or PNG photo.');
    expect(resize).not.toHaveBeenCalled();
    expect(upload).not.toHaveBeenCalled();
  });
});

describe('checkPhoto (BR2)', () => {
  it('accepts JPG and PNG photos up to 10 MB', () => {
    expect(checkPhoto(photo('a.jpg', 'image/jpeg'))).toBeNull();
    expect(checkPhoto(photo('b.png', 'image/png'))).toBeNull();
    expect(checkPhoto(photo('c.jpeg', '', MAX_PHOTO_BYTES))).toBeNull();
  });

  it('rejects a photo over 10 MB', () => {
    expect(checkPhoto(photo('big.jpg', 'image/jpeg', MAX_PHOTO_BYTES + 1))).toBe('too_big_or_unsupported');
  });

  it('rejects other file types, including WebP (deferred)', () => {
    expect(checkPhoto(photo('a.webp', 'image/webp'))).toBe('too_big_or_unsupported');
    expect(checkPhoto(photo('a.gif', 'image/gif'))).toBe('too_big_or_unsupported');
    expect(checkPhoto(photo('notes.pdf', 'application/pdf'))).toBe('too_big_or_unsupported');
  });
});

describe('fitWithin (BR2: longest side at most 1600 px)', () => {
  it('scales a large landscape photo down to 1600 px wide', () => {
    expect(fitWithin(4000, 3000)).toEqual({ width: 1600, height: 1200 });
  });

  it('scales a large portrait photo down to 1600 px high', () => {
    expect(fitWithin(3000, 4000)).toEqual({ width: 1200, height: 1600 });
  });

  it('never makes a small photo bigger', () => {
    expect(fitWithin(800, 600)).toEqual({ width: 800, height: 600 });
  });
});

describe('compressToTarget (BR2: under 500 KB)', () => {
  it('stops at the first quality that gives a result under 500 KB', async () => {
    const encode = vi.fn(async (quality: number) => blobOfSize(quality > 0.7 ? TARGET_BYTES * 2 : 300_000));

    const result = await compressToTarget(encode);

    expect(result.size).toBe(300_000);
    expect(encode.mock.calls.map(([quality]) => quality)).toEqual([0.85, 0.75, 0.65]);
  });

  it('keeps the first result when it is already small enough', async () => {
    const encode = vi.fn(async () => blobOfSize(100_000));

    await compressToTarget(encode);

    expect(encode).toHaveBeenCalledTimes(1);
  });
});

describe('addPhoto', () => {
  it('resizes a JPG and uploads it to before/<uuid>.jpg', async () => {
    const resized = blobOfSize(200_000);
    const upload = vi.fn(async () => {});
    const resize = vi.fn(async () => resized);

    const result = await addPhoto(photo('pothole.jpg', 'image/jpeg'), upload, resize);

    expect(result.path).toMatch(/^before\/[0-9a-f-]{36}\.jpg$/);
    expect(upload).toHaveBeenCalledWith(result.path, resized);
  });

  it('does not upload a photo that is too big', async () => {
    const upload = vi.fn();

    const result = await addPhoto(photo('big.png', 'image/png', MAX_PHOTO_BYTES + 1), upload, vi.fn());

    expect(result.error).toBe('too_big_or_unsupported');
    expect(upload).not.toHaveBeenCalled();
  });
});
