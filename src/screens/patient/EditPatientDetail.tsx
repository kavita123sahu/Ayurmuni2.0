import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import { Fonts } from '../../common/Fonts'
import AppInputField from '../../components/AppInputField'
import { Images } from '../../common/Images'

export default function EditPatientDetail() {
    return (
        <View style={{ padding: 16 }}>

            <Text style={styles.sectionTitle}>Personal Information</Text>

            <AppInputField label="Full Name" placeholder="John Doe" />

            <AppInputField
                label="Date of Birth"
                placeholder="DD/MM/YYYY"
                rightIcon={Images.calender}
            />

            <AppInputField
                label="Gender"
                placeholder="Select Gender"
                rightIcon={Images.arrow}
            />

            <AppInputField label="Blood Group" placeholder="A+" />

            {/* Row Inputs */}
            <View style={styles.row}>
                <AppInputField
                    label="Height (cm)"
                    placeholder="180"
                    containerStyle={{ flex: 1, marginRight: 8 }}
                />

                <AppInputField
                    label="Weight (kg)"
                    placeholder="75"
                    containerStyle={{ flex: 1, marginLeft: 8 }}
                />
            </View>

        </View>
    )
}

const styles = StyleSheet.create({
    sectionTitle: {
        fontSize: 16,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#111827',
        marginBottom: 12,
    },

    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
})