import React, { memo } from 'react';
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
import { Fonts } from '../../../common/Fonts';
import TablerIcon from '../../../components/TablerIcon';
import { isTempMessage } from '../../utils/messageUtils';

const THEME = '#0D614E';
const TICK_READ = '#3B82F6';
const TICK_UNREAD = '#94A3B8';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  senderName: string;
}

const MessageBubbleComponent: React.FC<MessageBubbleProps> = ({
  message,
  isOwn,
  senderName,
}) => {
  const openAttachment = (url: string) => {
    Linking.openURL(url).catch(err =>
      console.error('Failed to open URL:', err),
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
      }
      return (
        <TouchableOpacity
          key={idx}
          onPress={() => openAttachment(attachment.file_url)}
          style={styles.attachmentFile}
        >
          <Text style={styles.attachmentFileText}>
            📎 {attachment.file_name || 'Download'}
          </Text>
        </TouchableOpacity>
      );
    });
  };

  const timeLabel = formatMessageTime(message.created_at);
  const pending = isTempMessage(message);
  const seen = Boolean(message.is_seen);

  return (
    <View
      style={[
        styles.container,
        isOwn ? styles.containerRight : styles.containerLeft,
      ]}
    >
      {!isOwn ? (
        <Text style={styles.senderName} numberOfLines={1}>
          {senderName}
        </Text>
      ) : null}

      <View style={[styles.bubble, isOwn ? styles.bubbleRight : styles.bubbleLeft]}>
        {message.text ? (
          <Text
            style={[
              styles.messageText,
              isOwn ? styles.messageTextOwn : styles.messageTextOther,
            ]}
          >
            {message.text}
          </Text>
        ) : null}
        {renderAttachments()}
      </View>

      {/* Time + ticks below the card */}
      <View
        style={[
          styles.metaRow,
          isOwn ? styles.metaRowOwn : styles.metaRowOther,
        ]}
      >
        <Text style={styles.timestamp}>{timeLabel.toUpperCase()}</Text>

        {isOwn ? (
          <View style={styles.ticksWrap}>
            {pending ? (
              <TablerIcon name="clock" size={14} color={TICK_UNREAD} strokeWidth={2.2} />
            ) : seen ? (
              <TablerIcon name='tick-icon' size={16} color={TICK_READ} strokeWidth={2.4} />
            ) : (
              <TablerIcon name="tick-icon" size={15} color={TICK_UNREAD} strokeWidth={2.2} />
            )}
          </View>
        ) : null}
      </View>
    </View>
  );
};

export const MessageBubble = memo(MessageBubbleComponent);

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
    paddingHorizontal: 4,
    maxWidth: '100%',
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
    fontFamily: Fonts.PoppinsMedium,
    marginBottom: 3,
    marginLeft: 6,
    maxWidth: '78%',
  },
  bubble: {
    maxWidth: '78%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  bubbleLeft: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E8EEF2',
  },
  bubbleRight: {
    backgroundColor: Colors.primaryColor,
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 14,
    fontFamily: Fonts.PoppinsMedium,
    lineHeight: 20,
    includeFontPadding: false,
  },
  messageTextOwn: {
    color: '#FFFFFF',
  },
  messageTextOther: {
    color: '#111827',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
    maxWidth: '78%',
  },
  metaRowOwn: {
    alignSelf: 'flex-end',
    justifyContent: 'flex-end',
  },
  metaRowOther: {
    alignSelf: 'flex-start',
    justifyContent: 'flex-start',
    paddingLeft: 4,
  },
  timestamp: {
    fontSize: 10,
    fontFamily: Fonts.PoppinsMedium,
    color: '#94A3B8',
    includeFontPadding: false,
  },
  ticksWrap: {
    marginLeft: 2,
    justifyContent: 'center',
    alignItems: 'center',
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
  attachmentFileText: {
    fontSize: 13,
    color: THEME,
    fontFamily: Fonts.PoppinsMedium,
  },
});
