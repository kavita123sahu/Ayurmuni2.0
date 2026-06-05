import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, StatusBar, Platform, KeyboardAvoidingView, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Fonts } from '../../common/Fonts'
import AppInputField from '../../components/AppInputField'
import { Images } from '../../common/Images'
import AppHeader from '../../components/AppHeader'
import SectionHeader from '../../components/SectionHeader'
import { Styles } from '../../common/Styles'
import { Colors } from '../../common/Colors'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as _PATIENT_SERVICES from '../../services/PatientServices'
import { usePatientForm } from '../../hooks/usePatientData'
import {
    Dimensions,
} from 'react-native';

const {
    height: deviceHeight,
} = Dimensions.get('window');

export const GENDER_OPTIONS = [
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
    { label: 'Others', value: 'others' },
];

export const RELATION_OPTIONS = [
    { label: 'Self', value: 'self' },
    { label: 'Spouse', value: 'spouse' },
    { label: 'Father', value: 'father' },
    { label: 'Mother', value: 'mother' },
    { label: 'Child', value: 'child' },
    { label: 'Other', value: 'other' },
];

export const BLOOD_GROUP_OPTIONS = [
    { label: 'A+', value: 'A+' },
    { label: 'A-', value: 'A-' },
    { label: 'B+', value: 'B+' },
    { label: 'B-', value: 'B-' },
    { label: 'AB+', value: 'AB+' },
    { label: 'AB-', value: 'AB-' },
    { label: 'O+', value: 'O+' },
    { label: 'O-', value: 'O-' },
];

