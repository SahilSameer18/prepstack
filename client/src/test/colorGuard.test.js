// Guard for the colour tokens: every colour in the app must be a named token from src/index.css,
// so a light theme only needs new values there. This fails when someone types a raw colour into a component.
import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const SRC = fileURLToPath(new URL('..', import.meta.url));

// The PDF export is drawn on white paper, outside the site theme, so it keeps its own fixed colours.
const SKIPPED_DIRS = ['components/pdf'];

const PALETTE = 'slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose';
const UTILITY = 'bg|text|border|ring|outline|fill|stroke|from|via|to|shadow|divide|accent|caret|decoration|placeholder';
const RULES = [
  { name: 'hex colour', re: /#[0-9a-fA-F]{3,8}\b/ },
  { name: 'rgb()/rgba()', re: /\brgba?\(/ },
  { name: 'Tailwind palette colour', re: new RegExp(`\\b(?:${UTILITY})-(?:${PALETTE})-\\d{2,3}\\b`) },
  { name: 'raw white/black', re: new RegExp(`\\b(?:${UTILITY})-(?:white|black)\\b`) },
];

const sourceFiles = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return SKIPPED_DIRS.includes(relative(SRC, full).split(sep).join('/')) ? [] : sourceFiles(full);
    return /\.(js|jsx)$/.test(name) && !/\.test\.(js|jsx)$/.test(name) ? [full] : [];
  });

const findings = (rule, lines) =>
  lines.flatMap((text, i) => (rule.re.test(text) ? [`${i + 1}: ${text.trim().slice(0, 100)}`] : []));

describe('colour tokens', () => {
  it('scans the real source folder', () => {
    expect(sourceFiles(SRC).length).toBeGreaterThan(50);
  });

  for (const rule of RULES) {
    it(`no raw ${rule.name} in src (use a token from index.css)`, () => {
      const found = sourceFiles(SRC).flatMap((file) =>
        findings(rule, readFileSync(file, 'utf8').split(/\r?\n/)).map((hit) => `${relative(SRC, file)}:${hit}`),
      );
      expect(found).toEqual([]);
    });
  }
});
