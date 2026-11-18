// A small in-memory stand-in for Redis, so the app's tests need no real Redis and no network (like the fake Gemini in setup.js).
// It has its own clock: call advance(ms) to make keys expire. It knows only what the app uses today (strings, expiry, counters);
// add a command here when a later step needs it, and test it in redis-config.test.js.
class FakeRedis {
  constructor() {
    this.now = 0;
    this.data = new Map();
    this.closed = false;
  }

  advance(ms) { this.now += ms; }

  live(key) {
    const entry = this.data.get(key);
    if (!entry) return null;
    if (entry.expiresAt !== null && entry.expiresAt <= this.now) { this.data.delete(key); return null; }
    return entry;
  }

  async get(key) { return this.live(key)?.value ?? null; }

  // set(key, value, 'EX', seconds | 'PX', milliseconds | 'NX'): the options ioredis accepts, in any order
  async set(key, value, ...options) {
    let ttl = null;
    let onlyIfAbsent = false;
    for (let i = 0; i < options.length; i += 1) {
      const option = String(options[i]).toUpperCase();
      if (option === 'EX') ttl = Number(options[++i]) * 1000;
      else if (option === 'PX') ttl = Number(options[++i]);
      else if (option === 'NX') onlyIfAbsent = true;
    }
    if (onlyIfAbsent && this.live(key)) return null;
    this.data.set(key, { value: String(value), expiresAt: ttl === null ? null : this.now + ttl });
    return 'OK';
  }

  async del(...keys) {
    let removed = 0;
    for (const key of keys.flat()) if (this.live(key)) { this.data.delete(key); removed += 1; }
    return removed;
  }

  async exists(...keys) { return keys.flat().filter((key) => this.live(key)).length; }

  async incr(key) {
    const entry = this.live(key);
    const next = (entry ? Number(entry.value) : 0) + 1;
    this.data.set(key, { value: String(next), expiresAt: entry ? entry.expiresAt : null });
    return next;
  }

  async expire(key, seconds) {
    const entry = this.live(key);
    if (!entry) return 0;
    entry.expiresAt = this.now + seconds * 1000;
    return 1;
  }

  async ttl(key) {
    const entry = this.live(key);
    if (!entry) return -2;
    return entry.expiresAt === null ? -1 : Math.ceil((entry.expiresAt - this.now) / 1000);
  }

  async quit() { this.closed = true; return 'OK'; }

  disconnect() { this.closed = true; }
}

module.exports = { FakeRedis };
