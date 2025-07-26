import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverPath = path.join(__dirname, 'start.cjs');

function launch() {
  const proc = spawn(process.execPath, [serverPath], { stdio: 'inherit' });
  proc.on('exit', (code, signal) => {
    if (signal !== 'SIGINT' && signal !== 'SIGTERM') {
      console.log(`Server terminato con codice ${code || signal}. Riavvio in 3s...`);
      setTimeout(launch, 3000);
    }
  });
}

launch();
