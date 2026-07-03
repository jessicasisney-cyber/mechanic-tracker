export function isBlobConfigured() {
  // Vercel connects Blob stores either via a static BLOB_READ_WRITE_TOKEN,
  // or the newer OIDC-based connection, which only sets BLOB_STORE_ID
  // (the actual short-lived credential is injected automatically at runtime).
  return !!(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);
}

export const MAX_PHOTO_BYTES = 8 * 1024 * 1024;
export const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];
