import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StatusBar,
    StyleSheet,
    SafeAreaView,
    Image,
} from 'react-native';
import { Ionicons } from '../common/Vector';
import { Colors } from '../common/Colors';
import { Fonts } from '../common/Fonts';
import LinearGradient from 'react-native-linear-gradient';

interface PermissionItemProps {
    icon: any;
    title: string;
    description: string;
}

const PermissionItem: React.FC<PermissionItemProps> = ({ icon, title, description }) => (
    <View style={styles.permissionItem}>
        <View style={styles.permissionIcon}>
            <Image source={icon} style={{ height: 33, width: 33 }} />
        </View>
        <View style={styles.permissionContent}>
            <Text style={styles.permissionTitle}>{title}</Text>
            <Text style={styles.permissionDescription}>{description}</Text>
        </View>
    </View>
);

const AccessEnable: React.FC = (props) => {



    const handleContinue = () => {
    };

    const handleBack = () => {
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <View style={styles.gearIcon}>
                        <Image source={require('../assets/images/Vector.png')} style={{ height: 140, width: 140, }} />
                    </View>
                </View>

                <Text style={styles.title}>Enable App Permission</Text>

                <Text style={styles.subtitle}>
                    We need access to system permissions in order to work properly
                </Text>

                <View style={styles.permissionsList}>
                    <PermissionItem
                        icon={require('../assets/images/EnableMic.png')}
                        title="Access Microphone"
                        description="For audio input"
                    />
                    <PermissionItem
                        icon={require('../assets/images/bell.png')}
                        title="Send You Notification"
                        description="To be notified when you receive messages"
                    />
                    <PermissionItem
                        icon={require('../assets/images/EnableLocation.png')}
                        title="Access your location"
                        description="For getting laundry vendors near you"
                    />
                </View>

                <LinearGradient
                    colors={[Colors.secondaryColor, Colors.primaryColor]} style={styles.continueButton}>
                    <TouchableOpacity onPress={handleContinue}>
                        <Text style={styles.continueButtonText}>Continue</Text>
                    </TouchableOpacity>
                </LinearGradient>

                <Text style={styles.footerText}>
                    You can change these permission later from mobile settings
                </Text>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#ffffff' },
    header: { paddingHorizontal: 20, paddingTop: 40, paddingBottom: 20 },
    backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
    content: { flex: 1, paddingHorizontal: 30, alignItems: 'center' },
    iconContainer: { marginTop: 40, marginBottom: 40, position: 'relative' },
    gearIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.white, justifyContent: 'center', alignItems: 'center', position: 'relative' },
    checkmarkOverlay: { position: 'absolute', bottom: -5, right: -5, width: 28, height: 28, borderRadius: 14, backgroundColor: '#4CAF50', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#ffffff' },
    title: { fontSize: 24, fontFamily: Fonts.PoppinsMedium, color: Colors.textColor, textAlign: 'center', marginBottom: 12 },
    subtitle: { fontSize: 16, fontFamily: Fonts.PoppinsRegular, color: Colors.subTextColor, textAlign: 'center', lineHeight: 22, marginBottom: 40, paddingHorizontal: 10 },
    permissionsList: { width: '100%', marginBottom: 40 },
    permissionItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20 },
    permissionIcon: { width: 33, height: 33, borderRadius: 12, backgroundColor: '#E8F5E8', justifyContent: 'center', alignItems: 'center', marginRight: 15, marginTop: 2 },
    permissionContent: { flex: 1 },
    permissionTitle: { fontSize: 16, fontFamily: Fonts.PoppinsSemiBold, color: Colors.textColor, marginBottom: 4 },
    permissionDescription: { fontSize: 14, fontFamily: Fonts.PoppinsRegular, color: Colors.subTextColor, lineHeight: 20 },
    continueButton: { width: '100%', height: 50, backgroundColor: '#4CAF50', borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    continueButtonText: { fontSize: 16, fontFamily: Fonts.PoppinsMedium, color: '#ffffff' },
    footerText: { fontSize: 12, fontFamily: Fonts.PoppinsMedium, color: Colors.subTextColor, textAlign: 'center', lineHeight: 18, paddingHorizontal: 20 }
});

export default AccessEnable;