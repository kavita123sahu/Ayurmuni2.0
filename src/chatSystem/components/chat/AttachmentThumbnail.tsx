import React, { memo } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Attachment } from '../../types/chat';
import { chatColors, chatSpacing } from '../../theme/chatTheme';
import { getExtensionFromName } from '../../utils/fileUtils';

interface Props {
  attachment: Attachment;
  outgoing: boolean;
  onOpen?: (attachment: Attachment) => void;
}

function AttachmentThumbnailBase({ attachment, outgoing, onOpen }: Props) {
  const handlePress = () => {
    if (onOpen) {
      onOpen(attachment);
      return;
    }
    const url = attachment.file_url || attachment.local_uri;
    if (url) Linking.openURL(url).catch(() => {});
  };

  if (attachment.file_type === 'image') {
    const uri = attachment.local_uri || attachment.file_url;
    return (
      <TouchableOpacity activeOpacity={0.85} onPress={handlePress}>
        <Image source={{ uri }} style={styles.image} resizeMode="cover" />
      </TouchableOpacity>
    );
  }

  // pdf / document
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={handlePress}
      style={[
        styles.docCard,
        { backgroundColor: outgoing ? 'rgba(255,255,255,0.15)' : chatColors.background },
      ]}
    >
      <View style={styles.docIconWrap}>
        <Icon
          name={attachment.file_type === 'pdf' ? 'document-text' : 'document'}
          size={20}
          color={outgoing ? chatColors.textOnOutgoing : chatColors.bubbleOutgoing}
        />
      </View>
      <View style={styles.docMeta}>
        <Text
          numberOfLines={1}
          style={[styles.docName, { color: outgoing ? chatColors.textOnOutgoing : chatColors.textOnIncoming }]}
        >
          {attachment.file_name}
        </Text>
        <Text style={[styles.docExt, { color: outgoing ? 'rgba(255,255,255,0.7)' : chatColors.textSecondary }]}>
          {getExtensionFromName(attachment.file_name) || 'FILE'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export const AttachmentThumbnail = memo(AttachmentThumbnailBase);

const styles = StyleSheet.create({
  image: {
    width: 200,
    height: 150,
    borderRadius: 12,
    marginBottom: chatSpacing.xs,
  },
  docCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: chatSpacing.sm,
    borderRadius: 12,
    marginBottom: chatSpacing.xs,
    minWidth: 180,
  },
  docIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: chatSpacing.sm,
  },
  docMeta: { flex: 1 },
  docName: { fontSize: 13, fontWeight: '600' },
  docExt: { fontSize: 11, marginTop: 2 },
});
