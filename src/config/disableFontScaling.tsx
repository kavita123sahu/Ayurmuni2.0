/**
 * Locks typography to the sizes in our StyleSheets on every device, ignoring the
 * OS "font size" setting, so fixed-height cards never overflow.
 *
 * React 19 ignores `defaultProps` on function components (RN's Text/TextInput are
 * function components), so we swap the module's default export for a thin wrapper
 * instead. Must be imported before anything renders — see index.js.
 */
import React from 'react';

const lockFontScale = (modulePath: { default: any }, name: string) => {
  const Original = modulePath.default;
  if (!Original || Original.__fontScaleLocked) return;

  const Locked = (props: any) => (
    <Original allowFontScaling={false} maxFontSizeMultiplier={1} {...props} />
  );
  Locked.displayName = name;
  Locked.__fontScaleLocked = true;
  // Statics such as TextInput.State must stay reachable.
  Object.keys(Original).forEach(key => {
    if (!(key in Locked)) (Locked as any)[key] = Original[key];
  });

  modulePath.default = Locked;
};

lockFontScale(require('react-native/Libraries/Text/Text'), 'Text');
lockFontScale(require('react-native/Libraries/Components/TextInput/TextInput'), 'TextInput');
