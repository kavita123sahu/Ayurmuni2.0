const fs = require('fs');
const path = require('path');
const os = require('os');

const projectRoot = path.join(__dirname, '..');
const targets = [
  path.join(projectRoot, '.metro-cache'),
  path.join(os.tmpdir(), '.metro-cache', 'AyurmuniApp'),
  path.join(os.tmpdir(), 'metro-cache'),
  path.join(os.tmpdir(), 'react-native-packager-cache'),
];

function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function removeDir(dirPath, retries = 3) {
  if (!fs.existsSync(dirPath)) {
    return false;
  }

  for (let attempt = 0; attempt < retries; attempt += 1) {
    try {
      fs.rmSync(dirPath, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
      return true;
    } catch (error) {
      if (attempt === retries - 1) {
        console.warn(`Could not fully remove ${dirPath}: ${error.message}`);
        return false;
      }
      sleep(300);
    }
  }

  return false;
}

let removed = 0;

for (const target of targets) {
  if (removeDir(target)) {
    removed += 1;
    console.log(`Removed: ${target}`);
  }
}

console.log(
  removed > 0
    ? `Metro cache cleared (${removed} location${removed === 1 ? '' : 's'}).`
    : 'Metro cache already clean.',
);
