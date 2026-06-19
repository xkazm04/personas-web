// Vitest stub for Next's `server-only` import guard. The real package only
// exists to throw when server code is bundled for the browser; in the unit-test
// (node) environment there is no such risk, so it resolves to a no-op.
export {};
