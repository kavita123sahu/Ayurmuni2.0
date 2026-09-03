const path = require('path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const exclusionList = require('metro-config/private/defaults/exclusionList').default;
const fs = require('fs');

try {
  const gracefulFs = require('graceful-fs');
  gracefulFs.gracefulify(fs);
} catch (_) {}

/**
 * Keep Metro allowlist in sync with TablerIcon.tsx direct imports.
 * Never import from the package barrel (`@tabler/icons-react-native`) —
 * that pulls thousands of files and breaks on Windows (EMFILE).
 */
const tablerIconSource = fs.readFileSync(
  path.join(__dirname, 'src/components/TablerIcon.tsx'),
  'utf8',
);

const USED_TABLER_ICONS = [
  ...new Set(
    [
      ...tablerIconSource.matchAll(
        /@tabler\/icons-react-native\/(Icon[A-Za-z0-9]+)/g,
      ),
    ].map(match => match[1]),
  ),
];

if (USED_TABLER_ICONS.length === 0) {
  throw new Error(
    'metro.config.js: no Tabler icon imports found in TablerIcon.tsx',
  );
}

const unusedTablerIcons = new RegExp(
  `node_modules[/\\\\]@tabler[/\\\\]icons-react-native[/\\\\]dist[/\\\\](?:esm[/\\\\]icons|cjs[/\\\\]icons)[/\\\\](?!(${USED_TABLER_ICONS.join(
    '|',
  )})\\.(?:mjs|cjs)$).+\\.(?:mjs|cjs)$`,
);

const pdfLibDist = path.resolve(
  __dirname,
  'node_modules/pdf-lib/dist/pdf-lib.js',
);

/** @type {import('metro-config').MetroConfig} */
const config = {
  maxWorkers: 1,
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
  resolver: {
    blockList: exclusionList([
      unusedTablerIcons,
      /node_modules[/\\]@tabler[/\\]icons-react-native[/\\]dist[/\\](?:esm|cjs)[/\\]tabler-icons-react-native\.(?:mjs|cjs)$/,
      /node_modules[/\\]pdf-lib[/\\](?:cjs|es|src)[/\\].*/,
    ]),
    resolveRequest: (context, moduleName, platform) => {
      if (
        moduleName === 'pdf-lib' ||
        moduleName.startsWith('pdf-lib/')
      ) {
        return {
          type: 'sourceFile',
          filePath: pdfLibDist,
        };
      }
      return context.resolveRequest(context, moduleName, platform);
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
