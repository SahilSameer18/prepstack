import { defineConfig } from "@playwright/test";

// Both servers belong to this run; an occupied port fails instead of using a live session.
export default defineConfig({
  testDir: "./e2e",
  workers: 1,
  timeout: 60000,
  expect: { timeout: 15000 },
  use: {
    baseURL: "http://localhost:5175",
    channel: "chrome",
    trace: "retain-on-failure",
  },
  outputDir: "../.tmp/browser-results",
  webServer: [
    {
      command: "node ../server/test/helpers/browser-server.js",
      url: "http://localhost:3100/health",
      timeout: 60000,
    },
    {
      command: "npm run dev -- --host localhost --port 5175 --strictPort",
      url: "http://localhost:5175",
      env: { VITE_API_URL: "http://localhost:3100" },
    },
  ],
});
