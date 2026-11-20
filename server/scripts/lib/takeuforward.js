// Reads a takeUforward "prep hub" sheet page (for example https://takeuforward.org/prep-hub/strivers-a2z-dsa-sheet).
// The page ships its whole syllabus inside the HTML as a list of rows; this turns that list into modules, sections and problems.
// Rows look like  [0, id, slug, 'category', title, [child row numbers]]  and
// [n, id, slug, 'item', 'practice', title, time, { itemSlug, ... }, video, article, external, ...].
const BASE = 'https://takeuforward.org';

// The page escapes quotes and backslashes inside a script string; undo that so the row list is plain JSON.
function unescapePage(html) {
  const bs = String.fromCharCode(92);
  return html.split(bs + '"').join('"').split(bs + bs).join(bs);
}

// The row list starts at "rows":[ and ends at its matching bracket (brackets inside strings do not count).
function extractRows(html) {
  const text = unescapePage(html);
  const at = text.indexOf('"rows":[');
  if (at < 0) throw new Error('no syllabus rows in the page: the site layout changed');
  const start = at + '"rows":'.length;
  let depth = 0;
  let inString = false;
  for (let i = start; i < text.length; i += 1) {
    const c = text[i];
    if (inString) {
      if (c === '\\') i += 1;
      else if (c === '"') inString = false;
    } else if (c === '"') inString = true;
    else if (c === '[') depth += 1;
    else if (c === ']') {
      depth -= 1;
      if (depth === 0) return JSON.parse(text.slice(start, i + 1));
    }
  }
  throw new Error('the syllabus rows never end: the site layout changed');
}

const isCategory = (row) => row[3] === 'category';
const kids = (row) => (Array.isArray(row[5]) ? row[5] : []); // a category row lists the row numbers of its children
const isItem = (row) => row[3] === 'item';
const asUrl = (value) => (typeof value === 'string' && /^(https?:\/\/|\/)/.test(value) ? value : null);

// A row lists its links after the meta object in a fixed order, but a missing link shifts the rest, so each link is classified by what it is:
// a YouTube link is the video, a takeUforward blog path is the article, any other web link is the external practice link.
function readItem(row) {
  const metaAt = row.findIndex((cell) => cell && typeof cell === 'object' && !Array.isArray(cell) && cell.itemSlug);
  const links = (metaAt >= 0 ? row.slice(metaAt + 1) : []).map(asUrl).filter(Boolean);
  const video = links.find((l) => /youtu/.test(l)) || null;
  const article = links.find((l) => l.startsWith('/blogs/') || /takeuforward\.org\/blogs\//.test(l)) || null;
  const external = links.find((l) => l !== video && l !== article && /^https?:/.test(l)) || null;
  return {
    slug: row[2],
    kind: row[4], // 'practice' (a problem) or 'learning' (a lesson)
    title: String(row[5] || '').trim(),
    minutes: typeof row[6] === 'string' ? row[6] : null,
    practiceUrl: row[4] === 'practice' ? `${BASE}/practice/dsa/${row[2]}` : null,
    video,
    article: article ? (article.startsWith('/') ? BASE + article : article) : null,
    external,
    tier: row[row.length - 1],
  };
}

// Returns [{ slug, title, sections: [{ slug, title, items }] }] in page order. Items placed directly under a module form a section named after the module.
function buildOutline(rows) {
  const children = new Set();
  rows.filter(isCategory).forEach((row) => kids(row).forEach((index) => children.add(index)));
  const collect = (row) => kids(row).flatMap((index) => {
    const next = rows[index];
    if (!next) return [];
    return isItem(next) ? [readItem(next)] : collect(next);
  });
  const sectionsOf = (row) => {
    const sections = [];
    const loose = [];
    for (const index of kids(row)) {
      const next = rows[index];
      if (!next) continue;
      if (isItem(next)) loose.push(readItem(next));
      else sections.push({ slug: next[2], title: next[4], items: collect(next) });
    }
    if (loose.length) sections.unshift({ slug: row[2], title: row[4], items: loose });
    return sections;
  };
  return rows
    .map((row, index) => ({ row, index }))
    .filter(({ row, index }) => isCategory(row) && !children.has(index))
    .map(({ row }) => ({ slug: row[2], title: row[4], sections: sectionsOf(row).filter((s) => s.items.length) }))
    .filter((module) => module.sections.length);
}

async function fetchSheetPage(url) {
  const res = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0' } });
  if (!res.ok) throw new Error(`${url} answered ${res.status}`);
  return res.text();
}

module.exports = { BASE, extractRows, buildOutline, fetchSheetPage };
