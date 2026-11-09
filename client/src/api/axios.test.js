// Tests for the shared axios instance: when it refreshes the login, when it signs the user out, and when it does neither.
// No network is used: a fake adapter plays the server, and records every call it receives.
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AxiosError } from 'axios';
import api, { setLogoutCallback } from './axios';

let calls; // every request the fake server saw, as "METHOD /path"
let script; // path -> list of replies, used in order (the last one repeats)

const ok = (data = {}) => ({ status: 200, data });
const fail = (status) => ({ status, data: { message: `fake ${status}` } });
const timeout = () => ({ timeout: true });
const offline = () => ({ offline: true });

const fakeServer = async (config) => {
  const path = config.url;
  calls.push(`${config.method.toUpperCase()} ${path}`);
  const replies = script[path];
  if (!replies) throw new Error(`the test did not script a reply for ${path}`);
  const reply = replies.length > 1 ? replies.shift() : replies[0];
  if (reply.delayMs) await new Promise((r) => setTimeout(r, reply.delayMs));
  if (reply.timeout) throw new AxiosError('timeout of 30000ms exceeded', 'ECONNABORTED', config);
  if (reply.offline) throw new AxiosError('Network Error', 'ERR_NETWORK', config);
  const response = { status: reply.status, statusText: '', headers: {}, config, data: reply.data };
  if (reply.status >= 400) throw new AxiosError(`Request failed with status code ${reply.status}`, 'ERR_BAD_REQUEST', config, null, response);
  return response;
};

let logout;
beforeEach(() => {
  calls = [];
  script = {};
  api.defaults.adapter = fakeServer;
  logout = vi.fn();
  setLogoutCallback(logout);
});

const count = (needle) => calls.filter((c) => c === needle).length;

describe('shared axios instance: refreshing the login', () => {
  it('a 401 on a normal request triggers ONE refresh, then retries the request and returns its data', async () => {
    script['/api/user/stats'] = [fail(401), ok({ solved: 7 })];
    script['/api/auth/refresh'] = [ok()];
    const res = await api.get('/api/user/stats');
    expect(res.data).toEqual({ solved: 7 });
    expect(calls).toEqual(['GET /api/user/stats', 'POST /api/auth/refresh', 'GET /api/user/stats']);
    expect(logout).not.toHaveBeenCalled();
  });

  it('parallel requests that all get a 401 share a single refresh, and every one of them succeeds', async () => {
    script['/api/a'] = [fail(401), ok({ n: 'a' })];
    script['/api/b'] = [fail(401), ok({ n: 'b' })];
    script['/api/c'] = [fail(401), ok({ n: 'c' })];
    script['/api/auth/refresh'] = [{ ...ok(), delayMs: 20 }];
    const results = await Promise.all([api.get('/api/a'), api.get('/api/b'), api.get('/api/c')]);
    expect(results.map((r) => r.data.n)).toEqual(['a', 'b', 'c']);
    expect(count('POST /api/auth/refresh')).toBe(1);
    expect(logout).not.toHaveBeenCalled();
  });

  it('a request that is still refused after the refresh is not retried again (no endless loop)', async () => {
    script['/api/user/stats'] = [fail(401)]; // always 401
    script['/api/auth/refresh'] = [ok()];
    await expect(api.get('/api/user/stats')).rejects.toMatchObject({ response: { status: 401 } });
    expect(count('POST /api/auth/refresh')).toBe(1);
    expect(count('GET /api/user/stats')).toBe(2); // the original and one retry, no more
  });

  it('errors other than 401 are passed on without any refresh', async () => {
    script['/api/user/stats'] = [fail(500)];
    await expect(api.get('/api/user/stats')).rejects.toMatchObject({ response: { status: 500 } });
    expect(calls).toEqual(['GET /api/user/stats']);
    expect(logout).not.toHaveBeenCalled();
  });

  it('a 401 from login, register, Google sign-in or refresh itself is a real answer: no refresh is attempted', async () => {
    for (const path of ['/api/auth/login', '/api/auth/register', '/api/auth/google', '/api/auth/refresh']) {
      calls.length = 0;
      script[path] = [fail(401)];
      await expect(api.post(path, {})).rejects.toMatchObject({ response: { status: 401 } });
      expect(calls).toEqual([`POST ${path}`]);
    }
    expect(logout).not.toHaveBeenCalled();
  });
});

