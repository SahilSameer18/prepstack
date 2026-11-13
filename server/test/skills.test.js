// The skill catalog: finding a skill in text, the advice it gives, and (most important) that every link into PrepStack
// still points at something that exists. If someone renames a sheet topic, a notes section or a roadmap, these tests fail
// instead of a student meeting a dead link.
const t = require('./helpers/setup');
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const skills = require('../src/services/skills.service');
const { ROADMAP_SLUGS } = require('../src/services/analyzerContext.service');

const { catalog } = skills;
// ref -> readable title, built from the real notes data and the Blind 75 seed (the app builds the same map from the database)
const titles = Object.fromEntries([
  ...t.sheetSeedData()[0].topics.map((tp) => [`dsa:blind-75:${tp.id}`, tp.title.trim()]),
  ...['os', 'dbms', 'cn', 'oops', 'hld'].flatMap((subject) => require(`../src/data/notes/${subject}.js`).sections.map((sec) => [`notes:${subject}:${sec.id}`, sec.title])),
]);
const match = (text) => skills.matchSkillText(text);

describe('matchSkillText: a skill named in free text', () => {
  it('matches a name or alias exactly, whatever the letter case', () => {
    assert.deepEqual(match('Docker'), { name: 'Docker', how: 'exact' });
    assert.deepEqual(match('  KUBERNETES '), { name: 'Kubernetes', how: 'exact' });
    for (const [text, name] of [['k8s', 'Kubernetes'], ['node js', 'Node.js'], ['Postgres', 'PostgreSQL'], ['reactjs', 'React'], ['nextjs', 'Next.js'], ['containerization', 'Docker']]) {
      assert.equal(match(text).name, name, text);
      assert.equal(match(text).how, 'exact', text);
    }
  });
  it('finds a skill inside a longer phrase (whole words only)', () => {
    assert.deepEqual(match('TypeScript knowledge'), { name: 'TypeScript', how: 'alias' });
    assert.deepEqual(match('experience with MongoDB databases'), { name: 'MongoDB', how: 'alias' });
    assert.equal(match('Terraform infrastructure as code').name, 'Terraform');
  });
  it('never finds a skill inside another word ("java" in JavaScript, "go" in Django, "ts" in results, "js" in JSON)', () => {
    assert.equal(match('JavaScript developer').name, 'JavaScript');
    assert.equal(match('Django REST framework').name, 'Django');
    for (const text of ['results driven professional', 'JSON handling', 'mongoose odm', 'category theory']) assert.equal(match(text).how, 'none', text);
  });
  it('when several skills appear, the one that appears first wins', () => {
    assert.equal(match('Cloud infrastructure (AWS/Azure/GCP)').name, 'AWS');
    assert.equal(match('Azure and AWS').name, 'Azure');
  });
  it('offers a close spelling of a LONG skill name only as a suggestion ("fuzzy")', () => {
    assert.deepEqual(match('Kubernets'), { name: 'Kubernetes', how: 'fuzzy' });
    assert.deepEqual(match('Angulr'), { name: 'Angular', how: 'fuzzy' });
  });
  it('never turns one technology into another through a one-letter slip ("Flash" is not Flask, "Shift" is not Swift)', () => {
    for (const text of ['Flash', 'Shift', 'Reakt', 'Redus', 'Gradel', 'Dockr']) assert.equal(match(text).how, 'none', text);
  });
  it('never "corrects" a word that is itself a different skill (Redux is not Redis)', () => {
    assert.equal(match('Redux').name, 'Redux');
    assert.equal(match('Redis').name, 'Redis');
  });
  it('returns "none" for empty, missing and meaningless text', () => {
    for (const text of ['', '   ', undefined, null, '???', '12345', 'a b c']) assert.deepEqual(match(text), { name: null, how: 'none' }, String(text));
  });
  it('works with a small catalog passed in (so callers and tests need not use the real one)', () => {
    const index = skills.makeIndex({ Alpha: ['alp'], 'Beta Tool': [] });
    assert.equal(skills.matchSkillText('using alp daily', index).name, 'Alpha');
    assert.equal(skills.matchSkillText('beta tool', index).how, 'exact');
    assert.equal(skills.matchSkillText('docker', index).how, 'none');
  });
});

