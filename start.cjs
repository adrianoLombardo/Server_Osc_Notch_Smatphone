#!/usr/bin/env node
// start.cjs – launcher definitivo, senza menu interattivo

const path     = require("path");
const fs       = require("fs");
const minimist = require("minimist");

// 1. cartella base (dove si trova questo file)
const baseDir = __dirname;   // ✅  sostituisce la riga con import.meta.url

// 2. carica config.env esterno se presente
const cfgFile = path.join(baseDir, "config.env");
if (fs.existsSync(cfgFile)) {
  const txt = fs.readFileSync(cfgFile, "utf8");
  txt.split(/\r?\n/).forEach(l => {
    const m = l.match(/^\s*([^#=\s]+)\s*=\s*(.+?)\s*$/);
    if (m) process.env[m[1]] = m[2];
  });
}

// 3. override da CLI
const argv = minimist(process.argv.slice(2));
if (argv["notch-host"])  process.env.NOTCH_HOST  = argv["notch-host"];
if (argv["notch-port"])  process.env.NOTCH_PORT  = String(argv["notch-port"]);
if (argv["http-port"])   process.env.HTTP_PORT   = String(argv["http-port"]);
if (argv["public-host"]) process.env.PUBLIC_HOST = argv["public-host"];
if (argv["max-streams"]) process.env.MAX_STREAMS = String(argv["max-streams"]);

// 4. percorso /public per app.js
process.env.APP_BASEDIR = baseDir;

// 5. avvia il server
import("./app.js").catch(err => {
  console.error("ERRORE avviando app.js:", err);
  process.exit(1);
});