describe('shared axios instance: when the user is signed out', () => {
  it('the server refusing the refresh (401) signs the user out once and rejects the request', async () => {
    script['/api/user/stats'] = [fail(401)];
    script['/api/auth/refresh'] = [fail(401)];
    await expect(api.get('/api/user/stats')).rejects.toMatchObject({ response: { status: 401 } });
    expect(logout).toHaveBeenCalledTimes(1);
    expect(count('GET /api/user/stats')).toBe(1); // the original request is not retried
  });

  it('the server refusing the refresh (403, an old or reused token) also signs the user out', async () => {
    script['/api/user/stats'] = [fail(401)];
    script['/api/auth/refresh'] = [fail(403)];
    await expect(api.get('/api/user/stats')).rejects.toMatchObject({ response: { status: 403 } });
    expect(logout).toHaveBeenCalledTimes(1);
  });

  it('parallel requests when the refresh fails: all are rejected, the user is signed out ONCE', async () => {
    script['/api/a'] = [fail(401)];
    script['/api/b'] = [fail(401)];
    script['/api/auth/refresh'] = [{ ...fail(401), delayMs: 20 }];
    const results = await Promise.allSettled([api.get('/api/a'), api.get('/api/b')]);
    expect(results.every((r) => r.status === 'rejected')).toBe(true);
    expect(count('POST /api/auth/refresh')).toBe(1);
    expect(logout).toHaveBeenCalledTimes(1);
  });
});

describe('shared axios instance: when it must NOT sign the user out', () => {
  it('a timeout while refreshing says nothing about the session: no sign-out, the error is passed on', async () => {
    script['/api/user/stats'] = [fail(401)];
    script['/api/auth/refresh'] = [timeout()];
    await expect(api.get('/api/user/stats')).rejects.toMatchObject({ code: 'ECONNABORTED' });
    expect(logout).not.toHaveBeenCalled();
  });

  it('losing the connection while refreshing does not sign the user out either', async () => {
    script['/api/user/stats'] = [fail(401)];
    script['/api/auth/refresh'] = [offline()];
    await expect(api.get('/api/user/stats')).rejects.toMatchObject({ code: 'ERR_NETWORK' });
    expect(logout).not.toHaveBeenCalled();
  });

  it('a server error (500) while refreshing does not sign the user out', async () => {
    script['/api/user/stats'] = [fail(401)];
    script['/api/auth/refresh'] = [fail(500)];
    await expect(api.get('/api/user/stats')).rejects.toMatchObject({ response: { status: 500 } });
    expect(logout).not.toHaveBeenCalled();
  });

  it('a timeout on a normal request (no response at all) is not a login problem: no refresh, no sign-out', async () => {
    script['/api/user/stats'] = [timeout()];
    await expect(api.get('/api/user/stats')).rejects.toMatchObject({ code: 'ECONNABORTED' });
    expect(calls).toEqual(['GET /api/user/stats']);
    expect(logout).not.toHaveBeenCalled();
  });
});

describe('shared axios instance: state is reset between refreshes', () => {
  it('after a failed refresh, the next 401 starts a brand new refresh (it does not stay stuck)', async () => {
    script['/api/user/stats'] = [fail(401), fail(401), ok({ solved: 1 })];
    script['/api/auth/refresh'] = [timeout(), ok()];
    await expect(api.get('/api/user/stats')).rejects.toMatchObject({ code: 'ECONNABORTED' }); // first refresh times out
    const second = await api.get('/api/user/stats'); // 401 again, a second refresh now works
    expect(second.data).toEqual({ solved: 1 });
    expect(count('POST /api/auth/refresh')).toBe(2);
  });

  it('is set up to send cookies and to give up on a hung request', () => {
    expect(api.defaults.withCredentials).toBe(true);
    expect(api.defaults.timeout).toBe(30000);
  });
});
