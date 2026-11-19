const { it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const SOURCE = path.resolve(__dirname, '../src');
const ALLOWED = {
  shared: [],
  ai: ['shared'],
  auth: ['shared'],
  notes: ['shared'],
  sheets: ['auth', 'shared'],
  project: ['ai', 'auth', 'shared'],
  'problem-notes': ['auth', 'sheets', 'shared'],
  user: ['auth', 'project', 'sheets', 'shared'],
  usage: ['analyzer', 'auth', 'project', 'shared'],
  analyzer: ['ai', 'auth', 'notes', 'sheets', 'shared'],
  plan: ['analyzer', 'auth', 'notes', 'sheets', 'shared'],
};

function sourceFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? sourceFiles(file) : [file];
  });
}

function owner(file) {
  const relative = path.relative(SOURCE, file);
  assert.ok(!relative.startsWith('..') && !path.isAbsolute(relative), `Import outside src: ${file}`);
  if (relative === 'app.js') return null;
  const parts = relative.split(path.sep);
  assert.ok(parts[0] === 'shared' || parts[0] === 'modules', `File outside a module: ${relative}`);
  const name = parts[0] === 'shared' ? 'shared' : parts[1];
  assert.ok(Object.hasOwn(ALLOWED, name), `Missing dependency rules for ${name}`);
  return name;
}

// Keep strings as single tokens and discard comments so examples cannot create false imports.
function tokens(source) {
  const pattern = /\/\/[^\n]*|\/\*[\s\S]*?\*\/|'(?:\\[\s\S]|[^'\\])*'|"(?:\\[\s\S]|[^"\\])*"|`(?:\\[\s\S]|[^`\\])*`|[A-Za-z_$][\w$]*|[^\s]/g;
  return [...source.matchAll(pattern)].map((match) => match[0])
    .filter((token) => !token.startsWith('//') && !token.startsWith('/*'));
}

function literal(token) {
  const match = /^(['"`])([A-Za-z0-9_@./:-]+)\1$/.exec(token || '');
  return match?.[2];
}

function imports(file) {
  const list = tokens(fs.readFileSync(file, 'utf8'));
  const targets = [];
  for (let index = 0; index < list.length; index++) {
    if (list[index] !== 'require' || list[index - 1] === '.') continue;
    let opening = index + 1;
    if (list[opening] === '.' && list[opening + 1] === 'resolve') opening += 2;
    if (list[opening] !== '(') continue;
    let end = opening + 1;
    let depth = 1;
    for (; end < list.length && depth; end++) {
      if (list[end] === '(') depth++;
      if (list[end] === ')') depth--;
    }
    assert.equal(depth, 0, `Unclosed require in ${file}`);
    const expression = list.slice(opening + 1, end - 1);
    const specifier = expression.length === 1 ? literal(expression[0]) : undefined;
    if (specifier !== undefined) {
      if (specifier.startsWith('.')) targets.push(require.resolve(path.resolve(path.dirname(file), specifier)));
      continue;
    }

    // The planner loads a filename from a fixed folder. Scan every possible source file there.
    // New dynamic import forms must be handled explicitly instead of escaping the guard.
    assert.equal(expression.slice(0, 4).join(''), 'path.join(', `Unsupported require in ${file}`);
    assert.equal(expression.at(-1), ')', `Unsupported path expression in ${file}`);
    const argumentsList = expression.slice(4, -1);
    const parts = [];
    for (let argument = 0; argument < argumentsList.length; argument += 2) {
      if (argument > 0) assert.equal(argumentsList[argument - 1], ',', `Unsupported path argument in ${file}`);
      parts.push(argumentsList[argument]);
    }
    assert.ok(parts.length > 1 && /^[A-Za-z_$][\w$]*$/.test(parts.at(-1)), `Unsupported dynamic filename in ${file}`);
    const prefix = parts.slice(0, -1).map((part) => {
      const value = literal(part);
      assert.notEqual(value, undefined, `Nonliteral import directory in ${file}`);
      return value;
    });
    assert.ok(prefix[0].startsWith('.'), `Nonrelative import directory in ${file}`);
    const directory = path.resolve(path.dirname(file), ...prefix);
    const candidates = fs.readdirSync(directory, { withFileTypes: true })
      .filter((entry) => entry.isFile() && /\.(js|json)$/.test(entry.name));
    assert.ok(candidates.length, `Empty dynamic import directory: ${directory}`);
    targets.push(...candidates.map((entry) => path.join(directory, entry.name)));
  }
  return targets;
}

it('keeps backend files in modules with allowed imports and no dependency cycles', () => {
  const graph = new Map(Object.keys(ALLOWED).map((name) => [name, new Set()]));
  for (const file of sourceFiles(SOURCE)) {
    const from = owner(file);
    if (!file.endsWith('.js')) continue;
    for (const target of imports(file)) {
      const to = owner(target);
      if (!from || from === to) continue;
      assert.ok(to && ALLOWED[from].includes(to), `${path.relative(SOURCE, file)}: ${from} cannot import ${to || 'app.js'}`);
      graph.get(from).add(to);
    }
  }

  function checkCycles(name, chain) {
    assert.ok(!chain.includes(name), `Module cycle: ${[...chain, name].join(' -> ')}`);
    for (const next of graph.get(name)) checkCycles(next, [...chain, name]);
  }
  for (const name of graph.keys()) checkCycles(name, []);
});
