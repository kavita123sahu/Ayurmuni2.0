import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { chatColors, chatTypography, chatSpacing } from '../../theme/chatTheme';

interface Props {
  otherPartyName?: string;
}

export function EmptyChatState({ otherPartyName }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Icon name="chatbubbles-outline" size={36} color={chatColors.bubbleOutgoing} />
      </View>
      <Text style={styles.title}>No messages yet</Text>
      <Text style={styles.subtitle}>
        {otherPartyName
          ? `Say hello to ${otherPartyName} to start the conversation.`
          : 'Send a message to start the conversation.'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: chatSpacing.xl,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: chatColors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: chatSpacing.lg,
  },
  title: {
    ...chatTypography.emptyTitle,
    color: chatColors.textOnIncoming,
    fontWeight: '700',
    marginBottom: chatSpacing.xs,
  },
  subtitle: {
    ...chatTypography.emptySubtitle,
    color: chatColors.textSecondary,
    textAlign: 'center',
  },
});
