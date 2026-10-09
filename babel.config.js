module.exports = api => {
  const isProduction = api.env('production');

  return {
    presets: ['module:@react-native/babel-preset'],
    plugins: [
      // console.warn / console.error stay so Sentry still captures them.
      ...(isProduction ? [['transform-remove-console', { exclude: ['error', 'warn'] }]] : []),
      // Must stay last.
      'react-native-worklets/plugin',
    ],
  };
};



// module.exports = {
//   presets: ['module:@react-native/babel-preset'],
//   plugins: [
//     'react-native-worklets/plugin',
//   ],
// };