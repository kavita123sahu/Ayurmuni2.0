import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';

interface ChatHeaderProps {
    title: string;
    avatar?: string;
    isOnline: boolean;
    role: 'doctor' | 'patient';
    onBack?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
    title,
    avatar,
    isOnline,
    role,
    onBack,
}) => {
    const navigation = useNavigation();

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            navigation.goBack();
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.leftContainer}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <Text style={styles.backIcon}>‹</Text>
                </TouchableOpacity>

                {/* Avatar */}
                <View style={styles.avatarContainer}>
                    {avatar ? (
                        <Image source={{ uri: avatar }} style={styles.avatar} />
                    ) : (
                        <View style={[styles.avatar, styles.avatarPlaceholder]}>
                            <Text style={styles.avatarText}>{title.charAt(0).toUpperCase()}</Text>
                        </View>
                    )}
                    <View style={[styles.statusDot, isOnline ? styles.statusOnline : styles.statusOffline]} />
                </View>

                {/* Title */}
                <View style={styles.titleContainer}>
                    <Text style={styles.title} numberOfLines={1}>
                        {title}
                    </Text>
                    <Text style={styles.subtitle}>
                        {isOnline ? 'Online' : 'Offline'} • {role === 'doctor' ? 'Doctor' : 'Patient'}
                    </Text>
                </View>
            </View>

            {/* Actions */}
            <TouchableOpacity style={styles.moreButton}>
                <Text style={styles.moreIcon}>⋮</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        ...Platform.select({
            ios: {
                paddingTop: 44,
            },
        }),
    },
    leftContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    backButton: {
        padding: 4,
        marginRight: 4,
    },
    backIcon: {
        fontSize: 32,
        color: '#3B82F6',
        fontWeight: '300',
    },
    avatarContainer: {
        position: 'relative',
        marginRight: 10,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    avatarPlaceholder: {
        backgroundColor: '#3B82F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
    },
    statusDot: {
        position: 'absolute',
        bottom: 0,
        right: 0,
    },
    statusOnline: {
        backgroundColor: '#34D399',
    },
    statusOffline: {
        backgroundColor: '#9CA3AF',
    },
    titleContainer: {
        flex: 1,
    }
})
