const path = require('path');

const payphiRoot = path.join(__dirname, 'node_modules', 'react-native-payphi-sdk');

module.exports = {
  assets: ['./src/assets/fonts/'],
  dependencies: {
    // Force-autolink ICICI PayPhi Customer SDK (file: vendor tgz).
    'react-native-payphi-sdk': {
      root: payphiRoot,
      platforms: {
        android: {
          sourceDir: path.join(payphiRoot, 'android'),
          packageImportPath: 'import com.payphi.reactnative.sdk.PayphiPackage;',
          packageInstance: 'new PayphiPackage()',
        },
        ios: null,
      },
    },
  },
};
