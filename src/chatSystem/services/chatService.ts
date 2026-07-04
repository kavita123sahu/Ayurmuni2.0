import { API_BASE } from './api';
import { Message, SendMessagePayload } from '../types/chat';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { Utils } from '../../common/Utils';

// ✅ Pure fetch — no axios needed!
export const chatService = {
    // GET messages
    getMessages: async (
        appointmentId: string,
        markRead?: boolean | string | 'all'
    ): Promise<{ messages: Message[]; chat_access: any; read_receipt?: any }> => {
        // const token = await AsyncStorage.getItem('access_token');
  const token = await Utils.getData('_TOKEN');
        let url = `${API_BASE}/communication/appointments/${appointmentId}/messages/`;
        if (markRead !== undefined) {
            const value = markRead === true ? 'true' : markRead;
            url += `?mark_read=${value}`;
        }

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        console.log('🔹 GET messages response status:', response.status);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.data;
    },

    // POST send message
    sendMessage: async (
        appointmentId: string,
        payload: SendMessagePayload
    ): Promise<{ message: Message }> => {
        // const token = await AsyncStorage.getItem('access_token');
  const token = await Utils.getData('_TOKEN');
        const response = await fetch(
            `${API_BASE}/communication/appointments/${appointmentId}/messages/`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.data;
    },

    // ✅ Upload attachment using fetch
    uploadAttachment: async (
        fileUri: string,
        fileName: string,
        dir: string = 'consultation-chat'
    ): Promise<string> => {
        // const token = await AsyncStorage.getItem('access_token');

        const token = await Utils.getData('_TOKEN');
        const formData = new FormData();

        // ✅ React Native file format for fetch
        const file = {
            uri: fileUri,
            type: getMimeType(fileName),
            name: fileName,
        };

        formData.append('image', file as any);
        formData.append('dir', dir);

        const response = await fetch(`${API_BASE}/user/upload/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
            },
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`Upload failed: ${response.status}`);
        }

        const data = await response.json();
        return data.data.url;
    },

    // ✅ Refresh token
    refreshToken: async (refreshToken: string): Promise<{ access: string }> => {
        const response = await fetch(`${API_BASE}/user/token/refresh/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refresh: refreshToken }),
        });

        if (!response.ok) {
            throw new Error('Token refresh failed');
        }

        const data = await response.json();
        return data;
    },
};

// ✅ MIME type helper
const getMimeType = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    const mimeTypes: Record<string, string> = {
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        gif: 'image/gif',
        webp: 'image/webp',
        pdf: 'application/pdf',
        doc: 'application/msword',
        docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        mp4: 'video/mp4',
        mov: 'video/quicktime',
        mp3: 'audio/mpeg',
        wav: 'audio/wav',
    };
    return mimeTypes[extension] || 'application/octet-stream';
};