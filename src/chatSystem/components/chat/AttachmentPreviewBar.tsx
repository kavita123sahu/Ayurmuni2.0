import React, { memo } from 'react';
import { View, Image, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Attachment } from '../../types/chat';
import { chatColors, chatSpacing } from '../../theme/chatTheme';
import { getExtensionFromName } from '../../utils/fileUtils';

interface Props {
  attachments: Attachment[];
  onRemove: (index: number) => void;
}

function AttachmentPreviewBarBase({ attachments, onRemove }: Props) {
  if (attachments.length === 0) return null;

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.container} contentContainerStyle={styles.content}>
      {attachments.map((att, index) => (
        <View key={att.local_uri ?? `${att.file_name}_${index}`} style={styles.item}>
          {att.file_type === 'image' ? (
            <Image source={{ uri: att.local_uri || att.file_url }} style={styles.thumb} />
          ) : (
            <View style={styles.docThumb}>
              <Icon name="document-text" size={20} color={chatColors.bubbleOutgoing} />
              <Text numberOfLines={1} style={styles.docExt}>
                {getExtensionFromName(att.file_name)}
              </Text>
            </View>
          )}
          <TouchableOpacity style={styles.removeBtn} onPress={() => onRemove(index)}>
            <Icon name="close" size={12} color="#fff" />
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}

export const AttachmentPreviewBar = memo(AttachmentPreviewBarBase);

const styles = StyleSheet.create({
  container: {
    maxHeight: 84,
    backgroundColor: chatColors.inputBackground,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: chatColors.border,
  },
  content: {
    paddingHorizontal: chatSpacing.md,
    paddingVertical: chatSpacing.sm,
  },
  item: {
    marginRight: chatSpacing.sm,
    position: 'relative',
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: 10,
  },
  docThumb: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: chatColors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  docExt: { fontSize: 9, color: chatColors.textSecondary, marginTop: 2 },
  removeBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: chatColors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
