/**
 * QR Studio — Developed by ANIX Software Technology
 * Production-ready Vanilla JavaScript Engine (Black & White Theme)
 * Handles 5 QR types, real-time live preview, custom colors, patterns, logo embedding,
 * high-res downloads (PNG, SVG, JPG), Copy to Clipboard, Web Share, Print, and Visitor Counter.
 */

import QRCodeStyling from 'qr-code-styling';
import confetti from 'canvas-confetti';

const QRCodeClass = window.QRCodeStyling || QRCodeStyling;

// State management
const state = {
  type: 'url', // 'url' | 'text' | 'wifi' | 'whatsapp' | 'vcard'
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
    fgColor: '#000000', // Pure Black
    bgColor: '#ffffff', // Pure White
    bgTransparent: false,
    pattern: 'rounded', // 'square' | 'rounded' | 'dots'
    logoUrl: null,
    logoName: '',
    logoSize: 0.28,
  },
};

let qrCodeInstance = null;

// Escaping for Wi-Fi strings (RFC 3986 / ZXing standard)
function escapeWifi(str) {
  return (str || '').replace(/([\\;,:"])/g, '\\$1');
}

// Generate the payload for the current QR type
function getPayload() {
  const { type, fields } = state;
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
      return encodedMsg
        ? `https://wa.me/${cleanNum}?text=${encodedMsg}`
        : `https://wa.me/${cleanNum}`;
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

// Convert pattern choice to qr-code-styling dot and corner types
function getPatternOptions(pattern) {
  switch (pattern) {
    case 'square':
      return {
        dotType: 'square',
        cornerSquareType: 'square',
        cornerDotType: 'square',
      };
    case 'dots':
      return {
        dotType: 'dots',
        cornerSquareType: 'extra-rounded',
        cornerDotType: 'dot',
      };
    case 'rounded':
    default:
      return {
        dotType: 'rounded',
        cornerSquareType: 'extra-rounded',
        cornerDotType: 'dot',
      };
  }
}

// Build options object for QRCodeStyling
function buildQrOptions(size = 320) {
  const payload = getPayload();
  const { design } = state;
  const patternTypes = getPatternOptions(design.pattern);

  // If a logo is present, use High (H - 30%) error correction so code scans flawlessly
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

// Calculate color contrast ratio (WCAG 2.1 algorithm)
function getLuminance(hex) {
  let c = (hex || '#000000').replace('#', '');
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  const num = parseInt(c, 16);
  if (isNaN(num)) return 0;
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  const a = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function checkContrast() {
  const { fgColor, bgColor, bgTransparent } = state.design;
  const contrastEl = document.getElementById('contrast-notice');
  if (!contrastEl) return;

  if (bgTransparent) {
    contrastEl.innerHTML = `<span class="text-xs text-neutral-600 font-medium">Transparent background · Contrast depends on placement</span>`;
    return;
  }

  const lum1 = getLuminance(fgColor);
  const lum2 = getLuminance(bgColor);
  const ratio = (Math.max(lum1, lum2) + 0.05) / (Math.min(lum1, lum2) + 0.05);

  if (ratio >= 4.5) {
    contrastEl.innerHTML = `<span class="inline-flex items-center gap-1.5 text-xs text-neutral-900 font-semibold"><svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Optimal contrast (Instant camera read)</span>`;
  } else if (ratio >= 3.0) {
    contrastEl.innerHTML = `<span class="inline-flex items-center gap-1.5 text-xs text-neutral-600 font-medium"><svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> Moderate contrast · Readable</span>`;
  } else {
    contrastEl.innerHTML = `<span class="inline-flex items-center gap-1.5 text-xs text-neutral-900 font-bold bg-neutral-100 px-2.5 py-1 rounded-md"><svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg> Low contrast · Darken code for best scanning</span>`;
  }
}

// Toast notification helper
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.textContent = message;
  toast.className = `fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl shadow-2xl text-xs font-semibold text-white transition-all transform duration-200 flex items-center gap-2 ${
    type === 'error' ? 'bg-neutral-800' : 'bg-black'
  } translate-y-0 opacity-100 border border-neutral-700`;

  setTimeout(() => {
    toast.className = 'fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl shadow-2xl text-xs font-semibold text-white transition-all transform duration-200 translate-y-8 opacity-0 pointer-events-none border border-neutral-700';
  }, 2400);
}

// Render or update live QR Preview
function renderLiveQR() {
  const container = document.getElementById('qr-canvas-target');
  if (!container) return;

  const options = buildQrOptions(300);

  if (!qrCodeInstance) {
    container.innerHTML = '';
    qrCodeInstance = new QRCodeClass(options);
    qrCodeInstance.append(container);
  } else {
    qrCodeInstance.update(options);
  }

  checkContrast();
}

// Download handlers
async function downloadQR(format) {
  try {
    const size = 1024; // High resolution output
    const options = buildQrOptions(size);

    // If JPEG and transparent, replace with solid white so it doesn't render black
    if (format === 'jpeg' && state.design.bgTransparent) {
      options.backgroundOptions = { color: '#ffffff' };
    }

    const exportInstance = new QRCodeClass(options);
    const filename = `qr-studio-${state.type}`;
    await exportInstance.download({ name: filename, extension: format });

    // Monochrome celebratory confetti
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

    showToast(`${format.toUpperCase()} downloaded successfully!`);
  } catch (err) {
    console.error('Download error:', err);
    showToast('Failed to download QR code.', 'error');
  }
}

// Copy to clipboard
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

    // Fallback: copy content string
    await navigator.clipboard.writeText(getPayload());
    showToast('QR content copied to clipboard!');
  } catch (err) {
    try {
      await navigator.clipboard.writeText(getPayload());
      showToast('QR content copied to clipboard!');
    } catch (e) {
      showToast('Clipboard access not supported.', 'error');
    }
  }
}

// Native device share
async function shareQR() {
  const payload = getPayload();
  try {
    const exportInstance = new QRCodeClass(buildQrOptions(1024));
    const raw = await exportInstance.getRawData('png');

    if (raw && navigator.share) {
      const blob = raw instanceof Blob ? raw : new Blob([raw], { type: 'image/png' });
      const file = new File([blob], `qr-studio-${state.type}.png`, { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'QR Studio Code',
          text: `Scan this QR code (${state.type.toUpperCase()})`,
          files: [file],
        });
        return;
      }
    }

    if (navigator.share) {
      await navigator.share({
        title: 'QR Studio Code',
        text: payload,
        url: window.location.href,
      });
    } else {
      await navigator.clipboard.writeText(payload);
      showToast('Link copied! Share anywhere.');
    }
  } catch (err) {
    if (err.name !== 'AbortError') {
      console.log('Share canceled or not available:', err);
    }
  }
}

// Print QR layout
function printQR() {
  const printTitle = document.getElementById('print-title');
  const printInfo = document.getElementById('print-info');

  if (printTitle && printInfo) {
    switch (state.type) {
      case 'url':
        printTitle.textContent = 'Scan to Visit Website';
        printInfo.textContent = state.fields.url;
        break;
      case 'wifi':
        printTitle.textContent = 'Scan to Connect to Wi-Fi';
        printInfo.textContent = `Network: ${state.fields.wifi.ssid} ${state.fields.wifi.password ? `(Password: ${state.fields.wifi.password})` : ''}`;
        break;
      case 'whatsapp':
        printTitle.textContent = 'Scan to Chat on WhatsApp';
        printInfo.textContent = `${state.fields.whatsapp.countryCode} ${state.fields.whatsapp.phone}`;
        break;
      case 'vcard':
        printTitle.textContent = 'Scan to Save Contact Card';
        printInfo.textContent = `${state.fields.vcard.firstName} ${state.fields.vcard.lastName} · ${state.fields.vcard.phone}`;
        break;
      case 'text':
        printTitle.textContent = 'Scan to Read Note';
        printInfo.textContent = state.fields.text.slice(0, 120);
        break;
    }
  }

  window.print();
}

// Live Visitor Counter in Footer
async function initVisitorCounter() {
  const counterEl = document.getElementById('visitor-count');
  if (!counterEl) return;

  const storageKey = 'qr_studio_visits_count';
  const sessionKey = 'qr_studio_has_visited';

  // Base realistic starting count for persistent client-side tracking
  let count = parseInt(localStorage.getItem(storageKey) || '1540', 10);

  // If this is a fresh user session, increment count
  if (!sessionStorage.getItem(sessionKey)) {
    count += 1;
    localStorage.setItem(storageKey, count.toString());
    sessionStorage.setItem(sessionKey, 'true');

    // Attempt background sync with free public counter if network available
    try {
      const res = await fetch('https://api.counterapi.dev/v1/anix-qr-studio/visits/up', {
        method: 'GET',
        cache: 'no-cache',
      });
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data.count === 'number') {
          count = Math.max(count, data.count);
          localStorage.setItem(storageKey, count.toString());
        }
      }
    } catch (e) {
      // Offline or blocked network fallback
    }
  }

  // Display formatted visitor count
  counterEl.textContent = count.toLocaleString();
}

