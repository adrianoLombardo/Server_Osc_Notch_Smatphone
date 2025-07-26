// app.js – Pensieri → Notch 2025-07 con filtro e round-robin slot
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import http from "http";
import ip from "ip";
import fs from "fs";
import QRCode from "qrcode";
import OSC from "osc-js";
import dotenv from "dotenv";
import leoProfanity from "leo-profanity";

/* ─── Filtro parolacce ─── */
leoProfanity.loadDictionary("it");
leoProfanity.add([
  "dio","porcodio","porco dio","porcoddio","dio cane","dio merda","dio in croce",
  "madonna","porca madonna","porcamadonna","madonna puttana","madonna bastarda",
  "cristo","gesù","gesu","cazzo","c4zzo","caxx0","kazz0","kazzo","cazzone","cazzoni",
  "merda","merd@","m3rda","merdaccia","stronzo","str0nzo","stronzi","stronza",
  "troia","troja","tr0ia","troie","troiette","puttana","putt4na","putt@na","puttane",
  "puttanaccia","puttanella","puttanone","vaffanculo","vafanculo","vaffa","v4ffanculo",
  "porco","porca","porco cane","porco zio","porca puttana","porca troia",
  "mado","maddonna","makke*d*a","bastardo","bastarda","bastardi","b4stardo",
  "figlio di puttana","figlio di troia","figlia di puttana","culo","coglione","coglioni",
  "coglionazzo","testa di cazzo","testadicazzo",
  // spaziati
  "p u t t a n a","t r o i a","c a z z o","m e r d a","v a f f a n c u l o",
  "p u t t a n a m a d o n n a","d i o b a s t a r d o","m a d o n n a t o r o i a"
]);

/* ─── Config di base ─── */
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
if (!process.pkg) dotenv.config();
const STATE_FILE = path.join(__dirname, "state.json");

const HTTP_PORT   = parseInt(process.env.HTTP_PORT  ?? "3001", 10);
const NOTCH_HOST  = process.env.NOTCH_HOST           ?? "127.0.0.1";
const NOTCH_PORT  = parseInt(process.env.NOTCH_PORT  ?? "8000", 10);
const MAX_STREAMS = parseInt(process.env.MAX_STREAMS ?? "50", 10);

const MAX_QUEUE = parseInt(process.env.MAX_QUEUE ?? "100", 10);
const MAX_TEXT_LENGTH = parseInt(process.env.MAX_TEXT_LENGTH ?? "120", 10);
console.log("DEBUG HOST/PORT:", { NOTCH_HOST, NOTCH_PORT, HTTP_PORT, MAX_STREAMS });

/* ─── Express & static ─── */
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

/* ─── OSC client + coda 60Hz ─── */
const osc = new OSC({
  plugin: new OSC.DatagramPlugin({ send: { host: NOTCH_HOST, port: NOTCH_PORT }, open: { port: 0 } })
});
osc.open();
const queue = [];
setInterval(() => {
  const p = queue.shift();
  if (p) sendOsc(p.id, p.txt);
}, 16);
function sendOsc(id, txt) {
  console.log(`OSC → /thought/${id} : "${txt}"`);
  osc.send(new OSC.Message(`/thought/${id}`, txt));
  osc.send(new OSC.Message(`/thought/${id}/active`, 1));
  setTimeout(() => osc.send(new OSC.Message(`/thought/${id}/active`, 0)), 50);
}

/* ─── Round-robin slot ─── */
let nextId = 1;
try {
  const st = JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
  if (st.nextId) nextId = st.nextId;
} catch {}
function allocateSlot() {
  const id = nextId;
  nextId = nextId % MAX_STREAMS + 1;
  return id;
}

/* ─── API Pensiero ─── */
app.post("/api/thought", (req, res) => {
  const text = (req.body.text || "").toString().trim();
  if (!text) return res.status(400).json({ error: "Testo mancante" });
  if (leoProfanity.check(text)) return res.status(400).json({ error: "Contenuto offensivo" });

  if (text.length > MAX_TEXT_LENGTH) return res.status(400).json({ error: "Testo troppo lungo" });
  if (queue.length >= MAX_QUEUE) return res.status(503).json({ error: "Coda piena, riprova" });
  const id = allocateSlot();
  queue.push({ id, txt: text });
  return res.sendStatus(204);
});

/* ─── QR dinamico ─── */
app.get("/qr", async (_req, res) => {
  try {
    const host = process.env.PUBLIC_HOST || ip.address();
    const url  = `http://${host}:${HTTP_PORT}/`;
    const svg  = await QRCode.toString(url, { type: "svg", margin: 2 });
    res.type("image/svg+xml").send(svg);
  } catch (err) {
    console.error("Errore QR:", err);
    res.status(500).send("Errore QR");
  }
});

/* ─── Avvio server HTTP ─── */
http.createServer(app).listen(HTTP_PORT, () => {
  const hostIp = ip.address();
  const qrHost = process.env.PUBLIC_HOST || hostIp;
  console.log("========================================");
  console.log(" Pensieri → Notch OSC Server Avviato");
  console.log("========================================");
  console.log(`HTTP per smartphone:  http://${hostIp}:${HTTP_PORT}/`);
  console.log(`QR disponibile:       http://${qrHost}:${HTTP_PORT}/qr`);
  console.log(`OSC verso Notch:      udp://${NOTCH_HOST}:${NOTCH_PORT}`);
  console.log(`Slot (round-robin):   1..${MAX_STREAMS}`);
  console.log("----------------------------------------");
});
function saveState() {
  try { fs.writeFileSync(STATE_FILE, JSON.stringify({ nextId }), "utf8"); } catch (e) { console.error("Errore salvataggio stato:", e); }
}
process.on("SIGINT", () => { saveState(); process.exit(); });
process.on("SIGTERM", () => { saveState(); process.exit(); });
process.on("uncaughtException", err => { console.error("Uncaught:", err); saveState(); process.exit(1); });
process.on("unhandledRejection", err => { console.error("Unhandled rejection:", err); });
