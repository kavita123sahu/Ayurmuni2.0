const path = require('path');
const fs = require('fs');
const os = require('os');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { FileStore } = require('metro-cache');

const projectRoot = __dirname;
const cacheRoot = path.join(projectRoot, '.metro-cache');

if (!fs.existsSync(cacheRoot)) {
  fs.mkdirSync(cacheRoot, { recursive: true });
}

/** @type {import('@react-native/metro-config').MetroConfig} */
const config = {
  cacheStores: [
    new FileStore({
      root: cacheRoot,
    }),
  ],
  maxWorkers: 1,
  stickyWorkers: false,
  resetCache: false,
  resolver: {
    blockList: [
      /.*[\\/]android[\\/]app[\\/]build[\\/].*/,
      /.*[\\/]android[\\/]app[\\/]\.cxx[\\/].*/,
      /.*[\\/]android[\\/]build[\\/].*/,
      /.*[\\/]android[\\/]\.gradle[\\/].*/,
      /.*[\\/]android[\\/]\.cxx[\\/].*/,
      /.*[\\/]ios[\\/]build[\\/].*/,
      /.*[\\/]ios[\\/]Pods[\\/].*/,
      /.*[\\/]\.git[\\/].*/,
      /.*[\\/]\.metro-cache[\\/].*/,
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
};

module.exports = mergeConfig(getDefaultConfig(projectRoot), config);
