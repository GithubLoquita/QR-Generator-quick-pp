# QR Studio — Client-Side Utility Toolkit & Legal Compliance Suite

> **Brand**: QR Studio  
> **Developer Credit**: Developed by **ANIX Software Technology**  
> **Official Website**: [https://qrenerator.vercel.app/](https://qrenerator.vercel.app/)  
> **Official Contact**: [hembramgroupofficials@gmail.com](mailto:hembramgroupofficials@gmail.com)  
> **Hosting & Deployment**: Vercel

---

## 1. Project Overview & Architecture

QR Studio is a 100% client-side, browser-based utility suite built with pure HTML5, Tailwind CSS, and Vanilla JavaScript. It offers 4 primary tools:

1. **QR Code Generator**: URL, Plain Text, Wi-Fi, WhatsApp direct chat, and digital Contact (vCard 3.0) with custom dot patterns, colors, and logo embedding.
2. **Barcode Generator**: Linear barcodes (CODE 128, EAN-13, UPC-A, and CODE 39) with dimension controls and instant SVG/PNG exports.
3. **Image to PDF Converter**: Multi-image batch processing (JPG, PNG, WebP) with page reordering, format selection (A4, Letter, Original), orientation, and client-side PDF generation.
4. **Merge PDF**: Client-side document combiner with page count extraction, sequence reordering, and encrypted file error detection.
5. **Diwali Festive Celebration Campaign**: Animated festive banner featuring 100% CSS/HTML cartoon Indian colleagues celebrating Diwali in traditional kurtas and lehengas, live flickering clay diyas, hanging akash kandils, marigold toran garland, and floating golden sparkles.

---

## 2. File Structure

```text
├── index.html                   # Core application: 4-tool workspace & consent modals
├── about.html                   # About Us page (purpose, architecture, transparency)
├── contact.html                 # Contact Us page (verified mailto channels & bug reporting)
├── privacy.html                 # Privacy Policy (10 comprehensive sections, draft notice)
├── terms.html                   # Terms & Conditions (18 sections, draft notice, Indian law)
├── cookie-policy.html           # Cookie Policy (storage disclosures, AdSense readiness)
├── src/
│   ├── app.js                   # Application engine, tool handlers, consent verification
│   └── style.css                # Monochrome theme, print stylesheet, drop-zone styles
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
  - `Content-Security-Policy`: Restricts scripts, styles, fonts, and connects to verified origins (`countapi.mileshilliard.com`, `fonts.googleapis.com`, `fonts.gstatic.com`, `cdn.jsdelivr.net`).
  - `X-Content-Type-Options: nosniff`: Prevents MIME-sniffing.
  - `X-Frame-Options: SAMEORIGIN`: Defends against external clickjacking.
  - `Referrer-Policy: strict-origin-when-cross-origin`: Limits referrer leakage.
  - `Permissions-Policy`: Disables camera, microphone, and geolocation.
- **Responsible Vulnerability Disclosure**:
  - Dedicated email address (`hembramgroupofficials@gmail.com`) published on all pages.

---

## 4. Google AdSense Readiness

- All policy pages disclose potential future third-party advertising cookies and the DoubleClick cookie.
- Clear links to [Google Ads Settings](https://adssettings.google.com/) and [Google's Advertising Policies](https://policies.google.com/technologies/ads).
- Advertising cookies are isolated from essential functional storage and are not set before legally compliant consent.

---

## 5. Local Setup & Testing

```bash
# Install dependencies
npm install

# Run local development server
npm run dev

# Build production distribution
npm run build
```

---

## 6. Verification & What Was Actually Tested

- **Build & Compilation**: `npm run build` compiled all 6 HTML pages (`index.html`, `about.html`, `contact.html`, `privacy.html`, `terms.html`, `cookie-policy.html`) with zero syntax or bundling errors.
- **Linting**: Passed `npm run lint` cleanly.
- **First-Visit Modal**: Verified that `hasValidTermsConsent()` checks version and timestamp; un-checked box disables primary button; decline shows polite message.
- **File Upload Interception**: Verified that clicking "Choose Image Files", clicking the drop zone, or dropping files triggers `requireUploadConsent()` before opening file dialogs.
- **Navigation & URLs**: Direct URL access configured via `cleanUrls: true` in `vercel.json` for all 5 static pages.

---

## 7. Remaining Risks & Items Requiring Manual Legal Review

1. **Formal Legal Review Required**: All policies (`terms.html`, `privacy.html`, `cookie-policy.html`) are marked as **Drafts requiring formal review by an enrolled Indian advocate or legal counsel** prior to commercial or enterprise production.
2. **Third-Party CDN & CountAPI**: The visitor counter connects to `countapi.mileshilliard.com`. If that service experiences downtime or is blocked by user ad-blockers, the fallback local counter engages seamlessly.
3. **Future AdSense Deployment**: When applying for Google AdSense, a certified Consent Management Platform (CMP) supporting the IAB TCF framework should be integrated if serving EEA/UK visitors.

---

© 2026 QR Studio. Developed by **ANIX Software Technology**.
