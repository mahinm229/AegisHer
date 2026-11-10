(function (root) {
  "use strict";

  const GENESIS_HASH = "GENESIS";

  function canonicalPayload(entry) {
    return JSON.stringify({
      block: entry.block,
      timestamp: entry.timestamp,
      event: entry.event,
      snapshot: entry.snapshot,
      score: entry.score,
      previousHash: entry.previousHash
    });
  }

  class EvidenceLedger {
    constructor(entries = []) {
      if (!Array.isArray(entries)) throw new TypeError("entries must be an array");
      this.entries = entries;
      this.writeQueue = Promise.resolve();
    }

    append(input) {
      const operation = this.writeQueue.then(async () => {
        if (!input || typeof input !== "object") throw new TypeError("entry data is required");
        for (const key of ["timestamp", "event", "snapshot"]) {
          if (typeof input[key] !== "string" || input[key].length === 0) {
            throw new TypeError(`${key} must be a non-empty string`);
          }
        }
        const score = Number(input.score);
        if (!Number.isFinite(score) || score < 0 || score > 100) {
          throw new RangeError("score must be between 0 and 100");
        }
        const latest = this.entries[0];
        const payload = {
          block: latest ? Number(latest.block) + 1 : 101,
          timestamp: input.timestamp,
          event: input.event,
          snapshot: input.snapshot,
          score,
          previousHash: latest ? latest.hash : GENESIS_HASH
        };
        if (!Number.isSafeInteger(payload.block) || payload.block < 1) {
          throw new Error("latest ledger block number is invalid");
        }
        const hash = await root.sha256Hex(canonicalPayload(payload));
        const entry = { ...payload, hash };
        this.entries.unshift(entry);
        return entry;
      });
      this.writeQueue = operation.then(() => undefined, () => undefined);
      return operation;
    }

    async verify() {
      await this.writeQueue;
      const chronological = [...this.entries].sort((a, b) => Number(a.block) - Number(b.block));
      let expectedPreviousHash = GENESIS_HASH;
      let previousBlock = 0;
      for (const entry of chronological) {
        if (!Number.isSafeInteger(Number(entry.block)) || Number(entry.block) <= previousBlock) return false;
        if (entry.previousHash !== expectedPreviousHash) return false;
        const expectedHash = await root.sha256Hex(canonicalPayload(entry));
        if (entry.hash !== expectedHash) return false;
        expectedPreviousHash = entry.hash;
        previousBlock = Number(entry.block);
      }
      return true;
    }
  }

  const api = { EvidenceLedger, GENESIS_HASH, canonicalPayload };
  root.AegisEvidenceLedger = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(globalThis);
