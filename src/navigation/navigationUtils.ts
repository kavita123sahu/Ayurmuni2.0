/** Safe back — works from nested tab/stack navigators. */
export const safeGoBack = (navigation: any) => {
  if (navigation?.canGoBack?.()) {
    navigation.goBack();
    return;
  }

  const parent = navigation?.getParent?.();
  if (parent?.canGoBack?.()) {
    parent.goBack();
    return;
  }

  navigation?.navigate?.('TabStack', { screen: 'Home' });
};
