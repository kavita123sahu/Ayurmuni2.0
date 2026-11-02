/**
 * After npm install, re-apply local PayPhi SDK overrides:
 * - secretKey is backend-only (not required in the app)
 * - book-slot data.icici is passed through; optional secureToken from API
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const targetRoot = path.join(root, 'node_modules', 'react-native-payphi-sdk');
const overrideRoot = path.join(root, 'vendor', 'payphi-sdk-overrides');

const copies = [
  ['index.js', 'index.js'],
  [
    path.join('android', 'src', 'main', 'java', 'com', 'payphi', 'reactnative', 'sdk', 'PayphiModule.kt'),
    path.join('android', 'src', 'main', 'java', 'com', 'payphi', 'reactnative', 'sdk', 'PayphiModule.kt'),
  ],
  [
    path.join('android', 'src', 'main', 'java', 'com', 'payphi', 'reactnative', 'sdk', 'PayphiPackage.kt'),
    path.join('android', 'src', 'main', 'java', 'com', 'payphi', 'reactnative', 'sdk', 'PayphiPackage.kt'),
  ],
  [path.join('android', 'build.gradle'), path.join('android', 'build.gradle')],
];

if (!fs.existsSync(targetRoot)) {
  console.log('[payphi-overrides] react-native-payphi-sdk not installed — skip');
  process.exit(0);
}

for (const [fromRel, toRel] of copies) {
  const from = path.join(overrideRoot, fromRel);
  const to = path.join(targetRoot, toRel);
  if (!fs.existsSync(from)) {
    console.warn('[payphi-overrides] missing', from);
    continue;
  }
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(from, to);
  console.log('[payphi-overrides] applied', toRel);
}
