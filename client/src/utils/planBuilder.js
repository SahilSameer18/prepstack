// The address holds settings only. A save request after login needs a separate, one-use tab intent.
export const PLAN_INTENT_KEY = 'prepstack_plan_intent';
export const DEFAULT_SUBJECTS = ['os', 'dbms', 'cn', 'oops'];
const DAY_MS = 86400000;
const INTENT_LIFETIME_MS = 15 * 60 * 1000;

// Match the server's calendar day, even when the learner's browser uses another time zone.
export function dateInIndia(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(now);
}

// Starting values for a new placement plan. Return fresh arrays so edits cannot change the defaults.
export function defaultSettings() {
  return {
    goalType: 'placements', weeks: 12, weekdayHours: 3, weekendHours: 5,
    restDay: 6, style: 'one-topic', startDate: dateInIndia(),
    sheetSlug: 'blind-75', roadmapSlug: 'frontend',
    subjects: [...DEFAULT_SUBJECTS], knownTopics: [],
  };
}

// Restore form settings from a shared link or the browser's Back/Forward history.
// Keep invalid values for validation to explain; silently replacing them could produce the wrong plan.
export function readPlanSettings(search) {
  const params = new URLSearchParams(search);
  const settings = defaultSettings();
  const textFields = ['goalType', 'style', 'sheetSlug', 'roadmapSlug', 'startDate'];
  const numberFields = ['weeks', 'weekdayHours', 'weekendHours'];

  for (const field of textFields) {
    if (params.has(field)) settings[field] = params.get(field);
  }
  for (const field of numberFields) {
    if (params.has(field)) {
      const value = params.get(field);
      settings[field] = value === '' ? NaN : Number(value); // An empty field must not become zero hours.
    }
  }
  if (params.has('restDay')) {
    const rest = params.get('restDay');
    settings.restDay = rest === 'none' ? null : rest === '' ? NaN : Number(rest);
  }
  for (const field of ['subjects', 'knownTopics']) {
    if (params.has(field)) {
      settings[field] = [...new Set(params.get(field).split(',').filter(Boolean))];
    }
  }
  return settings;
}

// Save only the selected goal's settings in the address, never account data or a save instruction.
// An explicit empty subjects list means "no CS subjects", rather than "use the defaults".
export function writePlanSettings(settings) {
  const params = new URLSearchParams();
  for (const field of ['goalType', 'weeks', 'weekdayHours', 'weekendHours', 'style', 'startDate']) {
    params.set(field, String(settings[field]));
  }
  params.set('restDay', settings.restDay === null ? 'none' : String(settings.restDay));
  if (settings.goalType === 'role') {
    params.set('roadmapSlug', settings.roadmapSlug);
  } else {
    params.set('sheetSlug', settings.sheetSlug);
    params.set('subjects', settings.subjects.join(','));
  }
  params.set('knownTopics', settings.knownTopics.join(','));
  return params.toString();
}

// Offer only DSA topics that the chosen sheet or roadmap can actually leave out.
export function planTopics(settings, options) {
  if (!options) return [];
  const choices = settings.goalType === 'role' ? options.roadmaps : options.sheets;
  const selected = settings.goalType === 'role' ? settings.roadmapSlug : settings.sheetSlug;
  return choices.find((choice) => choice.slug === selected)?.topics || [];
}

// Check both the real calendar date and the server's yesterday-to-60-days-ahead window.
// Comparing the formatted date rejects values JavaScript would otherwise roll into another month.
function validStartDate(value, today) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = Date.parse(`${value}T00:00:00Z`);
  const current = Date.parse(`${today}T00:00:00Z`);
  if (!Number.isFinite(date)) return false;
  const realDate = new Date(date).toISOString().slice(0, 10) === value;
  return realDate && date >= current - DAY_MS && date <= current + 60 * DAY_MS;
}

