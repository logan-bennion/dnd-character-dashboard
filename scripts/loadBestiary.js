// Script to load bestiary JSON data into Convex
// Run this with: node scripts/loadBestiary.js

const fs = require('fs');
const path = require('path');

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

// Now you need to call the Convex mutation to load this data
// You can do this via:
// 1. Convex Dashboard -> Functions -> bestiaryReference:loadMonsters -> Run with { monsters: [...] }
// 2. Or use the Convex CLI: npx convex run bestiaryReference:loadMonsters --args '{"monsters": [...]}'
// 3. Or create an HTTP endpoint to load it

console.log('\nTo load this data into Convex:');
console.log('1. Go to your Convex Dashboard');
console.log('2. Navigate to Functions -> bestiaryReference:loadMonsters');
console.log('3. Run it with the monsters array');
console.log(`\nOr use the Convex CLI with the data in a file`);

// Save to a file that can be imported
const outputPath = path.join(__dirname, '../bestiary-data.json');
fs.writeFileSync(outputPath, JSON.stringify({ monsters: allMonsters }, null, 2));
console.log(`\nMonster data saved to: ${outputPath}`);
console.log(`You can now load this into Convex using the Convex Dashboard or CLI`);

