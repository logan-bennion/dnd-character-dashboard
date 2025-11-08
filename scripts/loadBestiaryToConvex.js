// Script to load bestiary JSON data into Convex via HTTP endpoint
// Run this with: node scripts/loadBestiaryToConvex.js
// Make sure to set your CONVEX_URL environment variable

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Read the JSON files
const bestiaryMmPath = path.join(__dirname, '../src/dnd5eReferences/dndBestiaryJsons/bestiary-mm.json');
const bestiaryToaPath = path.join(__dirname, '../src/dnd5eReferences/dndBestiaryJsons/bestiary-toa.json');

console.log('Reading bestiary JSON files...');

const bestiaryMm = JSON.parse(fs.readFileSync(bestiaryMmPath, 'utf8'));
const bestiaryToa = JSON.parse(fs.readFileSync(bestiaryToaPath, 'utf8'));

const allMonsters = [
  ...(bestiaryMm?.monster || []),
  ...(bestiaryToa?.monster || []),
];

console.log(`Found ${allMonsters.length} monsters total`);

// Get Convex URL from environment or use default
const CONVEX_URL = process.env.CONVEX_URL || process.env.VITE_CONVEX_URL;
if (!CONVEX_URL) {
  console.error('Error: CONVEX_URL environment variable not set');
  console.log('Set it with: export CONVEX_URL=https://your-deployment.convex.cloud');
  process.exit(1);
}

// Load monsters in batches to avoid timeout
const BATCH_SIZE = 100;
const batches = [];
for (let i = 0; i < allMonsters.length; i += BATCH_SIZE) {
  batches.push(allMonsters.slice(i, i + BATCH_SIZE));
}

console.log(`Loading ${batches.length} batches of monsters...`);

async function loadBatch(batch, batchNum) {
  return new Promise((resolve, reject) => {
    const url = new URL('/loadBestiary', CONVEX_URL);
    const data = JSON.stringify({ monsters: batch });
    
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
    };
    
    const client = url.protocol === 'https:' ? https : http;
    const req = client.request(url, options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          const result = JSON.parse(body);
          console.log(`Batch ${batchNum + 1}/${batches.length}: Loaded ${result.loaded}/${result.total} monsters`);
          resolve(result);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${body}`));
        }
      });
    });
    
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function loadAll() {
  let totalLoaded = 0;
  for (let i = 0; i < batches.length; i++) {
    try {
      const result = await loadBatch(batches[i], i);
      totalLoaded += result.loaded;
      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`Error loading batch ${i + 1}:`, error);
    }
  }
  console.log(`\nTotal loaded: ${totalLoaded} monsters`);
}

loadAll().catch(console.error);

