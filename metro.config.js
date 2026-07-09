const path = require('path');
const fs = require('fs');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { AutoCleanFileStore } = require('metro-cache');

const projectRoot = __dirname;
const cacheRoot = path.join(projectRoot, '.metro-cache');

if (!fs.existsSync(cacheRoot)) {
  fs.mkdirSync(cacheRoot, { recursive: true });
}

/**
 * Metro configuration — tuned for Windows EMFILE ("too many open files").
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  cacheStores: [
    new AutoCleanFileStore({
      root: cacheRoot,
      intervalMs: 10 * 60 * 1000,
      cleanupThresholdMs: 3 * 24 * 60 * 60 * 1000,
    }),
  ],
  maxWorkers: 1,
  stickyWorkers: false,
  resolver: {
    blockList: [
      /.*[\\/]android[\\/]app[\\/]build[\\/].*/,
      /.*[\\/]android[\\/]app[\\/]\.cxx[\\/].*/,
      /.*[\\/]android[\\/]build[\\/].*/,
      /.*[\\/]android[\\/]\.gradle[\\/].*/,
      /.*[\\/]android[\\/]\.cxx[\\/].*/,
      /.*[\\/]ios[\\/]build[\\/].*/,
      /.*[\\/]ios[\\/]Pods[\\/].*/,
      /.*[\\/]ios[\\/]DerivedData[\\/].*/,
      /.*[\\/]\.git[\\/].*/,
      /.*[\\/]coverage[\\/].*/,
      /.*[\\/]\.idea[\\/].*/,
      /.*[\\/]\.metro-cache[\\/].*/,
      /.*[\\/]node_modules[\\/]react-native[\\/]sdks[\\/].*/,
      /.*[\\/]node_modules[\\/]@react-native[\\/]gradle-plugin[\\/].*/,
    ],
  },
  transformer: {
    unstable_autoSaveCache: {
      enabled: false,
    },
  },
  watcher: {
    healthCheck: {
      enabled: false,
    },
    watchman: false,
  },
  server: {
    rewriteRequestUrl: url => url,
  },
};

module.exports = mergeConfig(getDefaultConfig(projectRoot), config);
