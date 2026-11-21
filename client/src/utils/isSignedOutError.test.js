import { describe, it, expect } from "vitest";
import { isSignedOutError } from "./isSignedOutError";

describe("isSignedOutError", () => {
  it("is true only when the server refused the session", () => {
    expect(isSignedOutError({ response: { status: 401 } })).toBe(true);
    expect(isSignedOutError({ response: { status: 403 } })).toBe(true);
  });

  it("is false for a lost connection, a timeout and server errors", () => {
    expect(isSignedOutError({ isAxiosError: true, code: "ERR_NETWORK" })).toBe(false);
    expect(isSignedOutError({ isAxiosError: true, code: "ECONNABORTED" })).toBe(false);
    expect(isSignedOutError({ response: { status: 502 } })).toBe(false);
    expect(isSignedOutError({ response: { status: 503 } })).toBe(false);
    expect(isSignedOutError(undefined)).toBe(false);
  });
});
