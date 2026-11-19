// Many different plan requests against the real sheets, notes and roadmaps. Writes nothing.
// Run: cd server && node scripts/plan-fuzz.js [count] [seed]      (default 1000 scenarios, seed 20261115)
// It checks the rules in test/helpers/plan-scenarios.js and prints how many plans cut something and any rule that broke.
const path = require('node:path');
const { loadPlanData } = require(path.join(__dirname, '../src/modules/plan/planData'));
const { buildScenarios, runScenarios } = require(path.join(__dirname, '../test/helpers/plan-scenarios'));

(async () => {
  let data = loadPlanData();
  if (data.then) data = await data;
  const count = Number(process.argv[2]) || 1000;
  const seed = Number(process.argv[3]) || 20261115;
  const started = Date.now();
  const scenarios = buildScenarios(count, data, seed);
  const stats = runScenarios(scenarios, data);
  console.log(`scenarios ${scenarios.length} (fresh plans ${stats.fresh}, rebuilds/changes ${stats.rebuild}) in ${((Date.now() - started) / 1000).toFixed(1)} s, seed ${seed}`);
  console.log('sheet plans that cut something:', stats.cut, '| role plans that cut something:', stats.roleCut);
  console.log('  of the sheet plans that cut, with a DSA topic group at 0 problems:', stats.groupNone, '| with a chosen subject at 0 sections:', stats.subjectNone);
  console.log('changes mid-plan, by result:', JSON.stringify(stats.outcomes));
  console.log('rule violations:', stats.violations.length);
  for (const line of stats.violations.slice(0, 25)) console.log('  ' + line);
  process.exit(stats.violations.length ? 1 : 0);
})();
