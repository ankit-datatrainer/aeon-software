// Builds the static multi-page site.
// Each file in src/pages/ starts with a front-matter comment:
//
//   <!--
//   title: Page title
//   description: Meta description
//   scripts: hero            (optional, comma separated)
//   -->
//
// and is wrapped with src/partials/{head,header,footer}.html, then written to
// the project root as <name>.html (Vercel serves /name thanks to cleanUrls).
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { dirname, join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const version = pkg.version;

const partial = (name) => readFileSync(join(root, 'src', 'partials', `${name}.html`), 'utf8');
const head = partial('head');
const header = partial('header');
const footer = partial('footer');

// Optional per-page script bundles
const SCRIPT_TAGS = {
    hero: `    <!-- Three.js WebGL hero (bundled by \`npm run build:scene\`) -->\n    <script src="/js/hero-scene.min.js?v={{v}}" defer></script>\n`,
};

function parseFrontMatter(source, file) {
    const match = source.match(/^\s*<!--([\s\S]*?)-->\s*/);
    if (!match) throw new Error(`${file}: missing front-matter comment`);
    const meta = {};
    for (const line of match[1].split(/\r?\n/)) {
        const m = line.match(/^\s*([a-z]+)\s*:\s*(.+?)\s*$/i);
        if (m) meta[m[1]] = m[2];
    }
    if (!meta.title || !meta.description) throw new Error(`${file}: title and description are required`);
    return { meta, body: source.slice(match[0].length) };
}

// <!-- @include name --> pulls in src/partials/name.html (nested includes allowed)
function resolveIncludes(html, depth = 0) {
    if (depth > 5) throw new Error('Include nesting too deep');
    return html.replace(/<!--\s*@include\s+([\w-]+)\s*-->/g, (_, name) => resolveIncludes(partial(name), depth + 1));
}

function render(template, page, meta) {
    const scripts = (meta.scripts || '')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)
        .map(s => {
            if (!SCRIPT_TAGS[s]) throw new Error(`Unknown script bundle "${s}"`);
            return SCRIPT_TAGS[s];
        })
        .join('');
    return template
        .replace(/\{\{scripts\}\}/g, scripts)
        .replace(/\{\{cur:([a-z]+)\}\}/g, (_, key) => (key === page ? ' active' : ''))
        .replace(/\{\{aria:([a-z]+)\}\}/g, (_, key) => (key === page ? ' aria-current="page"' : ''))
        .replace(/\{\{title\}\}/g, meta.title)
        .replace(/\{\{description\}\}/g, meta.description)
        .replace(/\{\{page\}\}/g, page)
        .replace(/\{\{v\}\}/g, version);
}

const pagesDir = join(root, 'src', 'pages');
const files = readdirSync(pagesDir).filter(f => f.endsWith('.html'));

for (const file of files) {
    const page = basename(file, '.html');
    const { meta, body } = parseFrontMatter(readFileSync(join(pagesDir, file), 'utf8'), file);
    const html = render(resolveIncludes(head + header + body + footer), page, meta);
    if (/\{\{[a-z:]+\}\}/i.test(html)) throw new Error(`${file}: unresolved template token`);
    writeFileSync(join(root, `${page}.html`), html);
    console.log(`${page}.html`);
}
