// Preloaded by scripts/load-test.js (node --require): lets the load test stop the server cleanly through its IPC channel, because Windows
// cannot send a stop signal to a child process, and a CPU profile (node --cpu-prof) is only written when the process exits normally.
process.on('message', (message) => { if (message === 'exit') process.exit(0); });
