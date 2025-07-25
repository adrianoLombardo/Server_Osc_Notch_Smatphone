// config-utils.js
// Lettura/scrittura file stile .env

import fs from "fs";
import path from "path";

/**
 * Legge un file chiave=valore stile .env in oggetto.
 * Return {} se file assente.
 */
export function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const txt = fs.readFileSync(filePath, "utf8");
  const out = {};
  for (const line of txt.split(/\r?\n/)) {
    const m = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    const key = m[1].trim();
    let val = m[2];
    // rimuovi eventuali quote
    if ((val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

/**
 * Scrive oggetto {K:V} in formato .env (ordine stabile).
 */
export function saveEnvFile(filePath, obj) {
  const lines = [];
  for (const key of Object.keys(obj)) {
    lines.push(`${key}=${obj[key]}`);
  }
  fs.writeFileSync(filePath, lines.join("\n"), "utf8");
}

/**
 * Applica valori a process.env (non sovrascrive se già presenti,
 * a meno che force=true).
 */
export function applyEnv(obj, force=false) {
  for (const [k,v] of Object.entries(obj)) {
    if (force || !(k in process.env)) {
      process.env[k] = v;
    }
  }
}
