// Runs after `vite build`. Turns the single app shell into real per-page HTML so search engines and social apps
// (which often do NOT run JavaScript) get the right title, description, canonical URL, share image, structured data
// and readable content for every page. Also writes sitemap.xml, robots.txt, app-shell.html and 404.html.
//
// React still takes over in the browser: it replaces the fallback content inside #root and keeps the head in sync (src/seo/Seo.jsx).
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { allPages, indexablePages, notFoundPage, SITE_URL, SITE_NAME, OG_IMAGE, absoluteUrl, jsonLdFor, robotsContent } from '../src/seo/pages.js';

const DIST = path.resolve('dist');
const read = (f) => fs.readFileSync(path.join(DIST, f), 'utf8');
const write = (f, content) => { const p = path.join(DIST, f); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, content); };
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const jsonScript = (data) => `<script type="application/ld+json" data-seo-ld>${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;

if (!fs.existsSync(path.join(DIST, 'index.html'))) { console.error('dist/index.html not found: run `vite build` first.'); process.exit(1); }
const shell = read('index.html');
if (!shell.includes('<!--seo-head-->') || !shell.includes('<div id="root"></div>')) { console.error('index.html is missing the <!--seo-head--> marker or the empty #root.'); process.exit(1); }

// Optional: Google Search Console ownership tag. Set VITE_GSC_VERIFICATION in your host's environment variables.
const gsc = process.env.VITE_GSC_VERIFICATION ? `<meta name="google-site-verification" content="${esc(process.env.VITE_GSC_VERIFICATION)}" />` : '';

const headFor = (page) => {
  const url = page.path ? absoluteUrl(page.path) : null;
  const img = SITE_URL + OG_IMAGE;
  const lines = [
    `<meta name="description" content="${esc(page.description)}" />`,
    `<meta name="robots" content="${robotsContent(page.noindex)}" />`,
    ...(!page.noindex && url ? [`<link rel="canonical" href="${url}" />`] : []),
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${SITE_NAME}" />`,
    `<meta property="og:locale" content="en_US" />`,
    `<meta property="og:title" content="${esc(page.title)}" />`,
    `<meta property="og:description" content="${esc(page.description)}" />`,
    `<meta property="og:url" content="${url || SITE_URL + '/'}" />`,
    `<meta property="og:image" content="${img}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="PrepStack: free interview prep for software engineers" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(page.title)}" />`,
    `<meta name="twitter:description" content="${esc(page.description)}" />`,
    `<meta name="twitter:image" content="${img}" />`,
    `<meta name="twitter:image:alt" content="PrepStack: free interview prep for software engineers" />`,
    ...(gsc ? [gsc] : []),
    ...jsonLdFor(page).map(jsonScript),
  ];
  return lines.join('\n  ');
};

// What a visitor sees from the first paint until React starts: a dark loading screen that matches the app's own loader.
// React replaces everything inside #root when it starts, so this disappears by itself.
const SPLASH = '<div id="boot" role="status" aria-label="Loading PrepStack"><div class="boot-mark"><span class="boot-ring"></span><span class="boot-p">P</span></div>' +
  '<p class="boot-name">Prep<span>Stack</span></p><div class="boot-dots"><i></i><i></i><i></i><i></i></div></div>';
// The readable page text for crawlers and non-JS readers stays in the HTML, but out of sight and out of reach of the keyboard,
// so a visitor never sees the plain, unstyled version flash before the real page.
const HIDDEN = 'position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0';

// Readable content for crawlers and non-JS readers (hidden from view, see HIDDEN). Only for pages meant to be indexed.
const bodyFor = (page) => {
  if (page.noindex) return `<div id="root">${SPLASH}</div>`;
  const crumbs = page.parent
    ? `<nav aria-label="Breadcrumb" style="font-size:.85rem;color:#a1a1aa;margin-bottom:1.25rem"><a href="/" style="color:#a1a1aa">Home</a>${page.parent.path !== '/' ? ` / <a href="${page.parent.path}" style="color:#a1a1aa">${esc(page.parent.name)}</a>` : ''}</nav>`
    : '';
  const links = (page.links || []).map((l) => `<li><a href="${l.path}" style="color:#ffa116">${esc(l.label)}</a></li>`).join('');
  return `<div id="root">${SPLASH}<main data-prerender inert style="${HIDDEN}">${crumbs}<h1 style="font-size:2.25rem;line-height:1.15;color:#fff;margin:0 0 1rem">${esc(page.h1)}</h1>${page.intro.map((p) => `<p style="color:#d4d4d8">${esc(p)}</p>`).join('')}${links ? `<ul style="padding-left:1.25rem;margin-top:1.5rem">${links}</ul>` : ''}</main></div>`;
};

const render = (page) =>
  shell
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(page.title)}</title>`)
    .replace('<!--seo-head-->', headFor(page))
    .replace('<div id="root"></div>', bodyFor(page));

// 1) Keep the untouched shell as the fallback for dynamic routes we cannot prerender (always noindex, no canonical).
const generic = { path: null, noindex: true, title: SITE_NAME, description: `${SITE_NAME}: interview preparation for software engineers.`, h1: SITE_NAME, intro: [] };
write('app-shell.html', render(generic));

// 2) One real HTML file per known page. "/" becomes dist/index.html, "/dsa" becomes dist/dsa.html, "/dsa/blind-75" becomes
//    dist/dsa/blind-75.html. vercel.json has "cleanUrls": true, so Vercel serves them at /dsa and /dsa/blind-75 (no .html).
for (const page of allPages) write(page.path === '/' ? 'index.html' : `${page.path.slice(1)}.html`, render(page));

// 3) A real 404 (Vercel serves dist/404.html with an HTTP 404 status for unknown paths).
write('404.html', render(notFoundPage));

// 4) sitemap.xml: indexable pages only. <lastmod> comes from the last commit that touched the app (omitted if git is unavailable).
let lastmod = '';
try { lastmod = execSync('git log -1 --format=%cs -- src', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); } catch { /* no git: omit lastmod instead of guessing */ }
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${indexablePages.map((p) => `  <url>\n    <loc>${absoluteUrl(p.path)}</loc>${/^\d{4}-\d{2}-\d{2}$/.test(lastmod) ? `\n    <lastmod>${lastmod}</lastmod>` : ''}\n  </url>`).join('\n')}\n</urlset>\n`);

// 5) robots.txt. Private pages are NOT disallowed on purpose: they carry noindex, and Google can only obey noindex if it may crawl the page.
write('robots.txt', `User-agent: *\nAllow: /\nDisallow: /app-shell.html\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);

console.log(`prerender: ${allPages.length} pages + app-shell.html + 404.html + sitemap.xml (${indexablePages.length} URLs) + robots.txt`);
console.log(`prerender: site url ${SITE_URL}${gsc ? ' | Search Console verification tag included' : ' | no VITE_GSC_VERIFICATION set'}`);
