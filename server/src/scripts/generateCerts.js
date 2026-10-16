import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { getLanIPv4Addresses } from '../routes/networkRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const certsDir = path.join(__dirname, '..', '..', 'certs');

if (!fs.existsSync(certsDir)) {
  fs.mkdirSync(certsDir, { recursive: true });
}

const keyPath = path.join(certsDir, 'key.pem');
const certPath = path.join(certsDir, 'cert.pem');

const lanIps = getLanIPv4Addresses().map(i => i.ip);
const ipList = ['localhost', '127.0.0.1', ...lanIps].join(' ');

console.log(`
========================================================================
🔐 AuraSync HTTPS Certificate Setup (mkcert)
========================================================================
`);

let mkcertInstalled = false;
try {
  execSync('mkcert -version', { stdio: 'ignore' });
  mkcertInstalled = true;
} catch {}

if (mkcertInstalled) {
  try {
    console.log('⚡ Found mkcert! Installing local Root CA on this machine...');
    execSync('mkcert -install', { stdio: 'inherit' });

    console.log(`⚡ Generating trusted TLS certificate for: ${ipList}...`);
    execSync(`mkcert -key-file "${keyPath}" -cert-file "${certPath}" ${ipList}`, { stdio: 'inherit' });

    console.log(`
✅ Certificate and Key successfully generated in:
   Key:  ${keyPath}
   Cert: ${certPath}

📱 TO TRUST CERTIFICATE ON YOUR SMARTPHONE (Zero Warnings):
1. Find your mkcert Root CA path by running: mkcert -CAROOT
2. Transfer 'rootCA.pem' to your phone (via AirDrop, email, or WhatsApp to yourself).
3. On iOS:
   - Tap rootCA.pem -> Download Profile -> Go to Settings -> Profile Downloaded -> Install.
   - Go to Settings -> General -> About -> Certificate Trust Settings -> Enable Full Trust for mkcert Root CA.
4. On Android:
   - Go to Settings -> Security -> Encryption & Credentials -> Install a Certificate -> CA Certificate -> Select rootCA.pem.
`);
  } catch (err) {
    console.error('Error running mkcert:', err.message);
  }
} else {
  console.log(`
ℹ️  mkcert is not installed globally.
For zero-warning trusted HTTPS on your phone, install mkcert:
  - Windows (via Chocolatey): choco install mkcert
  - Windows (via Scoop):      scoop bucket add extras; scoop install mkcert
  - macOS:                    brew install mkcert
  - Linux:                    sudo apt install libnss3-tools; brew install mkcert

💡 Alternatively, you do not need mkcert if using:
  1. Vite with basic-ssl plugin (already enabled for https://localhost:5173)
  2. Cloudflare Tunnel (npm run tunnel:cf)
  3. ngrok Tunnel (npm run tunnel:ngrok)
`);
}
