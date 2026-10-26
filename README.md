# QR Studio — Client-Side Utility Toolkit & Legal Compliance Suite

> **Brand**: QR Studio  
> **Developer Credit**: Developed by **Sandip Hembram** (System Software Engineer)  
> **Project Type**: Initial Project  
> **Official Website**: [https://qrenerator.vercel.app/](https://qrenerator.vercel.app/)  
> **Official Contact**: [hembramsandip990@gmail.com](mailto:hembramsandip990@gmail.com)  
> **Hosting & Deployment**: Vercel

---

## 1. Project Overview & Architecture

QR Studio is a 100% client-side, browser-based utility suite built with pure HTML5, Tailwind CSS, and Vanilla JavaScript. It offers 4 primary tools:

1. **QR Code Generator**: URL, Plain Text, Wi-Fi, WhatsApp direct chat, and digital Contact (vCard 3.0) with custom dot patterns, colors, and logo embedding.
2. **Barcode Generator**: Linear barcodes (CODE 128, EAN-13, UPC-A, and CODE 39) with dimension controls and instant SVG/PNG exports.
3. **Image to PDF Converter**: Multi-image batch processing (JPG, PNG, WebP) with page reordering, format selection (A4, Letter, Original), orientation, and client-side PDF generation.
4. **Merge PDF**: Client-side document combiner with page count extraction, sequence reordering, and encrypted file error detection.
5. **Diwali Festive Celebration Campaign**: Animated festive banner featuring 100% CSS/HTML cartoon Indian colleagues celebrating Diwali in traditional clothing, live flickering clay diyas, hanging akash kandils, marigold toran garland, and floating golden sparkles.

---

## 2. File Structure

```text
├── index.html                   # Core application: 4-tool workspace & consent modals
├── about.html                   # About Us page (purpose, developer attribution, transparency)
├── contact.html                 # Contact Us page (verified mailto channels & bug reporting)
├── privacy.html                 # Privacy Policy (17 comprehensive sections, draft notice)
├── terms.html                   # Terms & Conditions (18 sections, draft notice, Indian law)
├── cookie-policy.html           # Cookie Policy (storage disclosures, AdSense readiness)
├── src/
│   ├── app.js                   # Application engine, tool handlers, safe DOM rendering
│   ├── validators.js            # Magic-byte detection, dimension checks, resource quotas
│   ├── subpage.js               # Subpage event listener helper (no inline scripts)
│   └── style.css                # Monochrome theme, print stylesheet, drop-zone styles
├── test/
│   └── security.test.js         # Automated security and file validation unit tests
├── vercel.json                  # Vercel configuration (cleanUrls, CSP, security headers)
├── vite.config.ts               # Multi-page Rollup input configuration
├── metadata.json                # Applet configuration & metadata
└── package.json                 # Project dependencies & scripts
```

---

## 3. Implemented Privacy & Security Safeguards

- **Privacy by Design**:
  - Verification: All image and PDF operations execute inside the user's browser memory via `FileReader`, `jsPDF`, and `pdf-lib`. No files are uploaded or transmitted to any server.
  - Zero Server Retention: Closing or refreshing the browser tab instantly flushes all document and image memory.
  - Zero Telemetry: Completely removed third-party counters and tracking pings.
- **Mandatory First-Visit Terms & Conditions Consent**:
  - Displays a modal dialog on the first visit before normal usage of tools is permitted.
  - Non-preselected checkbox requiring conscious user agreement.
  - Decline state: Blocks tool usage politely and provides an option to review again.
  - Versioned storage in `localStorage` (`v1.0-draft-2026-10`) so changes re-trigger consent.
- **Mandatory Pre-Upload Rights Confirmation**:
  - Displays a dedicated confirmation modal before any file selection, drop-zone click, or drag-and-drop file processing occurs.
  - Enforces confirmation that the user holds the legal rights/license to the files.
- **Granular Cookie & Privacy Preferences**:
  - Interactive "Privacy Choices" modal in the footer.
  - User can reset or review all consent decisions at any time.
- **Vercel Security Headers (`vercel.json`)**:
  - `Content-Security-Policy`: Strict `script-src 'self'`, `object-src 'none'`, `connect-src 'self' blob:`, and verified font origins (`fonts.googleapis.com`, `fonts.gstatic.com`).
  - `X-Content-Type-Options: nosniff`: Prevents MIME-sniffing.
  - `X-Frame-Options: SAMEORIGIN` & `frame-ancestors 'self'`: Defends against clickjacking.
  - `Referrer-Policy: strict-origin-when-cross-origin`: Limits referrer leakage.
  - `Permissions-Policy`: Disables camera, microphone, and geolocation.
- **Responsible Vulnerability Disclosure**:
  - Dedicated developer contact (`hembramsandip990@gmail.com`) published on all pages.

---

## 4. Local Setup & Testing

```bash
# Install dependencies
npm install

# Run automated security test suite
npm test

# Run linter
npm run lint

# Run local development server
npm run dev

# Build production distribution
npm run build
```

---

© 2026 QR Studio. Developed by **Sandip Hembram** (System Software Engineer).
