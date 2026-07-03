import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Platform,
  Keyboard,
} from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import { launchImageLibrary } from 'react-native-image-picker';
import { chatService } from '../../services/chatService';

interface MessageInputProps {
  onSend: (text: string, attachments?: any[]) => void;
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
        onSend('', [{ file_url: url, file_type: 'image', file_name: asset.fileName }]);
      } catch (error) {
        console.error('Upload failed:', error);
      } finally {
        setIsUploading(false);
      }
    } catch (error) {
      console.error('File picker error:', error);
    }
  };

  const handleDocumentUpload = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
        allowMultiSelection: false,
      });

      const file = result[0];
      if (!file) return;

      setIsUploading(true);
      try {
        const url = await chatService.uploadAttachment(
          file.uri,
          file.name || 'document'
        );
        onSend('', [{ file_url: url, file_type: 'document', file_name: file.name }]);
      } catch (error) {
        console.error('Upload failed:', error);
      } finally {
        setIsUploading(false);
      }
    } catch (error) {
      if (!DocumentPicker.isCancel(error)) {
        console.error('Document picker error:', error);
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        {/* Attachment button */}
        <TouchableOpacity
          onPress={handleFileUpload}
          disabled={isDisabled || !isConnected || isUploading}
          style={[styles.iconButton, (isDisabled || !isConnected || isUploading) && styles.iconDisabled]}
        >
          {isUploading ? (
            <ActivityIndicator size="small" color="#6B7280" />
          ) : (
            <Text style={styles.iconText}>📎</Text>
          )}
        </TouchableOpacity>

        {/* Text input */}
        <TextInput
          ref={inputRef}
          value={text}
          onChangeText={setText}
          onSubmitEditing={handleSend}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          editable={!isDisabled && isConnected}
          multiline
          style={[
            styles.input,
            (isDisabled || !isConnected) && styles.inputDisabled,
          ]}
        />

        {/* Send button */}
        <TouchableOpacity
          onPress={handleSend}
          disabled={!text.trim() || isDisabled || !isConnected}
          style={[
            styles.sendButton,
            (text.trim() && isConnected && !isDisabled)
              ? styles.sendButtonActive
              : styles.sendButtonDisabled,
          ]}
        >
          <Text style={styles.sendIcon}>➤</Text>
        </TouchableOpacity>
      </View>

      {/* Connection status */}
      {!isConnected && (
        <View style={styles.statusBar}>
          <ActivityIndicator size="small" color="#D97706" />
          <Text style={styles.statusText}>Reconnecting...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  input: {
    flex: 1,
    maxHeight: 100,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 10 : 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 24,
    fontSize: 15,
    color: '#1F2937',
  },
  inputDisabled: {
    opacity: 0.5,
  },
  iconButton: {
    padding: 8,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconDisabled: {
    opacity: 0.4,
  },
  iconText: {
    fontSize: 20,
  },
  sendButton: {
    padding: 8,
    borderRadius: 24,
    width: 44,
    height: 44,
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
    gap: 8,
  },
  statusText: {
    fontSize: 12,
    color: '#D97706',
  },
});