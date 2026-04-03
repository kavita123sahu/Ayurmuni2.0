import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Fonts } from "../../common/Fonts";
import { Images } from "../../common/Images";
import AppHeader from "../../components/AppHeader";
import SettingItem from "../../components/SettingItem";
import { Colors } from "../../common/Colors";
import PrimaryButton from "../../components/PrimaryButton";
import { Styles } from "../../common/Styles";

const SettingsScreen = (props: any) => {

    const settingsData = [
        {
            section: "ACCOUNT",
            data: [
                {
                    title: "Edit Profile",
                    subtitle: "Name, email, phone number",
                    icon: Images.user,
                    type: "arrow",
                },
                {
                    title: "Change Password",
                    subtitle: "Update your security credentials",
                    icon: Images.Password,
                    type: "arrow",
                },
            ],
        },
        {
            section: "NOTIFICATIONS",
            data: [
                {
                    title: "Push Notifications",
                    subtitle: "Alerts for appointments & news",
                    icon: Images.bellnotification,
                    type: "toggle",
                    value: true,
                },
                {
                    title: "Email Updates",
                    subtitle: "Monthly reports and newsletters",
                    icon: Images.Email,
                    type: "toggle",
                    value: false,
                },
            ],
        },
        {
            section: "SECURITY & PRIVACY",
            data: [
                {
                    title: "Biometric Lock",
                    subtitle: "Use FaceID or Fingerprint",
                    icon: Images.Biometric,
                    type: "toggle",
                    value: true,
                },
                {
                    title: "Privacy Policy",
                    subtitle: "How we handle your medical data",
                    icon: Images.Privacy,
                    type: "arrow",
                },
            ],
        },
        {
            section: "SUPPORT",
            data: [
                {
                    title: "Help Center",
                    subtitle: "FAQs and contact information",
                    icon: Images.HelpCenter,
                    type: "arrow",
                },
                {
                    title: "About",
                    subtitle: "App version 2.4.0",
                    icon: Images.notification,
                    type: "arrow",
                },
            ],
        },
    ];


    return (
        <SafeAreaView style={styles.container}>
            <AppHeader
                title="Settings"
                leftIcon={Images.backIcon}
                onLeftPress={() => props.navigation.goBack()}
                rightIcon="search"
                onRightPress={() => console.log('Search clicked')}
            />
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={{ paddingHorizontal: 20, paddingBottom: 20 }}>

                    {settingsData.map((section, index) => (
                        <View key={index} style={{ marginTop: 20, marginBottom: 10 }}>
                            <Text style={styles.sectionTitle}>{section.section}</Text>

                            <View style={styles.card}>
                                {section.data.map((item, index) => (
                                    <React.Fragment key={index}>
                                        <SettingItem item={item} />

                                        {/* 👇 divider between ALL items except last */}
                                        {index < section.data.length - 1 && (
                                            <View style={styles.divider} />
                                        )}
                                    </React.Fragment>
                                ))}
                            </View>
                        </View>
                    ))}

                    <View style={{ marginTop: 40, marginBottom: 40 }}>
                        <PrimaryButton
                            title="Sign Out"
                            icon={Images.logout}
                            backgroundColor="#FEF2F2"
                            textColor={Colors.errorColor}
                            TextFont={Fonts.PoppinsMedium

                            }


                        />


                        <Text style={styles.version}>Logged in as <Text style={Styles.outlineText}> ajjayyuiux@gmail.com</Text></Text>

                    </View>

                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default SettingsScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8FAFC",
    },
    sectionTitle: {
        fontSize: 14,
        color: "#6B7280",
        marginBottom: 8,
        fontFamily: Fonts.PoppinsSemiBold,
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 14,
        paddingHorizontal: 12,
    },
    divider: {
        height: 1,
        margin: 5,
        backgroundColor: Colors.borderColor,
        // marginLeft: 52, // icon ke baad se start
    },

    version: {
        textAlign: 'center',
        fontFamily: Fonts.PoppinsMedium,
        fontSize: 14,
        marginTop: 10,
        paddingVertical: 10,
        color: "#A1A1AA",
    },
});