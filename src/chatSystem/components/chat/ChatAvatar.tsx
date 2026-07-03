import React, { memo } from 'react';
import { Image, View, Text, StyleSheet } from 'react-native';
import { chatColors, chatSpacing } from '../../theme/chatTheme';

interface ChatAvatarProps {
  uri?: string | null;
  name: string;
  size?: number;
}

function ChatAvatarBase({ uri, name, size = chatSpacing.avatarSize }: ChatAvatarProps) {
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const style = { width: size, height: size, borderRadius: size / 2 };

  if (uri) {
    return <Image source={{ uri }} style={[styles.image, style]} />;
  }

  return (
    <View style={[styles.fallback, style]}>
      <Text style={styles.initials}>{initials}</Text>
    </View>
  );
}

export const ChatAvatar = memo(ChatAvatarBase);

const styles = StyleSheet.create({
  image: {
    backgroundColor: chatColors.border,
  },
  fallback: {
    backgroundColor: chatColors.bubbleOutgoing,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});
