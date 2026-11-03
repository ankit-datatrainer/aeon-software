# Aeon Software Services

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fankit-datatrainer%2Faeon-software)

An award-level, high-performance agency website for **Aeon Software Services** — a full-spectrum software development enterprise delivering cybersecurity, application development, web development, custom software, AI & ML, cloud engineering and digital transformation solutions globally from India.

Inspired by **Awwwards** (Stellar Management) interactive design standards and **Infosys** corporate elegance.

![Aeon Software Services](https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1400&q=80)

---

## ⚡ 1-Click Vercel Deployment

Deploying this website to **Vercel** takes under 60 seconds:

### Option 1: Automatic via Vercel Dashboard (Recommended)
1. Go to [vercel.com/new](https://vercel.com/new).
2. Connect your GitHub account and select the **`aeon-software`** repository.
3. Keep the default settings (**Framework Preset: Other / Static**).
4. Click **Deploy**. Vercel will automatically detect `vercel.json` and deploy with instant global edge caching and SSL!

### Option 2: Deploy with Vercel CLI
```bash
# Install Vercel CLI globally (if not installed)
npm i -g vercel

# Deploy to preview
vercel

# Deploy directly to production
vercel --prod
```

---

## 🌟 Key Features

- **Multi-Page Site (v2.1)**: `/` Home · `/about` · `/services` · `/cybersecurity` · `/industries` · `/work` · `/insights` · `/contact`, with animated page-transition curtains, per-page heroes and a shared header/footer.
  - **About / Who We Are**: image collage with parallax, rotating "We are…" text tag, spinning circular text badge, scroll-scrubbed word highlight, mission & vision, values, a 2010→2026 journey timeline, culture gallery and global offices.

- **v2 Redesign Highlights**:
  - **WebGL Hero (Three.js)**: High-DPI particle globe with travelling data arcs, orbit rings and a star field — reacts to the mouse and scroll, renders at up to 2× device pixel ratio for crisp 4K displays, pauses when off-screen, and falls back to the 2D canvas network when WebGL is unavailable.
  - **Core Capabilities**: Expanding pillars for **Web Development**, **Application Development** and **Cybersecurity** (hover / focus / keyboard on desktop, stacked cards on tablet & mobile).
  - **Cybersecurity Section**: Live SOC console (radar sweep, DrawSVG shield, ScrambleText threat feed, live counters), 8 security service cards, Assess → Harden → Monitor → Respond lifecycle and a compliance-framework marquee (ISO 27001, SOC 2, PCI DSS, HIPAA, GDPR, DPDP Act, NIST CSF, CERT-In…).
  - **Micro-interactions**: GSAP SplitText masked headline reveals, decoding section labels, pointer-following spotlight cards, image curtain reveals, scroll progress bar, back-to-top progress ring, footer wordmark, film grain.
  - **Accessibility**: Honors `prefers-reduced-motion`, keyboard-navigable capability pillars, visible focus states.

- **Award-Level Kinetic Animations**:
  - **Preloader**: Letter stagger (`A-E-O-N`) with numerical progress ticker (0–100%) and curtain slide exit.
  - **Interactive Canvas Network**: HTML5 particle network reacting to mouse coordinates with real-time dynamic node connections.
  - **Horizontal Pinned Card Scroll**: Pinned services showcase that scrolls horizontally with vertical mouse-wheel scrub via GSAP ScrollTrigger.
  - **Interactive 3D Mouse Tilt**: Service and industry cards tilt with perspective following the cursor.
  - **Mouse Drag-to-Scroll**: Ability to click and drag across the cards track horizontally.
  - **Custom Cursor**: Trailing difference-blend ring with contextual action labels (`EXPLORE`, `VIEW`, `READ`, `DRAG`).
  - **Magnetic Buttons**: Interactive buttons that gravitate towards the cursor with elastic spring release.
  - **Smooth Scrolling**: Native smooth scrolling with GSAP ScrollToPlugin for programmatic jumps.
  - **Testimonial Slider**: Auto-advancing slider with pause-on-hover, dot controls, and keyboard/button navigation.

- **Typography & Aesthetics**:
  - **Font**: Google **DM Sans** (`font-family: 'DM Sans'`) with fluid responsive typography.
  - **Infosys-Inspired Floating Pill Navigation**: Frosted glassmorphism navbar (`Navigate Your Next`, `Services`, `Technologies`, `Industries`, `Case Studies`, `Aeon Knowledge`) with an **"Ask Aeon" AI Assistant pill**.
  - **Indian Heritage & Global Delivery**: Headquartered in Cyber City Gurugram, India, with centres in Bengaluru, Hyderabad, and Pune.

- **All Industry Software Services**:
  1. Custom Software Development
  2. Web Application Development
  3. Mobile App Development (iOS & Android)
  4. Cloud Solutions & DevOps
  5. AI & Machine Learning
  6. Data Analytics & Business Intelligence
  7. UI/UX Design Services
  8. Cybersecurity & DevSecOps
  9. Blockchain & Web3 Development
  10. IoT & Edge Computing
  11. ERP & CRM Solutions
  12. Quality Assurance & Automated Testing

- **100% Responsive**:
  - Optimized for mobile phones (320px–480px), tablets (768px–1024px), laptops (1200px–1440px), and ultrawide screens (1600px+).

---

## 🚀 Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/ankit-datatrainer/aeon-software.git
   cd aeon-software
   ```

2. Install the UI libraries and run locally:
   ```bash
   npm install
   npm run dev        # http://localhost:3000
   ```

3. Pages are composed from `src/pages/*.html` + shared `src/partials/` (head, header, footer, and sections such as `who`, `capabilities`, `cta`). **Edit those files, not the generated root `*.html`**, then run:
   ```bash
   npm run build:pages   # writes index.html, about.html, services.html, … to the project root
   ```

4. After upgrading a library (`gsap`, `three`) or editing `src/hero-scene.js`, rebuild the committed assets:
   ```bash
   npm run build      # = vendor (GSAP → /vendor) + build:scene (Three.js hero) + build:pages (HTML pages)
   ```
   The site stays a zero-build static deployment — the generated files in `/vendor` and `js/hero-scene.min.js` are committed. Asset URLs carry `?v=<package.json version>` — bump the version when CSS/JS changes so returning visitors bypass the long-lived cache.

---

## 🛠️ Tech Stack & Vercel Config

- **HTML5** — Semantic, accessible markup
- **CSS3** — Custom properties, CSS Grid, Flexbox, glassmorphism, fluid typography (`clamp`)
- **JavaScript (ES6+)** — Modular vanilla JavaScript
- **GSAP 3.15** (npm) — Animation timelines & tweening
- **ScrollTrigger** — Viewport scroll-linked animations and pinned horizontal scroll
- **ScrollToPlugin** — Smooth anchor navigation
- **SplitText / ScrambleTextPlugin / DrawSVGPlugin** — Masked text reveals, decoding text, SVG line drawing
- **Three.js r187** (npm, bundled with **esbuild**) — WebGL hero scene
- **Google Fonts** — DM Sans font family
- **Vercel (`vercel.json`)** — Security headers (HSTS, CSP, X-Frame-Options, X-Content-Type), clean URLs, immutable asset caching, and custom 404 handling.

---

## 📄 License

&copy; 2026 Aeon Software Services Pvt. Ltd. All rights reserved.
