import { View, Text, StyleSheet, ScrollView, Image } from 'react-native'
import React from 'react'
import { Fonts } from '../../common/Fonts'
import AppInputField from '../../components/AppInputField'
import { Images } from '../../common/Images'
import AppHeader from '../../components/AppHeader'
import SectionHeader from '../../components/SectionHeader'
import { Styles } from '../../common/Styles'

export default function EditPatientDetail(props: any) {
    return (
        <View style={{ flex: 1, }}>

            <AppHeader
                title="Patient Details"
                leftIcon={Images.backIcon}
                onLeftPress={() => props.navigation.goBack()}
                rightIcon="search"
                onRightPress={() => console.log('Search clicked')}
            />

            <ScrollView style={{ flex: 1, paddingHorizontal: 22, marginBottom:50 }}>

                <SectionHeader title="Personal Information" />



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


                <SectionHeader title="Contact Information" />

                <AppInputField
                    label="Phone Number"
                    placeholder="00000-00000"
                    rightIcon={Images.arrow}
                />


                <AppInputField
                    label="Email Address"
                    placeholder="john.doe@example.com"
                    rightIcon={Images.arrow}
                />




                <View style={styles.EmergencyView}>

                    <View style={styles.container}>
                        <Image source={Images.logout} style={Styles.IconSize} tintColor={'#F43F5E'} />
                        <Text style={styles.title}>Emergency Contact</Text>
                    </View>


                    <AppInputField label="Contact Name" placeholder="Jane Doe" />


                    <AppInputField label="Relation" placeholder="Spouse" />

                    <AppInputField label="Emergency Phone" placeholder="99999-99999" />



                </View>





                <SectionHeader title="Insurance Details" />

                <AppInputField label="Insurance Provider" placeholder="Blue Cross Shield" />


                <AppInputField label="Policy Number" placeholder="POL-987654321" />

                <AppInputField
                    label="Valid Thru"
                    placeholder="MM/YYYY"
                    rightIcon={Images.calender}
                />


            </ScrollView>
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

    EmergencyView: {
        marginHorizontal: 5,
        paddingHorizontal: 20,
        backgroundColor: '#F43F5E0D',
        borderWidth: 1,
        borderRadius: 16,
        borderColor: '#F43F5E33'
    },
    container: {
        //14
        marginTop: 20,
        marginBottom: 8,
        flexDirection: 'row',
        gap: 10
    },
    title: {
        fontFamily: Fonts.PoppinsSemiBold,
        fontSize: 18,
        color: "#F43F5E"
    },
})