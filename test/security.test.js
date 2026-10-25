import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  IMAGE_LIMITS,
  PDF_LIMITS,
  LOGO_LIMITS,
  detectImageSignature,
  isPdfSignature,
  validateImageDimensions,
  sanitizeText,
} from '../src/validators.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

test('Security Audit: Resource limit constants are strictly enforced', () => {
  assert.equal(IMAGE_LIMITS.MAX_FILE_SIZE_BYTES, 25 * 1024 * 1024, 'Max image size must be 25 MB');
  assert.equal(IMAGE_LIMITS.MAX_BATCH_COUNT, 50, 'Max image batch count must be 50');
  assert.equal(IMAGE_LIMITS.MAX_BATCH_SIZE_BYTES, 100 * 1024 * 1024, 'Max image batch size must be 100 MB');
  assert.equal(IMAGE_LIMITS.MAX_DIMENSION_PX, 8192, 'Max dimension must be 8192px');
  assert.equal(IMAGE_LIMITS.MAX_PIXELS, 32_000_000, 'Max pixel count must be 32 Megapixels');

  assert.equal(PDF_LIMITS.MAX_FILE_SIZE_BYTES, 50 * 1024 * 1024, 'Max PDF file size must be 50 MB');
  assert.equal(PDF_LIMITS.MAX_BATCH_COUNT, 30, 'Max PDF batch count must be 30');
  assert.equal(PDF_LIMITS.MAX_BATCH_SIZE_BYTES, 150 * 1024 * 1024, 'Max PDF batch size must be 150 MB');

  assert.equal(LOGO_LIMITS.MAX_FILE_SIZE_BYTES, 5 * 1024 * 1024, 'Max logo size must be 5 MB');
  assert.equal(LOGO_LIMITS.MAX_DIMENSION_PX, 2048, 'Max logo dimension must be 2048px');
});

test('Magic Bytes Validation: Genuine JPEG images', () => {
  const validJpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
  const res = detectImageSignature(validJpeg);
  assert.equal(res.isValid, true);
  assert.equal(res.format, 'jpeg');
});

test('Magic Bytes Validation: Genuine PNG images', () => {
  const validPng = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);
  const res = detectImageSignature(validPng);
  assert.equal(res.isValid, true);
  assert.equal(res.format, 'png');
});

test('Magic Bytes Validation: Genuine WebP images', () => {
  const validWebp = new Uint8Array([
    0x52, 0x49, 0x46, 0x46, // RIFF
    0x24, 0x00, 0x00, 0x00, // length
    0x57, 0x45, 0x42, 0x50, // WEBP
    0x56, 0x50, 0x38, 0x20,
  ]);
  const res = detectImageSignature(validWebp);
  assert.equal(res.isValid, true);
  assert.equal(res.format, 'webp');
});

test('Magic Bytes Validation: Rejects disguised non-images or executables', () => {
  // ELF / EXE binary masquerading as image
  const fakeImage1 = new Uint8Array([0x7f, 0x45, 0x4c, 0x46, 0x02, 0x01]);
  assert.equal(detectImageSignature(fakeImage1).isValid, false);

  // Script or text masquerading as image
  const fakeImage2 = new TextEncoder().encode('<script>alert("xss")</script>');
  assert.equal(detectImageSignature(fakeImage2).isValid, false);

  // Null or too-short buffers
  assert.equal(detectImageSignature(new Uint8Array([0x00, 0x01])).isValid, false);
});

test('PDF Signature: Genuine %PDF- header check', () => {
  const validPdfHeader = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37]); // %PDF-1.7
  assert.equal(isPdfSignature(validPdfHeader), true);

  const invalidHeader = new Uint8Array([0x50, 0x4b, 0x03, 0x04]); // Zip / DOCX header
  assert.equal(isPdfSignature(invalidHeader), false);
});

test('Decompression Bomb & Dimension Protections', () => {
  // Normal dimensions
  assert.equal(validateImageDimensions(1920, 1080).valid, true);
  assert.equal(validateImageDimensions(4000, 3000).valid, true);

  // Exceeds max single dimension (8192px)
  const tooWide = validateImageDimensions(9000, 1000);
  assert.equal(tooWide.valid, false);
  assert.match(tooWide.error, /exceeds 8192px/);

  // Exceeds 32 MP (e.g. 7000 x 6000 = 42 MP)
  const tooManyPixels = validateImageDimensions(7000, 6000);
  assert.equal(tooManyPixels.valid, false);
  assert.match(tooManyPixels.error, /exceeds 32 Megapixels/);

  // Invalid / Zero dimensions
  assert.equal(validateImageDimensions(0, 100).valid, false);
  assert.equal(validateImageDimensions(-5, -5).valid, false);
});

test('Text Sanitization: Escapes malicious characters', () => {
  const malicious = '<script>alert("xss")</script> & "quote" \'apostrophe\'';
  const clean = sanitizeText(malicious);
  assert.equal(clean.includes('<script>'), false);
  assert.equal(clean.includes('&lt;script&gt;'), true);
  assert.equal(clean.includes('&quot;quote&quot;'), true);
});

test('CSP & HTTP Headers: vercel.json configuration audit', () => {
  const vercelConfigPath = path.join(rootDir, 'vercel.json');
  assert.equal(fs.existsSync(vercelConfigPath), true);

  const vercel = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf8'));
  const headers = vercel.headers[0].headers;

  const headerMap = Object.fromEntries(headers.map(h => [h.key, h.value]));

  // Security headers check
  assert.equal(headerMap['X-Content-Type-Options'], 'nosniff');
  assert.equal(headerMap['X-Frame-Options'], 'SAMEORIGIN');
  assert.equal(headerMap['Referrer-Policy'], 'strict-origin-when-cross-origin');

  // CSP check
  const csp = headerMap['Content-Security-Policy'];
  assert.ok(csp, 'CSP header must be defined');

  // Verify no CountAPI in CSP
  assert.equal(csp.includes('countapi.mileshilliard.com'), false, 'CountAPI must be removed from CSP');
  // Verify no jsdelivr CDN in script-src
  assert.equal(csp.includes('cdn.jsdelivr.net'), false, 'cdn.jsdelivr.net must not be in script-src');
  // Verify strict script-src 'self'
  assert.match(csp, /script-src 'self';/);
  // Verify object-src 'none'
  assert.match(csp, /object-src 'none';/);
});

test('No Inline Script Audit: HTML files contain zero inline executable scripts', () => {
  const htmlFiles = ['index.html', 'about.html', 'contact.html', 'privacy.html', 'terms.html', 'cookie-policy.html'];

  for (const filename of htmlFiles) {
    const filePath = path.join(rootDir, filename);
    const content = fs.readFileSync(filePath, 'utf8');

    // Match any <script> tag that does not have a src attribute
    const inlineScriptMatches = content.match(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi);
    assert.equal(
      inlineScriptMatches,
      null,
      `File ${filename} should not contain any inline executable scripts (found ${inlineScriptMatches?.length || 0})`
    );
  }
});