describe('the skills added after the first 94', () => {
  it('finds each by its everyday wording', () => {
    for (const [text, name] of [['HTML and CSS', 'HTML'], ['data cleaning', 'Data Cleaning'], ['statistics', 'Statistics'], ['dashboard tool such as Tableau or Power BI', 'Tableau'], ['ability to mentor others', 'Leadership & Mentoring'],
      ['Excel', 'Excel'], ['pandas', 'Pandas & NumPy'], ['multithreading', 'Concurrency & Multithreading'], ['C#', 'C#'], ['communication skills', 'Communication'], ['Jenkins pipelines', 'Jenkins'], ['PyTorch', 'PyTorch'], ['WCAG compliance', 'Web Accessibility'], ['team player', 'Teamwork']]) {
      assert.equal(match(text).name, name, text);
    }
  });
  it('does not fire on look-alike words ("Google Analytics" is not data analysis, "trust" is not Rust, "excellent" is not Excel, "Tailwind CSS" is still Tailwind)', () => {
    assert.notEqual(match('Google Analytics reporting').name, 'Data Analysis');
    assert.equal(match('trust and safety').how, 'none');
    assert.equal(match('excellent attention to detail').how, 'none');
    assert.equal(match('Tailwind CSS').name, 'Tailwind CSS');
    assert.equal(match('team spirit').how, 'none');
  });
  it('soft skills point at the Behavioral Prep page and give no external link', () => {
    const a = skills.adviceFor('Communication', titles);
    assert.deepEqual(a.resources, []);
    assert.deepEqual(a.actions.map((x) => [x.kind, x.path]), [['behavioral', '/behavioral']]);
  });
  it('concurrency points at the OS notes it really relates to, and web basics at the Frontend roadmap', () => {
    assert.deepEqual(skills.adviceFor('Concurrency & Multithreading', titles).actions[0].sections, ['Processes', 'Threads and Multithreading', 'Process Synchronization', 'Deadlocks']);
    assert.equal(skills.adviceFor('HTML', titles).actions.find((x) => x.kind === 'roadmap').path, '/roadmaps/frontend');
    assert.equal(skills.adviceFor('Statistics', titles).actions.find((x) => x.kind === 'roadmap').path, '/roadmaps/data-analytics');
  });
  it('the added tools have an official documentation link and nothing invented (no videos)', () => {
    for (const name of ['HTML', 'CSS', 'Rust', 'C#', 'Tableau', 'Power BI', 'Jenkins', 'Nginx']) {
      const r = skills.adviceFor(name, titles).resources;
      assert.equal(r.length, 1, name);
      assert.equal(r[0].type, 'docs', name);
    }
  });
});

