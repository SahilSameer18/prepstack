// Writes the goal planner's form choices (sheets, subjects, roadmaps and their topics) into the client, so the
// "My plan" form can open at once without waiting for the server (a free-tier server can take a minute to wake up).
// The choices are public and the same for everyone: no user data, no problem lists.
// Run after changing a sheet, a roadmap or the plan data: npm run build:plan-choices
// test/plan-choices.test.js fails when the client copy and the server's own choices differ.
const fs = require('fs');
const path = require('path');
const { getPlanChoices } = require('../src/modules/plan/planData');

const TARGET = path.join(__dirname, '..', '..', 'client', 'src', 'data', 'planChoices.json');

const render = () => JSON.stringify(getPlanChoices(), null, 2) + '\n';

if (require.main === module) {
  fs.writeFileSync(TARGET, render());
  console.log('Wrote ' + path.relative(process.cwd(), TARGET));
}

module.exports = { TARGET, render };
