import React from 'react';
import {
  View,
  ScrollView,
  StatusBar,
  StyleSheet,
  ViewStyle,
  ScrollViewProps,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../common/Colors';
import {
  getDetailBottomPadding,
  getScreenBottomPadding,
  getScreenPaddingH,
  SCREEN_PADDING_H,
} from '../constants/layout';

type ScreenShellProps = {
  children: React.ReactNode;
  /** Tab screen — adds extra bottom space for floating tab bar */
  withTabBar?: boolean;
  /** Use ScrollView wrapper */
  scroll?: boolean;
  scrollProps?: ScrollViewProps;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  backgroundColor?: string;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  statusBarStyle?: 'light-content' | 'dark-content';
};

const ScreenShell: React.FC<ScreenShellProps> = ({
  children,
  withTabBar = false,
  scroll = false,
  scrollProps,
  style,
  contentStyle,
  backgroundColor = '#FDFDFB',
  edges = ['top'],
  statusBarStyle = 'dark-content',
}) => {
  const insets = useSafeAreaInsets();
  const paddingH = getScreenPaddingH();
  const paddingBottom = withTabBar
    ? getScreenBottomPadding(insets)
    : getDetailBottomPadding(insets);

  const inner = scroll ? (
    <ScrollView
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      {...scrollProps}
      contentContainerStyle={[
        styles.scrollContent,
        { paddingBottom, paddingHorizontal: paddingH },
        scrollProps?.contentContainerStyle,
        contentStyle,
      ]}
    >
      {children}
    </ScrollView>
  ) : (
    <View
      style={[
        styles.content,
        { paddingBottom, paddingHorizontal: paddingH },
        contentStyle,
      ]}
    >
      {children}
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor }, style]}
      edges={edges}
    >
      <StatusBar barStyle={statusBarStyle} backgroundColor={backgroundColor} />
      {inner}
    </SafeAreaView>
  );
};

export default ScreenShell;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 4,
  },
});

export { SCREEN_PADDING_H };
