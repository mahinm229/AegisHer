"use strict";
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const allowed = new Set(["index.html", "sha256.js", "evidence-ledger.js", "aegisher_gallery_3x2.png"]);
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".png": "image/png" };

function createServer() {
  return http.createServer((req, res) => {
    let pathname;
    try {
      pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    } catch {
      res.writeHead(400).end("Bad request");
      return;
    }

    const name = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
    if (!allowed.has(name)) {
      res.writeHead(404).end("Not found");
      return;
    }

    const file = path.join(root, name);
    fs.readFile(file, (error, data) => {
      if (error) {
        res.writeHead(error.code === "ENOENT" ? 404 : 500).end("Unable to read file");
        return;
      }
      res.writeHead(200, {
        "Content-Type": types[path.extname(file)] || "application/octet-stream",
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "no-store"
      });
      res.end(data);
    });
  });
}

if (require.main === module) {
  const host = process.env.HOST || "127.0.0.1";
  const port = Number(process.env.PORT || 4173);
  const server = createServer();
  server.listen(port, host, () => {
    const address = server.address();
    console.log(`AegisHer demo: http://${host}:${address.port}`);
  });
}

module.exports = { createServer };
