# QR Studio

> **Developed by ANIX Software Technology**  
> A simple, elegant, and 100% free browser tool to create, customize, and download QR codes in seconds.

---

## Highlights

- **100% Free**: No subscriptions, no ads, and no hidden upgrades.
- **Privacy First**: 100% client-side. All QR codes are generated directly in the browser's memory without sending any personal data, passwords, or contact info to any server.
- **No Account Required**: Ready to use the second you open the website.
- **Supported QR Types**:
  1. **URL** (Websites & Links)
  2. **Text** (Plain text, messages, notes)
  3. **Wi-Fi** (Direct network connect without typing passwords)
  4. **WhatsApp** (Direct chat launch with phone number & pre-filled message)
  5. **Contact (vCard)** (Digital business card saved with one tap on iOS & Android)
- **Customization**:
  - Foreground & Background colors
  - Pattern styles: Classic Square, Rounded, and Dots
  - Custom center logo upload with size control
  - Live preview with automatic contrast check
- **High-Resolution Exports**:
  - **PNG** (Crisp high-resolution image)
  - **SVG** (Infinite resolution scalable vector)
  - **JPG** (Standard image format)
  - **Copy Image** directly to clipboard
  - **Share** via native mobile sharing menu
  - **Print** with clean, dedicated print layout

---

## Local Setup & Testing

### Option 1: Run with Vite (Recommended)
```bash
# 1. Install dependencies
npm install

# 2. Start local dev server
npm run dev
# The website will be available at http://localhost:3000

# 3. Build for production (outputs to /dist)
npm run build
```

### Option 2: Run as a Pure Static Site
Because QR Studio uses only standard HTML5, CSS3, and modern Vanilla JavaScript, you can open `index.html` in any web browser or serve it with any static web server:
```bash
npx serve .
# or
python3 -m http.server 3000
```

---

## Deployment to Vercel

### Option 1: Deploy with Vercel CLI (1-Click)
```bash
npm install -g vercel
vercel
```

### Option 2: Deploy from GitHub
1. Push this repository to GitHub.
2. Go to [Vercel](https://vercel.com/) and click **Add New Project**.
3. Import this repository.
4. Framework Preset will auto-detect **Vite** (or Static).
5. Click **Deploy**. Your custom QR Studio tool is live immediately with free SSL.

---

## Brand & License

© 2026 QR Studio. Developed by **ANIX Software Technology**.  
Open for public, personal, and commercial use.