describe('adviceFor: what a student can do about a skill', () => {
  it('turns the catalog entry into resources and PrepStack actions with paths inside the app', () => {
    const os = skills.adviceFor('Operating Systems', titles);
    assert.equal(os.category, 'cs-core');
    assert.ok(os.resources.some((r) => r.type === 'docs') && os.resources.some((r) => r.type === 'video'));
    assert.deepEqual(os.actions.map((a) => [a.kind, a.path]), [['notes', '/notes/os/os-processes']]);
    assert.deepEqual(os.actions[0].sections, ['Processes', 'CPU Scheduling', 'Process Synchronization', 'Deadlocks', 'Memory Management']);
  });
  it('lists practice topics, notes, roadmap and project in a stable order', () => {
    assert.deepEqual(skills.adviceFor('Data Structures', titles).actions.map((a) => a.kind), ['dsa', 'roadmap']);
    assert.equal(skills.adviceFor('Data Structures', titles).actions[0].path, '/dsa/blind-75');
    assert.deepEqual(skills.adviceFor('REST APIs', titles).actions.map((a) => a.kind), ['notes', 'notes', 'roadmap', 'project']);
    assert.equal(skills.adviceFor('Node.js', titles).actions.find((a) => a.kind === 'roadmap').path, '/roadmaps/backend');
  });
  it('encodes the project stack in the link, and it is a stack the AI page accepts', () => {
    const a = skills.adviceFor('PostgreSQL', titles).actions.find((x) => x.kind === 'project');
    assert.equal(a.path, '/ai-projects?stack=PERN%20Stack');
    assert.equal(skills.adviceFor('Java', titles).actions.find((x) => x.kind === 'project').path, '/ai-projects?stack=Java%20%2F%20Spring%20Boot');
  });
  it('says honestly when PrepStack has nothing for a skill (empty actions) but still gives the learning links', () => {
    const k = skills.adviceFor('Azure', titles);
    assert.deepEqual(k.actions, []);
    assert.ok(k.resources.length >= 1);
  });
  it('the three newer roadmaps are the advice for their skills (Java and Spring, DSA, DevOps and cloud)', () => {
    const path = (name) => skills.adviceFor(name, titles).actions.find((a) => a.kind === 'roadmap').path;
    for (const n of ['Java', 'Spring Boot', 'Hibernate / JPA', 'Build Tools (Maven/Gradle)']) assert.equal(path(n), '/roadmaps/java-spring', n);
    for (const n of ['Data Structures', 'Algorithms', 'Big O / Time Complexity']) assert.equal(path(n), '/roadmaps/dsa', n);
    for (const n of ['Docker', 'Kubernetes', 'Terraform', 'Linux/Bash', 'Jenkins', 'CI/CD', 'GitHub Actions', 'Git', 'AWS']) assert.equal(path(n), '/roadmaps/devops-cloud', n);
  });
  it('returns null for an unknown skill', () => assert.equal(skills.adviceFor('Cobol', titles), null));
  it('adviceForReport covers the gaps and the plan, skips met skills and "none", and ignores unknown names', () => {
    const advice = skills.adviceForReport({
      requirements: [{ status: 'met', skillKey: 'React' }, { status: 'missing', skillKey: 'Docker' }, { status: 'partial', skillKey: 'TypeScript' }, { status: 'missing', skillKey: 'none' }, { status: 'missing', skillKey: 'Cobol' }],
      plan: [{ items: [{ ref: 'none', skillKey: 'Terraform' }, { ref: 'dsa:blind-75:graph', skillKey: 'none' }] }],
    }, titles);
    assert.deepEqual(Object.keys(advice).sort(), ['Docker', 'Terraform', 'TypeScript']);
  });
});

describe('permanent skill ids', () => {
  it('every skill has a lower-case id made of words joined with "-", and no id is used twice', () => {
    assert.ok(catalog.every((s) => /^[a-z0-9]+(-[a-z0-9]+)*$/.test(s.id)), 'a skill has a missing or badly written id');
    assert.equal(new Set(catalog.map((s) => s.id)).size, catalog.length);
  });
  it('a skill can be found by its id, and its advice carries the id', () => {
    for (const s of catalog) assert.equal(skills.skillById(s.id).name, s.name);
    assert.equal(skills.skillById('no-such-skill'), null);
    assert.equal(skills.adviceFor('Node.js', titles).id, 'nodejs');
    assert.equal(skills.adviceFor('C++', titles).id, 'cpp');
  });
  it('the notes and DSA mappings use ids, and the advice labels show the readable titles', () => {
    const os = skills.adviceFor('Operating Systems', titles).actions[0];
    assert.deepEqual(os.sectionIds, ['os-processes', 'os-cpu-scheduling', 'os-synchronization', 'os-deadlocks', 'os-memory-management']);
    assert.equal(os.label, 'Read Operating Systems notes: Processes, CPU Scheduling, Process Synchronization, Deadlocks, Memory Management');
    const dsa = skills.adviceFor('Data Structures', titles).actions[0];
    assert.deepEqual(dsa.topicIds, ['arrays-hashing', 'stack', 'linked-list', 'trees', 'heap-priority-queue', 'trie', 'graph']);
    assert.equal(dsa.topics[4], 'Heap/Priority Queue');
  });
});

