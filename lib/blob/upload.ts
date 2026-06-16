import { put } from '@vercel/blob';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

export class UploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UploadError';
  }
}

export async function uploadImage(file: File, folder: string): Promise<string> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new UploadError(
      `Invalid file type "${file.type}". Accepted: JPEG, PNG, WebP, GIF.`,
    );
  }
  if (file.size > MAX_BYTES) {
    throw new UploadError(
      `File is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum is 10 MB.`,
    );
  }

  const ext = file.name.split('.').pop() ?? 'jpg';
  const filename = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const blob = await put(filename, file, { access: 'public' });
  return blob.url;
}
