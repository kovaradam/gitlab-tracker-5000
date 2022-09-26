import fs from 'fs';

const [baseManifestPath, extensionManifestPath] = process.argv.slice(2);

const baseManifestData = fs.readFileSync(baseManifestPath);
const baseManifest = JSON.parse(baseManifestData);

const extensionManifestData = fs.readFileSync(extensionManifestPath);
const extensionManifest = JSON.parse(extensionManifestData);

const mergedManifest = { ...baseManifest, ...extensionManifest };

console.log(JSON.stringify(mergedManifest));
