// const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

// const defaultConfig = getDefaultConfig(__dirname);

// module.exports = mergeConfig(defaultConfig, {
//   maxWorkers: 1,
//   stickyWorkers: false,
// });

const { getDefaultConfig } = require('@react-native/metro-config');

module.exports = getDefaultConfig(__dirname);