describe('the catalog itself', () => {
  const CATEGORIES = ['dsa', 'cs-core', 'stack', 'soft', 'other'];
  it('has at least the 94 original skills, with unique names, a valid category and lower-case aliases', () => {
    assert.ok(catalog.length >= 94);
    assert.equal(new Set(catalog.map((s) => s.name)).size, catalog.length);
    for (const s of catalog) {
      assert.ok(CATEGORIES.includes(s.category), `${s.name}: category`);
      assert.ok(s.aliases.length > 0 && s.aliases.every((a) => a === a.toLowerCase().trim() && a.length >= 2), `${s.name}: aliases`);
    }
  });
  it('no alias belongs to two different skills (the match would be ambiguous)', () => {
    const owner = new Map();
    const clashes = [];
    for (const s of catalog) for (const a of new Set([s.name.toLowerCase(), ...s.aliases])) {
      if (owner.has(a) && owner.get(a) !== s.name) clashes.push(`"${a}": ${owner.get(a)} and ${s.name}`);
      else owner.set(a, s.name);
    }
    assert.deepEqual(clashes, []);
  });
  it('every learning link is https, has a title, and each skill has at most one docs link and one video', () => {
    for (const s of catalog) {
      for (const r of s.resources) {
        assert.ok(['docs', 'video'].includes(r.type), `${s.name}: type`);
        assert.ok(r.title.trim().length > 3, `${s.name}: title`);
        assert.match(r.url, /^https:\/\/[^\s]+$/, `${s.name}: url`);
      }
      assert.ok(s.resources.filter((r) => r.type === 'docs').length <= 1 && s.resources.filter((r) => r.type === 'video').length <= 1, `${s.name}: duplicates`);
    }
  });
  it('no link is shared by two skills (a "SQLite" video that is really the MySQL video would be mislabelled)', () => {
    const seen = new Map();
    const shared = [];
    for (const s of catalog) for (const r of s.resources) { if (seen.has(r.url)) shared.push(`${r.url}: ${seen.get(r.url)} and ${s.name}`); else seen.set(r.url, s.name); }
    assert.deepEqual(shared, []);
  });
  it('every skill has at least one learning link, except soft skills (practised on the Behavioral Prep page) and the MERN / PERN stacks (a roadmap and a project instead: there is no single official docs page)', () => {
    const stackCombos = (s) => s.category === 'stack' && s.prepstack.roadmap && s.prepstack.projectStack;
    assert.deepEqual(catalog.filter((s) => s.resources.length === 0 && s.category !== 'soft' && !stackCombos(s)).map((s) => s.name), []);
    assert.deepEqual(catalog.filter((s) => stackCombos(s) && s.resources.length === 0).map((s) => s.name).sort(), ['MERN Stack', 'PERN Stack']);
    // a soft skill with no external link must point somewhere inside PrepStack, or the student gets nothing at all
    assert.deepEqual(catalog.filter((s) => s.category === 'soft' && !s.resources.length && !s.prepstack.behavioral).map((s) => s.name), []);
  });
  it('only soft skills point at the Behavioral Prep page', () => {
    assert.deepEqual(catalog.filter((s) => s.prepstack.behavioral && s.category !== 'soft').map((s) => s.name), []);
  });
});

