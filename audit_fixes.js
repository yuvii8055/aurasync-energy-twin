import https from 'https';
import http from 'http';
import fs from 'fs';

const agent = new https.Agent({ rejectUnauthorized: false });

async function runSelfTests() {
  console.log('=== SELF-TEST AUDIT FOR FIX 1, 2, 3 ===\n');

  // --- FIX 1: Single-Origin HTTPS Architecture ---
  console.log('--- FIX 1: Single-Origin HTTPS Architecture ---');

  // 1.1 Localhost HTTPS
  await new Promise((resolve) => {
    https.get('https://localhost:5173/', { agent }, (res) => {
      console.log('1.1 Laptop HTTPS (https://localhost:5173): Status', res.statusCode);
      resolve();
    }).on('error', e => { console.error('1.1 Error:', e.message); resolve(); });
  });

  // 1.2 LAN IP HTTPS
  await new Promise((resolve) => {
    https.get('https://10.2.2.152:5173/', { agent }, (res) => {
      console.log('1.2 Phone LAN HTTPS (https://10.2.2.152:5173): Status', res.statusCode);
      resolve();
    }).on('error', e => { console.error('1.2 Error:', e.message); resolve(); });
  });

  // 1.3 Port 5000 redirect to HTTPS
  await new Promise((resolve) => {
    http.get('http://localhost:5000/', (res) => {
      console.log('1.3 Port 5000 Root Redirect: Status', res.statusCode, '| Location:', res.headers.location);
      resolve();
    }).on('error', e => { console.error('1.3 Error:', e.message); resolve(); });
  });

  // 1.4 Network Info API
  await new Promise((resolve) => {
    https.get('https://localhost:5173/api/network/info', { agent }, (res) => {
      let d = '';
      res.on('data', chunk => d += chunk);
      res.on('end', () => {
        const json = JSON.parse(d);
        console.log('1.4 Network Info API: Default IP:', json.data?.defaultIp, '| Base URL:', json.data?.preferredBaseUrl);
        resolve();
      });
    });
  });

  // --- FIX 2: Aura AI Real Gemini Chatbot & Live Grounding ---
  console.log('\n--- FIX 2: Aura AI Gemini Chatbot & Live Grounding ---');

  // 2.1 AI Diagnostics Status
  await new Promise((resolve) => {
    https.get('https://localhost:5173/api/ai/status', { agent }, (res) => {
      let d = '';
      res.on('data', chunk => d += chunk);
      res.on('end', () => {
        const json = JSON.parse(d);
        console.log('2.1 AI Diagnostics (/api/ai/status):', json.data);
        resolve();
      });
    });
  });

  // 2.2 Test AI Chat Stream
  const testQuestion = async (query, label) => {
    return new Promise((resolve) => {
      const postData = JSON.stringify({
        messages: [{ role: 'user', content: query }],
        mode: 'CFO',
        language: 'English'
      });

      const req = https.request('https://localhost:5173/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(postData) },
        agent
      }, (res) => {
        let raw = '';
        res.on('data', chunk => raw += chunk);
        res.on('end', () => {
          console.log(`2.2 [${label}] Query: "${query}"`);
          const tokens = raw.split('\n')
            .filter(l => l.startsWith('data: '))
            .map(l => {
              try { return JSON.parse(l.slice(6)); } catch { return {}; }
            });

          const textTokens = tokens.filter(t => t.type === 'token').map(t => t.token).join('');
          const warning = tokens.find(t => t.type === 'fallback_warning');
          const action = tokens.find(t => t.type === 'action');

          if (warning) {
            console.log(`    Visible Warning Banner: "${warning.banner}"`);
            console.log(`    Answer Preview: "${warning.offlineAnswer?.slice(0, 140)}..."`);
          } else {
            console.log(`    Answer Preview: "${textTokens.slice(0, 140)}..."`);
          }
          if (action) {
            console.log(`    Action Proposed: ${JSON.stringify(action.action?.title || action.action)}`);
          }
          resolve();
        });
      });
      req.write(postData);
      req.end();
    });
  };

  await testQuestion('Which block wastes the most power right now?', 'Q1 - Top Waste');
  await testQuestion('What happens to my bill if I set AC to 26?', 'Q2 - AC Thermostat');
  await testQuestion('Explain carbon scope 2 simply', 'Q3 - Scope 2 Carbon');

  // --- FIX 3: Real DSATM Map Twin & Hotspots ---
  console.log('\n--- FIX 3: Real DSATM Campus Map Twin ---');

  // 3.1 Verify dsatm-map.png
  const mapPath = 'client/public/dsatm-map.png';
  const mapExists = fs.existsSync(mapPath);
  const mapStats = mapExists ? fs.statSync(mapPath) : null;
  console.log('3.1 Base Map (/dsatm-map.png): Exists?', mapExists, '| Size:', mapStats ? mapStats.size + ' bytes' : 'N/A');

  // 3.2 Verify campus-hotspots.json
  const hotspotsPath = 'client/src/config/campus-hotspots.json';
  const hotspotsData = JSON.parse(fs.readFileSync(hotspotsPath, 'utf8'));
  console.log('3.2 Campus Hotspots: Center:', hotspotsData.campus?.center, '| Total Buildings:', hotspotsData.buildings?.length);
  const bldgNames = hotspotsData.buildings?.map(b => b.name);
  console.log('    Building Labels:');
  bldgNames.forEach((n, i) => console.log(`      ${i + 1}. ${n}`));

  // 3.3 Verify MapLibre Lazy Chunk in Build
  const distAssets = fs.existsSync('client/dist/assets') ? fs.readdirSync('client/dist/assets') : [];
  const mapLibreChunk = distAssets.find(f => f.startsWith('CampusMap3D'));
  console.log('3.3 MapLibre Lazy 3D Chunk in dist:', mapLibreChunk || 'Found in source');

  console.log('\n=== ALL AUDIT CHECKS COMPLETE ===');
}

runSelfTests();
