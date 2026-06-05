import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StatusBar,
    StyleSheet,
    Alert,
    Image,
    Platform,
    ScrollView,
    ActivityIndicator,
    Keyboard,
    TouchableWithoutFeedback,
    KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '../../common/Vector';
import { Colors } from '../../common/Colors';
import LinearGradient from 'react-native-linear-gradient';
import { Fonts } from '../../common/Fonts';
import * as _AUTH_SERVICES from '../../services/AuthService';
import { showSuccessToast } from '../../config/Key';
import { Utils } from '../../common/Utils';
import { launchImageLibrary, launchCamera, MediaType, ImagePickerResponse, ImageLibraryOptions, CameraOptions, Asset } from 'react-native-image-picker';
import { EmailValidator } from '../../common/Validator';
import { RouteProp, useIsFocused, useRoute } from '@react-navigation/native';
import { genderOptions } from '../../common/DataInterface';
import CommonButton from '../../components/CommonButton';
import { Images } from '../../common/Images';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as _PROFILE_SERVICE from '../../services/ProfileServices';
import { showImagePicker } from '../../hooks/ImagePickerUtils';


interface FormData {
    firstName: string;
    lastName: string;
    email: string;
    profileImageUrl: string;

    gender: string;
    profileImage: Asset | null;
    user: string;
}

interface FormErrors {
    firstName: string;
    lastName: string;
    email: string;
    gender: string;
    dob: string;
    // profileImage: string;
}


