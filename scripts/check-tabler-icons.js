const fs = require('fs');
const path = require('path');

const src = fs.readFileSync('src/components/TablerIcon.tsx', 'utf8');
const re = /@tabler\/icons-react-native\/(Icon[A-Za-z0-9]+)/g;
const icons = [];
let m;
while ((m = re.exec(src))) icons.push(m[1]);
const uniq = [...new Set(icons)];
const base = 'node_modules/@tabler/icons-react-native/dist/cjs/icons';
const missing = uniq.filter(i => !fs.existsSync(path.join(base, `${i}.cjs`)));
const hasBarrel =
  /from ['"]@tabler\/icons-react-native['"]/.test(src);
const flameLine = src
  .split('\n')
  .find(l => l.includes('IconFlame'));
const flameMap = src
  .split('\n')
  .find(l => l.includes('flame:'));

console.log(
  JSON.stringify(
    {
      count: uniq.length,
      missing,
      hasBarrel,
      flameLine,
      flameMap,
      questIcons: uniq.filter(i =>
        /Flame|Volume|Leaf|HeartHandshake/.test(i),
      ),
    },
    null,
    2,
  ),
);
