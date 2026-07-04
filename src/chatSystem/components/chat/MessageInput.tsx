import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Platform,
  Keyboard,
  Text,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { chatService } from '../../services/chatService';
import { Attachment } from '../../types/chat';
import { AntDesign ,MaterialIcons} from '../../../common/Vector';

interface MessageInputProps {
  onSend: (text: string, attachments?: Attachment[]) => void;
  isConnected: boolean;
  isDisabled?: boolean;
  placeholder?: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSend,
  isConnected,
  isDisabled = false,
  placeholder = 'Type a message...',
}) => {
  const [text, setText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const handleSend = () => {
    if (text.trim() && !isDisabled && isConnected) {
      onSend(text.trim());
      setText('');
      Keyboard.dismiss();
    }
  };

  const handleFileUpload = async () => {
    if (isDisabled || !isConnected) return;

    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        includeBase64: false,
      });

      if (result.didCancel) return;
      if (result.errorCode) {
        console.error('Image picker error:', result.errorMessage);
        return;
      }

      const asset = result.assets?.[0];
      if (!asset) return;

      setIsUploading(true);
      try {
        const url = await chatService.uploadAttachment(
          asset.uri!,
          asset.fileName || 'image.jpg'
        );
        const attachment: Attachment = {
          file_url: url,
          file_type: 'image',
          file_name: asset.fileName || 'image.jpg',
        };
        onSend('', [attachment]);
      } catch (error) {
        console.error('Upload failed:', error);
      } finally {
        setIsUploading(false);
      }
    } catch (error) {
      console.error('File picker error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        {/* ✅ Attachment button */}
        <TouchableOpacity
          onPress={handleFileUpload}
          disabled={isDisabled || !isConnected || isUploading}
          style={[
            styles.iconButton,
            (isDisabled || !isConnected || isUploading) && styles.iconDisabled,
          ]}
          activeOpacity={0.7}
        >
          {isUploading ? (
            <ActivityIndicator size="small" color="#6B7280" />
          ) : (
            <MaterialIcons name="attachment" size={20} color="#6B7280" />
            // <Text style={styles.iconText}>📎</Text>
          )}
        </TouchableOpacity>

        {/* ✅ Text input */}
        <View style={styles.inputWrapper}>
          <TextInput
            ref={inputRef}
            value={text}
            onChangeText={setText}
            placeholder={placeholder}
            placeholderTextColor="#9CA3AF"
            editable={!isDisabled && isConnected}
            multiline
            style={[
              styles.input,
              (isDisabled || !isConnected) && styles.inputDisabled,
            ]}
            returnKeyType="send"
            onSubmitEditing={handleSend}
          />
        </View>

        {/* ✅ Send button */}
        <TouchableOpacity
          onPress={handleSend}
          disabled={!text.trim() || isDisabled || !isConnected}
          style={[
            styles.sendButton,
            text.trim() && isConnected && !isDisabled
              ? styles.sendButtonActive
              : styles.sendButtonDisabled,
          ]}
          activeOpacity={0.7}
        >
          <MaterialIcons name="send" size={18} color="#FFFFFF" />
          {/* <Text style={styles.sendIcon}>➤</Text> */}
        </TouchableOpacity>
      </View>

      {/* ✅ Connection status */}
      {!isConnected && (
        <View style={styles.statusBar}>
          <ActivityIndicator size="small" color="#D97706" />
          <Text style={styles.statusText}>Connecting...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
  },
  inputWrapper: {
    flex: 1,
    marginHorizontal: 8,
  },
  input: {
    maxHeight: 100,
    minHeight: 44,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 24,
    fontSize: 15,
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  inputDisabled: {
    opacity: 0.5,
    backgroundColor: '#F9FAFB',
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  iconDisabled: {
    opacity: 0.4,
  },
  iconText: {
    fontSize: 20,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonActive: {
    backgroundColor: '#3B82F6',
  },
  sendButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  sendIcon: {
    fontSize: 18,
    color: '#FFFFFF',
    transform: [{ rotate: '90deg' }],
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#D97706',
    marginLeft: 8,
  },
});