export default function AddEditPatientDetail(props: any) {

    const { mode, patientId, } = props.route.params || {};
    const { patientData } = usePatientForm(mode === 'edit' ? patientId : undefined);
    const formatToISODate = (date: string) => {
        // agar already correct hai to return same
        const isoRegex = /^\d{4}-\d{2}-\d{2}$/;

        if (isoRegex.test(date)) return date;

        return null; // invalid
    };

    const [formData, setFormData] =
        useState({
            fullname: '',
            dob: '',
            gender: '',
            bloodG: '',
            height: '',
            weight: '',
            phonenumber: '',
            email: '',
            relation: '',
            profilePicture: '',
            contactName: '',
            emergencyRelation: '',
            EmergencyNO: '',
            insurance: '',
            policyNO: '',
            valid: '',
        });

    const nameParts =
        formData.fullname.trim().split(' ');

    const first_name =
        nameParts[0] || '';

    const last_name =
        nameParts.slice(1).join(' ') || '';

    useEffect(() => {

        if (!patientData) {
            return;
        }

        setFormData({
            fullname:
                `${patientData?.first_name || ''} ${patientData?.last_name || ''}`,

            dob:
                patientData?.dob || '',

            gender:
                patientData?.gender || '',

            bloodG:
                patientData?.blood_group || '',

            height:
                String(patientData?.height || ''),

            weight:
                String(patientData?.weight || ''),

            phonenumber:
                patientData?.phone_number || '',

            email:
                patientData?.email || '',

            relation:
                patientData?.relation || '',

            profilePicture:
                patientData?.profile_picture || '',

            contactName:
                patientData?.emergency_contact_name || '',

            emergencyRelation:
                patientData?.emergency_contact_relation || '',

            EmergencyNO:
                patientData?.emergency_contact_phone || '',

            insurance:
                patientData?.insurance_provider || '',

            policyNO:
                patientData?.insurance_policy_number || '',

            valid:
                patientData?.insurance_valid_thru || '',



        });

    }, [patientData]);


    const validateForm = () => {

        if (!formData.fullname.trim()) {
            return 'Full name is required';
        }

        if (!formData.dob) {
            return 'Date of birth is required';
        }

        if (!formData.gender) {
            return 'Gender is required';
        }

        if (!formData.bloodG) {
            return 'Blood group is required';
        }

        if (!formData.relation) {
            return 'Relation is required';
        }

        if (!formData.height) {
            return 'Height is required';
        }

        if (!formData.weight) {
            return 'Weight is required';
        }

        // if (
        //     !/^\d{12}$/.test(
        //         formData.phonenumber,
        //     )
        // ) {
        //     return 'Phone number must be 10 digits';
        // }

        if (
            !GENDER_OPTIONS.some(
                item => item.value === formData.gender,
            )
        ) {
            return 'Please select valid gender';
        }

        if (
            !RELATION_OPTIONS.some(
                item => item.value === formData.relation,
            )
        ) {
            return 'Please select valid relation';
        }

        if (
            !BLOOD_GROUP_OPTIONS.some(
                item => item.value === formData.bloodG,
            )
        ) {
            return 'Please select valid blood group';
        }
        if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                formData.email,
            )
        ) {
            return 'Invalid email address';
        }

        if (!formData.contactName.trim()) {
            return 'Emergency contact name is required';
        }

        if (!formData.emergencyRelation) {
            return 'Emergency relation is required';
        }

        if (
            !/^\d{10}$/.test(
                formData.EmergencyNO,
            )
        ) {
            return 'Emergency phone must be 10 digits';
        }

        if (!formData.insurance.trim()) {
            return 'Insurance provider is required';
        }

        if (!formData.policyNO.trim()) {
            return 'Policy number is required';
        }

        if (!formData.valid) {
            return 'Insurance validity date is required';
        }

        return null;
    };
    const onSavePatient = async () => {


        if (mode != 'edit') {
            const error = validateForm();

            if (error) {

                Alert.alert('Validation Error', error);
                return;
            }
        }



        const payload = {
            first_name,
            last_name,

            dob: formatToISODate(formData.dob),
            gender: formData.gender,
            blood_group: formData.bloodG,
            relation: formData.relation,

            height: Number(formData.height) || 0,
            weight: Number(formData.weight) || 0,

            phone_number: formData.phonenumber,
            email: formData.email,

            profile_picture: formData.profilePicture,

            emergency_contact_name: formData.contactName,
            emergency_contact_relation: formData.emergencyRelation,
            emergency_contact_phone: formData.EmergencyNO,

            insurance_provider: formData.insurance,
            insurance_policy_number: formData.policyNO,

            insurance_valid_thru: formatToISODate(formData.valid),
        };

        console.log('payload', payload);

        try {

            let response;

            if (mode === 'edit') {
                response = await _PATIENT_SERVICES.updatePatientById(patientId, payload);
            } else {
                response = await _PATIENT_SERVICES.AddNewPatient(payload);
            }

            // ✅ SAFE CHECK (VERY IMPORTANT)
            const apiError = response?.data;

            if (apiError?.error || apiError?.detail || apiError?.message) {
                throw apiError;
            }

            console.log('apiError', apiError);

            props.navigation.goBack();

        } catch (error: any) {

            console.log('API ERROR', error?.response?.data || error);

            const apiError = error?.response?.data;

            if (apiError && typeof apiError === 'object') {

                const formattedErrors = Object.entries(apiError)
                    .map(([key, value]: any) => {

                        const message = Array.isArray(value)
                            ? value.join(', ')
                            : value;

                        return `${key}: ${message}`;
                    })
                    .join('\n');

                Alert.alert(
                    'Fix These Fields',
                    formattedErrors,
                );

            } else {

                Alert.alert(
                    'Error',
                    error?.message || 'Something went wrong',
                );
            }

            return; // ❌ NO GO BACK
        }
    };

    const BottomButton = ({ onPress, title, backgroundColor, borderColor, textColor }: any) => {
        return (
            <TouchableOpacity
                onPress={onPress}
                style={[
                    styles.primaryBtn,
                    {
                        backgroundColor,
                        borderColor,
                    },
                ]}
            >
                <View style={styles.content}>

                    <Text numberOfLines={1} // 👈 NO WRAP
                        adjustsFontSizeToFit style={[styles.primaryText, { color: textColor }]}>
                        {title}
                    </Text>
                </View>
            </TouchableOpacity>
        )
    }



    return (

        <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>

            <StatusBar barStyle={'dark-content'} backgroundColor={'#FFFFFF'} />

            <AppHeader
                title={
                    mode === 'edit'
                        ? 'Edit Patient'
                        : 'Add Patient'
                }
                // title="Patient Details"
                leftIcon={Images.backIcon}
                onLeftPress={() => props.navigation.goBack()}
                rightIcon="search"
                onRightPress={() => console.log('Search clicked')}
            />


            <KeyboardAvoidingView style={{ backgroundColor: '#FDFDFB' }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

                <ScrollView style={{ paddingHorizontal: 22, backgroundColor: '#FDFDFB', marginBottom: 50 }} showsVerticalScrollIndicator={false}>

                    <SectionHeader title="Personal Information" />


                    <AppInputField label="Full Name" placeholder="John Doe" value={formData.fullname} onChangeText={(text: any) => setFormData(prev => ({ ...prev, fullname: text }))} />

                    <AppInputField
                        label="Date of Birth"
                        placeholder="YYYY-MM-DD"
                        value={formData.dob}
                        onChangeText={(text: any) =>
                            setFormData(prev => ({
                                ...prev,
                                dob: text,
                            }))
                        }
                        rightIcon={Images.calender}
                    />



                    <AppInputField
                        label="Gender"
                        value={formData.gender}
                        placeholder="Select Gender"
                        rightIcon={Images.dropdown}
                        options={GENDER_OPTIONS}
                        onSelect={(item: any) =>
                            setFormData(prev => ({
                                ...prev,
                                gender: item.value,
                            }))
                        }
                    />


                    <View style={styles.row}>

                        <AppInputField
                            label="Blood Group"
                            value={formData.bloodG}
                            placeholder="Select Blood Group"
                            rightIcon={Images.dropdown}
                            containerStyle={{
                                flex: 1,
                                marginRight: 8,
                            }}
                            options={BLOOD_GROUP_OPTIONS}
                            onSelect={(item: any) =>
                                setFormData(prev => ({
                                    ...prev,
                                    bloodG: item.value,
                                }))
                            }
                        />

                        <AppInputField
                            label="Relation"
                            value={formData.relation}
                            placeholder="Select Relation"
                            rightIcon={Images.dropdown}
                            containerStyle={{
                                flex: 1,
                                marginLeft: 8,
                            }}
                            options={RELATION_OPTIONS}
                            onSelect={(item: any) =>
                                setFormData(prev => ({
                                    ...prev,
                                    relation: item.value,
                                }))
                            }
                        />

                    </View>
                    {/* Row Inputs */}
                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 8 }}>
                            <AppInputField
                                label="Height (cm)"
                                placeholder="180 cm"
                                value={formData.height}
                                onChangeText={(text: any) =>
                                    setFormData(prev => ({
                                        ...prev,
                                        height: text,
                                    }))
                                }
                            />
                        </View>

                        <View style={{ flex: 1, marginLeft: 8 }}>
                            <AppInputField
                                label="Weight (kg)"
                                placeholder="75 kg"
                                value={formData.weight}
                                onChangeText={(text: any) =>
                                    setFormData(prev => ({
                                        ...prev,
                                        weight: text,
                                    }))
                                }
                            />
                        </View>
                    </View>


                    <SectionHeader title="Contact Information" />

                    <AppInputField
                        label="Phone Number"
                        placeholder="+1 (555) 000-0000"
                        value={formData.phonenumber}
                        keyboardType="number-pad"
                        maxLength={10}
                        onChangeText={(text: any) =>
                            setFormData(prev => ({
                                ...prev,
                                phonenumber: text.replace(
                                    /[^0-9]/g,
                                    '',
                                ),
                            }))
                        }
                        rightIcon={Images.Phone}



                    />

                    <AppInputField
                        label="Email Address"
                        placeholder="john.doe@example.com"
                        value={formData.email}

                        onChangeText={(text: any) => setFormData(prev => ({ ...prev, email: text }))}
                        rightIcon={Images.Email}
                    />

                    <View style={styles.EmergencyView}>

                        <View style={styles.container}>
                            <Image source={Images.logout} style={Styles.IconSize} tintColor={'#F43F5E'} />
                            <Text style={styles.title}>Emergency Contact</Text>
                        </View>


                        <AppInputField label="Contact Name" placeholder="Jane Doe" value={formData.contactName} onChangeText={(text: any) =>
                            setFormData(prev => ({
                                ...prev,
                                contactName: text,
                            }))
                        } />

                        <AppInputField
                            label="Emergency Relation"
                            value={formData.emergencyRelation}
                            placeholder="Select Relation"
                            rightIcon={Images.dropdown}
                            options={RELATION_OPTIONS}
                            onSelect={(item: any) =>
                                setFormData(prev => ({
                                    ...prev,
                                    emergencyRelation:
                                        item.value,
                                }))
                            }
                        />

                        <AppInputField
                            label="Emergency Phone"
                            keyboardType="number-pad"
                            placeholder="+1 (555) 000-0000"
                            rightIcon={Images.Phone}
                            maxLength={10}
                            value={formData.EmergencyNO}
                            onChangeText={(text: any) =>
                                setFormData(prev => ({
                                    ...prev,
                                    EmergencyNO: text.replace(
                                        /[^0-9]/g,
                                        '',
                                    ),
                                }))
                            }
                        />

                    </View>





                    <SectionHeader title="Insurance Details" />

                    <AppInputField value={formData.insurance} onChangeText={(text: any) => setFormData(prev => ({ ...prev, insurance: text }))} label="Insurance Provider" placeholder="Blue Cross Shield" />


                    <AppInputField label="Policy Number" placeholder="POL-987654321" value={formData.policyNO} onChangeText={(text: any) =>
                        setFormData(prev => ({
                            ...prev,
                            policyNO: text,
                        }))
                    } />



                    <AppInputField
                        label="Valid Thru"
                        placeholder="YYYY-MM-DD"
                        value={formData.valid}
                        onChangeText={(text: any) =>
                            setFormData(prev => ({
                                ...prev,
                                valid: text,
                            }))
                        }
                        rightIcon={Images.calender}
                    />


                    <View style={[
                        styles.buttonrow,
                        {
                            paddingBottom:
                                deviceHeight >= 800 ? 40 : 20,
                        },
                    ]}>

                        <BottomButton
                            title="Cancel"
                            icon={Images.shopCart}
                            onPress={() => props.navigation.navigate('MyCart')}
                            backgroundColor="#FFFFFF"
                            borderColor={Colors.borderColor}
                            textColor={Colors.subTextColor}
                        />


                        <BottomButton
                            title={
                                mode === 'edit'
                                    ? 'Update Patient'
                                    : 'Add Patient'
                            }
                            borderColor={
                                Colors.primaryColor
                            }
                            backgroundColor="#0D614E"
                            textColor="#FFFFFF"
                            onPress={onSavePatient}
                        />
                    </View>

                </ScrollView>


            </KeyboardAvoidingView>
        </SafeAreaView>
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
    buttonrow: {
        flexDirection: 'row',
        flex: 1,
        width: '100%',
        marginTop: 20,
        // paddingHorizontal: 20,
        marginBottom: 20,
        justifyContent: 'space-between',
        gap: 10, // spacing between buttons
    },

    primaryBtn: {
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderWidth: 1,
        flex: 1,
        height: 52,
        alignItems: "center",
        justifyContent: "center",
    },

    content: {

        alignItems: "center",
        justifyContent: "center",
    },

    primaryText: {
        marginLeft: 8,
        fontSize: 18,
        fontFamily: Fonts.PoppinsMedium,
        top: 2
    },

    icon: {
        width: 22,
        height: 22,
        resizeMode: "contain",
    },
})