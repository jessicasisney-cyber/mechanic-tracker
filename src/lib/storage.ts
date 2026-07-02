export function isBlobConfigured() {
  return !!process.env.BLOB_READ_WRITE_TOKEN;
}

export const MAX_PHOTO_BYTES = 8 * 1024 * 1024;
export const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];
