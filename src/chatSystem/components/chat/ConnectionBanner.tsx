import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SocketConnectionState } from '../../types/chat';
import { chatColors, chatSpacing } from '../../theme/chatTheme';

interface Props {
  state: SocketConnectionState;
}

const LABELS: Partial<Record<SocketConnectionState, string>> = {
  connecting: 'Connecting…',
  reconnecting: 'Reconnecting…',
  disconnected: 'Disconnected',
  failed: 'Unable to connect',
};

export function ConnectionBanner({ state }: Props) {
  const label = LABELS[state];
  if (!label) return null; // hidden when 'connected' or 'idle'

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: chatSpacing.xs,
    alignItems: 'center',
    backgroundColor: chatColors.connectionBannerBg,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    color: chatColors.connectionBannerText,
  },
});
