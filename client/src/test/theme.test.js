// Contrast of the light theme's key pairs (WCAG AA) is read from the real tokens in index.css, so a changed colour is caught.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ProgressMarks from '../components/ui/ProgressMarks';

const css = readFileSync(fileURLToPath(new URL('../index.css', import.meta.url)), 'utf8').replace(/\r\n/g, '\n');
const block = (start) => {
  const i = css.indexOf(start);
  return css.slice(i, css.indexOf('\n}\n', i));
};
const tokens = (text) => Object.fromEntries([...text.matchAll(/--([\w-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));
const light = tokens(block(':root[data-theme="light"] {'));
const dark = tokens(block(':root {'));

const lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
function rgb(v) {
  if (v.startsWith('#')) return [1, 3, 5].map((i) => lin(parseInt(v.slice(i, i + 2), 16) / 255));
  const [L, C, H] = v.match(/oklch\(([\d.]+)%\s+([\d.]+)\s+([\d.]+)\)/).slice(1).map(Number);
  const a = C * Math.cos((H * Math.PI) / 180), b = C * Math.sin((H * Math.PI) / 180), l0 = L / 100;
  const l = (l0 + 0.3963377774 * a + 0.2158037573 * b) ** 3, m = (l0 - 0.1055613458 * a - 0.0638541728 * b) ** 3, s = (l0 - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s].map((x) => Math.min(1, Math.max(0, x)));
}
const luminance = ([r, g, b]) => 0.2126 * r + 0.7152 * g + 0.0722 * b;
const ratio = (t, a, b) => {
  const x = luminance(rgb(t[a])), y = luminance(rgb(t[b]));
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
};

describe('light theme contrast', () => {
  const text = ['fg', 'fg-1', 'fg-2', 'fg-3', 'body', 'muted', 'faint', 'brand', 'brand-hover', 'ok', 'bad', 'warn', 'info', 'cyan', 'violet', 'pink', 'orange', 'yellow', 'data-blue', 'data-purple', 'data-green', 'data-pink'];
  for (const surface of ['canvas', 'card', 'card-hover']) {
    for (const name of text) {
      it(`${name} on ${surface} is at least 4.5:1`, () => {
        expect(ratio(light, name, surface)).toBeGreaterThanOrEqual(4.5);
      });
    }
  }
  it('white on the brand fill is at least 4.5:1', () => expect(ratio(light, 'on-brand', 'brand')).toBeGreaterThanOrEqual(4.5));
  it('dark text on both ends of the orange button gradient is at least 4.5:1', () => {
    for (const end of ['brand-grad-top', 'brand-grad-bottom', 'brand-grad-hover-top', 'brand-grad-hover-bottom']) {
      expect(ratio(light, 'on-grad', end)).toBeGreaterThanOrEqual(4.5);
    }
  });
  it('defines every colour the dark theme defines (nothing falls back to a dark value)', () => {
    const skip = new Set(['font-display', 'font-mono', 'font-sans', 'font-hand', 'logo-top', 'logo-bottom']);
    const missing = Object.keys(dark).filter((k) => !skip.has(k) && !dark[k].startsWith('var(') && !dark[k].startsWith('color-mix') && !dark[k].startsWith('inset') && !(k in light));
    expect(missing).toEqual([]);
  });
});

it('keeps the final progress mark empty until every item is complete', () => {
  const render = (value) => renderToStaticMarkup(createElement(ProgressMarks, { value, total: 50, max: 20, label: 'Tasks' }));
  expect(render(49).match(/bg-brand mark-fill/g)).toHaveLength(19);
  expect(render(49)).toContain('aria-valuenow="98"');
  expect(render(50).match(/bg-brand mark-fill/g)).toHaveLength(20);
  expect(render(0)).not.toContain('bg-brand mark-fill');
});
