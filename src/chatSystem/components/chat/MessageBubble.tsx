import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Linking,
  StyleSheet,
} from 'react-native';
import { Message } from '../../types/chat';
import { formatMessageTime } from '../../utils/dateFormatter';
import { Colors } from '../../../common/Colors';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  senderName: string;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwn,
  senderName,
}) => {
  const openAttachment = (url: string) => {
    Linking.openURL(url).catch((err) =>
      console.error('Failed to open URL:', err)
    );
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
            <Image
              source={{ uri: attachment.file_url }}
              style={styles.attachmentImage}
              resizeMode="cover"
            />
          </TouchableOpacity>
        );
      } else {
        return (
          <TouchableOpacity
            key={idx}
            onPress={() => openAttachment(attachment.file_url)}
            style={[
              styles.attachmentFile,
              isOwn && styles.attachmentFileOwn,
            ]}
          >
            <Text
              style={[
                styles.attachmentFileText,
                isOwn && styles.textWhite,
              ]}
            >
              📎 {attachment.file_name || 'Download'}
            </Text>
          </TouchableOpacity>
        );
      }
    });
  };

  const isLeft = !isOwn;

  return (
    <View
      style={[
        styles.container,
        isLeft ? styles.containerLeft : styles.containerRight,
      ]}
    >
      {/* ✅ Sender name (only for doctor/left messages) */}
      {isLeft && (
        <Text style={styles.senderName} numberOfLines={1}>
          {senderName}
        </Text>
      )}

      <View
        style={[
          styles.bubble,
          isLeft ? styles.bubbleLeft : styles.bubbleRight,
        ]}
      >
        {/* ✅ Message text */}
        {message.text ? (
          <Text style={[styles.messageText, isLeft ? styles.textDark : styles.textWhite]}>
            {message.text}
          </Text>
        ) : null}

        {/* ✅ Attachments */}
        {renderAttachments()}

        {/* ✅ Timestamp + Seen */}
        <View style={styles.timestampContainer}>
          <Text
            style={[
              styles.timestamp,
              isLeft ? styles.timestampLeft : styles.timestampRight,
            ]}
          >
            {formatMessageTime(message.created_at)}
          </Text>
          {isOwn && (
            <Text
              style={[
                styles.timestamp,
                styles.timestampRight,
                styles.seenIcon,
              ]}
            >
              {message.is_seen ? '✓✓' : '✓'}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  containerLeft: {
    alignItems: 'flex-start',
  },
  containerRight: {
    alignItems: 'flex-end',
  },
  senderName: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 2,
    marginLeft: 4,
    maxWidth: '70%',
  },
  bubble: {
    maxWidth: '78%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  bubbleLeft: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderBottomLeftRadius: 4,
  },
  bubbleRight: {
    backgroundColor: '#3B82F6',
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
    includeFontPadding: false,
  },
  textWhite: {
    color: '#FFFFFF',
  },
  textDark: {
    color: '#1F2937',
  },
  timestampContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
    gap: 4,
  },
  timestamp: {
    fontSize: 10,
    includeFontPadding: false,
  },
  timestampLeft: {
    color: '#9CA3AF',
  },
  timestampRight: {
    color: '#93C5FD',
  },
  seenIcon: {
    marginLeft: 2,
  },
  attachmentWrapper: {
    marginTop: 6,
  },
  attachmentImage: {
    width: 200,
    height: 150,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
  },
  attachmentFile: {
    marginTop: 6,
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
  },
  attachmentFileOwn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  attachmentFileText: {
    fontSize: 13,
    color: Colors.primaryColor,
  },
});