import fs from 'fs';

const [manifestPath, updateType] = process.argv.slice(2);
const manifestData = fs.readFileSync(manifestPath);
const manifest = JSON.parse(manifestData);

let [major, minor, patch] = manifest.version.split('.').map(Number);

if (updateType === 'major') {
  major++;
} else if (updateType === 'minor') {
  minor++;
} else if (updateType === '-major') {
  major--;
} else if (updateType === '-minor') {
  minor--;
} else if (updateType === '-patch') {
  patch--;
} else {
  patch++;
}

manifest.version = `${major}.${minor}.${patch}`;

console.log('Current version:', manifest.version);

fs.writeFileSync(manifestPath, JSON.stringify(manifest));
