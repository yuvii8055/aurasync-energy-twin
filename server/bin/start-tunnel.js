import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cloudflaredExe = path.join(__dirname, 'cloudflared.exe');
const targetPort = process.env.PORT || 5000;
const rootDir = path.resolve(__dirname, '..', '..');
const serverDir = path.resolve(__dirname, '..');

console.log(`\n🌐 Launching Cloudflare Live Internet Tunnel for Port ${targetPort}...`);
console.log(`📁 Binary: ${cloudflaredExe}`);

if (!fs.existsSync(cloudflaredExe)) {
  console.error(`❌ cloudflared.exe not found at ${cloudflaredExe}`);
  process.exit(1);
}

const child = spawn(cloudflaredExe, ['tunnel', '--url', `http://localhost:${targetPort}`], {
  stdio: ['ignore', 'pipe', 'pipe']
});

let tunnelFound = false;

function processLine(line) {
  process.stdout.write(line + '\n');

  // Match: https://[random].trycloudflare.com
  const match = line.match(/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/);
  if (match && !tunnelFound) {
    tunnelFound = true;
    const tunnelUrl = match[0];

    // Save to .tunnel_url files
    fs.writeFileSync(path.join(rootDir, '.tunnel_url'), tunnelUrl, 'utf8');
    fs.writeFileSync(path.join(serverDir, '.tunnel_url'), tunnelUrl, 'utf8');

    console.log(`
========================================================================
🎉 AURASYNC ENERGY TWIN IS LIVE OVER THE INTERNET!
========================================================================
🌍 Public Live URL:      ${tunnelUrl}
📱 Mobile Phone Link:    ${tunnelUrl}/pair
📷 Phone Camera CV:      ${tunnelUrl}/camera/live-stream
💻 Local Desktop:        http://localhost:${targetPort}

🔒 Cloudflare Trusted SSL: Active (Zero SSL warnings on any phone/browser)
📡 Edge AI Socket.IO:    Active over WebSocket
========================================================================
`);
  }
}

child.stdout.on('data', (data) => {
  const lines = data.toString().split(/\r?\n/);
  for (const line of lines) {
    if (line.trim()) processLine(line.trim());
  }
});

child.stderr.on('data', (data) => {
  const lines = data.toString().split(/\r?\n/);
  for (const line of lines) {
    if (line.trim()) processLine(line.trim());
  }
});

child.on('close', (code) => {
  console.log(`Cloudflare tunnel exited with code ${code}`);
});

child.on('error', (err) => {
  console.error(`Failed to start cloudflared:`, err);
});
