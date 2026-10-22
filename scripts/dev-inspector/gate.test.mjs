// node --test scripts/dev-inspector/gate.test.mjs
//
// Pins the DevInspector's opt-in gates. Each case runs the loader in a fresh
// child process so "was the Babel toolchain loaded" is read from that process's
// own module cache and not from a neighbour's.
import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..", "..");
const loaderPath = path.join(here, "source-loc-loader.cjs");

// Runs the loader over one tsx source and prints what it returned.
const probe = `
const loader = require(${JSON.stringify(loaderPath)});
const root = ${JSON.stringify(root.replace(/\\/g, "/"))};
const source = 'export const A = () => <div><span /></div>;\\n';
loader.call({
  async: () => (err, code) => {
    const babel = Object.keys(require.cache).some((k) => k.replace(/\\\\/g, "/").includes("/@babel/core/"));
    console.log(JSON.stringify({ err: Boolean(err), stamps: (code.match(/data-loc=/g) || []).length, babel }));
  },
  resourcePath: root + "/src/app/Probe.tsx",
  getOptions: () => ({ rootDir: root }),
}, source);
`;

function run(flag) {
  const env = { ...process.env };
  delete env.DEV_INSPECT;
  if (flag !== undefined) env.DEV_INSPECT = flag;
  const r = spawnSync(process.execPath, ["-e", probe], { env, encoding: "utf8" });
  assert.equal(r.status, 0, r.stderr);
  return JSON.parse(r.stdout.trim());
}

test("flag absent: loader returns input untouched and never loads the toolchain", () => {
  assert.deepEqual(run(undefined), { err: false, stamps: 0, babel: false });
});

test("flag set to anything but 1: still a no-op", () => {
  assert.deepEqual(run("true"), { err: false, stamps: 0, babel: false });
});

test("flag set: both host elements are stamped", () => {
  const out = run("1");
  assert.equal(out.err, false);
  assert.equal(out.stamps, 2);
});

test("one spelling: config, loader and dev:inspect script read the same flag", () => {
  const config = fs.readFileSync(path.join(root, "next.config.ts"), "utf8");
  const loader = fs.readFileSync(loaderPath, "utf8");
  const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
  const reads = (s) => new Set([...s.matchAll(/process\.env\.(DEV_[A-Z_]*INSPECT[A-Z_]*)/g)].map((m) => m[1]));
  assert.deepEqual([...reads(config)], ["DEV_INSPECT"]);
  assert.deepEqual([...reads(loader)], ["DEV_INSPECT"]);
  assert.match(pkg.scripts["dev:inspect"], /\bDEV_INSPECT=1\b/);
});
