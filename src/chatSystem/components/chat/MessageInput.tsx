import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Platform,
  Keyboard,
  Image,
} from 'react-native';
import { launchImageLibrary, Asset } from 'react-native-image-picker';
import { chatService } from '../../services/chatService';
import { Attachment } from '../../types/chat';
import { MaterialIcons } from '../../../common/Vector';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface MessageInputProps {
  onSend: (text: string, attachments?: Attachment[]) => void | Promise<void>;
  isConnected: boolean;
  isDisabled?: boolean;
  placeholder?: string;
}

const THEME = '#0D614E';

/** Survives remount — blocks a second press from ever starting another send. */
let globalInputSendLock = false;

export const MessageInput: React.FC<MessageInputProps> = ({
  onSend,
  isConnected: _isRealtimeConnected = true,
  isDisabled = false,
  placeholder = 'Type a message...',
}) => {
  const [text, setText] = useState('');
  const [pickedAsset, setPickedAsset] = useState<Asset | null>(null);
  const [isSending, setIsSending] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const sendGuardRef = useRef(false);

  const insets = useSafeAreaInsets();

  const canInteract = !isDisabled && !isSending && !globalInputSendLock;

  const handlePickImage = async () => {
    if (!canInteract) return;
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        includeBase64: false,
      });
      if (result.didCancel || result.errorCode) return;
      const asset = result.assets?.[0];
      if (asset) setPickedAsset(asset);
    } catch (error) {
      console.error('File picker error:', error);
    }
  };

  const removePickedAsset = () => setPickedAsset(null);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!canInteract || sendGuardRef.current || globalInputSendLock) return;
    if (!trimmed && !pickedAsset) return;

    sendGuardRef.current = true;
    globalInputSendLock = true;
    setIsSending(true);

    const asset = pickedAsset;
    const toSend = trimmed;
    setText('');
    setPickedAsset(null);
    Keyboard.dismiss();

    try {
      if (!asset) {
        await Promise.resolve(onSend(toSend));
      } else {
        const url = await chatService.uploadAttachment(
          asset.uri!,
          asset.fileName || 'image.jpg',
        );
        const attachment: Attachment = {
          file_url: url,
          file_type: 'image',
          file_name: asset.fileName || 'image.jpg',
        };
        await Promise.resolve(onSend(toSend, [attachment]));
      }
    } catch (error) {
      console.error('Send failed:', error);
      setText(toSend);
      if (asset) setPickedAsset(asset);
    } finally {
      sendGuardRef.current = false;
      globalInputSendLock = false;
      setIsSending(false);
      // Keep caret ready for the next message without layout jump
      requestAnimationFrame(() => {
        inputRef.current?.focus?.();
      });
    }
  };

  const hasContent = !!text.trim() || !!pickedAsset;

  return (
    <View
      style={[
        styles.container,
        { paddingBottom: Math.max(insets.bottom, 8) },
      ]}
    >
      {pickedAsset ? (
        <View style={styles.previewRow}>
          <Image source={{ uri: pickedAsset.uri }} style={styles.previewImage} />
          <TouchableOpacity
            style={styles.previewRemove}
            onPress={removePickedAsset}
            disabled={isSending}
          >
            <MaterialIcons name="close" size={14} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      ) : null}

      <View style={styles.inputContainer}>
        <TouchableOpacity
          onPress={handlePickImage}
          disabled={!canInteract}
          style={[styles.iconButton, !canInteract && styles.iconDisabled]}
          activeOpacity={0.7}
        >
          <MaterialIcons name="attachment" size={20} color="#6B7280" />
        </TouchableOpacity>

        <View style={styles.inputWrapper}>
          <TextInput
            ref={inputRef}
            value={text}
            onChangeText={setText}
            placeholder={placeholder}
            placeholderTextColor="#9CA3AF"
            editable={canInteract}
            multiline
            blurOnSubmit={false}
            textAlignVertical="center"
            style={[styles.input, !canInteract && styles.inputDisabled]}
            returnKeyType="default"
          />
        </View>

        <TouchableOpacity
          onPress={handleSend}
          disabled={!hasContent || !canInteract}
          style={[
            styles.sendButton,
            hasContent && canInteract
              ? styles.sendButtonActive
              : styles.sendButtonDisabled,
          ]}
          activeOpacity={0.7}
        >
          {isSending ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <MaterialIcons name="send" size={18} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E7EB',
  },
  previewRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  previewImage: {
    width: 64,
    height: 64,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
  },
  previewRemove: {
    position: 'absolute',
    top: -6,
    left: 54,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#00000099',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    minHeight: 48,
  },
  inputWrapper: {
    flex: 1,
    marginHorizontal: 8,
    justifyContent: 'center',
  },
  input: {
    maxHeight: 100,
    minHeight: 40,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 22,
    fontSize: 15,
    lineHeight: 20,
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  inputDisabled: {
    opacity: 0.5,
    backgroundColor: '#F9FAFB',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  iconDisabled: { opacity: 0.4 },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonActive: { backgroundColor: THEME },
  sendButtonDisabled: { backgroundColor: '#E5E7EB' },
});
