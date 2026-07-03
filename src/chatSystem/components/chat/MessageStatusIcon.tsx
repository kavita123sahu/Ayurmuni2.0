import React, { memo } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'; // ⚠️ swap for your app's icon set if different
import { MessageStatus } from '../../types/chat';
import { chatColors } from '../../theme/chatTheme';

interface Props {
  status: MessageStatus;
}

function MessageStatusIconBase({ status }: Props) {
  if (status === 'sending') {
    return (
      <View style={styles.wrap}>
        <ActivityIndicator size={10} color={chatColors.textOnOutgoing} />
      </View>
    );
  }

  if (status === 'failed') {
    return <Icon name="alert-circle" size={14} color={chatColors.danger} />;
  }

  if (status === 'read') {
    return <Icon name="checkmark-done" size={14} color={chatColors.success} />;
  }

  if (status === 'delivered') {
    return <Icon name="checkmark-done" size={14} color={chatColors.textOnOutgoing} />;
  }

  // 'sent'
  return <Icon name="checkmark" size={14} color={chatColors.textOnOutgoing} />;
}

export const MessageStatusIcon = memo(MessageStatusIconBase);

const styles = StyleSheet.create({
  wrap: { width: 14, height: 14, alignItems: 'center', justifyContent: 'center' },
});
