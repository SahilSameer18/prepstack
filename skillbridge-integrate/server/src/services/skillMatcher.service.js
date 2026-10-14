/**
 * Skill matcher — resolves a free-text skill gap string (from Gemini) to a
 * seeded Skill record, purely in server logic. No prompt changes, no AI calls.
 *
 * Pipeline: exact match -> bounded alias/keyword match (earliest wins) -> fuzzy fallback -> null
 */

const FUZZY_THRESHOLD = 0.84;
const MIN_FUZZY_TERM_LENGTH = 4; // skip fuzzy matching for very short aliases (e.g. "go", "js", "ts") — too noisy

/**
 * Loads all seeded skills once. Call this ONCE per report generation
 * (not once per skill gap) and reuse the result across all gaps.
 */
async function loadSkillsForMatching(prisma) {
  const skills = await prisma.skill.findMany({
    select: { id: true, name: true, aliases: true },
  });

  // Pre-lowercase everything once so matching doesn't repeat this work per gap.
  return skills.map((skill) => ({
    id: skill.id,
    terms: [skill.name.toLowerCase(), ...skill.aliases.map((a) => a.toLowerCase())],
  }));
}

/**
 * Finds the index of `term` inside `text` such that it is not immediately
 * preceded or followed by an alphanumeric character (i.e. it's a whole
 * token, not part of a longer word). Returns -1 if no such occurrence exists.
 *
 * This is what stops "java" from matching inside "javascript", "js" from
 * matching inside "json", and "go" from matching inside "django"/"mongo".
 */
function findBoundedSubstring(text, term) {
  let fromIndex = 0;
  while (fromIndex <= text.length) {
    const idx = text.indexOf(term, fromIndex);
    if (idx === -1) return -1;

    const beforeChar = idx > 0 ? text[idx - 1] : null;
    const afterChar = idx + term.length < text.length ? text[idx + term.length] : null;
    const beforeOk = !beforeChar || !/[a-z0-9]/i.test(beforeChar);
    const afterOk = !afterChar || !/[a-z0-9]/i.test(afterChar);

    if (beforeOk && afterOk) return idx;
    fromIndex = idx + 1;
  }
  return -1;
}

function levenshtein(a, b) {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[m][n];
}

function similarity(a, b) {
  if (a.length === 0 && b.length === 0) return 1;
  const distance = levenshtein(a, b);
  return 1 - distance / Math.max(a.length, b.length);
}

/**
 * Resolves a single raw skill gap string to a skill id.
 * Pure function — no DB calls, no side effects. `skills` is the array
 * returned by loadSkillsForMatching().
 */
function matchSkillGap(rawSkillText, skills) {
  const normalized = rawSkillText.toLowerCase().trim();

  // 1. Exact match — the whole gap text equals a skill name/alias exactly.
  // Rare given how Gemini phrases things today, but cheap to check and
  // future-proofs against cleaner output later.
  for (const skill of skills) {
    if (skill.terms.includes(normalized)) {
      return { skillId: skill.id, matchType: "exact" };
    }
  }

  // 2. Bounded alias/keyword match. If multiple skills are mentioned in one
  // gap (e.g. "Cloud Infrastructure (AWS/Azure/GCP)"), the one whose term
  // appears EARLIEST in the text wins. Ties broken by longer (more specific) term.
  let best = null; // { skillId, position, termLength }
  for (const skill of skills) {
    for (const term of skill.terms) {
      const position = findBoundedSubstring(normalized, term);
      if (position === -1) continue;
      if (
        !best ||
        position < best.position ||
        (position === best.position && term.length > best.termLength)
      ) {
        best = { skillId: skill.id, position, termLength: term.length };
      }
    }
  }
  if (best) return { skillId: best.skillId, matchType: "alias" };

  // 3. Fuzzy fallback — catches typos on an otherwise-literal tool name
  // (e.g. "Doker" -> Docker). Deliberately NOT applied to the whole gap
  // string (compound phrases would never score high enough); instead it's
  // checked per-token against each skill's terms.
  const tokens = normalized.split(/[^a-z0-9+.]+/).filter((t) => t.length >= 3);

  let fuzzyBest = null; // { skillId, score }
  for (const skill of skills) {
    for (const term of skill.terms) {
      if (term.length < MIN_FUZZY_TERM_LENGTH) continue;
      for (const token of tokens) {
        const score = similarity(token, term);
        if (score >= FUZZY_THRESHOLD && (!fuzzyBest || score > fuzzyBest.score)) {
          fuzzyBest = { skillId: skill.id, score };
        }
      }
    }
  }
  if (fuzzyBest) return { skillId: fuzzyBest.skillId, matchType: "fuzzy" };

  // No match — gap will be saved with skillId: null, no resources shown.
  return { skillId: null, matchType: "none" };
}

/**
 * Convenience batch helper for Phase 5: takes the raw skillGaps array
 * Gemini returned (each with a `skill` string) and an active prisma client,
 * and returns the same gaps with a `skillId` field attached to each.
 * Loads the skill list exactly once, regardless of how many gaps there are.
 */
async function attachSkillIds(skillGaps, prisma) {
  const skills = await loadSkillsForMatching(prisma);

  return skillGaps.map((gap) => {
    const { skillId } = matchSkillGap(gap.skill, skills);
    return { ...gap, skillId };
  });
}

export { loadSkillsForMatching, matchSkillGap, attachSkillIds };
