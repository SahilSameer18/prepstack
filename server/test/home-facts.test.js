// The home page quotes the size of the DSA library from a copy that lives in the client (client/src/data/homeFacts.json).
// If this fails, a sheet seed changed: run `npm run build:home-facts` in the server folder.
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const { TARGET, facts, render } = require('../scripts/export-home-facts');

describe('home facts copy in the client', () => {
  it('matches the sheet seed files', () => {
    assert.deepEqual(JSON.parse(fs.readFileSync(TARGET, 'utf8')), facts());
  });

  it('is written exactly as the script writes it (so a re-run changes nothing)', () => {
    assert.equal(fs.readFileSync(TARGET, 'utf8').replace(/\r\n/g, '\n'), render());
  });

  it('adds up: the total is the sum of the sheets', () => {
    const copy = JSON.parse(fs.readFileSync(TARGET, 'utf8'));
    assert.equal(copy.sheets, Object.keys(copy.perSheet).length);
    assert.equal(copy.problems, Object.values(copy.perSheet).reduce((a, b) => a + b, 0));
  });
});
