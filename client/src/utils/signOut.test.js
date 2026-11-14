import { describe, it, expect } from 'vitest';
import { signOut, SIGN_OUT_FAILED } from './signOut';

const httpError = (status) => Object.assign(new Error('x'), { response: { status } });

describe('signOut', () => {
  it('resolves when the server ended the session', async () => {
    await expect(signOut(() => Promise.resolve(), 0)).resolves.toBeUndefined();
  });
  it('does not confirm revocation when authentication or permission was refused', async () => {
    await expect(signOut(() => Promise.reject(httpError(401)), 0)).rejects.toThrow(SIGN_OUT_FAILED);
    await expect(signOut(() => Promise.reject(httpError(403)), 0)).rejects.toThrow(SIGN_OUT_FAILED);
  });
  it('fails on a network error or a server error, so the user stays signed in', async () => {
    await expect(signOut(() => Promise.reject(new Error('Network Error')), 0)).rejects.toThrow(SIGN_OUT_FAILED);
    await expect(signOut(() => Promise.reject(httpError(500)), 0)).rejects.toThrow(SIGN_OUT_FAILED);
  });
});
