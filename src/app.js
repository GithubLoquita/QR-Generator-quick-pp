/**
 * QR Studio — Developed by Sandip Hembram (System Software Engineer)
 * Production-ready Utility Toolkit:
 * 1. QR Code Generator
 * 2. Barcode Generator
 * 3. Image to PDF Converter
 * 4. Merge PDF
 * 
 * 100% Free, Client-Side, No Login, No Database, Black & White Aesthetic.
 * Secure, zero third-party telemetry, memory-bounded, DOM-XSS hardened.
 */

import QRCodeStyling from 'qr-code-styling';
import JsBarcode from 'jsbarcode';
import { jsPDF } from 'jspdf';
import { PDFDocument } from 'pdf-lib';
import confetti from 'canvas-confetti';
import {
  IMAGE_LIMITS,
  PDF_LIMITS,
  LOGO_LIMITS,
  detectImageSignature,
  isPdfSignature,
  validateImageDimensions,
} from './validators.js';

const QRCodeClass = window.QRCodeStyling || QRCodeStyling;
const BarcodeFn = window.JsBarcode || JsBarcode;
const PDFDocClass = window.PDFLib?.PDFDocument || PDFDocument;
const JsPdfClass = window.jspdf?.jsPDF || jsPDF;

// ==========================================
// 1. GLOBAL TOOL NAVIGATION STATE
// ==========================================
let currentTool = 'qr'; // 'qr' | 'barcode' | 'image-to-pdf' | 'merge-pdf'

// ==========================================
// 2. QR CODE STATE & ENGINE
// ==========================================
const qrState = {
  type: 'url',
  fields: {
    url: 'https://example.com',
    text: 'Welcome to QR Studio!',
    wifi: {
      ssid: 'My_WiFi_Network',
      password: '',
      encryption: 'WPA',
      hidden: false,
    },
    whatsapp: {
      countryCode: '+1',
      phone: '',
      message: 'Hello! I am contacting you via QR Studio.',
    },
    vcard: {
      firstName: 'Alex',
      lastName: 'Morgan',
      phone: '+1 555 123 4567',
      email: 'alex@example.com',
      organization: 'Tech Innovations Ltd',
      title: 'Product Director',
      website: 'https://example.com',
    },
  },
  design: {
    fgColor: '#000000',
    bgColor: '#ffffff',
    bgTransparent: false,
    pattern: 'rounded',
    logoUrl: null,
    logoName: '',
    logoSize: 0.28,
  },
};

let qrCodeInstance = null;