// Bind all event listeners
function setupEventListeners() {
  // 1. QR Type Tabs
  document.querySelectorAll('[data-type]').forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.getAttribute('data-type');
      state.type = type;

      // Update active tab styles
      document.querySelectorAll('[data-type]').forEach(b => {
        b.className = 'type-tab flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer text-neutral-600 hover:text-black hover:bg-neutral-100';
      });
      btn.className = 'type-tab flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer bg-black text-white shadow-xs';

      // Switch form view
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

  // 2. Input Fields Binding
  // URL
  const inputUrl = document.getElementById('field-url');
  if (inputUrl) {
    inputUrl.addEventListener('input', (e) => {
      state.fields.url = e.target.value;
      renderLiveQR();
    });
  }

  // Text
  const inputText = document.getElementById('field-text');
  if (inputText) {
    inputText.addEventListener('input', (e) => {
      state.fields.text = e.target.value;
      renderLiveQR();
    });
  }

  // Wi-Fi
  const wifiSsid = document.getElementById('wifi-ssid');
  const wifiPass = document.getElementById('wifi-pass');
  const wifiEnc = document.getElementById('wifi-enc');
  const wifiHidden = document.getElementById('wifi-hidden');
  const togglePass = document.getElementById('btn-toggle-pass');

  if (wifiSsid) wifiSsid.addEventListener('input', (e) => { state.fields.wifi.ssid = e.target.value; renderLiveQR(); });
  if (wifiPass) wifiPass.addEventListener('input', (e) => { state.fields.wifi.password = e.target.value; renderLiveQR(); });
  if (wifiEnc) wifiEnc.addEventListener('change', (e) => { state.fields.wifi.encryption = e.target.value; renderLiveQR(); });
  if (wifiHidden) wifiHidden.addEventListener('change', (e) => { state.fields.wifi.hidden = e.target.checked; renderLiveQR(); });

  if (togglePass && wifiPass) {
    togglePass.addEventListener('click', () => {
      wifiPass.type = wifiPass.type === 'password' ? 'text' : 'password';
    });
  }

  // WhatsApp
  const waCode = document.getElementById('wa-code');
  const waPhone = document.getElementById('wa-phone');
  const waMsg = document.getElementById('wa-msg');

  if (waCode) waCode.addEventListener('change', (e) => { state.fields.whatsapp.countryCode = e.target.value; renderLiveQR(); });
  if (waPhone) waPhone.addEventListener('input', (e) => { state.fields.whatsapp.phone = e.target.value; renderLiveQR(); });
  if (waMsg) waMsg.addEventListener('input', (e) => { state.fields.whatsapp.message = e.target.value; renderLiveQR(); });

  // Contact (vCard)
  ['firstName', 'lastName', 'phone', 'email', 'organization', 'title', 'website'].forEach(key => {
    const el = document.getElementById(`vcard-${key}`);
    if (el) {
      el.addEventListener('input', (e) => {
        state.fields.vcard[key] = e.target.value;
        renderLiveQR();
      });
    }
  });

  // 3. Customization Controls
  // Pattern Buttons (Classic square, rounded, dots)
  document.querySelectorAll('[data-pattern]').forEach(btn => {
    btn.addEventListener('click', () => {
      const pat = btn.getAttribute('data-pattern');
      state.design.pattern = pat;

      document.querySelectorAll('[data-pattern]').forEach(b => {
        b.className = 'pattern-btn p-3 rounded-xl border border-neutral-200 hover:border-black hover:bg-neutral-50 text-left transition-all cursor-pointer text-xs font-medium text-neutral-700';
      });
      btn.className = 'pattern-btn p-3 rounded-xl border-2 border-black bg-neutral-100 text-left transition-all cursor-pointer text-xs font-bold text-black shadow-xs';

      renderLiveQR();
    });
  });

  // Colors
  const pickerFg = document.getElementById('picker-fg');
  const hexFg = document.getElementById('hex-fg');
  const pickerBg = document.getElementById('picker-bg');
  const hexBg = document.getElementById('hex-bg');
  const checkTrans = document.getElementById('check-transparent');

  if (pickerFg && hexFg) {
    pickerFg.addEventListener('input', (e) => {
      state.design.fgColor = e.target.value;
      hexFg.value = e.target.value;
      renderLiveQR();
    });
    hexFg.addEventListener('input', (e) => {
      state.design.fgColor = e.target.value;
      pickerFg.value = e.target.value;
      renderLiveQR();
    });
  }

  if (pickerBg && hexBg) {
    pickerBg.addEventListener('input', (e) => {
      state.design.bgColor = e.target.value;
      hexBg.value = e.target.value;
      renderLiveQR();
    });
    hexBg.addEventListener('input', (e) => {
      state.design.bgColor = e.target.value;
      pickerBg.value = e.target.value;
      renderLiveQR();
    });
  }

  if (checkTrans) {
    checkTrans.addEventListener('change', (e) => {
      state.design.bgTransparent = e.target.checked;
      renderLiveQR();
    });
  }

  // Quick Foreground Color Swatches
  document.querySelectorAll('[data-swatch]').forEach(btn => {
    btn.addEventListener('click', () => {
      const color = btn.getAttribute('data-swatch');
      state.design.fgColor = color;
      if (pickerFg) pickerFg.value = color;
      if (hexFg) hexFg.value = color;
      renderLiveQR();
    });
  });

  // 4. Logo Upload & Size
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

    logoInput.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        showToast('Please upload an image file (PNG, JPG, SVG).', 'error');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        state.design.logoUrl = event.target?.result;
        state.design.logoName = file.name;

        if (logoThumb) logoThumb.src = event.target?.result;
        if (logoTitle) logoTitle.textContent = file.name;
        if (logoBox) logoBox.classList.add('hidden');
        if (logoPreview) logoPreview.classList.remove('hidden');

        renderLiveQR();
        showToast('Logo embedded with 30% error correction!');
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    });
  }

  if (btnRemoveLogo) {
    btnRemoveLogo.addEventListener('click', () => {
      state.design.logoUrl = null;
      state.design.logoName = '';

      if (logoBox) logoBox.classList.remove('hidden');
      if (logoPreview) logoPreview.classList.add('hidden');

      renderLiveQR();
      showToast('Logo removed');
    });
  }

  if (sliderSize) {
    sliderSize.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      state.design.logoSize = val;
      if (sizeValueLabel) {
        sizeValueLabel.textContent = val <= 0.2 ? 'Small' : val <= 0.3 ? 'Medium' : 'Large';
      }
      renderLiveQR();
    });
  }

  // 5. Download and Share Action Buttons
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
}

// Initial boot
window.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  renderLiveQR();
  initVisitorCounter();
});
