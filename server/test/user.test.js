const t = require('./helpers/setup');
const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');

let User, Project, Progress, DSASheet, ExtraOwned, NotOurs;
const mid = (id) => new t.mongoose.Types.ObjectId(id);
const toggle = (acct, link, slug = 'blind-75') => t.api.post(`/api/sheets/${slug}/progress`, { cookies: acct.cookies, body: { problemLink: link } });
const putProfile = (acct, body) => t.api.put('/api/user/profile', { cookies: acct.cookies, body });
const googleAccount = async (n = Math.random().toString(36).slice(2, 8)) => {
  const email = `g${n}@example.com`;
  const res = await t.api.post('/api/auth/google', { body: { idToken: t.google.token({ email, sub: `sub-${n}`, name: `Goo ${n}` }) } });
  return { res, email, cookies: t.parseCookies(res), id: res.body.data.user.id };
};

describe('User: stats, dashboard, profile, password, account deletion', () => {
  before(async () => {
    await t.start();
    ({ User, Project, Progress, DSASheet } = t.getModels());
    await t.seedSheets();
    await DSASheet.create({ name: 'Empty', slug: 'empty-sheet', description: 'no problems yet', topics: [] });
    // two extra models to prove the delete cascade finds user-owned data by itself
    ExtraOwned = t.mongoose.model('ExtraOwned', new t.mongoose.Schema({ user: { type: t.mongoose.Schema.Types.ObjectId, ref: 'User' }, v: String }));
    NotOurs = t.mongoose.model('NotOurs', new t.mongoose.Schema({ user: { type: t.mongoose.Schema.Types.ObjectId, ref: 'Somebody' }, v: String }));
  });
  after(() => t.stop());

  // ───────────────────────────── stats + dashboard ─────────────────────────────
  describe('GET /api/user/stats and /api/user/dashboard-summary', () => {
    it('are all zeros for a brand-new user (and never divide by zero)', async () => {
      const acct = await t.register();
      const stats = await t.api.get('/api/user/stats', { cookies: acct.cookies });
      assert.deepEqual(stats.body.data.stats, { generatedProjectsCount: 0, solvedDSACount: 0 });
      const dash = await t.api.get('/api/user/dashboard-summary', { cookies: acct.cookies });
      assert.equal(dash.body.data.stats.totalSolved, 0);
      assert.equal(dash.body.data.stats.overallPct, 0);
      assert.equal(dash.body.data.stats.totalQuestions, 4);          // blind 3 unique + other 1 + empty 0
      assert.equal(dash.body.data.stats.sheetsInProgress, 0);
      assert.equal(dash.body.data.stats.sheetsCompleted, 0);
    });

    it('count unique links once, per sheet, with percent / in-progress / completed', async () => {
      const acct = await t.register();
      await toggle(acct, t.L('two-sum')); await toggle(acct, t.L('3sum'));      // 2 of 3 on blind-75
      await toggle(acct, t.L('only-in-other'), 'other-sheet');                  // 1 of 1 on other-sheet
      const d = (await t.api.get('/api/user/dashboard-summary', { cookies: acct.cookies })).body.data;
      assert.equal(d.stats.totalSolved, 3);
      assert.equal(d.stats.totalQuestions, 4);
      assert.equal(d.stats.overallPct, 75);
      assert.equal(d.stats.sheetsInProgress, 1);
      assert.equal(d.stats.sheetsCompleted, 1);
      const per = Object.fromEntries(d.dsaSheets.map((s) => [s.sheet.slug, `${s.solved}/${s.total}`]));
      assert.deepEqual(per, { 'blind-75': '2/3', 'other-sheet': '1/1', 'empty-sheet': '0/0' });
    });

    it('stats and dashboard AGREE even with stale links, links from missing sheets, and repeated links', async () => {
      const acct = await t.register();
      await Progress.collection.insertMany([
        { user: mid(acct.id), sheetSlug: 'blind-75', solvedProblems: [t.L('two-sum'), t.L('3sum'), t.L('removed-from-sheet-later'), t.L('3sum')].map((link) => ({ link, solvedAt: null })) },
        { user: mid(acct.id), sheetSlug: 'ghost-sheet', solvedProblems: ['https://x.example.com/a', 'https://x.example.com/b'].map((link) => ({ link, solvedAt: null })) },
      ]);
      const stats = (await t.api.get('/api/user/stats', { cookies: acct.cookies })).body.data.stats;
      const dash = (await t.api.get('/api/user/dashboard-summary', { cookies: acct.cookies })).body.data.stats;
      assert.equal(dash.totalSolved, 2);                    // only the two real, unique links
      assert.equal(stats.solvedDSACount, dash.totalSolved); // the old bug: stats said 7 here
    });

    it('stats also reports how many AI projects the user has', async () => {
      const acct = await t.register();
      await Project.create({ title: 't', tagline: 't', description: 'd', techStack: 'x', difficulty: 'Beginner', user: acct.id });
      assert.equal((await t.api.get('/api/user/stats', { cookies: acct.cookies })).body.data.stats.generatedProjectsCount, 1);
      assert.equal((await t.api.get('/api/user/dashboard-summary', { cookies: acct.cookies })).body.data.stats.generatedProjectsCount, 1);
    });

    it('only count MY progress, not other users', async () => {
      const a = await t.register(); const b = await t.register();
      await toggle(b, t.L('two-sum'));
      assert.equal((await t.api.get('/api/user/stats', { cookies: a.cookies })).body.data.stats.solvedDSACount, 0);
    });

    it('require login (401)', async () => {
      assert.equal((await t.api.get('/api/user/stats')).status, 401);
      assert.equal((await t.api.get('/api/user/dashboard-summary')).status, 401);
    });
  });

  // ───────────────────────────── profile ─────────────────────────────
  describe('PUT /api/user/profile', () => {
    it('changes the username and returns the updated user', async () => {
      const acct = await t.register({ username: 'old_name_1' });
      const res = await putProfile(acct, { username: 'new_name_1' });
      assert.equal(res.status, 200);
      assert.equal(res.body.data.user.username, 'new_name_1');
      assert.equal((await User.findById(acct.id)).username, 'new_name_1');
    });
    it('lets me change only the capital letters of my own name', async () => {
      const acct = await t.register({ username: 'caps_user' });
      const res = await putProfile(acct, { username: 'Caps_User' });
      assert.equal(res.status, 200);
      assert.equal(res.body.data.user.username, 'Caps_User');
    });
    it('refuses a name already taken by someone else, in any letter case (409)', async () => {
      await t.register({ username: 'Taken_Name' });
      const acct = await t.register();
      for (const name of ['Taken_Name', 'taken_name', 'TAKEN_NAME']) {
        const res = await putProfile(acct, { username: name });
        assert.equal(res.status, 409, name);
        assert.match(res.body.message, /already taken/);
      }
    });
    const badNames = [
      ['missing', {}, 'Username is required'],
      ['too short', { username: 'abc' }, 'Username must be at least 4 characters'],
      ['too long', { username: 'x'.repeat(31) }, 'Username cannot exceed 30 characters'],
      ['starts with a digit', { username: '1abcd' }, /start with a letter/],
      ['contains a space', { username: 'ab cd' }, /letters, numbers, and underscores/],
      ['regex characters (would break a pattern match)', { username: 'a.*b(' }, /letters, numbers, and underscores/],
    ];
    for (const [label, body, expected] of badNames) {
      it(`rejects a username that is ${label} (422)`, async () => {
        const res = await putProfile(await t.register(), body);
        assert.equal(res.status, 422);
        if (expected instanceof RegExp) assert.match(res.body.message, expected); else assert.equal(res.body.message, expected);
      });
    }

    describe('avatar URL', () => {
      it('accepts an https URL', async () => {
        const acct = await t.register();
        const url = 'https://api.dicebear.com/7.x/bottts/svg?seed=abc';
        const res = await putProfile(acct, { username: acct.username, avatar: url });
        assert.equal(res.status, 200);
        assert.equal(res.body.data.user.avatar, url);
      });
      const bad = [
        ['http (not https)', 'http://example.com/a.png'],
        ['javascript:', 'javascript:alert(document.cookie)'],
        ['data: URI', 'data:image/svg+xml;base64,PHN2Zz48L3N2Zz4='],
        ['plain text', 'not a url'],
        ['protocol-relative //host', '//evil.com/a.png'],
        ['https with no host', 'https://'],
      ];
      for (const [label, avatar] of bad) {
        it(`rejects ${label} (422) and keeps the old avatar`, async () => {
          const acct = await t.register();
          const before = (await User.findById(acct.id)).avatar;
          const res = await putProfile(acct, { username: acct.username, avatar });
          assert.equal(res.status, 422);
          assert.equal(res.body.message, 'Avatar must be a valid https:// URL');
          assert.equal((await User.findById(acct.id)).avatar, before);
        });
      }
      it('rejects an avatar longer than 500 characters', async () => {
        const res = await putProfile(await t.register(), { username: 'longavatar1', avatar: 'https://example.com/' + 'a'.repeat(490) });
        assert.equal(res.status, 422);
        assert.equal(res.body.message, 'Avatar URL cannot exceed 500 characters');
      });
      it('a blank avatar resets to the generated default; leaving it out keeps the current one', async () => {
        const acct = await t.register();
        await putProfile(acct, { username: acct.username, avatar: 'https://example.com/me.png' });
        const kept = await putProfile(acct, { username: acct.username });
        assert.equal(kept.body.data.user.avatar, 'https://example.com/me.png');
        const reset = await putProfile(acct, { username: acct.username, avatar: '' });
        assert.match(reset.body.data.user.avatar, /^https:\/\/api\.dicebear\.com\//);
      });
    });

    it('cannot change the email or the password through this endpoint', async () => {
      const acct = await t.register();
      const hashBefore = (await User.findById(acct.id)).password;
      const res = await putProfile(acct, { username: acct.username, email: 'hijack@example.com', password: 'Hacked123', providers: [{ providerName: 'google', providerId: 'x' }] });
      assert.equal(res.status, 200);
      const doc = await User.findById(acct.id);
      assert.equal(doc.email, acct.email);
      assert.equal(doc.password, hashBefore);
      assert.equal(doc.providers.length, 0);
    });
    it('requires login (401)', async () => {
      assert.equal((await t.api.put('/api/user/profile', { body: { username: 'abcd' } })).status, 401);
    });
  });

  // ───────────────────────────── change password ─────────────────────────────
  describe('PUT /api/user/change-password', () => {
    const change = (acct, body) => t.api.put('/api/user/change-password', { cookies: acct.cookies, body });

    it('changes the password: new one works, old one does not', async () => {
      const acct = await t.register();
      const res = await change(acct, { currentPassword: acct.password, newPassword: 'NewPass12345' });
      assert.equal(res.status, 200);
      assert.equal((await t.api.post('/api/auth/login', { body: { email: acct.email, password: 'NewPass12345' } })).status, 200);
      assert.equal((await t.api.post('/api/auth/login', { body: { email: acct.email, password: acct.password } })).status, 401);
    });
    it('signs every OTHER device out immediately (access + refresh tokens) but keeps this one', async () => {
      const acct = await t.register();
      const other = await t.login(acct);
      await change(acct, { currentPassword: acct.password, newPassword: 'NewPass12345' });
      assert.equal((await t.api.get('/api/auth/current-user', { cookies: other.cookies })).status, 401);
      assert.equal((await t.api.post('/api/auth/refresh', { cookies: { refreshToken: other.cookies.refreshToken } })).status, 403);
      assert.equal((await t.api.get('/api/auth/current-user', { cookies: acct.cookies })).status, 200);
      assert.equal((await t.api.post('/api/auth/refresh', { cookies: { refreshToken: acct.cookies.refreshToken } })).status, 200);
      assert.equal((await User.findById(acct.id)).refreshTokens.length, 1);
    });
    it('refuses a wrong current password (401) and changes nothing', async () => {
      const acct = await t.register();
      const res = await change(acct, { currentPassword: 'WrongCurrent1', newPassword: 'NewPass12345' });
      assert.equal(res.status, 401);
      assert.equal(res.body.message, 'Incorrect current password');
      assert.equal((await t.api.post('/api/auth/login', { body: { email: acct.email, password: acct.password } })).status, 200);
    });
    it('refuses reusing the same password (400)', async () => {
      const acct = await t.register();
      const res = await change(acct, { currentPassword: acct.password, newPassword: acct.password });
      assert.equal(res.status, 400);
      assert.match(res.body.message, /must be different/);
    });
    const weak = [
      ['missing current', { newPassword: 'NewPass12345' }, 'Current password is required'],
      ['missing new', { currentPassword: 'x' }, 'New password is required'],
      ['too short', { currentPassword: 'x', newPassword: 'Ab1' }, /at least 8/],
      ['no uppercase', { currentPassword: 'x', newPassword: 'alllower123' }, /uppercase/],
      ['no lowercase', { currentPassword: 'x', newPassword: 'ALLUPPER123' }, /lowercase/],
      ['no number', { currentPassword: 'x', newPassword: 'NoNumbersHere' }, /number/],
    ];
    for (const [label, body, expected] of weak) {
      it(`rejects: ${label} (422)`, async () => {
        const res = await change(await t.register(), body);
        assert.equal(res.status, 422);
        if (expected instanceof RegExp) assert.match(res.body.message, expected); else assert.equal(res.body.message, expected);
      });
    }
    it('tells a Google-only account to set a password first (400)', async () => {
      const g = await googleAccount();
      const res = await change(g, { currentPassword: 'Whatever123', newPassword: 'NewPass12345' });
      assert.equal(res.status, 400);
      assert.match(res.body.message, /Set Password/);
    });
    it('requires login (401)', async () => {
      assert.equal((await t.api.put('/api/user/change-password', { body: { currentPassword: 'x', newPassword: 'NewPass12345' } })).status, 401);
    });
    it('stops password guessing: after 10 wrong current passwords the 11th gets 429, even from a new address', async () => {
      const acct = await t.register();
      const statuses = [];
      for (let i = 0; i < 11; i++) statuses.push((await change(acct, { currentPassword: 'WrongPass123', newPassword: 'NewPass12345' })).status);
      assert.deepEqual(statuses, [...Array(10).fill(401), 429]);
      // counted per signed-in user, not per address: a request from a brand-new address is still blocked
      assert.equal((await change(acct, { currentPassword: acct.password, newPassword: 'NewPass12345' })).status, 429);
    });
    it('the guess limit is per user: someone else on the same address can still change their password', async () => {
      const bad = await t.register(); const other = await t.register();
      const ip = '203.0.113.99';
      for (let i = 0; i < 11; i++) await t.api.put('/api/user/change-password', { cookies: bad.cookies, ip, body: { currentPassword: 'WrongPass123', newPassword: 'NewPass12345' } });
      const res = await t.api.put('/api/user/change-password', { cookies: other.cookies, ip, body: { currentPassword: other.password, newPassword: 'AnotherPass123' } });
      assert.equal(res.status, 200);
    });
  });

  // ───────────────────────────── delete account ─────────────────────────────
  describe('DELETE /api/user/account (GDPR erasure)', () => {
    const del = (acct, body) => t.api.del('/api/user/account', { cookies: acct.cookies, body });
    const fill = async (acct) => {
      await toggle(acct, t.L('two-sum'));
      await Project.create({ title: 't', tagline: 't', description: 'd', techStack: 'x', difficulty: 'Beginner', user: acct.id });
      await ExtraOwned.create({ user: acct.id, v: 'x' });
      await NotOurs.create({ user: acct.id, v: 'x' });
    };

    it('asks for the password (400) and rejects a wrong one (401), deleting nothing', async () => {
      const acct = await t.register();
      assert.equal((await del(acct, {})).status, 400);
      const wrong = await del(acct, { password: 'WrongPass1' });
      assert.equal(wrong.status, 401);
      assert.equal(wrong.body.message, 'Incorrect password. Verification failed.');
      assert.ok(await User.exists({ _id: acct.id }));
    });

    it('deletes the user and EVERYTHING they own, leaves other users and unrelated data alone', async () => {
      const victim = await t.register(); const bystander = await t.register();
      await fill(victim); await fill(bystander);
      const res = await del(victim, { password: victim.password });
      assert.equal(res.status, 200);
      assert.equal(await User.exists({ _id: victim.id }), null);
      assert.equal(await Progress.countDocuments({ user: victim.id }), 0);
      assert.equal(await Project.countDocuments({ user: victim.id }), 0);
      assert.equal(await ExtraOwned.countDocuments({ user: victim.id }), 0, 'a NEW model with a user ref must be cascaded without editing the delete code');
      assert.equal(await NotOurs.countDocuments({ user: victim.id }), 1, 'a model whose "user" points somewhere else must NOT be touched');
      assert.ok(await User.exists({ _id: bystander.id }));
      assert.equal(await Progress.countDocuments({ user: bystander.id }), 1);
      assert.equal(await Project.countDocuments({ user: bystander.id }), 1);
      assert.equal(await ExtraOwned.countDocuments({ user: bystander.id }), 1);
    });

    it('clears the cookies, kills every old token, and the credentials no longer log in', async () => {
      const acct = await t.register();
      const other = await t.login(acct);
      const res = await del(acct, { password: acct.password });
      assert.match(res.headers['set-cookie'].join(';'), /accessToken=;/);
      for (const c of [acct.cookies, other.cookies]) {
        assert.equal((await t.api.get('/api/auth/current-user', { cookies: c })).status, 401);
        assert.equal((await t.api.post('/api/auth/refresh', { cookies: { refreshToken: c.refreshToken } })).status, 403);
      }
      assert.equal((await t.api.post('/api/auth/login', { body: { email: acct.email, password: acct.password } })).status, 401);
    });

    it('a deleted user cannot create orphan data with an old token', async () => {
      const acct = await t.register();
      await del(acct, { password: acct.password });
      assert.equal((await t.api.get('/api/sheets/blind-75/progress', { cookies: acct.cookies })).status, 401);
      assert.equal((await toggle(acct, t.L('two-sum'))).status, 401);
      assert.equal(await Progress.countDocuments({ user: acct.id }), 0);
    });

    it('the email can be registered again afterwards', async () => {
      const acct = await t.register();
      await del(acct, { password: acct.password });
      const again = await t.register({ email: acct.email, username: acct.username });
      assert.equal(again.res.status, 201);
    });

    it('Google-only accounts confirm with their email instead (case/space-insensitive)', async () => {
      const g = await googleAccount();
      await Project.create({ title: 't', tagline: 't', description: 'd', techStack: 'x', difficulty: 'Beginner', user: g.id });
      assert.equal((await del(g, {})).status, 400);
      const wrong = await del(g, { confirmationEmail: 'someone.else@example.com' });
      assert.equal(wrong.status, 400);
      assert.match(wrong.body.message, /email correctly/);
      assert.ok(await User.exists({ _id: g.id }));
      const ok = await del(g, { confirmationEmail: `  ${g.email.toUpperCase()} ` });
      assert.equal(ok.status, 200);
      assert.equal(await User.exists({ _id: g.id }), null);
      assert.equal(await Project.countDocuments({ user: g.id }), 0);
    });

    it('validates the confirmation email format (422) and requires login (401)', async () => {
      const g = await googleAccount();
      assert.equal((await del(g, { confirmationEmail: 'not-an-email' })).status, 422);
      assert.equal((await t.api.del('/api/user/account', { body: { password: 'x' } })).status, 401);
    });
    it('stops password guessing on delete: 10 wrong passwords, then 429, and the account is still there', async () => {
      const acct = await t.register();
      const statuses = [];
      for (let i = 0; i < 11; i++) statuses.push((await del(acct, { password: 'WrongPass123' })).status);
      assert.deepEqual(statuses, [...Array(10).fill(401), 429]);
      assert.ok(await User.exists({ _id: acct.id }));
    });
  });
});
