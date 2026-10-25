/**
 * QR Studio Phase 1 - Core JavaScript Engine
 * Pure modern JavaScript with no TypeScript.
 * Handles live QR generation, custom styling, logo embedding, downloads, copy, share, print and deployment docs.
 */

import QRCodeStyling from 'qr-code-styling';
import confetti from 'canvas-confetti';

// Fallback to window object if available
const QRCodeClass = window.QRCodeStyling || QRCodeStyling;

// Built-in SVG logos (data URIs)
const PRESET_LOGOS = [
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    bengaliName: 'হোয়াটসঅ্যাপ',
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="%2325D366"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/></svg>`,
  },
  {
    id: 'wifi',
    name: 'Wi-Fi',
    bengaliName: 'ওয়াই-ফাই',
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%232563EB"><path d="M12 18a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-4.95-3.05a7 7 0 0 1 9.9 0l1.41-1.41a9 9 0 0 0-12.72 0l1.41 1.41zm-2.83-2.83a11 11 0 0 1 15.56 0l1.41-1.41a13 13 0 0 0-18.38 0l1.41 1.41zM.7 7.7a15 15 0 0 1 22.6 0l1.41-1.41a17 17 0 0 0-25.42 0L.7 7.7z"/></svg>`,
  },
  {
    id: 'link',
    name: 'Web / Link',
    bengaliName: 'ওয়েব লিঙ্ক',
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%234F46E5" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
  },
  {
    id: 'contact',
    name: 'vCard / User',
    bengaliName: 'কন্টাক্ট কার্ড',
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%23059669" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  },
  {
    id: 'location',
    name: 'Location Pin',
    bengaliName: 'লোকেশন পিন',
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23DC2626"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`,
  },
  {
    id: 'star',
    name: 'Star Badge',
    bengaliName: 'স্টার ব্যাজ',
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23D97706"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  },
];

// Presets
const STYLE_PRESETS = [
  {
    id: 'classic-dark',
    name: 'Modern Carbon',
    bengaliName: 'মডার্ন কার্বন',
    dotPattern: 'rounded',
    cornerSquarePattern: 'extra-rounded',
    cornerDotPattern: 'dot',
    fgType: 'solid',
    fgColor1: '#0f172a',
    fgColor2: '#0f172a',
    fgGradientType: 'linear',
    fgGradientAngle: 0,
    bgColor: '#ffffff',
    bgTransparent: false,
    cornerSquareColor: '#0f172a',
    cornerDotColor: '#0f172a',
  },
  {
    id: 'royal-indigo',
    name: 'Royal Indigo',
    bengaliName: 'রয়্যাল নীল',
    dotPattern: 'classy-rounded',
    cornerSquarePattern: 'extra-rounded',
    cornerDotPattern: 'dot',
    fgType: 'gradient',
    fgColor1: '#4338ca',
    fgColor2: '#6366f1',
    fgGradientType: 'linear',
    fgGradientAngle: 45,
    bgColor: '#ffffff',
    bgTransparent: false,
    cornerSquareColor: '#312e81',
    cornerDotColor: '#4f46e5',
  },
  {
    id: 'emerald-growth',
    name: 'Emerald Lush',
    bengaliName: 'সবুজ এমারেল্ড',
    dotPattern: 'dots',
    cornerSquarePattern: 'extra-rounded',
    cornerDotPattern: 'dot',
    fgType: 'gradient',
    fgColor1: '#047857',
    fgColor2: '#10b981',
    fgGradientType: 'linear',
    fgGradientAngle: 135,
    bgColor: '#ffffff',
    bgTransparent: false,
    cornerSquareColor: '#065f46',
    cornerDotColor: '#059669',
  },
  {
    id: 'sunset-coral',
    name: 'Sunset Coral',
    bengaliName: 'সানসেট কোরাল',
    dotPattern: 'classy',
    cornerSquarePattern: 'square',
    cornerDotPattern: 'square',
    fgType: 'gradient',
    fgColor1: '#c2410c',
    fgColor2: '#e11d48',
    fgGradientType: 'linear',
    fgGradientAngle: 90,
    bgColor: '#ffffff',
    bgTransparent: false,
    cornerSquareColor: '#9a3412',
    cornerDotColor: '#be123c',
  },
  {
    id: 'midnight-teal',
    name: 'Midnight Teal',
    bengaliName: 'মিডনাইট টিল',
    dotPattern: 'extra-rounded',
    cornerSquarePattern: 'extra-rounded',
    cornerDotPattern: 'dot',
    fgType: 'gradient',
    fgColor1: '#0f766e',
    fgColor2: '#0284c7',
    fgGradientType: 'radial',
    fgGradientAngle: 0,
    bgColor: '#ffffff',
    bgTransparent: false,
    cornerSquareColor: '#115e59',
    cornerDotColor: '#0369a1',
  },
  {
    id: 'minimalist-mono',
    name: 'Strict Monochrome',
    bengaliName: 'ক্লাসিক ব্ল্যাক & হোয়াইট',
    dotPattern: 'square',
    cornerSquarePattern: 'square',
    cornerDotPattern: 'square',
    fgType: 'solid',
    fgColor1: '#000000',
    fgColor2: '#000000',
    fgGradientType: 'linear',
    fgGradientAngle: 0,
    bgColor: '#ffffff',
    bgTransparent: false,
    cornerSquareColor: '#000000',
    cornerDotColor: '#000000',
  },
];

// Application State
const appState = {
  language: 'en', // 'en' | 'bn'
  activeType: 'url',
  resolution: 1024,
  fields: {
    url: 'https://example.com',
    text: 'Hello from QR Studio!',
    wifi: {
      ssid: 'Home_WiFi_5G',
      password: '',
      encryption: 'WPA',
      hidden: false,
    },
    whatsapp: {
      countryCode: '+880',
      phone: '',
      message: 'Hello, I saw your QR code and would like more details!',
    },
    vcard: {
      firstName: 'Sandip',
      lastName: 'Hembram',
      phone: '+8801700000000',
      email: 'hello@example.com',
      organization: 'QR Studio',
      title: 'Founder & Engineer',
      website: 'https://example.com',
      address: 'Dhaka, Bangladesh',
      note: 'Created with QR Studio Phase 1',
    },
  },
  design: {
    dotPattern: 'rounded',
    cornerSquarePattern: 'extra-rounded',
    cornerDotPattern: 'dot',
    fgType: 'solid',
    fgColor1: '#0f172a',
    fgColor2: '#4338ca',
    fgGradientType: 'linear',
    fgGradientAngle: 45,
    bgColor: '#ffffff',
    bgTransparent: false,
    customCorners: false,
    cornerSquareColor: '#0f172a',
    cornerDotColor: '#0f172a',
    logoUrl: null,
    logoName: '',
    logoSize: 0.28,
    logoMargin: 4,
    hideBackgroundDots: true,
    errorCorrection: 'M',
  },
};

let qrCodeInstance = null;

// Escaping for Wi-Fi strings
function escapeWifi(str) {
  return (str || '').replace(/([\\;,:"])/g, '\\$1');
}

// Build standard payload string
function getPayload() {
  const { activeType, fields } = appState;
  switch (activeType) {
    case 'url': {
      const trimmed = (fields.url || '').trim();
      if (!trimmed) return 'https://example.com';
      if (!/^https?:\/\//i.test(trimmed) && !/^[a-z]+:/i.test(trimmed)) {
        return `https://${trimmed}`;
      }
      return trimmed;
    }
    case 'text':
      return fields.text || 'Welcome to QR Studio';
    case 'wifi': {
      const { ssid, password, encryption, hidden } = fields.wifi;
      const cleanSsid = escapeWifi(ssid || 'My_WiFi_Network');
      const cleanPass = escapeWifi(password || '');
      const cleanEnc = encryption === 'nopass' ? 'nopass' : encryption;
      if (cleanEnc === 'nopass') {
        return `WIFI:T:nopass;S:${cleanSsid};H:${hidden ? 'true' : 'false'};;`;
      }
      return `WIFI:T:${cleanEnc};S:${cleanSsid};P:${cleanPass};H:${hidden ? 'true' : 'false'};;`;
    }
    case 'whatsapp': {
      const { countryCode, phone, message } = fields.whatsapp;
      const combined = `${countryCode}${phone}`.replace(/[^\d+]/g, '');
      const cleanPhone = combined.startsWith('+') ? combined.substring(1) : combined;
      const encodedMsg = encodeURIComponent(message || '');
      if (!cleanPhone) return 'https://wa.me/';
      return encodedMsg ? `https://wa.me/${cleanPhone}?text=${encodedMsg}` : `https://wa.me/${cleanPhone}`;
    }
    case 'vcard': {
      const { firstName, lastName, organization, title, phone, email, website, address, note } = fields.vcard;
      const fName = (firstName || '').trim();
      const lName = (lastName || '').trim();
      const fullName = [fName, lName].filter(Boolean).join(' ') || 'Contact Person';
      const lines = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `N:${lName};${fName};;;`,
        `FN:${fullName}`,
      ];
      if (organization.trim()) lines.push(`ORG:${organization.trim()}`);
      if (title.trim()) lines.push(`TITLE:${title.trim()}`);
      if (phone.trim()) lines.push(`TEL;TYPE=CELL,VOICE:${phone.trim()}`);
      if (email.trim()) lines.push(`EMAIL;TYPE=PREF,INTERNET:${email.trim()}`);
      if (website.trim()) {
        const site = website.trim();
        lines.push(`URL:${/^https?:\/\//i.test(site) ? site : `https://${site}`}`);
      }
      if (address.trim()) lines.push(`ADR;TYPE=WORK:;;${address.trim()};;;;`);
      if (note.trim()) lines.push(`NOTE:${note.trim()}`);
      lines.push('END:VCARD');
      return lines.join('\n');
    }
    default:
      return 'https://example.com';
  }
}

// Luminance and Contrast calculation
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

function getContrastInfo() {
  const { fgColor1, bgColor, bgTransparent } = appState.design;
  if (bgTransparent) {
    return {
      ratio: '—',
      label: appState.language === 'en'
        ? 'Transparent (Ensure contrast when placed)'
        : 'স্বচ্ছ ব্যাকগ্রাউন্ড (বিপরীত রঙে রাখুন)',
      isGood: true,
    };
  }
  const lum1 = getLuminance(fgColor1);
  const lum2 = getLuminance(bgColor);
  const ratio = (Math.max(lum1, lum2) + 0.05) / (Math.min(lum1, lum2) + 0.05);
  const rounded = Math.round(ratio * 10) / 10;
  if (ratio >= 5) {
    return {
      ratio: `${rounded}:1`,
      label: appState.language === 'en' ? 'Optimal scannability' : 'চমৎকার স্ক্যানযোগ্যতা',
      isGood: true,
    };
  } else if (ratio >= 3) {
    return {
      ratio: `${rounded}:1`,
      label: appState.language === 'en' ? 'Good scannability' : 'ভালো স্ক্যানযোগ্যতা',
      isGood: true,
    };
  } else {
    return {
      ratio: `${rounded}:1`,
      label: appState.language === 'en' ? 'Low contrast! Scanner may struggle' : 'কম কনট্রাস্ট! স্ক্যানারে সমস্যা হতে পারে',
      isGood: false,
    };
  }
}

// Generate options for QRCodeStyling
function buildQrOptions(resolution = 320) {
  const payload = getPayload();
  const { design } = appState;
  const effectiveEc = design.logoUrl ? 'H' : design.errorCorrection;

  return {
    width: resolution,
    height: resolution,
    data: payload,
    margin: Math.round(resolution * 0.035),
    qrOptions: {
      typeNumber: 0,
      mode: 'Byte',
      errorCorrectionLevel: effectiveEc,
    },
    imageOptions: {
      hideBackgroundDots: design.hideBackgroundDots,
      imageSize: design.logoSize,
      margin: design.logoMargin * (resolution / 320),
      crossOrigin: 'anonymous',
    },
    dotsOptions: {
      type: design.dotPattern,
      color: design.fgType === 'solid' ? design.fgColor1 : undefined,
      gradient: design.fgType === 'gradient' ? {
        type: design.fgGradientType,
        rotation: (design.fgGradientAngle * Math.PI) / 180,
        colorStops: [
          { offset: 0, color: design.fgColor1 },
          { offset: 1, color: design.fgColor2 },
        ],
      } : undefined,
    },
    backgroundOptions: {
      color: design.bgTransparent ? 'rgba(255,255,255,0)' : design.bgColor,
    },
    cornersSquareOptions: {
      type: design.cornerSquarePattern,
      color: design.customCorners ? design.cornerSquareColor : design.fgColor1,
    },
    cornersDotOptions: {
      type: design.cornerDotPattern,
      color: design.customCorners ? design.cornerDotColor : design.fgColor1,
    },
    image: design.logoUrl || undefined,
  };
}

// Render or update QR Code in preview frame
function renderQRCode() {
  const container = document.getElementById('qr-canvas-container');
  if (!container) return;

  const options = buildQrOptions(320);

  if (!qrCodeInstance) {
    container.innerHTML = '';
    qrCodeInstance = new QRCodeClass(options);
    qrCodeInstance.append(container);
  } else {
    qrCodeInstance.update(options);
  }

  // Update contrast indicator
  updateContrastDisplay();
}

function updateContrastDisplay() {
  const contrastBadge = document.getElementById('contrast-badge');
  const contrastRatio = document.getElementById('contrast-ratio');
  if (!contrastBadge || !contrastRatio) return;

  const info = getContrastInfo();
  contrastRatio.textContent = info.ratio;
  contrastBadge.textContent = info.label;

  if (info.isGood) {
    contrastBadge.className = 'text-xs font-semibold text-emerald-700';
    contrastRatio.className = 'font-mono text-slate-500 tabular-nums';
  } else {
    contrastBadge.className = 'text-xs font-semibold text-amber-700';
    contrastRatio.className = 'font-mono text-amber-700 tabular-nums';
  }
}

// Download handler
async function handleDownload(extension) {
  const payload = getPayload();
  const resolution = appState.resolution;
  const options = buildQrOptions(resolution);
  
  // Ensure JPEG doesn't save transparent black
  if (extension === 'jpeg' && appState.design.bgTransparent) {
    options.backgroundOptions = { color: '#ffffff' };
  }

  const exportQr = new QRCodeClass(options);
  const filename = `qr-${appState.activeType}-${Date.now()}`;
  await exportQr.download({ name: filename, extension: extension });

  // Confetti effect
  if (typeof confetti === 'function') {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#4f46e5', '#10b981', '#f59e0b', '#06b6d4'],
    });
  }
}

// Clipboard copy handler
async function handleCopy() {
  const copyBtn = document.getElementById('btn-copy');
  const originalText = copyBtn.innerHTML;

  try {
    const payload = getPayload();
    const exportQr = new QRCodeClass(buildQrOptions(1024));
    const raw = await exportQr.getRawData('png');
    
    if (raw && navigator.clipboard && window.ClipboardItem) {
      const blob = raw instanceof Blob ? raw : new Blob([raw], { type: 'image/png' });
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      copyBtn.innerHTML = `<span>${appState.language === 'en' ? 'Copied Image!' : 'ছবি কপি হয়েছে!'}</span>`;
      setTimeout(() => (copyBtn.innerHTML = originalText), 2200);
      return;
    }
    
    // Text fallback
    await navigator.clipboard.writeText(payload);
    copyBtn.innerHTML = `<span>${appState.language === 'en' ? 'Copied Text!' : 'টেক্সট কপি হয়েছে!'}</span>`;
    setTimeout(() => (copyBtn.innerHTML = originalText), 2200);
  } catch (err) {
    try {
      await navigator.clipboard.writeText(getPayload());
      copyBtn.innerHTML = `<span>${appState.language === 'en' ? 'Copied Text!' : 'টেক্সট কপি হয়েছে!'}</span>`;
      setTimeout(() => (copyBtn.innerHTML = originalText), 2200);
    } catch (e) {
      alert('Copy failed: ' + e.message);
    }
  }
}

// Native share handler
async function handleShare() {
  const payload = getPayload();
  try {
    const exportQr = new QRCodeClass(buildQrOptions(1024));
    const raw = await exportQr.getRawData('png');
    if (raw && navigator.share) {
      const blob = raw instanceof Blob ? raw : new Blob([raw], { type: 'image/png' });
      const file = new File([blob], `qr-${appState.activeType}.png`, { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'QR Studio Code',
          text: `QR code generated with QR Studio (${appState.activeType.toUpperCase()})`,
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
      alert(appState.language === 'en' ? 'Payload copied to clipboard!' : 'লিঙ্ক ক্লিপবোর্ডে কপি হয়েছে!');
    }
  } catch (err) {
    console.log('Share canceled:', err);
  }
}

// Print Handler
function handlePrint() {
  // Update print sheet details before printing
  const payload = getPayload();
  const printTitle = document.getElementById('print-sheet-title');
  const printDetail = document.getElementById('print-sheet-detail');
  
  if (printTitle && printDetail) {
    switch (appState.activeType) {
      case 'url':
        printTitle.textContent = appState.language === 'en' ? 'Scan to Visit Website' : 'ওয়েবসাইট ভিজিট করতে স্ক্যান করুন';
        printDetail.textContent = appState.fields.url;
        break;
      case 'wifi':
        printTitle.textContent = appState.language === 'en' ? 'Scan to Connect to Wi-Fi' : 'ওয়াই-ফাই কানেক্ট করতে স্ক্যান করুন';
        printDetail.textContent = `SSID: ${appState.fields.wifi.ssid} ${appState.fields.wifi.password ? `· Pass: ${appState.fields.wifi.password}` : ''}`;
        break;
      case 'whatsapp':
        printTitle.textContent = appState.language === 'en' ? 'Scan to Chat on WhatsApp' : 'হোয়াটসঅ্যাপে চ্যাট করতে স্ক্যান করুন';
        printDetail.textContent = `${appState.fields.whatsapp.countryCode} ${appState.fields.whatsapp.phone}`;
        break;
      case 'vcard':
        printTitle.textContent = appState.language === 'en' ? 'Scan to Save Contact Card' : 'কন্টাক্ট কার্ড সেভ করতে স্ক্যান করুন';
        printDetail.textContent = `${appState.fields.vcard.firstName} ${appState.fields.vcard.lastName} · ${appState.fields.vcard.phone}`;
        break;
      case 'text':
        printTitle.textContent = appState.language === 'en' ? 'Scan to Read Information' : 'তথ্য দেখতে স্ক্যান করুন';
        printDetail.textContent = appState.fields.text.slice(0, 100);
        break;
    }
  }

  window.print();
}

// Test Scan Simulator Modal
function openTestScanModal() {
  const modal = document.getElementById('test-scan-modal');
  const content = document.getElementById('test-scan-content');
  if (!modal || !content) return;

  const payload = getPayload();
  const { activeType, fields } = appState;

  let html = '';
  if (activeType === 'url') {
    html = `
      <div class="space-y-2">
        <div class="font-semibold text-slate-900 text-xs">Target Website URL:</div>
        <div class="p-2.5 bg-slate-100 rounded font-mono text-xs text-indigo-700 break-all select-all">${payload}</div>
        <a href="${payload}" target="_blank" rel="noreferrer" class="inline-block mt-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded text-xs">
          Open in New Tab →
        </a>
      </div>
    `;
  } else if (activeType === 'wifi') {
    html = `
      <div class="space-y-1.5 text-xs">
        <div class="font-semibold text-slate-900">Wi-Fi Connection Payload:</div>
        <div class="p-2.5 bg-slate-100 rounded space-y-1">
          <div><span class="text-slate-500">SSID:</span> <strong>${fields.wifi.ssid}</strong></div>
          <div><span class="text-slate-500">Security:</span> <span class="font-mono">${fields.wifi.encryption}</span></div>
          ${fields.wifi.password ? `<div><span class="text-slate-500">Password:</span> <span class="font-mono font-semibold">${fields.wifi.password}</span></div>` : ''}
        </div>
        <p class="text-[11px] text-slate-500 pt-1">Smartphone camera displays: "Join '${fields.wifi.ssid}' Wi-Fi Network?"</p>
      </div>
    `;
  } else if (activeType === 'whatsapp') {
    html = `
      <div class="space-y-2 text-xs">
        <div class="font-semibold text-slate-900">WhatsApp Chat Action:</div>
        <div class="p-2.5 bg-slate-100 rounded space-y-1">
          <div><span class="text-slate-500">Phone:</span> <strong>${fields.whatsapp.countryCode} ${fields.whatsapp.phone}</strong></div>
          ${fields.whatsapp.message ? `<div><span class="text-slate-500">Message:</span> <em>"${fields.whatsapp.message}"</em></div>` : ''}
        </div>
        <a href="${payload}" target="_blank" rel="noreferrer" class="inline-block mt-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded text-xs">
          Test WhatsApp Link →
        </a>
      </div>
    `;
  } else if (activeType === 'vcard') {
    html = `
      <div class="space-y-2 text-xs">
        <div class="font-semibold text-slate-900">Contact Card (vCard 3.0):</div>
        <div class="p-2.5 bg-slate-100 rounded space-y-1">
          <div class="font-bold text-slate-900">${fields.vcard.firstName} ${fields.vcard.lastName}</div>
          <div>${fields.vcard.phone} · ${fields.vcard.email}</div>
          <div class="text-slate-500">${fields.vcard.organization} ${fields.vcard.title ? `(${fields.vcard.title})` : ''}</div>
        </div>
        <button id="btn-download-vcf" class="mt-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded text-xs cursor-pointer">
          Download .VCF File
        </button>
      </div>
    `;
  } else {
    html = `
      <div class="space-y-2 text-xs">
        <div class="font-semibold text-slate-900">Plain Text Content:</div>
        <div class="p-2.5 bg-slate-100 rounded text-slate-800 whitespace-pre-wrap max-h-36 overflow-y-auto">${fields.text}</div>
      </div>
    `;
  }

  content.innerHTML = html;

  const vcfBtn = document.getElementById('btn-download-vcf');
  if (vcfBtn) {
    vcfBtn.addEventListener('click', () => {
      const blob = new Blob([payload], { type: 'text/vcard;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fields.vcard.firstName || 'contact'}.vcf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }

  modal.classList.remove('hidden');
}

function closeTestScanModal() {
  const modal = document.getElementById('test-scan-modal');
  if (modal) modal.classList.add('hidden');
}

// Deploy Guide Modal
function openDeployModal(tab = 'vercel') {
  const modal = document.getElementById('deploy-modal');
  if (!modal) return;
  modal.classList.remove('hidden');
  switchDeployTab(tab);
}

function closeDeployModal() {
  const modal = document.getElementById('deploy-modal');
  if (modal) modal.classList.add('hidden');
}

function switchDeployTab(tab) {
  const tabs = ['vercel', 'local', 'architecture'];
  tabs.forEach(t => {
    const btn = document.getElementById(`tab-btn-${t}`);
    const section = document.getElementById(`tab-sec-${t}`);
    if (btn) {
      if (t === tab) {
        btn.className = 'py-3 border-b-2 border-indigo-600 text-indigo-600 font-semibold cursor-pointer';
      } else {
        btn.className = 'py-3 border-b-2 border-transparent text-slate-500 hover:text-slate-800 cursor-pointer';
      }
    }
    if (section) {
      if (t === tab) {
        section.classList.remove('hidden');
      } else {
        section.classList.add('hidden');
      }
    }
  });
}

// Language Switcher
function toggleLanguage() {
  appState.language = appState.language === 'en' ? 'bn' : 'en';
  applyLanguage();
}

function applyLanguage() {
  const isBn = appState.language === 'bn';
  document.querySelectorAll('[data-en]').forEach(el => {
    const enText = el.getAttribute('data-en');
    const bnText = el.getAttribute('data-bn');
    if (isBn && bnText) {
      el.textContent = bnText;
    } else if (enText) {
      el.textContent = enText;
    }
  });

  const langBtn = document.getElementById('btn-lang-toggle');
  if (langBtn) {
    langBtn.innerHTML = `<span>${isBn ? 'English' : 'বাংলা'}</span>`;
  }

  updateContrastDisplay();
}

// Reset Studio to Default
function resetDefaults() {
  appState.fields.url = 'https://example.com';
  appState.fields.text = 'Hello from QR Studio!';
  appState.fields.wifi = { ssid: 'Home_WiFi_5G', password: '', encryption: 'WPA', hidden: false };
  appState.fields.whatsapp = { countryCode: '+880', phone: '', message: '' };
  appState.fields.vcard = { firstName: 'Sandip', lastName: 'Hembram', phone: '+8801700000000', email: '', organization: '', title: '', website: '', address: '', note: '' };
  
  appState.design.dotPattern = 'rounded';
  appState.design.cornerSquarePattern = 'extra-rounded';
  appState.design.cornerDotPattern = 'dot';
  appState.design.fgType = 'solid';
  appState.design.fgColor1 = '#0f172a';
  appState.design.fgColor2 = '#4338ca';
  appState.design.bgColor = '#ffffff';
  appState.design.bgTransparent = false;
  appState.design.customCorners = false;
  appState.design.logoUrl = null;
  appState.design.logoName = '';

  syncFormValuesFromState();
  renderQRCode();
}

// Synchronize inputs with state
function syncFormValuesFromState() {
  // URL
  const inputUrl = document.getElementById('input-url');
  if (inputUrl) inputUrl.value = appState.fields.url;

  // Text
  const inputText = document.getElementById('input-text');
  if (inputText) inputText.value = appState.fields.text;

  // Wi-Fi
  const wifiSsid = document.getElementById('wifi-ssid');
  const wifiPass = document.getElementById('wifi-password');
  const wifiEnc = document.getElementById('wifi-enc');
  const wifiHidden = document.getElementById('wifi-hidden');
  if (wifiSsid) wifiSsid.value = appState.fields.wifi.ssid;
  if (wifiPass) wifiPass.value = appState.fields.wifi.password;
  if (wifiEnc) wifiEnc.value = appState.fields.wifi.encryption;
  if (wifiHidden) wifiHidden.checked = appState.fields.wifi.hidden;

  // WhatsApp
  const waCode = document.getElementById('wa-code');
  const waPhone = document.getElementById('wa-phone');
  const waMsg = document.getElementById('wa-msg');
  if (waCode) waCode.value = appState.fields.whatsapp.countryCode;
  if (waPhone) waPhone.value = appState.fields.whatsapp.phone;
  if (waMsg) waMsg.value = appState.fields.whatsapp.message;

  // Colors
  const fgColor1 = document.getElementById('picker-fg1');
  const fgColor1Hex = document.getElementById('hex-fg1');
  const bgColor = document.getElementById('picker-bg');
  const bgColorHex = document.getElementById('hex-bg');
  const bgTrans = document.getElementById('check-bg-trans');
  if (fgColor1) fgColor1.value = appState.design.fgColor1;
  if (fgColor1Hex) fgColor1Hex.value = appState.design.fgColor1;
  if (bgColor) bgColor.value = appState.design.bgColor;
  if (bgColorHex) bgColorHex.value = appState.design.bgColor;
  if (bgTrans) bgTrans.checked = appState.design.bgTransparent;

  // Logo info
  const logoActiveName = document.getElementById('logo-active-name');
  if (logoActiveName) {
    logoActiveName.textContent = appState.design.logoName
      ? `${appState.language === 'en' ? 'Active: ' : 'বর্তমান: '}${appState.design.logoName}`
      : (appState.language === 'en' ? 'Upload custom logo image (PNG, SVG, JPG)' : 'ডিভাইস থেকে নিজের লোগো আপলোড করুন');
  }

  const removeLogoBtn = document.getElementById('btn-remove-logo');
  if (removeLogoBtn) {
    if (appState.design.logoUrl) {
      removeLogoBtn.classList.remove('hidden');
    } else {
      removeLogoBtn.classList.add('hidden');
    }
  }
}

// Setup Event Listeners
function initEventListeners() {
  // 1. QR Type Selector tabs
  document.querySelectorAll('[data-type-tab]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const type = btn.getAttribute('data-type-tab');
      appState.activeType = type;

      // Update active tab buttons
      document.querySelectorAll('[data-type-tab]').forEach(b => {
        b.className = 'type-btn flex flex-col items-center justify-center py-2.5 px-2 rounded-lg text-xs font-medium transition-all cursor-pointer text-slate-600 hover:text-slate-900 hover:bg-slate-200/60';
      });
      btn.className = 'type-btn flex flex-col items-center justify-center py-2.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer bg-white text-slate-900 shadow-xs border border-slate-200/80';

      // Toggle form sections
      ['url', 'text', 'wifi', 'whatsapp', 'vcard'].forEach(t => {
        const sec = document.getElementById(`form-${t}`);
        if (sec) {
          if (t === type) sec.classList.remove('hidden');
          else sec.classList.add('hidden');
        }
      });

      renderQRCode();
    });
  });

  // 2. Form Inputs binding
  // URL
  const inputUrl = document.getElementById('input-url');
  if (inputUrl) {
    inputUrl.addEventListener('input', (e) => {
      appState.fields.url = e.target.value;
      renderQRCode();
    });
  }

  // Quick URL samples
  document.querySelectorAll('[data-sample-url]').forEach(btn => {
    btn.addEventListener('click', () => {
      const sample = btn.getAttribute('data-sample-url');
      if (inputUrl) inputUrl.value = sample;
      appState.fields.url = sample;
      renderQRCode();
    });
  });

  // Text
  const inputText = document.getElementById('input-text');
  const textCount = document.getElementById('text-char-count');
  if (inputText) {
    inputText.addEventListener('input', (e) => {
      appState.fields.text = e.target.value;
      if (textCount) textCount.textContent = `${e.target.value.length} chars`;
      renderQRCode();
    });
  }

  // Wi-Fi
  const wifiSsid = document.getElementById('wifi-ssid');
  const wifiPass = document.getElementById('wifi-password');
  const wifiEnc = document.getElementById('wifi-enc');
  const wifiHidden = document.getElementById('wifi-hidden');
  const passToggle = document.getElementById('btn-toggle-pass');

  if (wifiSsid) wifiSsid.addEventListener('input', (e) => { appState.fields.wifi.ssid = e.target.value; renderQRCode(); });
  if (wifiPass) wifiPass.addEventListener('input', (e) => { appState.fields.wifi.password = e.target.value; renderQRCode(); });
  if (wifiEnc) wifiEnc.addEventListener('change', (e) => { appState.fields.wifi.encryption = e.target.value; renderQRCode(); });
  if (wifiHidden) wifiHidden.addEventListener('change', (e) => { appState.fields.wifi.hidden = e.target.checked; renderQRCode(); });
  
  if (passToggle && wifiPass) {
    passToggle.addEventListener('click', () => {
      wifiPass.type = wifiPass.type === 'password' ? 'text' : 'password';
    });
  }

  // WhatsApp
  const waCode = document.getElementById('wa-code');
  const waPhone = document.getElementById('wa-phone');
  const waMsg = document.getElementById('wa-msg');
  if (waCode) waCode.addEventListener('change', (e) => { appState.fields.whatsapp.countryCode = e.target.value; renderQRCode(); });
  if (waPhone) waPhone.addEventListener('input', (e) => { appState.fields.whatsapp.phone = e.target.value; renderQRCode(); });
  if (waMsg) waMsg.addEventListener('input', (e) => { appState.fields.whatsapp.message = e.target.value; renderQRCode(); });

  // vCard
  ['firstName', 'lastName', 'phone', 'email', 'organization', 'title', 'website', 'address', 'note'].forEach(field => {
    const el = document.getElementById(`vcard-${field}`);
    if (el) {
      el.addEventListener('input', (e) => {
        appState.fields.vcard[field] = e.target.value;
        renderQRCode();
      });
    }
  });

  // 3. Design Subtabs (Presets, Patterns, Colors, Logo)
  document.querySelectorAll('[data-design-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-design-tab');
      document.querySelectorAll('[data-design-tab]').forEach(b => {
        b.className = 'design-subtab flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer text-slate-600 hover:text-slate-900';
      });
      btn.className = 'design-subtab flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer bg-white text-slate-900 shadow-xs border border-slate-200/80';

      ['presets', 'patterns', 'colors', 'logo'].forEach(t => {
        const sec = document.getElementById(`design-sec-${t}`);
        if (sec) {
          if (t === tab) sec.classList.remove('hidden');
          else sec.classList.add('hidden');
        }
      });
    });
  });

  // 4. Dot Patterns
  document.querySelectorAll('[data-pattern]').forEach(btn => {
    btn.addEventListener('click', () => {
      const pat = btn.getAttribute('data-pattern');
      appState.design.dotPattern = pat;
      document.querySelectorAll('[data-pattern]').forEach(b => {
        b.classList.remove('border-indigo-600', 'bg-indigo-50/50', 'text-indigo-900', 'font-semibold');
      });
      btn.classList.add('border-indigo-600', 'bg-indigo-50/50', 'text-indigo-900', 'font-semibold');
      renderQRCode();
    });
  });

  // 5. Corner Frame & Dot Styles
  document.querySelectorAll('[data-corner-square]').forEach(btn => {
    btn.addEventListener('click', () => {
      appState.design.cornerSquarePattern = btn.getAttribute('data-corner-square');
      document.querySelectorAll('[data-corner-square]').forEach(b => b.classList.remove('border-indigo-600', 'bg-indigo-50/50', 'text-indigo-900', 'font-semibold'));
      btn.classList.add('border-indigo-600', 'bg-indigo-50/50', 'text-indigo-900', 'font-semibold');
      renderQRCode();
    });
  });

  document.querySelectorAll('[data-corner-dot]').forEach(btn => {
    btn.addEventListener('click', () => {
      appState.design.cornerDotPattern = btn.getAttribute('data-corner-dot');
      document.querySelectorAll('[data-corner-dot]').forEach(b => b.classList.remove('border-indigo-600', 'bg-indigo-50/50', 'text-indigo-900', 'font-semibold'));
      btn.classList.add('border-indigo-600', 'bg-indigo-50/50', 'text-indigo-900', 'font-semibold');
      renderQRCode();
    });
  });

  // 6. Color Pickers & Solid/Gradient
  const btnSolid = document.getElementById('btn-fg-solid');
  const btnGradient = document.getElementById('btn-fg-gradient');
  const gradientBox = document.getElementById('gradient-controls');

  if (btnSolid && btnGradient) {
    btnSolid.addEventListener('click', () => {
      appState.design.fgType = 'solid';
      btnSolid.className = 'px-2.5 py-1 rounded-md font-medium shadow-xs bg-white text-slate-900 cursor-pointer';
      btnGradient.className = 'px-2.5 py-1 rounded-md text-slate-600 hover:text-slate-900 cursor-pointer';
      if (gradientBox) gradientBox.classList.add('hidden');
      renderQRCode();
    });

    btnGradient.addEventListener('click', () => {
      appState.design.fgType = 'gradient';
      btnGradient.className = 'px-2.5 py-1 rounded-md font-medium shadow-xs bg-white text-slate-900 cursor-pointer';
      btnSolid.className = 'px-2.5 py-1 rounded-md text-slate-600 hover:text-slate-900 cursor-pointer';
      if (gradientBox) gradientBox.classList.remove('hidden');
      renderQRCode();
    });
  }

  const pickerFg1 = document.getElementById('picker-fg1');
  const hexFg1 = document.getElementById('hex-fg1');
  const pickerFg2 = document.getElementById('picker-fg2');
  const hexFg2 = document.getElementById('hex-fg2');
  const gradAngle = document.getElementById('grad-angle');
  const gradAngleVal = document.getElementById('grad-angle-val');

  if (pickerFg1 && hexFg1) {
    pickerFg1.addEventListener('input', (e) => {
      appState.design.fgColor1 = e.target.value;
      hexFg1.value = e.target.value;
      renderQRCode();
    });
    hexFg1.addEventListener('input', (e) => {
      appState.design.fgColor1 = e.target.value;
      pickerFg1.value = e.target.value;
      renderQRCode();
    });
  }

  if (pickerFg2 && hexFg2) {
    pickerFg2.addEventListener('input', (e) => {
      appState.design.fgColor2 = e.target.value;
      hexFg2.value = e.target.value;
      renderQRCode();
    });
    hexFg2.addEventListener('input', (e) => {
      appState.design.fgColor2 = e.target.value;
      pickerFg2.value = e.target.value;
      renderQRCode();
    });
  }

  if (gradAngle && gradAngleVal) {
    gradAngle.addEventListener('input', (e) => {
      appState.design.fgGradientAngle = Number(e.target.value);
      gradAngleVal.textContent = `${e.target.value}°`;
      renderQRCode();
    });
  }

  // Background color & transparent
  const pickerBg = document.getElementById('picker-bg');
  const hexBg = document.getElementById('hex-bg');
  const checkBgTrans = document.getElementById('check-bg-trans');

  if (pickerBg && hexBg) {
    pickerBg.addEventListener('input', (e) => {
      appState.design.bgColor = e.target.value;
      hexBg.value = e.target.value;
      renderQRCode();
    });
    hexBg.addEventListener('input', (e) => {
      appState.design.bgColor = e.target.value;
      pickerBg.value = e.target.value;
      renderQRCode();
    });
  }

  if (checkBgTrans) {
    checkBgTrans.addEventListener('change', (e) => {
      appState.design.bgTransparent = e.target.checked;
      renderQRCode();
    });
  }

  // Quick Swatches
  document.querySelectorAll('[data-swatch]').forEach(btn => {
    btn.addEventListener('click', () => {
      const hex = btn.getAttribute('data-swatch');
      appState.design.fgColor1 = hex;
      if (pickerFg1) pickerFg1.value = hex;
      if (hexFg1) hexFg1.value = hex;
      renderQRCode();
    });
  });

  // Presets
  document.querySelectorAll('[data-preset-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-preset-id');
      const p = STYLE_PRESETS.find(x => x.id === id);
      if (!p) return;

      appState.design.dotPattern = p.dotPattern;
      appState.design.cornerSquarePattern = p.cornerSquarePattern;
      appState.design.cornerDotPattern = p.cornerDotPattern;
      appState.design.fgType = p.fgType;
      appState.design.fgColor1 = p.fgColor1;
      appState.design.fgColor2 = p.fgColor2;
      appState.design.fgGradientType = p.fgGradientType;
      appState.design.fgGradientAngle = p.fgGradientAngle;
      appState.design.bgColor = p.bgColor;
      appState.design.bgTransparent = p.bgTransparent;

      syncFormValuesFromState();
      renderQRCode();
    });
  });

  // 7. Logo Upload & Preset Badges
  const fileUpload = document.getElementById('file-logo-upload');
  const dropBox = document.getElementById('box-logo-upload');

  if (dropBox && fileUpload) {
    dropBox.addEventListener('click', () => fileUpload.click());
    fileUpload.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        appState.design.logoUrl = event.target?.result;
        appState.design.logoName = file.name;
        syncFormValuesFromState();
        renderQRCode();
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    });
  }

  // Preset logo buttons
  document.querySelectorAll('[data-preset-logo]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-preset-logo');
      const item = PRESET_LOGOS.find(x => x.id === id);
      if (!item) return;

      appState.design.logoUrl = item.dataUrl;
      appState.design.logoName = item.name;
      syncFormValuesFromState();
      renderQRCode();
    });
  });

  // Remove Logo
  const removeLogoBtn = document.getElementById('btn-remove-logo');
  if (removeLogoBtn) {
    removeLogoBtn.addEventListener('click', () => {
      appState.design.logoUrl = null;
      appState.design.logoName = '';
      syncFormValuesFromState();
      renderQRCode();
    });
  }

  // 8. Download Resolution buttons
  document.querySelectorAll('[data-res]').forEach(btn => {
    btn.addEventListener('click', () => {
      const res = Number(btn.getAttribute('data-res'));
      appState.resolution = res;
      document.querySelectorAll('[data-res]').forEach(b => {
        b.className = 'py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer text-slate-600 hover:text-slate-900';
      });
      btn.className = 'py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer bg-white text-slate-900 shadow-xs';
    });
  });

  // Download buttons (PNG, SVG, JPG)
  const btnPng = document.getElementById('btn-download-png');
  const btnSvg = document.getElementById('btn-download-svg');
  const btnJpg = document.getElementById('btn-download-jpg');

  if (btnPng) btnPng.addEventListener('click', () => handleDownload('png'));
  if (btnSvg) btnSvg.addEventListener('click', () => handleDownload('svg'));
  if (btnJpg) btnJpg.addEventListener('click', () => handleDownload('jpeg'));

  // Utility actions (Copy, Share, Print, Test Scan)
  const btnCopy = document.getElementById('btn-copy');
  const btnShare = document.getElementById('btn-share');
  const btnPrint = document.getElementById('btn-print');
  const btnTestScan = document.getElementById('btn-test-scan');

  if (btnCopy) btnCopy.addEventListener('click', handleCopy);
  if (btnShare) btnShare.addEventListener('click', handleShare);
  if (btnPrint) btnPrint.addEventListener('click', handlePrint);
  if (btnTestScan) btnTestScan.addEventListener('click', openTestScanModal);

  // Modals
  const closeTestScan = document.getElementById('btn-close-test-scan');
  if (closeTestScan) closeTestScan.addEventListener('click', closeTestScanModal);

  const btnOpenDeploy = document.getElementById('btn-open-deploy');
  const btnDeployHeader = document.getElementById('btn-deploy-header');
  const btnCloseDeploy = document.getElementById('btn-close-deploy');

  if (btnOpenDeploy) btnOpenDeploy.addEventListener('click', () => openDeployModal('vercel'));
  if (btnDeployHeader) btnDeployHeader.addEventListener('click', () => openDeployModal('vercel'));
  if (btnCloseDeploy) btnCloseDeploy.addEventListener('click', closeDeployModal);

  // Deploy modal tabs
  ['vercel', 'local', 'architecture'].forEach(t => {
    const tabBtn = document.getElementById(`tab-btn-${t}`);
    if (tabBtn) tabBtn.addEventListener('click', () => switchDeployTab(t));
  });

  // Language switch
  const langBtn = document.getElementById('btn-lang-toggle');
  if (langBtn) langBtn.addEventListener('click', toggleLanguage);

  // Reset button
  const resetBtn = document.getElementById('btn-reset');
  if (resetBtn) resetBtn.addEventListener('click', resetDefaults);
}

// Initial boot
window.addEventListener('DOMContentLoaded', () => {
  initEventListeners();
  syncFormValuesFromState();
  renderQRCode();
  applyLanguage();
});