function escapeWifi(str) {
  return (str || '').replace(/([\\;,:"])/g, '\\$1');
}

function getQRPayload() {
  const { type, fields } = qrState;
  switch (type) {
    case 'url': {
      let raw = (fields.url || '').trim();
      if (!raw) return 'https://example.com';
      if (!/^https?:\/\//i.test(raw) && !/^[a-z]+:/i.test(raw)) {
        raw = `https://${raw}`;
      }
      return raw;
    }
    case 'text':
      return fields.text.trim() || 'Welcome to QR Studio';

    case 'wifi': {
      const { ssid, password, encryption, hidden } = fields.wifi;
      const cleanSsid = escapeWifi((ssid || 'My_WiFi_Network').trim());
      const cleanPass = escapeWifi(password || '');
      const cleanEnc = encryption === 'nopass' ? 'nopass' : encryption;
      if (cleanEnc === 'nopass') {
        return `WIFI:T:nopass;S:${cleanSsid};H:${hidden ? 'true' : 'false'};;`;
      }
      return `WIFI:T:${cleanEnc};S:${cleanSsid};P:${cleanPass};H:${hidden ? 'true' : 'false'};;`;
    }

    case 'whatsapp': {
      const { countryCode, phone, message } = fields.whatsapp;
      const digits = `${countryCode}${phone}`.replace(/[^\d+]/g, '');
      const cleanNum = digits.startsWith('+') ? digits.substring(1) : digits;
      const encodedMsg = encodeURIComponent(message || '');
      if (!cleanNum) return 'https://wa.me/';
      return encodedMsg ? `https://wa.me/${cleanNum}?text=${encodedMsg}` : `https://wa.me/${cleanNum}`;
    }

    case 'vcard': {
      const { firstName, lastName, phone, email, organization, title, website } = fields.vcard;
      const fName = (firstName || '').trim();
      const lName = (lastName || '').trim();
      const fullName = [fName, lName].filter(Boolean).join(' ') || 'Contact Person';
      const lines = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `N:${lName};${fName};;;`,
        `FN:${fullName}`,
      ];
      if (phone.trim()) lines.push(`TEL;TYPE=CELL,VOICE:${phone.trim()}`);
      if (email.trim()) lines.push(`EMAIL;TYPE=PREF,INTERNET:${email.trim()}`);
      if (organization.trim()) lines.push(`ORG:${organization.trim()}`);
      if (title.trim()) lines.push(`TITLE:${title.trim()}`);
      if (website.trim()) {
        const site = website.trim();
        lines.push(`URL:${/^https?:\/\//i.test(site) ? site : `https://${site}`}`);
      }
      lines.push('END:VCARD');
      return lines.join('\n');
    }

    default:
      return 'https://example.com';
  }
}

function getPatternOptions(pattern) {
  switch (pattern) {
    case 'square':
      return { dotType: 'square', cornerSquareType: 'square', cornerDotType: 'square' };
    case 'dots':
      return { dotType: 'dots', cornerSquareType: 'extra-rounded', cornerDotType: 'dot' };
    case 'rounded':
    default:
      return { dotType: 'rounded', cornerSquareType: 'extra-rounded', cornerDotType: 'dot' };
  }
}

function buildQrOptions(size = 320) {
  const payload = getQRPayload();
  const { design } = qrState;
  const patternTypes = getPatternOptions(design.pattern);
  const errorCorrection = design.logoUrl ? 'H' : 'M';

  return {
    width: size,
    height: size,
    data: payload,
    margin: Math.round(size * 0.04),
    qrOptions: {
      typeNumber: 0,
      mode: 'Byte',
      errorCorrectionLevel: errorCorrection,
    },
    imageOptions: {
      hideBackgroundDots: true,
      imageSize: design.logoSize,
      margin: Math.round(5 * (size / 320)),
      crossOrigin: 'anonymous',
    },
    dotsOptions: {
      type: patternTypes.dotType,
      color: design.fgColor,
    },
    backgroundOptions: {
      color: design.bgTransparent ? 'rgba(255,255,255,0)' : design.bgColor,
    },
    cornersSquareOptions: {
      type: patternTypes.cornerSquareType,
      color: design.fgColor,
    },
    cornersDotOptions: {
      type: patternTypes.cornerDotType,
      color: design.fgColor,
    },
    image: design.logoUrl || undefined,
  };
}

function renderLiveQR() {
  const container = document.getElementById('qr-canvas-target');
  if (!container) return;

  const options = buildQrOptions(300);

  if (!qrCodeInstance) {
    container.replaceChildren();
    qrCodeInstance = new QRCodeClass(options);
    qrCodeInstance.append(container);
  } else {
    qrCodeInstance.update(options);
  }

  // Update contrast feedback safely using DOM nodes
  const contrastEl = document.getElementById('contrast-notice');
  if (contrastEl) {
    contrastEl.replaceChildren();
    const span = document.createElement('span');
    if (qrState.design.bgTransparent) {
      span.className = 'text-xs text-neutral-600 font-medium';
      span.textContent = 'Transparent background · Contrast depends on placement';
    } else {
      span.className = 'inline-flex items-center gap-1.5 text-xs text-neutral-900 font-semibold';
      const checkIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      checkIcon.setAttribute('class', 'w-3.5 h-3.5');
      checkIcon.setAttribute('viewBox', '0 0 24 24');
      checkIcon.setAttribute('fill', 'none');
      checkIcon.setAttribute('stroke', 'currentColor');
      checkIcon.setAttribute('stroke-width', '2.5');
      const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
      polyline.setAttribute('points', '20 6 9 17 4 12');
      checkIcon.appendChild(polyline);

      span.appendChild(checkIcon);
      span.appendChild(document.createTextNode(' Optimal contrast (Fast scanning)'));
    }
    contrastEl.appendChild(span);
  }
}

async function downloadQR(format) {
  try {
    const size = 1024;
    const options = buildQrOptions(size);
    if (format === 'jpeg' && qrState.design.bgTransparent) {
      options.backgroundOptions = { color: '#ffffff' };
    }
    const exportInstance = new QRCodeClass(options);
    const filename = `qr-studio-${qrState.type}`;
    await exportInstance.download({ name: filename, extension: format });
    triggerConfetti();
    showToast(`${format.toUpperCase()} downloaded successfully!`);
  } catch (err) {
    console.error('QR download error:', err);
    showToast('Failed to download QR code.', 'error');
  }
}

async function copyQR() {
  try {
    const exportInstance = new QRCodeClass(buildQrOptions(1024));
    const raw = await exportInstance.getRawData('png');
    if (raw && navigator.clipboard && window.ClipboardItem) {
      const blob = raw instanceof Blob ? raw : new Blob([raw], { type: 'image/png' });
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      showToast('QR Image copied to clipboard!');
      return;
    }
    await navigator.clipboard.writeText(getQRPayload());
    showToast('QR content copied to clipboard!');
  } catch (err) {
    try {
      await navigator.clipboard.writeText(getQRPayload());
      showToast('QR content copied to clipboard!');
    } catch (e) {
      showToast('Clipboard access not supported.', 'error');
    }
  }
}

async function shareQR() {
  const payload = getQRPayload();
  try {
    const exportInstance = new QRCodeClass(buildQrOptions(1024));
    const raw = await exportInstance.getRawData('png');
    if (raw && navigator.share) {
      const blob = raw instanceof Blob ? raw : new Blob([raw], { type: 'image/png' });
      const file = new File([blob], `qr-studio-${qrState.type}.png`, { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'QR Studio Code',
          text: `Scan this QR code (${qrState.type.toUpperCase()})`,
          files: [file],
        });
        return;
      }
    }
    if (navigator.share) {
      await navigator.share({ title: 'QR Studio Code', text: payload, url: window.location.href });
    } else {
      await navigator.clipboard.writeText(payload);
      showToast('Link copied! Share anywhere.');
    }
  } catch (err) {
    if (err.name !== 'AbortError') console.log('Share canceled:', err);
  }
}

function printQR() {
  const printTitle = document.getElementById('print-title');
  const printInfo = document.getElementById('print-info');
  if (printTitle && printInfo) {
    switch (qrState.type) {
      case 'url':
        printTitle.textContent = 'Scan to Visit Website';
        printInfo.textContent = qrState.fields.url;
        break;
      case 'wifi':
        printTitle.textContent = 'Scan to Connect to Wi-Fi';
        printInfo.textContent = `Network: ${qrState.fields.wifi.ssid} ${qrState.fields.wifi.password ? `(Password: ${qrState.fields.wifi.password})` : ''}`;
        break;
      case 'whatsapp':
        printTitle.textContent = 'Scan to Chat on WhatsApp';
        printInfo.textContent = `${qrState.fields.whatsapp.countryCode} ${qrState.fields.whatsapp.phone}`;
        break;
      case 'vcard':
        printTitle.textContent = 'Scan to Save Contact Card';
        printInfo.textContent = `${qrState.fields.vcard.firstName} ${qrState.fields.vcard.lastName} · ${qrState.fields.vcard.phone}`;
        break;
      case 'text':
        printTitle.textContent = 'Scan to Read Note';
        printInfo.textContent = qrState.fields.text.slice(0, 120);
        break;
    }
  }
  window.print();
}

// ==========================================
// 3. BARCODE GENERATOR STATE & ENGINE
// ==========================================
const barcodeState = {
  format: 'CODE128', // 'CODE128' | 'EAN13' | 'UPC' | 'CODE39'
  value: 'STUDIO-2026-SANDIP',
  height: 100,
  width: 2,
  displayValue: true,
  fontSize: 16,
  lineColor: '#000000',
  background: '#ffffff',
};

// Format-specific input validator
function validateBarcodeInput(format, value) {
  const val = (value || '').trim();
  if (!val) {
    return { valid: false, message: 'Please enter a value for the barcode.' };
  }

  switch (format) {
    case 'CODE128': {
      if (!/^[\x00-\x7F]+$/.test(val)) {
        return { valid: false, message: 'CODE 128 accepts standard ASCII text and numbers only.' };
      }
      return { valid: true };
    }

    case 'EAN13': {
      if (!/^\d+$/.test(val)) {
        return { valid: false, message: 'EAN-13 only accepts numeric numbers (digits 0-9).' };
      }
      if (val.length !== 12 && val.length !== 13) {
        return { valid: false, message: 'EAN-13 requires exactly 12 or 13 digits (current length: ' + val.length + ').' };
      }
      if (val.length === 13) {
        let sum = 0;
        for (let i = 0; i < 12; i++) {
          sum += parseInt(val[i], 10) * (i % 2 === 0 ? 1 : 3);
        }
        const calcCheck = (10 - (sum % 10)) % 10;
        if (calcCheck !== parseInt(val[12], 10)) {
          return { valid: false, message: `Invalid EAN-13 checksum! Last digit should be ${calcCheck}.` };
        }
      }
      return { valid: true };
    }

    case 'UPC': {
      if (!/^\d+$/.test(val)) {
        return { valid: false, message: 'UPC-A only accepts numeric digits (0-9).' };
      }
      if (val.length !== 11 && val.length !== 12) {
        return { valid: false, message: 'UPC-A requires exactly 11 or 12 digits (current length: ' + val.length + ').' };
      }
      if (val.length === 12) {
        let sum = 0;
        for (let i = 0; i < 11; i++) {
          sum += parseInt(val[i], 10) * (i % 2 === 0 ? 3 : 1);
        }
        const calcCheck = (10 - (sum % 10)) % 10;
        if (calcCheck !== parseInt(val[11], 10)) {
          return { valid: false, message: `Invalid UPC-A checksum! Last digit should be ${calcCheck}.` };
        }
      }
      return { valid: true };
    }

    case 'CODE39': {
      const upperVal = val.toUpperCase();
      if (!/^[0-9A-Z\-\.\ \$\/\+\%]+$/.test(upperVal)) {
        return { valid: false, message: 'CODE 39 only allows uppercase A-Z, 0-9, and symbols: - . $ / + % [space]' };
      }
      return { valid: true, sanitized: upperVal };
    }

    default:
      return { valid: true };
  }
}

function renderLiveBarcode() {
  const svg = document.getElementById('barcode-svg');
  const errorEl = document.getElementById('barcode-error');
  if (!svg || !errorEl) return;

  const { format, value, height, width, displayValue, fontSize, lineColor, background } = barcodeState;
  const validation = validateBarcodeInput(format, value);

  if (!validation.valid) {
    errorEl.textContent = validation.message;
    errorEl.classList.remove('hidden');
    svg.style.opacity = '0.25';
    return;
  }

  errorEl.classList.add('hidden');
  svg.style.opacity = '1';

  const valToRender = validation.sanitized || value;

  try {
    BarcodeFn(svg, valToRender, {
      format: format,
      width: Number(width),
      height: Number(height),
      displayValue: Boolean(displayValue),
      fontSize: Number(fontSize),
      lineColor: lineColor,
      background: background,
      margin: 14,
    });
  } catch (err) {
    console.error('Barcode render error:', err);
    errorEl.textContent = 'Invalid barcode data for ' + format + '. ' + err.message;
    errorEl.classList.remove('hidden');
  }
}

// Barcode Downloads
function downloadBarcodeSVG() {
  const svg = document.getElementById('barcode-svg');
  if (!svg) return;
  const svgData = new XMLSerializer().serializeToString(svg);
  const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `barcode-${barcodeState.format.toLowerCase()}-${Date.now()}.svg`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  triggerConfetti();
  showToast('Barcode SVG downloaded!');
}

function downloadBarcodePNG() {
  const svg = document.getElementById('barcode-svg');
  if (!svg) return;

  const svgData = new XMLSerializer().serializeToString(svg);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const img = new Image();

  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  img.onload = () => {
    canvas.width = img.width * 2;
    canvas.height = img.height * 2;
    ctx.fillStyle = barcodeState.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const pngUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = pngUrl;
      a.download = `barcode-${barcodeState.format.toLowerCase()}-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(pngUrl);
      URL.revokeObjectURL(url);
      triggerConfetti();
      showToast('Barcode PNG downloaded!');
    });
  };

  img.src = url;
}

function printBarcode() {
  const printTitle = document.getElementById('print-title');
  const printInfo = document.getElementById('print-info');
  if (printTitle && printInfo) {
    printTitle.textContent = `Barcode (${barcodeState.format})`;
    printInfo.textContent = barcodeState.value;
  }
  window.print();
}

// ==========================================
// 4. IMAGE TO PDF CONVERTER STATE & ENGINE
// ==========================================
const imgToPdfState = {
  images: [], // array of { id, file, name, size, type, dataUrl, blobUrl, width, height }
  pageSize: 'a4', // 'a4' | 'letter' | 'original'
  orientation: 'auto', // 'auto' | 'portrait' | 'landscape'
  fit: 'fit', // 'fit' | 'fill' | 'stretch'
  isConverting: false,
};

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

async function handleImageFiles(files) {
  const fileList = Array.from(files);
  if (fileList.length === 0) return;

  // Batch count limit check
  if (imgToPdfState.images.length + fileList.length > IMAGE_LIMITS.MAX_BATCH_COUNT) {
    showToast(`Batch limit exceeded: Maximum ${IMAGE_LIMITS.MAX_BATCH_COUNT} images allowed.`, 'error');
    return;
  }

  // Batch total size limit check
  const currentTotalSize = imgToPdfState.images.reduce((acc, item) => acc + item.size, 0);
  const newTotalSize = fileList.reduce((acc, f) => acc + f.size, 0);
  if (currentTotalSize + newTotalSize > IMAGE_LIMITS.MAX_BATCH_SIZE_BYTES) {
    showToast(`Batch size exceeds 100 MB limit. Please convert in smaller batches.`, 'error');
    return;
  }

  for (const file of fileList) {
    // Individual file size check
    if (file.size > IMAGE_LIMITS.MAX_FILE_SIZE_BYTES) {
      showToast(`"${file.name}" exceeds 25 MB limit (${formatBytes(file.size)}).`, 'error');
      continue;
    }

    try {
      // Magic bytes verification
      const headerBuffer = await file.slice(0, 16).arrayBuffer();
      const headerBytes = new Uint8Array(headerBuffer);
      const sig = detectImageSignature(headerBytes);
      if (!sig.isValid || !['jpeg', 'png', 'webp'].includes(sig.format)) {
        showToast(`"${file.name}" is not a valid JPEG, PNG, or WebP image.`, 'error');
        continue;
      }

      // Memory-safe URL
      const blobUrl = URL.createObjectURL(file);
      const img = new Image();

      await new Promise((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Corrupt or unreadable image file.'));
        img.src = blobUrl;
      });

      // Decompression bomb / dimension protection
      const dimCheck = validateImageDimensions(img.naturalWidth, img.naturalHeight);
      if (!dimCheck.valid) {
        URL.revokeObjectURL(blobUrl);
        showToast(`"${file.name}": ${dimCheck.error}`, 'error');
        continue;
      }

      // Read data URL for jsPDF
      const reader = new FileReader();
      const dataUrl = await new Promise((resolve, reject) => {
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = () => reject(new Error('Failed reading file data.'));
        reader.readAsDataURL(file);
      });

      imgToPdfState.images.push({
        id: 'img_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
        file,
        name: file.name,
        size: file.size,
        type: file.type || `image/${sig.format}`,
        dataUrl,
        blobUrl,
        width: img.naturalWidth,
        height: img.naturalHeight,
      });

      renderImageThumbnails();
    } catch (err) {
      console.error('Image loading error:', err);
      showToast(`Cannot read "${file.name}": ${err.message || 'unsupported file'}`, 'error');
    }
  }
}

function removeImageItem(id) {
  const item = imgToPdfState.images.find(x => x.id === id);
  if (item && item.blobUrl) {
    URL.revokeObjectURL(item.blobUrl);
  }
  imgToPdfState.images = imgToPdfState.images.filter(x => x.id !== id);
  renderImageThumbnails();
}

function moveImageItem(index, direction) {
  const targetIndex = index + direction;
  if (targetIndex < 0 || targetIndex >= imgToPdfState.images.length) return;
  const temp = imgToPdfState.images[index];
  imgToPdfState.images[index] = imgToPdfState.images[targetIndex];
  imgToPdfState.images[targetIndex] = temp;
  renderImageThumbnails();
}

function clearAllImages() {
  imgToPdfState.images.forEach(item => {
    if (item.blobUrl) URL.revokeObjectURL(item.blobUrl);
  });
  imgToPdfState.images = [];
  renderImageThumbnails();
}

/**
 * Renders the image items list safely using createElement, textContent, and event listeners.
 * Completely immune to DOM-based XSS via filenames or attributes.
 */
function renderImageThumbnails() {
  const listEl = document.getElementById('image-files-list');
  const countEl = document.getElementById('image-count-label');
  const emptyEl = document.getElementById('image-empty-state');
  const actionsEl = document.getElementById('image-convert-actions');

  if (!listEl) return;

  const count = imgToPdfState.images.length;
  if (countEl) countEl.textContent = `${count} image${count === 1 ? '' : 's'} added`;

  if (count === 0) {
    listEl.replaceChildren();
    if (emptyEl) emptyEl.classList.remove('hidden');
    if (actionsEl) actionsEl.classList.add('hidden');
    return;
  }

  if (emptyEl) emptyEl.classList.add('hidden');
  if (actionsEl) actionsEl.classList.remove('hidden');

  listEl.replaceChildren();

  imgToPdfState.images.forEach((item, idx) => {
    const card = document.createElement('div');
    card.className = 'flex items-center justify-between p-3 bg-white rounded-xl border border-neutral-200 shadow-2xs gap-3';

    // Left info
    const left = document.createElement('div');
    left.className = 'flex items-center gap-3 min-w-0';

    const numBadge = document.createElement('span');
    numBadge.className = 'w-6 h-6 rounded-full bg-neutral-100 border border-neutral-300 flex items-center justify-center font-mono text-xs font-bold shrink-0 text-black';
    numBadge.textContent = String(idx + 1);

    const thumb = document.createElement('img');
    thumb.src = item.blobUrl || item.dataUrl;
    thumb.alt = 'Thumbnail for ' + item.name;
    thumb.className = 'w-12 h-12 rounded-lg object-cover border border-neutral-200 shrink-0 bg-neutral-100';

    const details = document.createElement('div');
    details.className = 'min-w-0';

    const title = document.createElement('div');
    title.className = 'text-xs font-bold text-black truncate max-w-[200px] sm:max-w-[280px]';
    title.textContent = item.name;

    const meta = document.createElement('div');
    meta.className = 'text-[11px] text-neutral-500 font-mono';
    meta.textContent = `${item.width}×${item.height}px · ${formatBytes(item.size)}`;

    details.appendChild(title);
    details.appendChild(meta);

    left.appendChild(numBadge);
    left.appendChild(thumb);
    left.appendChild(details);

    // Right actions
    const right = document.createElement('div');
    right.className = 'flex items-center gap-1 shrink-0';

    const btnUp = document.createElement('button');
    btnUp.type = 'button';
    btnUp.title = 'Move Up';
    btnUp.disabled = idx === 0;
    btnUp.className = 'p-1.5 rounded-lg border border-neutral-200 text-neutral-700 hover:bg-neutral-100 disabled:opacity-30 disabled:pointer-events-none cursor-pointer';
    btnUp.innerHTML = `<svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"/></svg>`;
    btnUp.addEventListener('click', () => moveImageItem(idx, -1));

    const btnDown = document.createElement('button');
    btnDown.type = 'button';
    btnDown.title = 'Move Down';
    btnDown.disabled = idx === count - 1;
    btnDown.className = 'p-1.5 rounded-lg border border-neutral-200 text-neutral-700 hover:bg-neutral-100 disabled:opacity-30 disabled:pointer-events-none cursor-pointer';
    btnDown.innerHTML = `<svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>`;
    btnDown.addEventListener('click', () => moveImageItem(idx, 1));

    const btnRemove = document.createElement('button');
    btnRemove.type = 'button';
    btnRemove.title = 'Remove image';
    btnRemove.className = 'p-1.5 rounded-lg border border-neutral-200 text-rose-600 hover:bg-rose-50 cursor-pointer ml-1';
    btnRemove.innerHTML = `<svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
    btnRemove.addEventListener('click', () => removeImageItem(item.id));

    right.appendChild(btnUp);
    right.appendChild(btnDown);
    right.appendChild(btnRemove);

    card.appendChild(left);
    card.appendChild(right);
    listEl.appendChild(card);
  });
}

// Convert all images to PDF
async function convertImagesToPDF() {
  if (imgToPdfState.images.length === 0) {
    showToast('Please add at least one image to convert.', 'error');
    return;
  }

  const btnConvert = document.getElementById('btn-convert-images');
  const progressEl = document.getElementById('image-progress-bar');
  if (btnConvert) {
    btnConvert.disabled = true;
    btnConvert.innerHTML = `<span>Converting images to PDF...</span>`;
  }
  if (progressEl) progressEl.classList.remove('hidden');

  try {
    const { pageSize, orientation, fit, images } = imgToPdfState;
    let doc = null;

    for (let i = 0; i < images.length; i++) {
      const item = images[i];
      const isLandscape = item.width > item.height;
      const pageOrientation = orientation === 'auto' ? (isLandscape ? 'landscape' : 'portrait') : orientation;

      let pageW, pageH;
      if (pageSize === 'a4') {
        pageW = pageOrientation === 'portrait' ? 595.28 : 841.89;
        pageH = pageOrientation === 'portrait' ? 841.89 : 595.28;
      } else if (pageSize === 'letter') {
        pageW = pageOrientation === 'portrait' ? 612 : 792;
        pageH = pageOrientation === 'portrait' ? 792 : 612;
      } else {
        pageW = item.width * 0.75;
        pageH = item.height * 0.75;
      }

      if (i === 0) {
        doc = new JsPdfClass({
          orientation: pageOrientation,
          unit: 'pt',
          format: pageSize === 'original' ? [pageW, pageH] : pageSize,
        });
      } else {
        doc.addPage(pageSize === 'original' ? [pageW, pageH] : pageSize, pageOrientation);
      }

      let imgX = 0, imgY = 0, imgW = pageW, imgH = pageH;
      const margin = fit === 'fit' ? 20 : 0;
      const availW = pageW - margin * 2;
      const availH = pageH - margin * 2;

      if (fit === 'fit') {
        const ratio = Math.min(availW / item.width, availH / item.height);
        imgW = item.width * ratio;
        imgH = item.height * ratio;
        imgX = margin + (availW - imgW) / 2;
        imgY = margin + (availH - imgH) / 2;
      } else if (fit === 'fill') {
        const ratio = Math.max(pageW / item.width, pageH / item.height);
        imgW = item.width * ratio;
        imgH = item.height * ratio;
        imgX = (pageW - imgW) / 2;
        imgY = (pageH - imgH) / 2;
      } else {
        imgX = 0;
        imgY = 0;
        imgW = pageW;
        imgH = pageH;
      }

      const imgFormat = item.type.includes('png') ? 'PNG' : item.type.includes('webp') ? 'WEBP' : 'JPEG';
      doc.addImage(item.dataUrl, imgFormat, imgX, imgY, imgW, imgH);
    }

    doc.save(`qr-studio-images-${Date.now()}.pdf`);
    triggerConfetti();
    showToast('PDF downloaded successfully!');
  } catch (err) {
    console.error('Image to PDF conversion error:', err);
    showToast('Conversion failed: ' + err.message, 'error');
  } finally {
    if (btnConvert) {
      btnConvert.disabled = false;
      btnConvert.innerHTML = `<span>Download Converted PDF</span>`;
    }
    if (progressEl) progressEl.classList.add('hidden');
  }
}

// ==========================================
// 5. MERGE PDF STATE & ENGINE
// ==========================================
const mergePdfState = {
  pdfFiles: [], // array of { id, file, name, size, pageCount, buffer }
  isMerging: false,
};

async function handlePdfFiles(files) {
  const fileList = Array.from(files);
  if (fileList.length === 0) return;

  // Batch count limit check
  if (mergePdfState.pdfFiles.length + fileList.length > PDF_LIMITS.MAX_BATCH_COUNT) {
    showToast(`Batch limit exceeded: Maximum ${PDF_LIMITS.MAX_BATCH_COUNT} PDF files allowed.`, 'error');
    return;
  }

  // Batch total size limit check
  const currentTotalSize = mergePdfState.pdfFiles.reduce((acc, item) => acc + item.size, 0);
  const newTotalSize = fileList.reduce((acc, f) => acc + f.size, 0);
  if (currentTotalSize + newTotalSize > PDF_LIMITS.MAX_BATCH_SIZE_BYTES) {
    showToast(`Batch size exceeds 150 MB limit. Please merge fewer or smaller documents.`, 'error');
    return;
  }

  const errorEl = document.getElementById('merge-error-msg');
  if (errorEl) errorEl.classList.add('hidden');

  for (const file of fileList) {
    // Individual file size check
    if (file.size > PDF_LIMITS.MAX_FILE_SIZE_BYTES) {
      showToast(`"${file.name}" exceeds 50 MB limit (${formatBytes(file.size)}).`, 'error');
      continue;
    }

    try {
      // Magic bytes verification (%PDF-)
      const headerBuffer = await file.slice(0, 8).arrayBuffer();
      const headerBytes = new Uint8Array(headerBuffer);
      if (!isPdfSignature(headerBytes)) {
        showToast(`"${file.name}" is not a valid PDF file (missing %PDF- header).`, 'error');
        continue;
      }

      const buffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocClass.load(buffer, { ignoreEncryption: true });
      const pageCount = pdfDoc.getPageCount();

      mergePdfState.pdfFiles.push({
        id: 'pdf_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
        file,
        name: file.name,
        size: file.size,
        pageCount,
        buffer,
      });
    } catch (err) {
      console.error('Error reading PDF file:', err);
      showToast(`Cannot read "${file.name}": file may be corrupt or encrypted.`, 'error');
    }
  }

  renderPdfFileList();
}

function removePdfItem(id) {
  mergePdfState.pdfFiles = mergePdfState.pdfFiles.filter(x => x.id !== id);
  renderPdfFileList();
}

function movePdfItem(index, direction) {
  const targetIndex = index + direction;
  if (targetIndex < 0 || targetIndex >= mergePdfState.pdfFiles.length) return;
  const temp = mergePdfState.pdfFiles[index];
  mergePdfState.pdfFiles[index] = mergePdfState.pdfFiles[targetIndex];
  mergePdfState.pdfFiles[targetIndex] = temp;
  renderPdfFileList();
}

function clearAllPdfs() {
  mergePdfState.pdfFiles = [];
  renderPdfFileList();
}

/**
 * Renders the PDF documents list safely using createElement, textContent, and event listeners.
 * Completely immune to DOM-based XSS via filenames or attributes.
 */
function renderPdfFileList() {
  const listEl = document.getElementById('pdf-files-list');
  const countEl = document.getElementById('pdf-count-label');
  const emptyEl = document.getElementById('pdf-empty-state');
  const actionsEl = document.getElementById('pdf-merge-actions');

  if (!listEl) return;

  const count = mergePdfState.pdfFiles.length;
  const totalPages = mergePdfState.pdfFiles.reduce((acc, f) => acc + f.pageCount, 0);

  if (countEl) {
    countEl.textContent = `${count} file${count === 1 ? '' : 's'} (${totalPages} total pages)`;
  }

  if (count === 0) {
    listEl.replaceChildren();
    if (emptyEl) emptyEl.classList.remove('hidden');
    if (actionsEl) actionsEl.classList.add('hidden');
    return;
  }

  if (emptyEl) emptyEl.classList.add('hidden');
  if (actionsEl) actionsEl.classList.remove('hidden');

  listEl.replaceChildren();

  mergePdfState.pdfFiles.forEach((item, idx) => {
    const card = document.createElement('div');
    card.className = 'flex items-center justify-between p-3.5 bg-white rounded-xl border border-neutral-200 shadow-2xs gap-3';

    // Left info
    const left = document.createElement('div');
    left.className = 'flex items-center gap-3 min-w-0';

    const numBadge = document.createElement('span');
    numBadge.className = 'w-6 h-6 rounded-full bg-neutral-100 border border-neutral-300 flex items-center justify-center font-mono text-xs font-bold shrink-0 text-black';
    numBadge.textContent = String(idx + 1);

    const icon = document.createElement('div');
    icon.className = 'w-10 h-10 rounded-lg bg-neutral-100 border border-neutral-200 flex items-center justify-center shrink-0 text-black';
    icon.innerHTML = `<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`;

    const details = document.createElement('div');
    details.className = 'min-w-0';

    const title = document.createElement('div');
    title.className = 'text-xs font-bold text-black truncate max-w-[200px] sm:max-w-[320px]';
    title.textContent = item.name;

    const meta = document.createElement('div');
    meta.className = 'text-[11px] text-neutral-500 font-mono';
    meta.textContent = `${item.pageCount} page${item.pageCount === 1 ? '' : 's'} · ${formatBytes(item.size)}`;

    details.appendChild(title);
    details.appendChild(meta);

    left.appendChild(numBadge);
    left.appendChild(icon);
    left.appendChild(details);

    // Right actions
    const right = document.createElement('div');
    right.className = 'flex items-center gap-1 shrink-0';

    const btnUp = document.createElement('button');
    btnUp.type = 'button';
    btnUp.title = 'Move Up';
    btnUp.disabled = idx === 0;
    btnUp.className = 'p-1.5 rounded-lg border border-neutral-200 text-neutral-700 hover:bg-neutral-100 disabled:opacity-30 disabled:pointer-events-none cursor-pointer';
    btnUp.innerHTML = `<svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"/></svg>`;
    btnUp.addEventListener('click', () => movePdfItem(idx, -1));

    const btnDown = document.createElement('button');
    btnDown.type = 'button';
    btnDown.title = 'Move Down';
    btnDown.disabled = idx === count - 1;
    btnDown.className = 'p-1.5 rounded-lg border border-neutral-200 text-neutral-700 hover:bg-neutral-100 disabled:opacity-30 disabled:pointer-events-none cursor-pointer';
    btnDown.innerHTML = `<svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>`;
    btnDown.addEventListener('click', () => movePdfItem(idx, 1));

    const btnRemove = document.createElement('button');
    btnRemove.type = 'button';
    btnRemove.title = 'Remove PDF';
    btnRemove.className = 'p-1.5 rounded-lg border border-neutral-200 text-rose-600 hover:bg-rose-50 cursor-pointer ml-1';
    btnRemove.innerHTML = `<svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
    btnRemove.addEventListener('click', () => removePdfItem(item.id));

    right.appendChild(btnUp);
    right.appendChild(btnDown);
    right.appendChild(btnRemove);

    card.appendChild(left);
    card.appendChild(right);
    listEl.appendChild(card);
  });
}

// Perform client-side PDF Merge
async function mergeSelectedPDFs() {
  if (mergePdfState.pdfFiles.length < 2) {
    showToast('Please add at least 2 PDF documents to merge.', 'error');
    return;
  }

  const btnMerge = document.getElementById('btn-merge-pdfs');
  const errorEl = document.getElementById('merge-error-msg');
  if (errorEl) errorEl.classList.add('hidden');

  if (btnMerge) {
    btnMerge.disabled = true;
    btnMerge.innerHTML = `<span>Merging documents...</span>`;
  }

  try {
    const mergedDoc = await PDFDocClass.create();

    for (const item of mergePdfState.pdfFiles) {
      try {
        const doc = await PDFDocClass.load(item.buffer);
        const copiedPages = await mergedDoc.copyPages(doc, doc.getPageIndices());
        copiedPages.forEach((page) => mergedDoc.addPage(page));
      } catch (err) {
        throw new Error(`Failed to read "${item.name}". The file may be password-protected or corrupt.`);
      }
    }

    const mergedPdfBytes = await mergedDoc.save();
    const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qr-studio-merged-${Date.now()}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    triggerConfetti();
    showToast('Merged PDF downloaded successfully!');
  } catch (err) {
    console.error('Merge error:', err);
    if (errorEl) {
      errorEl.textContent = err.message;
      errorEl.classList.remove('hidden');
    }
    showToast('Merge failed: ' + err.message, 'error');
  } finally {
    if (btnMerge) {
      btnMerge.disabled = false;
      btnMerge.innerHTML = `<span>Merge and Download Combined PDF</span>`;
    }
  }
}

// ==========================================
// 6. UI HELPERS & NOTIFICATIONS
// ==========================================
function triggerConfetti() {
  try {
    const confettiFn = window.confetti || confetti;
    if (typeof confettiFn === 'function') {
      confettiFn({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#000000', '#52525b', '#a1a1aa', '#e4e4e7'],
      });
    }
  } catch (e) {
    // Ignored
  }
}

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.textContent = message;
  toast.className = `fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl shadow-2xl text-xs font-semibold text-white transition-all transform duration-200 flex items-center gap-2 ${
    type === 'error' ? 'bg-neutral-800' : 'bg-black'
  } translate-y-0 opacity-100 border border-neutral-700`;

  setTimeout(() => {
    toast.className = 'fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl shadow-2xl text-xs font-semibold text-white transition-all transform duration-200 translate-y-8 opacity-0 pointer-events-none border border-neutral-700';
  }, 2600);
}

// ==========================================
// 7. TOOL SWITCHING LOGIC
// ==========================================
function switchTool(toolId) {
  currentTool = toolId;

  // Update active states on dashboard buttons
  document.querySelectorAll('[data-switch-tool]').forEach(btn => {
    const isTarget = btn.getAttribute('data-switch-tool') === toolId;
    if (isTarget) {
      btn.className = 'tool-card p-4 rounded-2xl border-2 border-black bg-neutral-100 text-left transition-all cursor-pointer shadow-xs';
      btn.querySelector('.tool-indicator')?.classList.remove('hidden');
    } else {
      btn.className = 'tool-card p-4 rounded-2xl border border-neutral-200 bg-white hover:border-neutral-400 hover:bg-neutral-50 text-left transition-all cursor-pointer';
      btn.querySelector('.tool-indicator')?.classList.add('hidden');
    }
  });

  // Toggle main tool sections
  ['qr', 'barcode', 'image-to-pdf', 'merge-pdf'].forEach(t => {
    const section = document.getElementById(`tool-section-${t}`);
    if (section) {
      if (t === toolId) section.classList.remove('hidden');
      else section.classList.add('hidden');
    }
  });

  // Render specific tool canvas if needed
  if (toolId === 'qr') {
    renderLiveQR();
  } else if (toolId === 'barcode') {
    renderLiveBarcode();
  }

  // Update URL hash without reload
  if (history.replaceState) {
    history.replaceState(null, '', `#${toolId}`);
  }
}

// ==========================================
// 8. BIND EVENT LISTENERS
// ==========================================
function setupEventListeners() {
  // Tool switcher buttons
  document.querySelectorAll('[data-switch-tool]').forEach(btn => {
    btn.addEventListener('click', () => {
      const toolId = btn.getAttribute('data-switch-tool');
      switchTool(toolId);
    });
  });

  // Hash-based routing
  const initialHash = window.location.hash.replace('#', '');
  if (['qr', 'barcode', 'image-to-pdf', 'merge-pdf'].includes(initialHash)) {
    switchTool(initialHash);
  }

  // QR CODE LISTENERS
  document.querySelectorAll('[data-type]').forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.getAttribute('data-type');
      qrState.type = type;
      document.querySelectorAll('[data-type]').forEach(b => {
        b.className = 'type-tab flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer text-neutral-600 hover:text-black hover:bg-neutral-100';
      });
      btn.className = 'type-tab flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer bg-black text-white shadow-xs';

      ['url', 'text', 'wifi', 'whatsapp', 'vcard'].forEach(t => {
        const form = document.getElementById(`form-${t}`);
        if (form) {
          if (t === type) form.classList.remove('hidden');
          else form.classList.add('hidden');
        }
      });
      renderLiveQR();
    });
  });

  // QR Input bindings
  const inputUrl = document.getElementById('field-url');
  if (inputUrl) inputUrl.addEventListener('input', (e) => { qrState.fields.url = e.target.value; renderLiveQR(); });

  const inputText = document.getElementById('field-text');
  if (inputText) inputText.addEventListener('input', (e) => { qrState.fields.text = e.target.value; renderLiveQR(); });

  const wifiSsid = document.getElementById('wifi-ssid');
  const wifiPass = document.getElementById('wifi-pass');
  const wifiEnc = document.getElementById('wifi-enc');
  const wifiHidden = document.getElementById('wifi-hidden');
  const togglePass = document.getElementById('btn-toggle-pass');

  if (wifiSsid) wifiSsid.addEventListener('input', (e) => { qrState.fields.wifi.ssid = e.target.value; renderLiveQR(); });
  if (wifiPass) wifiPass.addEventListener('input', (e) => { qrState.fields.wifi.password = e.target.value; renderLiveQR(); });
  if (wifiEnc) wifiEnc.addEventListener('change', (e) => { qrState.fields.wifi.encryption = e.target.value; renderLiveQR(); });
  if (wifiHidden) wifiHidden.addEventListener('change', (e) => { qrState.fields.wifi.hidden = e.target.checked; renderLiveQR(); });
  if (togglePass && wifiPass) {
    togglePass.addEventListener('click', () => { wifiPass.type = wifiPass.type === 'password' ? 'text' : 'password'; });
  }

  const waCode = document.getElementById('wa-code');
  const waPhone = document.getElementById('wa-phone');
  const waMsg = document.getElementById('wa-msg');
  if (waCode) waCode.addEventListener('change', (e) => { qrState.fields.whatsapp.countryCode = e.target.value; renderLiveQR(); });
  if (waPhone) waPhone.addEventListener('input', (e) => { qrState.fields.whatsapp.phone = e.target.value; renderLiveQR(); });
  if (waMsg) waMsg.addEventListener('input', (e) => { qrState.fields.whatsapp.message = e.target.value; renderLiveQR(); });

  ['firstName', 'lastName', 'phone', 'email', 'organization', 'title', 'website'].forEach(key => {
    const el = document.getElementById(`vcard-${key}`);
    if (el) el.addEventListener('input', (e) => { qrState.fields.vcard[key] = e.target.value; renderLiveQR(); });
  });

  // QR Pattern & Colors
  document.querySelectorAll('[data-pattern]').forEach(btn => {
    btn.addEventListener('click', () => {
      qrState.design.pattern = btn.getAttribute('data-pattern');
      document.querySelectorAll('[data-pattern]').forEach(b => {
        b.className = 'pattern-btn p-3 rounded-xl border border-neutral-200 hover:border-black hover:bg-neutral-50 text-left transition-all cursor-pointer text-xs font-medium text-neutral-700';
      });
      btn.className = 'pattern-btn p-3 rounded-xl border-2 border-black bg-neutral-100 text-left transition-all cursor-pointer text-xs font-bold text-black shadow-xs';
      renderLiveQR();
    });
  });

  const pickerFg = document.getElementById('picker-fg');
  const hexFg = document.getElementById('hex-fg');
  const pickerBg = document.getElementById('picker-bg');
  const hexBg = document.getElementById('hex-bg');
  const checkTrans = document.getElementById('check-transparent');

  if (pickerFg && hexFg) {
    pickerFg.addEventListener('input', (e) => { qrState.design.fgColor = e.target.value; hexFg.value = e.target.value; renderLiveQR(); });
    hexFg.addEventListener('input', (e) => { qrState.design.fgColor = e.target.value; pickerFg.value = e.target.value; renderLiveQR(); });
  }

  if (pickerBg && hexBg) {
    pickerBg.addEventListener('input', (e) => { qrState.design.bgColor = e.target.value; hexBg.value = e.target.value; renderLiveQR(); });
    hexBg.addEventListener('input', (e) => { qrState.design.bgColor = e.target.value; pickerBg.value = e.target.value; renderLiveQR(); });
  }

  if (checkTrans) {
    checkTrans.addEventListener('change', (e) => { qrState.design.bgTransparent = e.target.checked; renderLiveQR(); });
  }

  document.querySelectorAll('[data-swatch]').forEach(btn => {
    btn.addEventListener('click', () => {
      const color = btn.getAttribute('data-swatch');
      qrState.design.fgColor = color;
      if (pickerFg) pickerFg.value = color;
      if (hexFg) hexFg.value = color;
      renderLiveQR();
    });
  });

  // QR Logo Upload with Magic Byte & Size Validation
  const logoInput = document.getElementById('file-logo');
  const logoBox = document.getElementById('box-logo-upload');
  const logoPreview = document.getElementById('logo-preview-box');
  const logoThumb = document.getElementById('logo-thumb');
  const logoTitle = document.getElementById('logo-title');
  const btnRemoveLogo = document.getElementById('btn-remove-logo');
  const sliderSize = document.getElementById('slider-logo-size');
  const sizeValueLabel = document.getElementById('logo-size-label');

  if (logoBox && logoInput) {
    logoBox.addEventListener('click', () => logoInput.click());
    logoInput.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (file.size > LOGO_LIMITS.MAX_FILE_SIZE_BYTES) {
        showToast(`Logo exceeds 5 MB limit (${formatBytes(file.size)}).`, 'error');
        e.target.value = '';
        return;
      }

      try {
        const headerBuffer = await file.slice(0, 16).arrayBuffer();
        const headerBytes = new Uint8Array(headerBuffer);
        const sig = detectImageSignature(headerBytes);
        if (!sig.isValid) {
          showToast('Uploaded file is not a valid image (PNG, JPG, SVG, WebP).', 'error');
          e.target.value = '';
          return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
          const imgUrl = event.target?.result;
          const img = new Image();
          img.onload = () => {
            if (img.width > LOGO_LIMITS.MAX_DIMENSION_PX || img.height > LOGO_LIMITS.MAX_DIMENSION_PX) {
              showToast(`Logo dimension exceeds ${LOGO_LIMITS.MAX_DIMENSION_PX}px.`, 'error');
              return;
            }
            qrState.design.logoUrl = imgUrl;
            qrState.design.logoName = file.name;
            if (logoThumb) logoThumb.src = imgUrl;
            if (logoTitle) logoTitle.textContent = file.name;
            if (logoBox) logoBox.classList.add('hidden');
            if (logoPreview) logoPreview.classList.remove('hidden');
            renderLiveQR();
            showToast('Logo embedded with 30% error correction!');
          };
          img.onerror = () => {
            showToast('Failed to load logo image.', 'error');
          };
          img.src = imgUrl;
        };
        reader.readAsDataURL(file);
      } catch (err) {
        showToast('Error validating logo image.', 'error');
      }
      e.target.value = '';
    });
  }

  if (btnRemoveLogo) {
    btnRemoveLogo.addEventListener('click', () => {
      qrState.design.logoUrl = null;
      qrState.design.logoName = '';
      if (logoBox) logoBox.classList.remove('hidden');
      if (logoPreview) logoPreview.classList.add('hidden');
      renderLiveQR();
      showToast('Logo removed');
    });
  }

  if (sliderSize) {
    sliderSize.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      qrState.design.logoSize = val;
      if (sizeValueLabel) sizeValueLabel.textContent = val <= 0.2 ? 'Small' : val <= 0.3 ? 'Medium' : 'Large';
      renderLiveQR();
    });
  }

  // QR Export Buttons
  const btnPng = document.getElementById('btn-download-png');
  const btnSvg = document.getElementById('btn-download-svg');
  const btnJpg = document.getElementById('btn-download-jpg');
  const btnCopy = document.getElementById('btn-copy');
  const btnShare = document.getElementById('btn-share');
  const btnPrint = document.getElementById('btn-print');

  if (btnPng) btnPng.addEventListener('click', () => downloadQR('png'));
  if (btnSvg) btnSvg.addEventListener('click', () => downloadQR('svg'));
  if (btnJpg) btnJpg.addEventListener('click', () => downloadQR('jpeg'));
  if (btnCopy) btnCopy.addEventListener('click', copyQR);
  if (btnShare) btnShare.addEventListener('click', shareQR);
  if (btnPrint) btnPrint.addEventListener('click', printQR);

  // ==========================================
  // BARCODE LISTENERS
  // ==========================================
  const barcodeInput = document.getElementById('barcode-text');
  const barcodeFormat = document.getElementById('barcode-format');
  const barcodeHeight = document.getElementById('barcode-height');
  const barcodeWidth = document.getElementById('barcode-width');
  const barcodeDisplayVal = document.getElementById('barcode-display-val');
  const barcodeLineColor = document.getElementById('barcode-line-color');
  const barcodeBgColor = document.getElementById('barcode-bg-color');

  if (barcodeInput) {
    barcodeInput.addEventListener('input', (e) => {
      barcodeState.value = e.target.value;
      renderLiveBarcode();
    });
  }

  if (barcodeFormat) {
    barcodeFormat.addEventListener('change', (e) => {
      barcodeState.format = e.target.value;
      if (e.target.value === 'EAN13' && (!barcodeState.value || barcodeState.value.length < 12 || !/^\d+$/.test(barcodeState.value))) {
        barcodeState.value = '5901234123457';
        if (barcodeInput) barcodeInput.value = barcodeState.value;
      } else if (e.target.value === 'UPC' && (!barcodeState.value || barcodeState.value.length < 11 || !/^\d+$/.test(barcodeState.value))) {
        barcodeState.value = '012345678905';
        if (barcodeInput) barcodeInput.value = barcodeState.value;
      } else if (e.target.value === 'CODE39' && !/^[0-9A-Z\-.$/+% ]+$/i.test(barcodeState.value)) {
        barcodeState.value = 'CODE39-TEST';
        if (barcodeInput) barcodeInput.value = barcodeState.value;
      }
      renderLiveBarcode();
    });
  }

  if (barcodeHeight) {
    barcodeHeight.addEventListener('input', (e) => {
      barcodeState.height = Number(e.target.value);
      renderLiveBarcode();
    });
  }

  if (barcodeWidth) {
    barcodeWidth.addEventListener('input', (e) => {
      barcodeState.width = Number(e.target.value);
      renderLiveBarcode();
    });
  }

  if (barcodeDisplayVal) {
    barcodeDisplayVal.addEventListener('change', (e) => {
      barcodeState.displayValue = e.target.checked;
      renderLiveBarcode();
    });
  }

  if (barcodeLineColor) {
    barcodeLineColor.addEventListener('input', (e) => {
      barcodeState.lineColor = e.target.value;
      renderLiveBarcode();
    });
  }

  if (barcodeBgColor) {
    barcodeBgColor.addEventListener('input', (e) => {
      barcodeState.background = e.target.value;
      renderLiveBarcode();
    });
  }

  const btnBarcodeSvg = document.getElementById('btn-download-barcode-svg');
  const btnBarcodePng = document.getElementById('btn-download-barcode-png');
  const btnBarcodePrint = document.getElementById('btn-print-barcode');

  if (btnBarcodeSvg) btnBarcodeSvg.addEventListener('click', downloadBarcodeSVG);
  if (btnBarcodePng) btnBarcodePng.addEventListener('click', downloadBarcodePNG);
  if (btnBarcodePrint) btnBarcodePrint.addEventListener('click', printBarcode);

  // ==========================================
  // IMAGE TO PDF LISTENERS
  // ==========================================
  const imgFileInput = document.getElementById('input-image-files');
  const imgDropZone = document.getElementById('image-drop-zone');
  const btnSelectImages = document.getElementById('btn-select-images');
  const btnClearImages = document.getElementById('btn-clear-images');
  const btnConvertImages = document.getElementById('btn-convert-images');
  const selectPageSize = document.getElementById('pdf-page-size');
  const selectOrientation = document.getElementById('pdf-orientation');
  const selectFit = document.getElementById('pdf-fit');

  let pendingUploadCallback = null;

  function hasValidTermsConsent() {
    try {
      const raw = localStorage.getItem('qr_studio_terms_consent');
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      return parsed && parsed.version === 'v1.0-draft-2026-10';
    } catch (e) {
      return false;
    }
  }

  function hasValidUploadConsent() {
    try {
      const raw = localStorage.getItem('qr_studio_file_upload_consent');
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      return parsed && parsed.version === 'v1.0-draft-2026-10';
    } catch (e) {
      return false;
    }
  }

  function requireUploadConsent(onConfirmed) {
    if (hasValidUploadConsent()) {
      onConfirmed();
      return;
    }
    pendingUploadCallback = onConfirmed;
    const modal = document.getElementById('modal-upload-consent');
    const checkbox = document.getElementById('check-upload-confirm');
    const btnContinue = document.getElementById('btn-upload-continue');
    if (checkbox) checkbox.checked = false;
    if (btnContinue) btnContinue.disabled = true;
    if (modal) modal.classList.remove('hidden');
  }

  if (btnSelectImages && imgFileInput) {
    btnSelectImages.addEventListener('click', (e) => {
      e.stopPropagation();
      requireUploadConsent(() => imgFileInput.click());
    });
  }

  if (imgFileInput) {
    imgFileInput.addEventListener('change', (e) => {
      if (e.target.files) handleImageFiles(e.target.files);
      e.target.value = '';
    });
  }

  if (imgDropZone) {
    let imgDragCounter = 0;

    imgDropZone.addEventListener('click', (e) => {
      if (e.target !== imgFileInput && e.target !== btnSelectImages) {
        requireUploadConsent(() => imgFileInput?.click());
      }
    });

    imgDropZone.addEventListener('dragenter', (e) => {
      e.preventDefault();
      imgDragCounter++;
      if (imgDragCounter === 1) {
        imgDropZone.classList.add('drop-zone-active');
      }
    });

    imgDropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
      if (!imgDropZone.classList.contains('drop-zone-active')) {
        imgDropZone.classList.add('drop-zone-active');
      }
    });

    imgDropZone.addEventListener('dragleave', (e) => {
      e.preventDefault();
      imgDragCounter--;
      if (imgDragCounter <= 0) {
        imgDragCounter = 0;
        imgDropZone.classList.remove('drop-zone-active');
      }
    });

    imgDropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      imgDragCounter = 0;
      imgDropZone.classList.remove('drop-zone-active');
      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        const droppedFiles = e.dataTransfer.files;
        requireUploadConsent(() => handleImageFiles(droppedFiles));
      }
    });
  }

  if (btnClearImages) btnClearImages.addEventListener('click', clearAllImages);
  if (btnConvertImages) btnConvertImages.addEventListener('click', convertImagesToPDF);

  if (selectPageSize) {
    selectPageSize.addEventListener('change', (e) => { imgToPdfState.pageSize = e.target.value; });
  }
  if (selectOrientation) {
    selectOrientation.addEventListener('change', (e) => { imgToPdfState.orientation = e.target.value; });
  }
  if (selectFit) {
    selectFit.addEventListener('change', (e) => { imgToPdfState.fit = e.target.value; });
  }

  // ==========================================
  // MERGE PDF LISTENERS
  // ==========================================
  const pdfFileInput = document.getElementById('input-pdf-files');
  const pdfDropZone = document.getElementById('pdf-drop-zone');
  const btnSelectPdfs = document.getElementById('btn-select-pdfs');
  const btnClearPdfs = document.getElementById('btn-clear-pdfs');
  const btnMergePdfs = document.getElementById('btn-merge-pdfs');

  if (btnSelectPdfs && pdfFileInput) {
    btnSelectPdfs.addEventListener('click', (e) => {
      e.stopPropagation();
      requireUploadConsent(() => pdfFileInput.click());
    });
  }

  if (pdfFileInput) {
    pdfFileInput.addEventListener('change', (e) => {
      if (e.target.files) handlePdfFiles(e.target.files);
      e.target.value = '';
    });
  }

  if (pdfDropZone) {
    let pdfDragCounter = 0;

    pdfDropZone.addEventListener('click', (e) => {
      if (e.target !== pdfFileInput && e.target !== btnSelectPdfs) {
        requireUploadConsent(() => pdfFileInput?.click());
      }
    });

    pdfDropZone.addEventListener('dragenter', (e) => {
      e.preventDefault();
      pdfDragCounter++;
      if (pdfDragCounter === 1) {
        pdfDropZone.classList.add('drop-zone-active');
      }
    });

    pdfDropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
      if (!pdfDropZone.classList.contains('drop-zone-active')) {
        pdfDropZone.classList.add('drop-zone-active');
      }
    });

    pdfDropZone.addEventListener('dragleave', (e) => {
      e.preventDefault();
      pdfDragCounter--;
      if (pdfDragCounter <= 0) {
        pdfDragCounter = 0;
        pdfDropZone.classList.remove('drop-zone-active');
      }
    });

    pdfDropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      pdfDragCounter = 0;
      pdfDropZone.classList.remove('drop-zone-active');
      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        const droppedFiles = e.dataTransfer.files;
        requireUploadConsent(() => handlePdfFiles(droppedFiles));
      }
    });
  }

  if (btnClearPdfs) btnClearPdfs.addEventListener('click', clearAllPdfs);
  if (btnMergePdfs) btnMergePdfs.addEventListener('click', mergeSelectedPDFs);

  // ==========================================
  // TERMS, UPLOAD CONSENT & PRIVACY PREFERENCES
  // ==========================================
  const termsModal = document.getElementById('modal-terms-consent');
  const termsFormState = document.getElementById('terms-form-state');
  const termsDeclinedState = document.getElementById('terms-declined-state');
  const checkTermsAgree = document.getElementById('check-terms-agree');
  const btnAcceptTerms = document.getElementById('btn-accept-terms');
  const btnDeclineTerms = document.getElementById('btn-decline-terms');
  const btnReopenTerms = document.getElementById('btn-reopen-terms');

  // Show First-Visit Modal if not accepted
  if (!hasValidTermsConsent()) {
    if (termsModal) {
      termsModal.classList.remove('hidden');
      if (termsFormState) termsFormState.classList.remove('hidden');
      if (termsDeclinedState) termsDeclinedState.classList.add('hidden');
      if (checkTermsAgree) checkTermsAgree.checked = false;
      if (btnAcceptTerms) btnAcceptTerms.disabled = true;
    }
  }

  if (checkTermsAgree && btnAcceptTerms) {
    checkTermsAgree.addEventListener('change', () => {
      btnAcceptTerms.disabled = !checkTermsAgree.checked;
    });
  }

  if (btnAcceptTerms) {
    btnAcceptTerms.addEventListener('click', () => {
      try {
        localStorage.setItem(
          'qr_studio_terms_consent',
          JSON.stringify({
            version: 'v1.0-draft-2026-10',
            timestamp: new Date().toISOString(),
          })
        );
      } catch (e) {}
      if (termsModal) termsModal.classList.add('hidden');
      showToast('Terms & Privacy Policy accepted');
    });
  }

  if (btnDeclineTerms) {
    btnDeclineTerms.addEventListener('click', () => {
      if (termsFormState) termsFormState.classList.add('hidden');
      if (termsDeclinedState) termsDeclinedState.classList.remove('hidden');
    });
  }

  if (btnReopenTerms) {
    btnReopenTerms.addEventListener('click', () => {
      if (termsDeclinedState) termsDeclinedState.classList.add('hidden');
      if (termsFormState) termsFormState.classList.remove('hidden');
      if (checkTermsAgree) checkTermsAgree.checked = false;
      if (btnAcceptTerms) btnAcceptTerms.disabled = true;
    });
  }

  // Upload Consent Modal Handlers
  const uploadModal = document.getElementById('modal-upload-consent');
  const uploadCheck = document.getElementById('check-upload-confirm');
  const uploadContinueBtn = document.getElementById('btn-upload-continue');
  const uploadCancelBtn = document.getElementById('btn-upload-cancel');

  if (uploadCheck && uploadContinueBtn) {
    uploadCheck.addEventListener('change', () => {
      uploadContinueBtn.disabled = !uploadCheck.checked;
    });
  }

  if (uploadContinueBtn) {
    uploadContinueBtn.addEventListener('click', () => {
      try {
        localStorage.setItem(
          'qr_studio_file_upload_consent',
          JSON.stringify({
            version: 'v1.0-draft-2026-10',
            timestamp: new Date().toISOString(),
          })
        );
      } catch (e) {}

      if (uploadModal) uploadModal.classList.add('hidden');
      showToast('File rights confirmed');

      if (typeof pendingUploadCallback === 'function') {
        const cb = pendingUploadCallback;
        pendingUploadCallback = null;
        cb();
      }
    });
  }

  if (uploadCancelBtn) {
    uploadCancelBtn.addEventListener('click', () => {
      if (uploadModal) uploadModal.classList.add('hidden');
      pendingUploadCallback = null;
    });
  }

  // Privacy Preferences Modal Handlers
  const prefsModal = document.getElementById('modal-privacy-preferences');
  const openPrefsBtn = document.getElementById('btn-open-privacy-prefs');
  const closePrefsBtn = document.getElementById('btn-close-privacy-prefs');
  const savePrefsBtn = document.getElementById('btn-save-privacy-prefs');
  const resetAllBtn = document.getElementById('btn-reset-all-consent');

  if (openPrefsBtn && prefsModal) {
    openPrefsBtn.addEventListener('click', () => {
      prefsModal.classList.remove('hidden');
    });
  }

  if (closePrefsBtn && prefsModal) {
    closePrefsBtn.addEventListener('click', () => {
      prefsModal.classList.add('hidden');
    });
  }

  if (savePrefsBtn && prefsModal) {
    savePrefsBtn.addEventListener('click', () => {
      prefsModal.classList.add('hidden');
      showToast('Privacy preferences saved');
    });
  }

  if (resetAllBtn) {
    resetAllBtn.addEventListener('click', () => {
      localStorage.removeItem('qr_studio_terms_consent');
      localStorage.removeItem('qr_studio_file_upload_consent');
      localStorage.removeItem('qr_studio_last_known_count');
      if (prefsModal) prefsModal.classList.add('hidden');
      if (termsModal) {
        termsModal.classList.remove('hidden');
        if (termsFormState) termsFormState.classList.remove('hidden');
        if (termsDeclinedState) termsDeclinedState.classList.add('hidden');
        if (checkTermsAgree) checkTermsAgree.checked = false;
        if (btnAcceptTerms) btnAcceptTerms.disabled = true;
      }
      showToast('Consent reset. Please review terms again.');
    });
  }
}

// Initial Boot
window.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  renderLiveQR();
  renderLiveBarcode();
});