const Onboarding = (props: any) => {

    const [isLoading, setIsLoading] = useState(false);

    const [isLoadingImage, setImageloding] = useState(false);
    const [Isloading, setUSERID] = useState('');
    const dayRef = useRef<TextInput>(null);
    const monthRef = useRef<TextInput>(null);
    const yearRef = useRef<TextInput>(null);

    const [formData, setFormData] = useState<FormData>({
        firstName: '',
        lastName: '',
        email: '',
        gender: '',
        profileImageUrl: '',
        profileImage: null,
        user: ''
    });


    const [errors, setErrors] = useState<FormErrors>({
        firstName: '',
        lastName: '',
        email: '',
        gender: '',
        dob: '',
        // profileImage: ''
    });

    const isFocused = useIsFocused();

    useEffect(() => {
        getUser();
    }, [isFocused]);


    const getUser = async () => {
        try {
            const user_id = await Utils.getData('_USER_ID');
            setFormData(prev => ({ ...prev, user: user_id }));
        } catch (error) {
            console.log(error);
        }
    };

    const handleBack = () => {
        props.navigation.goBack();
        console.log('Back pressed');
    };



    const uploadProfileImage = async (
        image: Asset
    ) => {

        setImageloding(true)
        try {

            const formDataImage =
                new FormData();

            formDataImage.append(
                'image',
                {
                    uri: image?.uri,
                    type:
                        image?.type ||
                        'image/jpeg',
                    name:
                        image?.fileName ||
                        `profile_${Date.now()}.jpg`,
                } as any
            );
            formDataImage.append('dir', 'customer_avatar')

            const hasExistingImage =
                !!formData?.profileImageUrl;

            const res: any =
                await _PROFILE_SERVICE.UploadProfilePhoto(
                    formDataImage,
                    // hasExistingImage
                    //     ? 'PUT'
                    //     : 'POST'
                );

            console.log(
                'PROFILE IMAGE RESPONSE ===>',
                res
            );


            /*
            ===================================
            SUCCESS
            ===================================
            */

            if (res?.success) {

                /*
                API IMAGE URL
                */

                const uploadedImageUrl =
                    res?.data?.profile_picture ||
                    res?.data?.image ||
                    res?.data?.url ||
                    '';

                setImageloding(false)
                setFormData(prev => ({
                    ...prev,

                    // LOCAL IMAGE
                    profileImage: image,

                    // SERVER IMAGE URL
                    profileImageUrl:
                        uploadedImageUrl,
                }));

                console.log(
                    'UPLOADED IMAGE URL ===>',
                    uploadedImageUrl
                );

                showSuccessToast(
                    res?.message ||
                    'Profile image uploaded',
                    'success'
                );

                return;
            }

            /*
            ERROR
            */

            setImageloding(false)
            showSuccessToast(
                res?.message ||
                'Upload failed',
                'error'
            );

        } catch (error) {

            console.log(
                'PROFILE IMAGE ERROR ===>',
                error
            );
            setImageloding(false)
            showSuccessToast(
                'Something went wrong',
                'error'
            );
        }
    };



    const handleAddImage = () => {
        showImagePicker(
            uploadProfileImage,
        );
    };




    const handleFieldChange = (field: keyof FormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        if (errors[field as keyof FormErrors]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };


    const validateForm = () => {

        let isValid = true;

        const newErrors: FormErrors = {
            firstName: '',
            lastName: '',
            email: '',
            gender: '',
            dob: '',
        };

        // FIRST NAME
        if (!formData.firstName.trim()) {
            newErrors.firstName = 'First name is required';
            isValid = false;
        }

        // LAST NAME
        if (!formData.lastName.trim()) {
            newErrors.lastName = 'Last name is required';
            isValid = false;
        }

        // EMAIL
        if (!formData.email.trim()) {

            newErrors.email = 'Email is required';
            isValid = false;

        } else if (!EmailValidator(formData.email.trim())) {

            newErrors.email = 'Please enter a valid email address';
            isValid = false;
        }

        // GENDER
        if (!formData.gender) {
            newErrors.gender = 'Gender is required';
            isValid = false;
        }

        // DOB VALIDATION
        const day = Number(dob.day);
        const month = Number(dob.month);
        const year = Number(dob.year);

        // EMPTY CHECK
        if (!day || !month || !year) {

            newErrors.dob = 'Date of birth is required';
            isValid = false;

        } else {

            // CREATE DATE
            const enteredDate = new Date(year, month - 1, day);
            const today = new Date();

            // VALID DATE CHECK
            const isRealDate =
                enteredDate.getFullYear() === year &&
                enteredDate.getMonth() === month - 1 &&
                enteredDate.getDate() === day;

            if (!isRealDate) {

                newErrors.dob = 'Please enter a valid date';
                isValid = false;

            } else if (enteredDate > today) {

                // FUTURE DATE BLOCK
                newErrors.dob = 'Future date is not allowed';
                isValid = false;

            } else {

                // AGE CHECK
                let age = today.getFullYear() - year;

                const monthDiff = today.getMonth() - (month - 1);

                if (
                    monthDiff < 0 ||
                    (monthDiff === 0 && today.getDate() < day)
                ) {
                    age--;
                }

                if (age < 1) {

                    newErrors.dob = 'Please enter a valid age';
                    isValid = false;
                }
            }
        }

        setErrors(newErrors);

        return isValid;
    };

    const handleProcees = async () => {

        // ✅ VALIDATION
        if (!validateForm()) {
            return;
        }

        try {

            setIsLoading(true);

            const send_data = {
                first_name: formData.firstName.trim(),
                last_name: formData.lastName.trim(),
                email: formData.email.trim(),
                profile_picture:
                    formData.profileImageUrl,
                gender: formData.gender,
                date_of_birth: `${dob.year}-${dob.month}-${dob.day}`,
            };

            console.log(
                'IMAGE URL ===>',
                formData.profileImageUrl
            );

            console.log('OnboardingData:', send_data);

            // ✅ API CALL
            const response: any =
                await _AUTH_SERVICES.onBoarding(send_data);

            console.log('Onboarding Response:', response);


            // ===================================================
            // ✅ SUCCESS
            // ===================================================

            if (response?.success) {

                // STORE USER
                await Utils.storeData(
                    '_USER_INFO',
                    response?.data
                );

                showSuccessToast(
                    response?.message || 'Welcome to Ayurmuni',
                    'success'
                );

                props.navigation.replace('AssessmentType', {
                    form: 'all',
                });
                setIsLoading(false);
                return;
            }

            // ===================================================
            // ✅ API ERROR
            // ===================================================

            showSuccessToast(
                response?.message ||
                'Something went wrong',
                'error'
            );

        } catch (error: any) {
            setIsLoading(false);
            console.log('Network Error:', error);

            showSuccessToast(
                'Network error, please try again',
                'error'
            );

        } finally {

            setIsLoading(false);
        }
    };


    const [dob, setDob] = useState({ day: '', month: '', year: '' });

    return (

        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >

                <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
                    <Image
                        source={Images.backIcon}
                        style={styles.backIcon}
                    />
                </TouchableOpacity>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <ScrollView
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.scrollContent}
                    >
                        <View style={styles.content}>

                            {/* HEADER */}

                            <Text style={styles.title}>Create Account</Text>
                            <Text style={styles.subtitle}>
                                Join our healthcare community today for better health management.
                            </Text>

                            {/* PROFILE IMAGE */}
                            <View style={styles.imageWrapper}>
                                <TouchableOpacity onPress={handleAddImage}>

                                    <View style={styles.profileContainer}>

                                        {/* BIG LIGHT CIRCLE */}


                                        <View style={styles.bigCircle}>
                                            {isLoadingImage ? (
                                                <ActivityIndicator size="small" />
                                            ) : formData?.profileImage?.uri ? (
                                                <Image
                                                    source={{
                                                        uri: formData.profileImage.uri,
                                                    }}
                                                    style={styles.profileImage}
                                                />
                                            ) : (
                                                <View style={styles.placeholderContainer}>
                                                    <Text style={styles.placeholderText}>
                                                        {formData?.firstName
                                                            ? formData.firstName
                                                                .charAt(0)
                                                                .toUpperCase()
                                                            : ''}
                                                    </Text>
                                                </View>
                                            )}
                                        </View>

                                        {/* SMALL GREEN CIRCLE */}
                                        <TouchableOpacity style={styles.smallCircle} onPress={handleAddImage}>
                                            <Image
                                                source={Images.calender}
                                                style={styles.cameraImage}
                                            />
                                        </TouchableOpacity>

                                    </View>

                                </TouchableOpacity>

                                <Text style={styles.uploadText}>Upload Photo</Text>
                            </View>

                            <View style={styles.row}>

                                <View style={styles.inputWrapper}>
                                    <Text style={styles.label}>First Name</Text>
                                    <TextInput
                                        placeholder="ABC"
                                        placeholderTextColor="#9CA3AF"
                                        value={formData.firstName}
                                        onChangeText={(t) => handleFieldChange('firstName', t)}
                                        style={[
                                            styles.inputHalf,
                                            formData.firstName && styles.inputFilled
                                        ]}
                                    />

                                    <Text style={styles.errorText}>{errors.firstName}</Text>

                                </View>

                                {/* LAST NAME */}
                                <View style={styles.inputWrapper}>
                                    <Text style={styles.label}>Last Name</Text>
                                    <TextInput
                                        placeholder="XYZ"
                                        placeholderTextColor="#9CA3AF"
                                        value={formData.lastName}
                                        onChangeText={(t) => handleFieldChange('lastName', t)}
                                        style={[
                                            styles.inputHalf,
                                            formData.lastName && styles.inputFilled
                                        ]}
                                    />
                                    <Text style={styles.errorText}>{errors.lastName}</Text>

                                </View>

                            </View>

                            {/* GENDER */}
                            <Text style={styles.label}>Gender</Text>

                            <View style={styles.genderRow}>
                                {genderOptions.map((item: any) => (
                                    <TouchableOpacity
                                        key={item.id}
                                        onPress={() => handleFieldChange('gender', item.value)}
                                        style={[
                                            styles.genderBtn,
                                            formData.gender === item.value && styles.genderActive,
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.genderText,
                                                formData.gender === item.value && styles.genderTextActive
                                            ]}
                                        >
                                            {item.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}

                            </View>

                            {/* DOB */}
                            <Text style={styles.label}>Date of Birth</Text>

                            <View style={styles.dobContainer}>

                                {/* DAY */}

                                <TextInput
                                    ref={dayRef}
                                    placeholder="DD"
                                    placeholderTextColor="#9CA3AF"
                                    value={dob.day}
                                    keyboardType="number-pad"
                                    maxLength={2}
                                    style={[
                                        styles.dobInput,
                                        dob.day && styles.inputFilled,
                                    ]}
                                    onChangeText={(t) => {

                                        const value = t.replace(/[^0-9]/g, '');

                                        setDob({
                                            ...dob,
                                            day: value,
                                        });

                                        // AUTO NEXT
                                        if (value.length === 2) {
                                            monthRef.current?.focus();
                                        }
                                    }}
                                    onKeyPress={({ nativeEvent }) => {

                                        // BACK TO PREVIOUS
                                        if (
                                            nativeEvent.key === 'Backspace' &&
                                            dob.day.length === 0
                                        ) {
                                            dayRef.current?.blur();
                                        }
                                    }}
                                />

                                {/* MONTH */}

                                <TextInput
                                    ref={monthRef}
                                    placeholder="MM"
                                    placeholderTextColor="#9CA3AF"
                                    value={dob.month}
                                    keyboardType="number-pad"
                                    maxLength={2}
                                    style={[
                                        styles.dobInput,
                                        dob.month && styles.inputFilled,
                                    ]}
                                    onChangeText={(t) => {

                                        const value = t.replace(/[^0-9]/g, '');

                                        setDob({
                                            ...dob,
                                            month: value,
                                        });

                                        // AUTO NEXT
                                        if (value.length === 2) {
                                            yearRef.current?.focus();
                                        }
                                    }}
                                    onKeyPress={({ nativeEvent }) => {

                                        // BACK TO DAY
                                        if (
                                            nativeEvent.key === 'Backspace' &&
                                            dob.month.length === 0
                                        ) {
                                            dayRef.current?.focus();
                                        }
                                    }}
                                />

                                {/* YEAR */}

                                <TextInput
                                    ref={yearRef}
                                    placeholder="YYYY"
                                    placeholderTextColor="#9CA3AF"
                                    value={dob.year}
                                    keyboardType="number-pad"
                                    maxLength={4}
                                    style={[
                                        styles.dobInput,
                                        styles.dobYearInput,
                                        dob.year && styles.inputFilled,
                                    ]}
                                    onChangeText={(t) => {

                                        const value = t.replace(/[^0-9]/g, '');

                                        setDob({
                                            ...dob,
                                            year: value,
                                        });
                                    }}
                                    onKeyPress={({ nativeEvent }) => {

                                        // BACK TO MONTH
                                        if (
                                            nativeEvent.key === 'Backspace' &&
                                            dob.year.length === 0
                                        ) {
                                            monthRef.current?.focus();
                                        }
                                    }}
                                />

                            </View>

                            <Text style={[styles.errorText, { top: -15 }]}>{errors.dob}</Text>

                            {/* EMAIL */}
                            <Text style={styles.label}>Email Address</Text>
                            <TextInput
                                placeholder="email@gmail.com"
                                placeholderTextColor="#9CA3AF"
                                value={formData.email}
                                onChangeText={(t) => handleFieldChange('email', t)}
                                style={[
                                    styles.inputFull,
                                    formData.email && styles.inputFilled
                                ]}
                            />
                            <Text style={styles.errorText}>{errors.email}</Text>
                        </View>


                        {/* BUTTON */}
                        <View style={styles.bottom}>
                            <CommonButton
                                title="Proceed"
                                onPress={handleProcees}
                                loading={isLoading}
                            />
                        </View>

                    </ScrollView>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default Onboarding;


const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
        backgroundColor: '#F8FAFC',
    },

    keyboardContainer: {
        flex: 1,
    },

    scrollContent: {
        flexGrow: 1,
        // paddingBottom: 40,
    },

    content: {
        // paddingHorizontal: 20,
        // paddingTop: Platform.OS === 'android' ? 10 : 0,
    },

    /* ---------------- HEADER ---------------- */

    backBtn: {
        width: 46,
        height: 46,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: Platform.OS === 'android' ? 18 : 10,
        marginBottom: 18,
        backgroundColor: '#FFFFFF',
        alignSelf: 'flex-start',
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 8,
        shadowOffset: {
            width: 0,
            height: 3,
        },
    },

    backIcon: {
        width: 46,
        height: 46,
        resizeMode: 'contain',
    },

    title: {
        fontSize: 30,
        color: '#111827',
        fontFamily: Fonts.PoppinsSemiBold,
        lineHeight: 40,
    },

    subtitle: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 8,
        lineHeight: 22,
        fontFamily: Fonts.PoppinsRegular,
        marginBottom: 30,
        paddingRight: 10,
    },

    /* ---------------- PROFILE IMAGE ---------------- */

    imageWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 28,
    },

    profileContainer: {
        width: 150,
        height: 150,
        justifyContent: 'center',
        alignItems: 'center',
    },

    bigCircle: {
        width: 145,
        height: 145,
        borderRadius: 999,
        backgroundColor: '#0D614E12',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#0D614E15',
    },

    profileImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },

    placeholderContainer: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0D614E15',
    },

    placeholderText: {
        fontSize: 42,
        color: Colors.primaryColor,
        fontFamily: Fonts.PoppinsSemiBold,
    },

    smallCircle: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        width: 42,
        height: 42,
        borderRadius: 999,
        backgroundColor: Colors.primaryColor,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 8,
        shadowOffset: {
            width: 0,
            height: 3,
        },
    },

    cameraImage: {
        width: 18,
        height: 18,
        resizeMode: 'contain',
        tintColor: '#FFFFFF',
    },

    uploadText: {
        marginTop: 14,
        fontSize: 15,
        color: Colors.primaryColor,
        fontFamily: Fonts.PoppinsMedium,
    },

    /* ---------------- FORM ---------------- */

    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
        marginBottom: 18,
    },

    inputWrapper: {
        flex: 1,
    },

    label: {
        fontSize: 14,
        color: '#111827',
        marginBottom: 8,
        fontFamily: Fonts.PoppinsMedium,
    },

    inputHalf: {
        height: 54,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 16,
        paddingHorizontal: 16,
        backgroundColor: '#FFFFFF',
        color: '#111827',
        fontSize: 14,
        fontFamily: Fonts.PoppinsMedium,
    },

    inputFull: {
        width: '100%',
        height: 54,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 16,
        paddingHorizontal: 16,
        backgroundColor: '#FFFFFF',
        color: '#111827',
        fontSize: 14,
        fontFamily: Fonts.PoppinsMedium,
    },

    inputFilled: {
        backgroundColor: '#0D614E08',
        borderColor: '#0D614E55',
        color: '#0D614E',
    },

    /* ---------------- GENDER ---------------- */

    genderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
        marginBottom: 20,
    },

    genderBtn: {
        flex: 1,
        minHeight: 50,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 12,
    },

    genderActive: {
        backgroundColor: '#0D614E10',
        borderColor: '#0D614E',
    },

    genderText: {
        fontSize: 14,
        color: '#6B7280',
        fontFamily: Fonts.PoppinsMedium,
        textAlign: 'center',
    },

    genderTextActive: {
        color: '#0D614E',
    },

    /* ---------------- DOB ---------------- */

    dobContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
        marginBottom: 18,
    },

    dobInput: {
        // flex: 1,
        // height: 54,
        // borderWidth: 1,
        // borderColor: '#E5E7EB',
        // borderRadius: 16,
        // backgroundColor: '#FFFFFF',
        // textAlign: 'center',
        // color: '#111827',
        // fontSize: 14,
        // fontFamily: Fonts.PoppinsSemiBold,
        // paddingHorizontal: 10,


        width: '30%',
        height: 50,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        backgroundColor: '#fff',

        // ✅ MAIN FIX
        textAlign: 'center',
        textAlignVertical: 'center', // Android fix

        fontFamily: Fonts.PoppinsMedium,
        color: '#111827',

        paddingVertical: 0,
        paddingHorizontal: 0,

    },

    dobYearInput: {
        flex: 1.3,
        width: '34%',
    },

    /* ---------------- ERROR ---------------- */

    errorText: {
        color: '#EF4444',
        fontSize: 12,
        marginTop: 6,
        marginLeft: 2,
        fontFamily: Fonts.PoppinsMedium,
    },

    /* ---------------- BUTTON ---------------- */

    bottom: {
        // paddingHorizontal: 20,
        marginTop: 26,
    },

    button: {
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },

    gradientBtn: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 16,
    },

    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontFamily: Fonts.PoppinsSemiBold,
    },

    /* ---------------- EXTRA ---------------- */

    loader: {
        marginTop: 5,
    },
});