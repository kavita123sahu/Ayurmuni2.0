// components/CommonModal.tsx

import React from 'react';
import {
    Modal,
    Pressable,
    Text,
    TouchableOpacity,
    View,
    ActivityIndicator,
    StyleSheet,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Fonts } from '../common/Fonts';

interface CommonModalProps {
    visible: boolean;
    title: string;
    subtitle: string;
    icon?: string;
    cancelText?: string;
    confirmText?: string;
    loading?: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

const CommonModal = ({
    visible,
    title,
    subtitle,
    icon = '👋',
    cancelText = 'Cancel',
    confirmText = 'Confirm',
    loading = false,
    onClose,
    onConfirm,
}: CommonModalProps) => {
    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            statusBarTranslucent>
            <Pressable
                style={styles.overlay}
                onPress={onClose}>
                <Pressable style={styles.modalContainer}>

                    {/* Icon */}
                    <View style={styles.iconWrapper}>
                        <Text style={styles.icon}>
                            {icon}
                        </Text>
                    </View>

                    {/* Title */}
                    <Text style={styles.title}>
                        {title}
                    </Text>

                    {/* Subtitle */}
                    <Text style={styles.subtitle}>
                        {subtitle}
                    </Text>

                    {/* Buttons */}
                    <View style={styles.buttonRow}>

                        <TouchableOpacity
                            activeOpacity={0.8}
                            style={styles.cancelBtn}
                            onPress={onClose}
                            disabled={loading}>
                            <Text style={styles.cancelText}>
                                {cancelText}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            activeOpacity={0.9}
                            onPress={onConfirm}
                            disabled={loading}
                            style={styles.confirmBtnWrapper}>
                            <LinearGradient
                                colors={['#0D614E', '#159B7E']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.confirmBtn}>
                                {loading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.confirmText}>
                                        {confirmText}
                                    </Text>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>

                    </View>

                </Pressable>
            </Pressable>
        </Modal>
    );
};

export default CommonModal;

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },

    modalContainer: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        paddingHorizontal: 24,
        paddingVertical: 28,
        alignItems: 'center',
    },

    iconWrapper: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: '#F3F8F7',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },

    icon: {
        fontSize: 32,
    },

    title: {
        fontSize: 22,
        fontWeight: '700',
        color: '#111827',
        textAlign: 'center',
    },

    subtitle: {
        fontSize: 15,
        color: '#6B7280',
        textAlign: 'center',
        marginTop: 10,
        lineHeight: 22,
    },

    buttonRow: {
        flexDirection: 'row',
        marginTop: 28,
        width: '100%',
    },

    cancelBtn: {
        flex: 1,
        height: 52,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
        backgroundColor: '#FFFFFF',
    },

    cancelText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#374151',
    },

    confirmBtnWrapper: {
        flex: 1,
        marginLeft: 8,
    },

    confirmBtn: {
        height: 52,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },

    confirmText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#FFFFFF',
    },
});