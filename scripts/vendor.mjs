// Copies the installed UI libraries from node_modules into /vendor so the
// static site (no build step on Vercel) can load them locally.
import { copyFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'vendor', 'gsap');

const gsapFiles = [
    'gsap.min.js',
    'ScrollTrigger.min.js',
    'ScrollToPlugin.min.js',
    'SplitText.min.js',
    'ScrambleTextPlugin.min.js',
    'DrawSVGPlugin.min.js',
];

mkdirSync(out, { recursive: true });

for (const file of gsapFiles) {
    const src = join(root, 'node_modules', 'gsap', 'dist', file);
    if (!existsSync(src)) {
        console.error(`Missing ${src} — run "npm install" first.`);
        process.exit(1);
    }
    copyFileSync(src, join(out, file));
    console.log(`vendor/gsap/${file}`);
}
