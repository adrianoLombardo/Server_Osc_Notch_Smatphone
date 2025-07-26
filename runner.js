import { spawn } from 'child_process';
import path from 'path';

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
