/**
 * QR Studio — Input & File Security Validators
 * Enforces magic-byte verification, file size quotas, and dimension limits
 * to prevent memory exhaustion, decompression bombs, and malicious file injection.
 */

export const IMAGE_LIMITS = {
  MAX_FILE_SIZE_BYTES: 25 * 1024 * 1024, // 25 MB
  MAX_BATCH_SIZE_BYTES: 100 * 1024 * 1024, // 100 MB
  MAX_BATCH_COUNT: 50,
  MAX_DIMENSION_PX: 8192,
  MAX_PIXELS: 32_000_000, // 32 MegaPixels
};

export const PDF_LIMITS = {
  MAX_FILE_SIZE_BYTES: 50 * 1024 * 1024, // 50 MB
  MAX_BATCH_SIZE_BYTES: 150 * 1024 * 1024, // 150 MB
  MAX_BATCH_COUNT: 30,
};

export const LOGO_LIMITS = {
  MAX_FILE_SIZE_BYTES: 5 * 1024 * 1024, // 5 MB
  MAX_DIMENSION_PX: 2048,
};

/**
 * Checks magic bytes of a Uint8Array or ArrayBuffer against known image signatures.
 * @param {Uint8Array} bytes
 * @returns {{ format: string|null, isValid: boolean }}
 */
export function detectImageSignature(bytes) {
  if (!bytes || bytes.length < 4) {
    return { format: null, isValid: false };
  }

  // JPEG: FF D8 FF
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { format: 'jpeg', isValid: true };
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return { format: 'png', isValid: true };
  }

  // WebP: RIFF .... WEBP
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 && // 'RIFF'
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50 // 'WEBP'
  ) {
    return { format: 'webp', isValid: true };
  }

  // SVG (XML / SVG text header check)
  // Check for '<svg' or '<?xml' within first 512 bytes
  const headerSlice = String.fromCharCode(...bytes.slice(0, Math.min(bytes.length, 512)));
  if (/<svg[\s>]/i.test(headerSlice) || (/<\?xml/i.test(headerSlice) && /<svg/i.test(headerSlice))) {
    return { format: 'svg', isValid: true };
  }

  return { format: null, isValid: false };
}

/**
 * Checks if bytes start with '%PDF-' (0x25 0x50 0x44 0x46 0x2D).
 * @param {Uint8Array} bytes
 * @returns {boolean}
 */
export function isPdfSignature(bytes) {
  if (!bytes || bytes.length < 5) return false;
  return (
    bytes[0] === 0x25 && // %
    bytes[1] === 0x50 && // P
    bytes[2] === 0x44 && // D
    bytes[3] === 0x46 && // F
    bytes[4] === 0x2d // -
  );
}

/**
 * Validates image dimensions against decompression bombs.
 * @param {number} width
 * @param {number} height
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateImageDimensions(width, height) {
  if (!width || !height || width <= 0 || height <= 0) {
    return { valid: false, error: 'Invalid image dimensions.' };
  }

  if (width > IMAGE_LIMITS.MAX_DIMENSION_PX || height > IMAGE_LIMITS.MAX_DIMENSION_PX) {
    return {
      valid: false,
      error: `Image dimension exceeds ${IMAGE_LIMITS.MAX_DIMENSION_PX}px limit (${width}×${height}px).`,
    };
  }

  const totalPixels = width * height;
  if (totalPixels > IMAGE_LIMITS.MAX_PIXELS) {
    return {
      valid: false,
      error: `Image resolution exceeds 32 Megapixels limit (${Math.round(totalPixels / 1_000_000)} MP).`,
    };
  }

  return { valid: true };
}

/**
 * Sanitizes plain text for safe rendering in text-only contexts.
 * @param {string} str
 * @returns {string}
 */
export function sanitizeText(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[<>"'&]/g, (char) => {
    switch (char) {
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      case "'":
        return '&#39;';
      case '&':
        return '&amp;';
      default:
        return char;
    }
  });
}
