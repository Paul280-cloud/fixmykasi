// Photo util for fault photos (Issue #14, PRD BR2, plan decision 3).
//
// 1. checkPhoto: JPG or PNG only, at most 10 MB. HEIC/HEIF gets its own message.
// 2. resizePhoto: longest side at most 1600 px, re-encoded as JPEG under 500 KB.
//    Drawing to a canvas and re-encoding drops all EXIF data, including location.
// 3. addPhoto: checks, resizes and uploads to before/<uuid>.jpg. Nothing is
//    resized or uploaded when the check fails.
// The upload is passed in, so this file does not depend on the Supabase client.

export const MAX_PHOTO_BYTES = 10 * 1024 * 1024;
export const MAX_SIDE_PX = 1600;
export const TARGET_BYTES = 500 * 1024;

export type PhotoError = 'heic_not_supported' | 'too_big_or_unsupported';

// English text from plan decision 3 and PRD 8.3 (S6). The screen (#13) can
// move these into the i18n files. The second message still names HEIC and
// WebP: plan question 27 asks the team to update that wording.
export const PHOTO_ERROR_TEXT: Record<PhotoError, string> = {
  heic_not_supported: 'Please choose a JPG or PNG photo.',
  too_big_or_unsupported:
    'This photo is too big or not a supported type. Use a JPG, PNG, HEIC or WebP under 10 MB.',
};

const ALLOWED_TYPES = ['image/jpeg', 'image/png'];
const HEIC_TYPES = ['image/heic', 'image/heif'];

function extension(name: string): string {
  const dot = name.lastIndexOf('.');
  return dot === -1 ? '' : name.slice(dot + 1).toLowerCase();
}

function isHeic(file: File): boolean {
  if (HEIC_TYPES.includes(file.type)) return true;
  // Some phones give HEIC files an empty type, so check the name too.
  return file.type === '' && ['heic', 'heif'].includes(extension(file.name));
}

function isAllowedType(file: File): boolean {
  if (ALLOWED_TYPES.includes(file.type)) return true;
  return file.type === '' && ['jpg', 'jpeg', 'png'].includes(extension(file.name));
}

/** Returns why a photo cannot be used, or null when it is fine. */
export function checkPhoto(file: File): PhotoError | null {
  if (isHeic(file)) return 'heic_not_supported';
  if (!isAllowedType(file) || file.size > MAX_PHOTO_BYTES) return 'too_big_or_unsupported';
  return null;
}

/** Scales width and height down so the longest side is at most maxSide. Never scales up. */
export function fitWithin(width: number, height: number, maxSide = MAX_SIDE_PX) {
  const scale = Math.min(1, maxSide / Math.max(width, height));
  return { width: Math.round(width * scale), height: Math.round(height * scale) };
}

export type Encoder = (quality: number) => Promise<Blob>;

/**
 * Encodes at falling JPEG quality until the result is under the target size.
 * Returns the smallest attempt if even the lowest quality is too big.
 */
export async function compressToTarget(encode: Encoder, target = TARGET_BYTES): Promise<Blob> {
  const qualities = [0.85, 0.75, 0.65, 0.55, 0.45, 0.35];
  let blob = await encode(qualities[0]);
  for (const quality of qualities.slice(1)) {
    if (blob.size < target) break;
    blob = await encode(quality);
  }
  return blob;
}

/** Resizes and re-encodes a photo in the browser. EXIF is not copied to the result. */
export async function resizePhoto(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  const { width, height } = fitWithin(bitmap.width, bitmap.height);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas is not available');
  // White background so transparent PNG areas do not turn black in the JPEG.
  context.fillStyle = '#FFFFFF';
  context.fillRect(0, 0, width, height);
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  return compressToTarget(
    (quality) =>
      new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) => (blob ? resolve(blob) : reject(new Error('Could not encode photo'))),
          'image/jpeg',
          quality,
        );
      }),
  );
}

export type UploadPhoto = (path: string, photo: Blob) => Promise<void>;

export type AddPhotoResult = { path: string; error?: undefined } | { path?: undefined; error: PhotoError };

/** Checks, resizes and uploads a resident's photo to the fault-photos bucket (before/ folder). */
export async function addPhoto(
  file: File,
  upload: UploadPhoto,
  resize: (file: File) => Promise<Blob> = resizePhoto,
): Promise<AddPhotoResult> {
  const error = checkPhoto(file);
  if (error) return { error };
  const photo = await resize(file);
  const path = `before/${crypto.randomUUID()}.jpg`;
  await upload(path, photo);
  return { path };
}
