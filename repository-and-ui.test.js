"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const pkg = require(path.join(root, "package.json"));

test("root-level npm commands and workflow are present", () => {
  for (const script of ["start", "test", "benchmark"]) assert.equal(typeof pkg.scripts[script], "string");
  assert.ok(fs.existsSync(path.join(root, ".github", "workflows", "ci.yml")));
  for (const file of ["index.html", "sha256.js", "evidence-ledger.js", "scripts/serve.js", "scripts/benchmark.js"]) {
    assert.ok(fs.existsSync(path.join(root, file)), `missing ${file}`);
  }
});

test("demo visibly discloses that no real emergency service or hardware is connected", () => {
  assert.match(html, /DEMO ONLY/);
  assert.match(html, /No real alert, phone call, message, location share, or hardware command is sent/);
  assert.match(html, /No call, message, location share, or responder dispatch has occurred/);
});

test("guardian and evidence dynamic content is rendered without innerHTML interpolation", () => {
  const guardianFn = html.match(/function renderGuardiansTab\(\) \{([\s\S]*?)\n    \}\n\n    \/\/ Render Evidence Ledger Table/);
  const evidenceFn = html.match(/function renderEvidenceTab\(\) \{([\s\S]*?)\n    \}\n\n    function renderAll/);
  assert.ok(guardianFn, "guardian renderer exists");
  assert.ok(evidenceFn, "evidence renderer exists");
  assert.doesNotMatch(guardianFn[1], /innerHTML/);
  assert.doesNotMatch(html, /\.innerHTML\s*=/);
  assert.doesNotMatch(html, /computeFastHexHash/);
  assert.doesNotMatch(evidenceFn[1], /innerHTML/);
  assert.match(guardianFn[1], /name\.textContent = g\.name/);
});

test("motion sensor listener is cleaned up and does not fabricate a reading", () => {
  const motionFn = html.match(/deviceMotionBtn'\)\.addEventListener\('click', async \(\) => \{([\s\S]*?)\n      \}\);\n\n      \/\/ Manual Snapshot/);
  assert.ok(motionFn, "motion handler exists");
  assert.match(motionFn[1], /removeEventListener\('devicemotion', handler\)/);
  assert.match(motionFn[1], /No motion event arrived/);
  assert.doesNotMatch(motionFn[1], /gForce = 2\.4/);
});

test("mobile overflow-prone evidence actions wrap and table scrolls inside its own container", () => {
  assert.match(html, /evidence-actions[\s\S]*?flex-wrap/);
  assert.match(html, /flex flex-wrap items-center gap-2 sm:gap-3/);
  assert.match(html, /max-w-full overflow-x-auto/);
  assert.match(html, /min-w-\[840px\]/);
  assert.match(html, /html, body \{ max-width: 100%; overflow-x: clip; \}/);
  assert.match(html, /word-break: normal; overflow-wrap: normal; hyphens: none/);
});

test("top header is sticky at the viewport top", () => {
  assert.match(html, /<header class="sticky top-0/);
});

test("static server serves the app and local crypto helpers, and rejects unknown paths", async (t) => {
  const { createServer } = require("../scripts/serve");
  const server = createServer();
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  t.after(() => new Promise(resolve => server.close(resolve)));
  const address = server.address();
  const origin = `http://127.0.0.1:${address.port}`;
  const home = await fetch(`${origin}/`);
  assert.equal(home.status, 200);
  assert.match(home.headers.get("content-type"), /text\/html/);
  assert.match(await home.text(), /AegisHer/);
  const helper = await fetch(`${origin}/sha256.js`);
  assert.equal(helper.status, 200);
  assert.match(await helper.text(), /crypto\.subtle\.digest/);
  const missing = await fetch(`${origin}/not-a-file`);
  assert.equal(missing.status, 404);
});

test("inline browser script is syntactically valid JavaScript", () => {
  const vm = require("node:vm");
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
  assert.ok(scripts.length > 0);
  for (const script of scripts) new vm.Script(script[1]);
});

test("application writes evidence through the cryptographic ledger and latches critical events", () => {
  assert.match(html, /new AegisEvidenceLedger\.EvidenceLedger\(appState\.evidenceLedger\)/);
  assert.match(html, /await evidenceStore\.append\(/);
  assert.match(html, /criticalIncidentLogged/);
  assert.doesNotMatch(html, /computeFastHexHash/);
});