describe('every link into PrepStack still points at something real (the dangling-link test)', () => {
  const readBlind75Topics = () => t.sheetSeedData()[0].topics.map((topic) => topic.id);
  const notesSections = (subject) => require(`../src/data/notes/${subject}.js`).sections.map((s) => s.id);

  it('the DSA topics exist in the Blind 75 sheet', () => {
    const real = new Set(readBlind75Topics());
    const bad = catalog.flatMap((s) => s.prepstack.dsaTopics.filter((x) => !real.has(x)).map((x) => `${s.name}: ${x}`));
    assert.deepEqual(bad, []);
  });
  it('the CS notes subjects and sections exist', () => {
    const bad = [];
    for (const s of catalog) for (const n of s.prepstack.notes) {
      if (!skills.SUBJECTS[n.subject]) { bad.push(`${s.name}: subject ${n.subject}`); continue; }
      if (!notesSections(n.subject).includes(n.sectionId)) bad.push(`${s.name}: ${n.subject} / ${n.sectionId}`);
    }
    assert.deepEqual(bad, []);
  });
  it('the roadmaps exist', () => {
    assert.deepEqual(catalog.filter((s) => s.prepstack.roadmap && !ROADMAP_SLUGS.includes(s.prepstack.roadmap)).map((s) => `${s.name}: ${s.prepstack.roadmap}`), []);
  });
  it('the Behavioral Prep page the soft skills point to exists in the app', () => {
    const routes = path.join(t.SERVER_ROOT, '..', 'client', 'src', 'app.routes.jsx');
    if (!fs.existsSync(routes)) return; // the client folder may be absent when the server is tested alone
    assert.match(fs.readFileSync(routes, 'utf8'), /path:\s*["']\/behavioral["']/);
  });
  it('every project stack is a name the AI Projects page accepts (2 to 40 characters, letters, numbers and + # . / & ( ) -)', () => {
    for (const s of catalog.filter((x) => x.prepstack.projectStack)) {
      const v = s.prepstack.projectStack;
      assert.ok(/^[A-Za-z0-9 +#./&()-]{2,40}$/.test(v) && (v.match(/[A-Za-z]/g) || []).length >= 2, `${s.name}: ${v}`);
    }
  });
  it('a project stack that is one of the page buttons uses the button\'s exact spelling', () => {
    const page = fs.readFileSync(path.join(t.SERVER_ROOT, '..', 'client', 'src', 'pages', 'project', 'AIProjectIdeas.jsx'), 'utf8');
    const buttons = (page.match(/const techStacks = \[([^\]]*)\]/) || [])[1];
    if (!buttons) return; // the client folder may be absent when the server is tested alone
    const names = [...buttons.matchAll(/"([^"]+)"/g)].map((m) => m[1]);
    const wrong = catalog.map((s) => s.prepstack.projectStack).filter(Boolean).filter((v) => names.some((n) => n.toLowerCase() === v.toLowerCase() && n !== v));
    assert.deepEqual(wrong, []);
  });
  it('reports how much of the catalog PrepStack can actually teach (a count to watch, not a pass or fail)', () => {
    const teaches = catalog.filter((s) => s.prepstack.dsaTopics.length || s.prepstack.notes.length || s.prepstack.roadmap);
    assert.ok(teaches.length >= 40, `only ${teaches.length} of ${catalog.length} skills point at PrepStack content`);
  });
});

describe('MERN and PERN stacks', () => {
  it('a job that asks for the "PERN stack" or "MERN" is matched to its own skill, not to a database', () => {
    assert.equal(match('Hands-on experience in PERN stack').name, 'PERN Stack');
    assert.equal(match('Experience with the MERN stack').name, 'MERN Stack');
  });
  it('they give a roadmap and a project action, and no external link', () => {
    const a = skills.adviceFor('PERN Stack', titles);
    assert.deepEqual(a.resources, []);
    assert.deepEqual(a.actions.map((x) => x.kind), ['roadmap', 'project']);
    assert.equal(a.actions[1].path, '/ai-projects?stack=PERN%20Stack');
  });
});
