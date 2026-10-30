# Aeon Software Services

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fankit-datatrainer%2Faeon-software)

An award-level, high-performance agency website for **Aeon Software Services** — a full-spectrum software development enterprise delivering custom software, AI & ML, cloud engineering, mobile apps, and digital transformation solutions globally from India.

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

- **Award-Level Kinetic Animations**:
  - **Preloader**: Letter stagger (`A-E-O-N`) with numerical progress ticker (0–100%) and curtain slide exit.
  - **Interactive Canvas Network**: HTML5 particle network reacting to mouse coordinates with real-time dynamic node connections.
  - **Horizontal Pinned Card Scroll**: Pinned services showcase that scrolls horizontally with vertical mouse-wheel scrub via GSAP ScrollTrigger.
  - **Interactive 3D Mouse Tilt**: Service and industry cards tilt with perspective following the cursor.
  - **Mouse Drag-to-Scroll**: Ability to click and drag across the cards track horizontally.
  - **Custom Cursor**: Trailing difference-blend ring with contextual action labels (`EXPLORE`, `VIEW`, `READ`, `DRAG`).
  - **Magnetic Buttons**: Interactive buttons that gravitate towards the cursor with elastic spring release.
  - **Smooth Scrolling**: Integrated with **Lenis** smooth scroll engine.
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

2. Run locally:
   ```bash
   npx serve .
   # or
   npm run dev
   # or double-click index.html in any browser
   ```

---

## 🛠️ Tech Stack & Vercel Config

- **HTML5** — Semantic, accessible markup
- **CSS3** — Custom properties, CSS Grid, Flexbox, glassmorphism, fluid typography (`clamp`)
- **JavaScript (ES6+)** — Modular vanilla JavaScript
- **GSAP 3** — Animation timelines & tweening
- **ScrollTrigger** — Viewport scroll-linked animations and pinned horizontal scroll
- **ScrollToPlugin** — Smooth anchor navigation
- **Lenis** — Modern smooth scroll library
- **Google Fonts** — DM Sans font family
- **Vercel (`vercel.json`)** — Security headers (HSTS, CSP, X-Frame-Options, X-Content-Type), clean URLs, immutable asset caching, and custom 404 handling.

---

## 📄 License

&copy; 2026 Aeon Software Services Pvt. Ltd. All rights reserved.
