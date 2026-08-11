const EXTENSION = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' };

/**
 * Downscale and re-encode an image in the browser, before upload.
 *
 * Shared by product photos and brand logos because the mechanics — decode,
 * scale, draw, re-encode, keep whichever is smaller — are identical. Only the
 * policy differs, and that is what the options are for:
 *
 *   type              output format. JPEG flattens transparency onto black, so
 *                     anything that may have an alpha channel must ask for PNG.
 *   fitBy             'width' bounds the width only; 'longest' bounds whichever
 *                     side is larger, which is what keeps a tall logo in range.
 *   rawLimit          below this size an already-small-enough file is uploaded
 *                     untouched rather than re-encoded for nothing.
 *   passThroughVector leave SVG alone — rasterising a vector logo throws away
 *                     the entire reason to use one.
 *
 * Anything undecodable is returned as-is and left for the server to reject.
 */
export async function resizeImage(file, {
  maxPx = 1200,
  quality = 0.8,
  type = 'image/jpeg',
  fitBy = 'width',
  rawLimit = 0,
  passThroughVector = false,
} = {}) {
  if (!file.type?.startsWith('image/')) return file;
  if (passThroughVector && file.type === 'image/svg+xml') return file;

  let bitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return file;
  }

  const measured = fitBy === 'longest' ? Math.max(bitmap.width, bitmap.height) : bitmap.width;
  const scale = Math.min(1, maxPx / measured);
  if (scale === 1 && file.size <= rawLimit) {
    bitmap.close?.();
    return file;
  }

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close?.();

  const blob = await new Promise((res) => canvas.toBlob(res, type, quality));
  if (!blob || blob.size >= file.size) return file;
  return new File([blob], file.name.replace(/\.\w+$/, EXTENSION[type] ?? '.jpg'), { type });
}
