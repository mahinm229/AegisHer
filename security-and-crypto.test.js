"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { sha256Hex } = require("../sha256");
const { EvidenceLedger } = require("../evidence-ledger");

test("SHA-256 matches RFC 6234 known-answer vectors", async () => {
  assert.equal(await sha256Hex(""), "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
  assert.equal(await sha256Hex("abc"), "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
  assert.equal(await sha256Hex("hello world"), "b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9");
});

test("ledger entries use 64-character SHA-256 and a verifiable previous-hash chain", async () => {
  const entries = [];
  const ledger = new EvidenceLedger(entries);
  const first = await ledger.append({ timestamp: "2026-11-10 00:00:00 UTC", event: "First", snapshot: "76 BPM", score: 14 });
  const second = await ledger.append({ timestamp: "2026-11-10 00:00:01 UTC", event: "Second", snapshot: "90 BPM", score: 52 });
  assert.match(first.hash, /^[a-f0-9]{64}$/);
  assert.equal(first.previousHash, "GENESIS");
  assert.equal(second.block, first.block + 1);
  assert.equal(second.previousHash, first.hash);
  assert.equal(await ledger.verify(), true);
});

test("ledger serializes concurrent writes and rejects tampering", async () => {
  const entries = [];
  const ledger = new EvidenceLedger(entries);
  const common = { timestamp: "2026-11-10 00:00:00 UTC", snapshot: "76 BPM", score: 14 };
  const [a, b, c] = await Promise.all([
    ledger.append({ ...common, event: "A" }),
    ledger.append({ ...common, event: "B" }),
    ledger.append({ ...common, event: "C" })
  ]);
  assert.deepEqual([a.block, b.block, c.block].sort((x, y) => x - y), [101, 102, 103]);
  assert.equal(await ledger.verify(), true);
  entries[0].snapshot = "tampered";
  assert.equal(await ledger.verify(), false);
});

test("ledger refuses malformed scores and missing event strings", async () => {
  const ledger = new EvidenceLedger([]);
  await assert.rejects(ledger.append({ timestamp: "t", event: "e", snapshot: "s", score: 101 }), /score/);
  await assert.rejects(ledger.append({ timestamp: "t", event: "", snapshot: "s", score: 12 }), /event/);
});


test("bundled starter ledger fixture is a valid SHA-256 chain", async () => {
  const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
  const match = html.match(/evidenceLedger: (\[[\s\S]*?\]),\n      telemetryHistory:/);
  assert.ok(match, "seed ledger literal exists");
  const seedEntries = vm.runInNewContext(`(${match[1]})`);
  const ledger = new EvidenceLedger(seedEntries);
  assert.equal(await ledger.verify(), true);
});