// Give field-specific feedback before requesting a preview. The server still validates every request.
// Choice-dependent checks wait until the server's available sheets, subjects and topics have loaded.
export function planFormErrors(settings, options, today = dateInIndia()) {
  const errors = {};
  if (!['placements', 'role', 'bigtech'].includes(settings.goalType)) {
    errors.goalType = 'Choose a goal.';
  }
  if (!Number.isInteger(settings.weeks) || settings.weeks < 1 || settings.weeks > 52) {
    errors.weeks = 'Choose 1 to 52 whole weeks.';
  }
  for (const [field, label] of [['weekdayHours', 'Weekday hours'], ['weekendHours', 'Weekend hours']]) {
    const hours = settings[field];
    const allowed = Number.isFinite(hours) && (hours === 0 || (hours >= 0.5 && hours <= 12));
    if (!allowed) errors[field] = `${label} must be 0 or between 0.5 and 12.`;
  }
  const rest = settings.restDay;
  if (rest !== null && !(Number.isInteger(rest) && rest >= 0 && rest <= 6)) {
    errors.restDay = 'Choose a rest day or no rest day.';
  }
  const hasStudyDay = Array.from({ length: 7 }, (_, day) => {
    const hours = day < 5 ? settings.weekdayHours : settings.weekendHours;
    return day !== rest && hours > 0;
  }).some(Boolean);
  if (!hasStudyDay) errors.weekdayHours = 'Allow study time on at least one day each week.';
  if (!['one-topic', 'mixed'].includes(settings.style)) errors.style = 'Choose a study style.';
  if (!validStartDate(settings.startDate, today)) {
    errors.startDate = 'Start from yesterday to 60 days from today (India time).';
  }
  if (!options) return errors;

  if (settings.goalType === 'role') {
    if (!options.roadmaps.some((road) => road.slug === settings.roadmapSlug)) {
      errors.roadmapSlug = 'Choose an available roadmap.';
    }
  } else {
    if (!options.sheets.some((sheet) => sheet.slug === settings.sheetSlug)) {
      errors.sheetSlug = 'Choose an available DSA sheet.';
    }
    if (settings.goalType === 'bigtech' && !['neetcode-150', 'striver-sde'].includes(settings.sheetSlug)) {
      errors.sheetSlug = 'For big-tech prep, choose NeetCode 150 or Striver SDE.';
    }
    if (settings.subjects.some((id) => !options.subjects.some((subject) => subject.id === id))) {
      errors.subjects = 'Choose available CS subjects.';
    }
  }
  const topicIds = new Set(planTopics(settings, options).map((topic) => topic.id));
  if (settings.knownTopics.length > 80 || settings.knownTopics.some((id) => !topicIds.has(id))) {
    errors.knownTopics = 'Some saved topics do not belong to this selection. Clear them or choose again.';
  }
  return errors;
}

// Build the API payload: role plans use a roadmap; placement/big-tech plans use a sheet and subjects.
export function planBody(settings) {
  const { goalType, weeks, weekdayHours, weekendHours, restDay, style, startDate, knownTopics } = settings;
  const common = { goalType, weeks, weekdayHours, weekendHours, restDay, style, startDate, knownTopics };
  if (goalType === 'role') return { ...common, roadmapSlug: settings.roadmapSlug };
  return { ...common, sheetSlug: settings.sheetSlug, subjects: settings.subjects };
}

// Login may return to an internal page only. Reject external addresses and authentication loops.
// Decode the path as well, so encoded slashes cannot disguise an unsafe destination.
export function safeReturnTo(value) {
  try {
    if (!value?.startsWith('/') || value.startsWith('//')) return '/';
    const hasControlCharacter = [...value].some((character) => character.charCodeAt(0) <= 32);
    if (hasControlCharacter || value.includes('\\')) return '/';
    const url = new URL(value, 'https://prepstack.invalid');
    const decoded = decodeURIComponent(url.pathname);
    const authPages = ['/login', '/register', '/forgot-password', '/reset-password'];
    if (url.origin !== 'https://prepstack.invalid' || authPages.includes(url.pathname)) return '/';
    if (decoded.startsWith('//') || decoded.includes('\\')) return '/';
    return url.pathname + url.search + url.hash;
  } catch {
    return '/';
  }
}

// Resume a learner's Generate click once after login, only for matching settings in the same tab.
// A shared URL alone cannot authorize a save; expired, changed or already-used intents are refused.
export function consumePlanIntent(storage, token, settingsKey, now = Date.now()) {
  try {
    const intent = JSON.parse(storage.getItem(PLAN_INTENT_KEY) || 'null');
    if (!intent || intent.token !== token || intent.settings !== settingsKey) return false;
    const age = now - intent.createdAt;
    if (!Number.isFinite(age) || age < 0 || age > INTENT_LIFETIME_MS) return false;
    storage.removeItem(PLAN_INTENT_KEY);
    return true;
  } catch {
    return false;
  }
}

// Adapt generator items to the shared checklist's day groups, keeping part labels and completion state.
// Preview/saved-plan displays reuse that checklist instead of maintaining a separate task renderer.
export function planDays(items) {
  const days = new Map();
  for (const item of items) {
    if (!days.has(item.day)) days.set(item.day, { day: item.day, focus: 'Study tasks', items: [] });
    const part = item.part ? ` (part ${item.part.n} of ${item.part.of})` : '';
    days.get(item.day).items.push({
      task: `${item.title}${part} · ${item.plannedMinutes} min`, ref: item.ref,
      done: !!(item.doneAt || item.solvedOnSheet), doneAt: item.doneAt,
    });
  }
  return [...days.values()].sort((a, b) => a.day.localeCompare(b.day));
}
