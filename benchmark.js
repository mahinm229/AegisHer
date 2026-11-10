"use strict";
const { performance } = require("node:perf_hooks");
const { sha256Hex } = require("../sha256");

(async () => {
  const input = "AegisHer benchmark payload — demo-only SHA-256";
  const iterations = 5000;
  const start = performance.now();
  let last = "";
  for (let i = 0; i < iterations; i++) last = await sha256Hex(`${input}:${i}`);
  const elapsed = performance.now() - start;
  if (!/^[a-f0-9]{64}$/.test(last)) throw new Error("SHA-256 output format check failed");
  console.log(`SHA-256 benchmark: ${iterations.toLocaleString()} digests in ${elapsed.toFixed(1)} ms (${(iterations / (elapsed / 1000)).toFixed(0)} digests/s)`);
})().catch(error => { console.error(error); process.exitCode = 1; });
