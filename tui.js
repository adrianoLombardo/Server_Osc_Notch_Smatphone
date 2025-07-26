#!/usr/bin/env node
import blessed from 'blessed';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';
import { loadEnvFile, saveEnvFile } from './config-utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, 'config.env');

let config = {
  NOTCH_HOST: '127.0.0.1',
  NOTCH_PORT: '8000',
  HTTP_PORT: '3001',
  MAX_STREAMS: '50',
  ...loadEnvFile(envPath)
};

let server = null;
let screen, hostInput, portInput, logBox, startBtn, stopBtn;

function log(message) {
  logBox.log(message.toString());
  screen.render();
}

function startServer() {
  if (server) {
    log('Server gia\' in esecuzione');
    return;
  }
  config.NOTCH_HOST = hostInput.getValue();
  config.NOTCH_PORT = portInput.getValue();
  saveEnvFile(envPath, config);
  server = spawn(process.execPath, ['start.cjs'], { cwd: __dirname });
  server.stdout.on('data', d => log(d.toString().trim()));
  server.stderr.on('data', d => log(d.toString().trim()));
  server.on('exit', (code, signal) => {
    log(`Server terminato: ${code ?? signal}`);
    server = null;
  });
  log('Server avviato');
}

function stopServer() {
  if (!server) {
    log('Server non in esecuzione');
    return;
  }
  server.kill();
  server = null;
  log('Server fermato');
}

function buildUI() {
  screen = blessed.screen({ smartCSR: true, title: 'Notch OSC Server' });
  screen.key(['q', 'C-c'], () => { stopServer(); process.exit(0); });

  const form = blessed.form({ parent: screen, top: 0, left: 0, width: '100%', height: 4 });

  blessed.text({ parent: form, top: 0, left: 1, content: 'Host:' });
  hostInput = blessed.textbox({ parent: form, top: 0, left: 7, width: 18, height: 1, inputOnFocus: true, value: config.NOTCH_HOST });

  blessed.text({ parent: form, top: 0, left: 28, content: 'Porta:' });
  portInput = blessed.textbox({ parent: form, top: 0, left: 35, width: 8, height: 1, inputOnFocus: true, value: config.NOTCH_PORT });

  startBtn = blessed.button({ parent: form, top: 2, left: 1, content: '[ Avvia ]', shrink: true, mouse: true });
  stopBtn = blessed.button({ parent: form, top: 2, left: 12, content: '[ Ferma ]', shrink: true, mouse: true });

  startBtn.on('press', () => startServer());
  stopBtn.on('press', () => stopServer());

  logBox = blessed.log({ parent: screen, top: 5, left: 0, width: '100%', height: '100%-5', border: 'line', scrollbar: { ch: ' ', track: { bg: 'grey' }, style: { inverse: true } } });

  screen.render();
}

buildUI();
