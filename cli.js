#!/usr/bin/env node
import readline from 'readline';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadEnvFile, saveEnvFile } from './config-utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envFile = path.join(__dirname, 'config.env');

let config = {
  NOTCH_HOST: '127.0.0.1',
  NOTCH_PORT: '8000',
  HTTP_PORT: '3001',
  MAX_STREAMS: '50',
  ...loadEnvFile(envFile)
};

let server = null;

function startServer() {
  if (server) {
    console.log('Server gia\' in esecuzione');
    return;
  }
  saveEnvFile(envFile, config);
  server = spawn(process.execPath, ['start.cjs'], { stdio: 'inherit' });
  server.on('exit', () => {
    server = null;
    console.log('Server terminato');
  });
}

function stopServer() {
  if (server) {
    server.kill();
    server = null;
  } else {
    console.log('Server non in esecuzione');
  }
}

function showMenu() {
  console.log('\n==== Notch OSC Server CLI ====');
  console.log('[1] Avvia server');
  console.log('[2] Ferma server');
  console.log(`[3] Imposta IP Notch (attuale: ${config.NOTCH_HOST})`);
  console.log(`[4] Imposta porta Notch (attuale: ${config.NOTCH_PORT})`);
  console.log('[5] Esci');
  rl.prompt();
}

const rl = readline.createInterface({ input: process.stdin, output: process.stdout, prompt: '> ' });

rl.on('line', line => {
  const cmd = line.trim();
  switch (cmd) {
    case '1':
      startServer();
      showMenu();
      break;
    case '2':
      stopServer();
      showMenu();
      break;
    case '3':
      rl.question('Nuovo IP: ', ip => {
        if (ip) config.NOTCH_HOST = ip.trim();
        showMenu();
      });
      break;
    case '4':
      rl.question('Nuova porta: ', port => {
        if (port) config.NOTCH_PORT = port.trim();
        showMenu();
      });
      break;
    case '5':
      stopServer();
      rl.close();
      break;
    default:
      console.log('Comando non valido');
      showMenu();
  }
});

rl.on('close', () => process.exit(0));

showMenu();
