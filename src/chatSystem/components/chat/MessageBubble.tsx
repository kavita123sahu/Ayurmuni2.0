


import React from 'react';
import { View, Text, Image, TouchableOpacity, Linking, StyleSheet } from 'react-native';
import { Message } from '../../types/chat';
import { formatMessageTime } from '../../utils/dateFormatter';
import { Colors } from '../../../common/Colors';
import { Fonts } from '../../../common/Fonts';

const THEME = '#0D614E';
const OWN_BUBBLE = '#DCF8C6'; // WhatsApp jaisa halka green

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  senderName: string;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwn, senderName }) => {
  const openAttachment = (url: string) => {
    Linking.openURL(url).catch((err) => console.error('Failed to open URL:', err));
  };

  const renderAttachments = () => {
    if (!message.attachments || message.attachments.length === 0) return null;
    return message.attachments.map((attachment, idx) => {
      if (attachment.file_type === 'image') {
        return (
          <TouchableOpacity
            key={idx}
            onPress={() => openAttachment(attachment.file_url)}
            activeOpacity={0.9}
            style={styles.attachmentWrapper}
          >
            <Image source={{ uri: attachment.file_url }} style={styles.attachmentImage} resizeMode="cover" />
          </TouchableOpacity>
        );
      }
      return (
        <TouchableOpacity
          key={idx}
          onPress={() => openAttachment(attachment.file_url)}
          style={styles.attachmentFile}
        >
          <Text style={styles.attachmentFileText}>📎 {attachment.file_name || 'Download'}</Text>
        </TouchableOpacity>
      );
    });
  };

  const isLeft = !isOwn;

  return (
    <View style={[styles.container, isLeft ? styles.containerLeft : styles.containerRight]}>
      {isLeft && (
        <Text style={styles.senderName} numberOfLines={1}>{senderName}</Text>
      )}

      <View style={[styles.bubble, isLeft ? styles.bubbleLeft : styles.bubbleRight]}>
        {message.text ? (
          <Text style={styles.messageText}>{message.text}</Text>
        ) : null}

        {renderAttachments()}

        <View style={styles.timestampContainer}>
          <Text style={styles.timestamp}>
            {formatMessageTime(message.created_at)}
          </Text>

          {isOwn && (
            <Text style={[styles.tick, message.is_seen && styles.tickSeen]}>
              {message.is_seen ? '✓✓' : '✓'}
            </Text>
          )}
        </View>

        {/* <View style={styles.timestampContainer}>
          <Text style={styles.timestamp}>{formatMessageTime(message.created_at)}</Text>
          {isOwn && (
            <Text style={[styles.timestamp, message.is_seen && styles.seenTick]}>
              {message.is_seen ? '✓✓' : '✓'}
            </Text>
          )}
        </View> */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 8, paddingHorizontal: 4 },
  containerLeft: { alignItems: 'flex-start' },
  containerRight: { alignItems: 'flex-end' },
  senderName: {
    fontSize: 11, color: '#6B7280', fontFamily: Fonts.PoppinsMedium,
    marginBottom: 2, marginLeft: 4, maxWidth: '70%',
  },
  bubble: {
    maxWidth: '78%', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 2, elevation: 1,
  },
  bubbleLeft: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
  },
  bubbleRight: {
    backgroundColor: '#E6F4EA',
    borderBottomRightRadius: 4,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 16,
  },
  // bubbleLeft: {
  //   backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB',
  //   borderBottomLeftRadius: 4,
  // },
  // bubbleRight: {
  //   backgroundColor: OWN_BUBBLE, borderBottomRightRadius: 4,
  // },
  messageText: { fontSize: 15, fontFamily: Fonts.PoppinsMedium, lineHeight: 20, color: '#1F2937', includeFontPadding: false },
  timestampContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },

  timestamp: {
    fontSize: 11,
    fontFamily: Fonts.PoppinsMedium,
    color: '#6B7280',
  },

  tick: {
    fontSize: 11,
    marginLeft: 4,
    fontFamily: Fonts.PoppinsMedium,
    color: '#6B7280',
  },

  tickSeen: {
    color: Colors.primaryColor,
  },
  attachmentWrapper: { marginTop: 6 },
  attachmentImage: { width: 200, height: 150, borderRadius: 10, backgroundColor: '#F3F4F6' },
  attachmentFile: { marginTop: 6, padding: 8, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 8 },
  attachmentFileText: { fontSize: 13, color: THEME , fontFamily: Fonts.PoppinsMedium},
});