const http = require("http");
const fs = require("fs");
const path = require("path");

const root = process.cwd();
const port = 5500;

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".webmanifest": "application/manifest+json",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg"
};

function safePathFromUrl(urlPath) {
  const clean = (urlPath || "/").split("?")[0].split("#")[0];
  const relPath = clean === "/" ? "index.html" : clean.replace(/^\/+/, "");
  const resolved = path.resolve(root, relPath);
  if (!resolved.startsWith(path.resolve(root))) {
    return null;
  }
  return resolved;
}

const server = http.createServer((req, res) => {
  const target = safePathFromUrl(req.url);
  if (!target) {
    res.statusCode = 403;
    res.end("forbidden");
    return;
  }

  fs.readFile(target, (err, data) => {
    if (err) {
      res.statusCode = 404;
      res.end("not found");
      return;
    }
    const ext = path.extname(target).toLowerCase();
    res.setHeader("Content-Type", contentTypes[ext] || "application/octet-stream");
    res.end(data);
  });
});

server.listen(port, "127.0.0.1", () => {
  // eslint-disable-next-line no-console
  console.log(`Local app running at http://localhost:${port}`);
});
