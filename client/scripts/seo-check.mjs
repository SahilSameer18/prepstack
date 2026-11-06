// Runs after prerender. Fails the build (exit 1) if anything that matters for search or share previews is wrong,
// so a bad title, a missing canonical or a broken link can never ship quietly.
import fs from 'node:fs';
import path from 'node:path';
import { allPages, indexablePages, SITE_URL, OG_IMAGE, absoluteUrl } from '../src/seo/pages.js';

const DIST = path.resolve('dist');
const errors = []; const warnings = [];
const fail = (m) => errors.push(m); const warn = (m) => warnings.push(m);
const htmlFor = (p) => path.join(DIST, p === '/' ? 'index.html' : `${p.slice(1)}.html`);

// ── 1. the SEO text itself ──
const seen = { title: new Map(), description: new Map() };
for (const p of allPages) {
  const label = p.path;
  if (!p.title || p.title.length > 60) fail(`${label}: title is ${p.title?.length} chars (max 60): "${p.title}"`);
  // Length rules matter for pages that appear in search results; private (noindex) pages only need to be non-empty and not too long.
  const minDesc = p.noindex ? 1 : 110;
  if (!p.description || p.description.length < minDesc || p.description.length > 160) fail(`${label}: description is ${p.description?.length} chars (needs ${minDesc}-160)`);
  if (!p.h1) fail(`${label}: missing h1`);
  if (!p.noindex) {
    for (const k of ['title', 'description']) { const prev = seen[k].get(p[k]); if (prev) fail(`${label}: ${k} duplicates ${prev}`); seen[k].set(p[k], label); }
  }
}
if (new Set(allPages.map((p) => p.path)).size !== allPages.length) fail('duplicate paths in the page table');

// ── 2. the generated HTML ──
const count = (html, re) => (html.match(re) || []).length;
const attr = (html, re) => (html.match(re) || [])[1];
for (const p of allPages) {
  const file = htmlFor(p.path);
  if (!fs.existsSync(file)) { fail(`${p.path}: ${path.relative(DIST, file)} was not generated`); continue; }
  const html = fs.readFileSync(file, 'utf8');
  if (count(html, /<title>/g) !== 1) fail(`${p.path}: needs exactly one <title>`);
  if (count(html, /<meta name="description"/g) !== 1) fail(`${p.path}: needs exactly one meta description`);
  if (count(html, /<meta name="robots"/g) !== 1) fail(`${p.path}: needs exactly one meta robots`);
  const canon = count(html, /<link rel="canonical"/g);
  if (p.noindex) {
    if (canon !== 0) fail(`${p.path}: noindex page must not have a canonical`);
    if (!/content="noindex/.test(html)) fail(`${p.path}: noindex page is missing the noindex directive`);
  } else {
    if (canon !== 1) fail(`${p.path}: needs exactly one canonical`);
    if (attr(html, /<link rel="canonical" href="([^"]+)"/) !== absoluteUrl(p.path)) fail(`${p.path}: canonical does not match its own URL`);
    if (count(html, /<h1[ >]/g) !== 1) fail(`${p.path}: needs exactly one <h1> in the HTML crawlers see`);
    if (/noindex/.test(attr(html, /<meta name="robots" content="([^"]+)"/) || '')) fail(`${p.path}: indexable page has a noindex directive`);
  }
  for (const key of ['og:title', 'og:description', 'og:image', 'og:url']) if (count(html, new RegExp(`<meta property="${key}"`, 'g')) !== 1) fail(`${p.path}: needs exactly one ${key}`);
  for (const key of ['twitter:card', 'twitter:title', 'twitter:image']) if (count(html, new RegExp(`<meta name="${key}"`, 'g')) !== 1) fail(`${p.path}: needs exactly one ${key}`);
  if (!attr(html, /<meta property="og:image" content="(https:\/\/[^"]+)"/)) fail(`${p.path}: og:image must be an absolute https URL`);
  for (const m of html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) { try { JSON.parse(m[1]); } catch { fail(`${p.path}: invalid JSON-LD`); } }
  // internal links in the readable content must point at real pages
  for (const m of html.matchAll(/<a href="(\/[^"]*)"/g)) if (!allPages.some((x) => x.path === m[1])) fail(`${p.path}: broken internal link ${m[1]}`);
}

// ── 3. special files ──
for (const f of ['app-shell.html', '404.html', 'sitemap.xml', 'robots.txt', 'favicon.ico', 'favicon.svg', 'apple-touch-icon.png', 'site.webmanifest', 'logo.png', 'og-image.png']) if (!fs.existsSync(path.join(DIST, f))) fail(`dist/${f} is missing`);
if (fs.existsSync(path.join(DIST, 'app-shell.html')) && !/content="noindex/.test(fs.readFileSync(path.join(DIST, 'app-shell.html'), 'utf8'))) fail('app-shell.html must be noindex');
const sitemap = fs.existsSync(path.join(DIST, 'sitemap.xml')) ? fs.readFileSync(path.join(DIST, 'sitemap.xml'), 'utf8') : '';
for (const p of indexablePages) if (!sitemap.includes(`<loc>${absoluteUrl(p.path)}</loc>`)) fail(`sitemap is missing ${p.path}`);
for (const p of allPages.filter((x) => x.noindex)) if (p.path && sitemap.includes(`<loc>${absoluteUrl(p.path)}</loc>`)) fail(`sitemap must not list noindex page ${p.path}`);
const robots = fs.existsSync(path.join(DIST, 'robots.txt')) ? fs.readFileSync(path.join(DIST, 'robots.txt'), 'utf8') : '';
if (!robots.includes(`Sitemap: ${SITE_URL}/sitemap.xml`)) fail('robots.txt must point at the sitemap');
// share image must be a PNG of 1200x630
const ogPath = path.join(DIST, OG_IMAGE.slice(1));
if (fs.existsSync(ogPath)) { const b = fs.readFileSync(ogPath); const w = b.readUInt32BE(16), h = b.readUInt32BE(20); if (w !== 1200 || h !== 630) fail(`og-image.png is ${w}x${h}, expected 1200x630`); if (b.length > 300 * 1024) warn(`og-image.png is ${(b.length / 1024) | 0} KB (keep under 300 KB)`); }
const logoSize = fs.existsSync(path.join(DIST, 'logo.png')) ? fs.statSync(path.join(DIST, 'logo.png')).size : 0;
if (logoSize > 100 * 1024) warn(`logo.png is ${(logoSize / 1024) | 0} KB`);
if (!SITE_URL.startsWith('https://')) fail(`SITE_URL must be https (got ${SITE_URL})`);

for (const w of warnings) console.warn('seo-check warning:', w);
if (errors.length) { console.error(`\nseo-check FAILED (${errors.length}):`); for (const e of errors) console.error('  - ' + e); process.exit(1); }
console.log(`seo-check passed: ${allPages.length} pages, ${indexablePages.length} indexable, ${warnings.length} warnings`);
