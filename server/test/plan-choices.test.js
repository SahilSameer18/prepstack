// The "My plan" form opens from a copy of the planner's choices that lives in the client (client/src/data/planChoices.json).
// If this fails, a sheet, a roadmap or the plan data changed: run `npm run build:plan-choices` in the server folder.
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const { TARGET, render } = require('../scripts/export-plan-choices');
const { getPlanChoices } = require('../src/modules/plan/planData');

describe('plan choices copy in the client', () => {
  it('matches what the server sends from /api/plan/options', () => {
    const copy = JSON.parse(fs.readFileSync(TARGET, 'utf8'));
    assert.deepEqual(copy, JSON.parse(JSON.stringify(getPlanChoices())));
  });

  it('is written exactly as the script writes it (so a re-run changes nothing)', () => {
    assert.equal(fs.readFileSync(TARGET, 'utf8').replace(/\r\n/g, '\n'), render());
  });

  it('holds only public choices: titles and ids, nothing that looks like user data or a problem list', () => {
    const text = fs.readFileSync(TARGET, 'utf8');
    assert.ok(!/"(email|password|token|problems|link)"/i.test(text));
  });
});
