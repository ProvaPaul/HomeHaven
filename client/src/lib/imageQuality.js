/**
 * Client-side image quality checks (no API needed):
 * - resolution floor
 * - blur detection via variance of a Laplacian filter
 * - exposure check via mean luminance
 * Returns { ok, warnings, skipped } — warnings are advisory, never blocking.
 */

const ANALYSIS_WIDTH = 256;
const MIN_WIDTH = 600;
const MIN_HEIGHT = 400;
const BLUR_VARIANCE_THRESHOLD = 60;
const DARK_MEAN = 45;
const BRIGHT_MEAN = 225;

const loadImage = (source) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    if (typeof source === 'string') {
      // Remote URL — needs CORS to read pixels; caller handles failure
      img.crossOrigin = 'anonymous';
      img.src = source;
    } else {
      img.src = URL.createObjectURL(source);
    }
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Could not load image'));
  });

export async function checkImageQuality(source) {
  let img;
  try {
    img = await loadImage(source);
  } catch {
    return { ok: true, warnings: [], skipped: true };
  }

  const warnings = [];
  const { naturalWidth: w, naturalHeight: h } = img;

  if (w < MIN_WIDTH || h < MIN_HEIGHT) {
    warnings.push(`low resolution (${w}×${h}) — aim for at least ${MIN_WIDTH}×${MIN_HEIGHT}`);
  }

  try {
    const scale = ANALYSIS_WIDTH / w;
    const cw = ANALYSIS_WIDTH;
    const ch = Math.max(1, Math.round(h * scale));
    const canvas = document.createElement('canvas');
    canvas.width = cw;
    canvas.height = ch;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(img, 0, 0, cw, ch);
    const { data } = ctx.getImageData(0, 0, cw, ch);

    // Grayscale
    const gray = new Float32Array(cw * ch);
    let sum = 0;
    for (let i = 0; i < cw * ch; i++) {
      const l = 0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2];
      gray[i] = l;
      sum += l;
    }
    const mean = sum / (cw * ch);

    if (mean < DARK_MEAN) warnings.push('image looks too dark');
    else if (mean > BRIGHT_MEAN) warnings.push('image looks overexposed');

    // Variance of Laplacian (4-neighbor) — low variance ⇒ blurry
    let lapSum = 0;
    let lapSqSum = 0;
    let count = 0;
    for (let y = 1; y < ch - 1; y++) {
      for (let x = 1; x < cw - 1; x++) {
        const i = y * cw + x;
        const lap = gray[i - 1] + gray[i + 1] + gray[i - cw] + gray[i + cw] - 4 * gray[i];
        lapSum += lap;
        lapSqSum += lap * lap;
        count++;
      }
    }
    const lapMean = lapSum / count;
    const variance = lapSqSum / count - lapMean * lapMean;
    if (variance < BLUR_VARIANCE_THRESHOLD) warnings.push('image may be blurry');
  } catch {
    // Cross-origin canvas taint or other read failure — skip pixel checks
    if (typeof source !== 'string') {
      // Local files should always be readable; treat failure as skip anyway
    }
    return { ok: warnings.length === 0, warnings, skipped: true };
  } finally {
    if (typeof source !== 'string') URL.revokeObjectURL(img.src);
  }

  return { ok: warnings.length === 0, warnings, skipped: false };
}
