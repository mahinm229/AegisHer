(function (root) {
  "use strict";

  async function sha256Hex(value) {
    if (!root.crypto || !root.crypto.subtle || typeof root.TextEncoder !== "function") {
      throw new Error("Web Crypto SHA-256 is unavailable. Serve this app from localhost or HTTPS.");
    }
    const bytes = new root.TextEncoder().encode(String(value));
    const digest = await root.crypto.subtle.digest("SHA-256", bytes);
    return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
  }

  root.sha256Hex = sha256Hex;
  if (typeof module !== "undefined" && module.exports) module.exports = { sha256Hex };
})(globalThis);
