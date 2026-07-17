
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
  Image,
} from 'react-native';
import { launchImageLibrary, Asset } from 'react-native-image-picker';
import { chatService } from '../../services/chatService';
import { Attachment } from '../../types/chat';
import { AntDesign, MaterialIcons } from '../../../common/Vector';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface MessageInputProps {
  onSend: (text: string, attachments?: Attachment[]) => void;
  isConnected: boolean;
  isDisabled?: boolean;
  placeholder?: string;
}

const THEME = '#0D614E';

export const MessageInput: React.FC<MessageInputProps> = ({
  onSend,
  isConnected,
  isDisabled = false,
  placeholder = 'Type a message...',
}) => {
  const [text, setText] = useState('');
  const [pickedAsset, setPickedAsset] = useState<Asset | null>(null);
  const [isSending, setIsSending] = useState(false);
  const inputRef = useRef<TextInput>(null);

const insets = useSafeAreaInsets();

  const canInteract = !isDisabled && isConnected && !isSending;

  // ✅ Sirf pick karo, upload/send abhi mat karo — preview dikhao
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
    if (!canInteract) return;
    if (!trimmed && !pickedAsset) return;

    if (!pickedAsset) {
      onSend(trimmed);
      setText('');
      Keyboard.dismiss();
      return;
    }

    // ✅ Attachment hai — upload karo, phir text+attachment ek saath bhejo
    setIsSending(true);
    try {
      const url = await chatService.uploadAttachment(
        pickedAsset.uri!,
        pickedAsset.fileName || 'image.jpg'
      );
      const attachment: Attachment = {
        file_url: url,
        file_type: 'image',
        file_name: pickedAsset.fileName || 'image.jpg',
      };
      onSend(trimmed, [attachment]);
      setText('');
      setPickedAsset(null);
      Keyboard.dismiss();
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsSending(false);
    }
  };

  const hasContent = !!text.trim() || !!pickedAsset;

  return (
    <View style={[styles.container,{
  paddingBottom: Math.max(insets.bottom, 10)}]}>
      {/* ✅ Selected image preview — WhatsApp style */}
      {pickedAsset && (
        <View style={styles.previewRow}>
          <Image source={{ uri: pickedAsset.uri }} style={styles.previewImage} />
          <TouchableOpacity style={styles.previewRemove} onPress={removePickedAsset}>
            <MaterialIcons name="close" size={14} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}

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
            style={[styles.input, !canInteract && styles.inputDisabled]}
            returnKeyType="send"
            onSubmitEditing={handleSend}
          />
        </View>

        <TouchableOpacity
          onPress={handleSend}
          disabled={!hasContent || !canInteract}
          style={[
            styles.sendButton,
            hasContent && canInteract ? styles.sendButtonActive : styles.sendButtonDisabled,
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
  paddingHorizontal: 12,
  paddingTop: 8,
  borderTopWidth: 1,
  borderTopColor: '#E5E7EB',
},
  // container: {
  //   backgroundColor: '#FFFFFF',
  //   borderTopWidth: 1,
  //   borderTopColor: '#E5E7EB',
  //   paddingHorizontal: 12,
  //   paddingVertical: 8,
  //   paddingBottom: Platform.OS === 'ios' ? 24 : 8,
  // },
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
  iconDisabled: { opacity: 0.4 },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonActive: { backgroundColor: THEME },
  sendButtonDisabled: { backgroundColor: '#E5E7EB' },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  statusText: { fontSize: 12, color: '#D97706', marginLeft: 8 },
});