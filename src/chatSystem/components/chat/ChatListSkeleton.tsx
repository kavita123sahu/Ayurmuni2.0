import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { chatColors, chatSpacing } from '../../theme/chatTheme';

const ROW_CONFIG: { outgoing: boolean; width: number }[] = [
  { outgoing: false, width: 180 },
  { outgoing: true, width: 140 },
  { outgoing: false, width: 220 },
  { outgoing: false, width: 120 },
  { outgoing: true, width: 190 },
  { outgoing: true, width: 100 },
];

function ShimmerBlock({ width, outgoing }: { width: number; outgoing: boolean }) {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 650, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 650, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <View style={[styles.row, outgoing ? styles.rowOutgoing : styles.rowIncoming]}>
      <Animated.View
        style={[
          styles.bubble,
          { width, opacity, backgroundColor: chatColors.skeletonBase },
        ]}
      />
    </View>
  );
}

export function ChatListSkeleton() {
  return (
    <View style={styles.container}>
      {ROW_CONFIG.map((row, idx) => (
        <ShimmerBlock key={idx} width={row.width} outgoing={row.outgoing} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingVertical: chatSpacing.lg,
  },
  row: {
    flexDirection: 'row',
    paddingHorizontal: chatSpacing.lg,
    marginBottom: chatSpacing.sm,
  },
  rowOutgoing: { justifyContent: 'flex-end' },
  rowIncoming: { justifyContent: 'flex-start' },
  bubble: {
    height: 40,
    borderRadius: chatSpacing.bubbleRadius,
  },
});
