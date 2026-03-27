import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StatusBar,
    StyleSheet,
    SafeAreaView,
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


interface FormData {
    firstName: string;
    lastName: string;
    email: string;
    gender: string;
    profileImage: Asset | null;
    user: string;
}

interface FormErrors {
    firstName: string;
    lastName: string;
    email: string;
    gender: string;
    profileImage: string;
}


const Onboarding = (props: any) => {

    const [isLoading, setIsLoading] = useState(false);
    const [Isloading, setUSERID] = useState('')
    const [formData, setFormData] = useState<FormData>({
        firstName: '',
        lastName: '',
        email: '',
        gender: '',
        profileImage: null,
        user: ''
    });

    const [errors, setErrors] = useState<FormErrors>({
        firstName: '',
        lastName: '',
        email: '',
        gender: '',
        profileImage: ''
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

    const handleAddImage = () => {
        Alert.alert(
            'Select Image',
            'Choose an option to select image',
            [
                {
                    text: 'Camera',
                    onPress: openCamera,
                },
                {
                    text: 'Gallery',
                    onPress: openGallery,
                },
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
            ],
            { cancelable: true }
        );
    };

    const openCamera = () => {
        const options: CameraOptions = {
            mediaType: 'photo',
            includeBase64: false,
            maxHeight: 2000,
            maxWidth: 2000,
            quality: 0.8,
        };

        launchCamera(options, (response: ImagePickerResponse) => {
            if (response.didCancel || response.errorMessage) {
                // showSuccessToast('Camera cancelled or error', 'error');
                return;
            }

            if (response.assets && response.assets[0]) {
                const asset = response.assets[0];
                console.log(asset, 'data');
                setFormData(prev => ({ ...prev, profileImage: asset }));
                showSuccessToast('Photo Captured Successfully', 'success');

                // Clear profile image error if any
                if (errors.profileImage) {
                    setErrors(prev => ({ ...prev, profileImage: '' }));
                }
            }
        });
    };

    const openGallery = () => {
        const options: ImageLibraryOptions = {
            mediaType: 'photo',
            includeBase64: false,
            maxHeight: 2000,
            maxWidth: 2000,
            quality: 0.8,
        };

        launchImageLibrary(options, (response: ImagePickerResponse) => {
            if (response.didCancel || response.errorMessage) {
                showSuccessToast('Gallery cancelled or error', 'error');
                return;
            }

            if (response.assets && response.assets[0]) {
                const asset = response.assets[0];

                setFormData(prev => ({ ...prev, profileImage: asset }));
                showSuccessToast('Photo Selected Successfully', 'success');

                // Clear profile image error if any
                if (errors.profileImage) {
                    setErrors(prev => ({ ...prev, profileImage: '' }));
                }
            }
        });
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
            profileImage: ''
        };

        if (!formData.firstName.trim()) {
            newErrors.firstName = 'First name is required';
            isValid = false;
        }

        if (!formData.lastName.trim()) {
            newErrors.lastName = 'Last name is required';
            isValid = false;
        }

        if (formData.email.trim() && !EmailValidator(formData.email.trim())) {
            newErrors.email = 'Please enter a valid email address';
            isValid = false;
        }

        if (!formData.gender) {
            newErrors.gender = 'Gender is required';
            isValid = false;
        }



        setErrors(newErrors);
        return isValid;
    };



    const handleProcees = async () => {

        if (!validateForm()) return;

        setIsLoading(true);
        const send_data = new FormData();
        send_data.append('user', formData.user);
        send_data.append('first_name', formData.firstName);
        send_data.append('last_name', formData.lastName);
        send_data.append('email', formData.email);
        send_data.append('gender', formData.gender);


        if (formData.profileImage && formData.profileImage.uri) {
            const imageFile = {
                uri: formData.profileImage.uri,
                type: formData.profileImage.type || 'image/jpeg',
                name: formData.profileImage.fileName || `profile_${Date.now()}.jpg`,
            };
            send_data.append('profile_picture', imageFile as any);
        }

        console.log("OnboardingData:", send_data);
        try {

            const response: any = await _AUTH_SERVICES.onBoarding(send_data);
            console.log("Onboarding Response:", response);
            if (!response.ok) {
                setIsLoading(false);
                const errorText = await response.json();
                console.log("Error response:", errorText);
                showSuccessToast(errorText.message, 'error');
                // showSuccessToast(errorText.message, 'error');
                return;
            }

            const jsonResponse = await response.json();
            console.log("Response JSON:", jsonResponse);
            const { data, message = "", status } = jsonResponse;
            console.log("ResponseData:", jsonResponse.data, "Message:", message, "Status:", status);

            if (status === 'success' || response.status === 201) {
                setIsLoading(false);
                Utils.storeData('_TOKEN', jsonResponse?.access);
                Utils.storeData('_USER_INFO', jsonResponse.data);
                // Utils.storeData('_USER_ID', jsonResponse?.data?.user);
                showSuccessToast('Welcome to Ayurmuni', 'success');
                props.navigation.navigate('PatientFAQ');
            } else {
                setIsLoading(false);
                showSuccessToast(message || 'Login failed', 'error');
            }
        } catch (error) {
            setIsLoading(false);
            console.log("Network Error:", error);
            showSuccessToast('Something went wrong', 'error');
        }
    };


   

    const [dob, setDob] = useState({ day: '', month: '', year: '' });

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 30 }}
                    >
                        <View style={styles.content}>

                            {/* HEADER */}
                            <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
                                <Image
                                    source={require('../../assets/images/BackButton.png')}
                                    style={styles.backIcon}
                                />
                            </TouchableOpacity>

                            <Text style={styles.title}>Create Account</Text>
                            <Text style={styles.subtitle}>
                                Join our healthcare community today for better health management.
                            </Text>

                            {/* PROFILE IMAGE */}
                            <View style={styles.imageWrapper}>
                                <TouchableOpacity onPress={handleAddImage}>

                                    <View style={styles.imageCircle}>
                                        {formData.profileImage ? (
                                            <Image
                                                source={{ uri: formData.profileImage.uri }}
                                                style={styles.profileImage}
                                            />
                                        ) : (
                                            
                                            <Image
                                                source={Images.ImageContain}
                                                style={styles.profileImage}
                                            />
                                        )}
                                    </View>

                                </TouchableOpacity>

                                <Text style={styles.uploadText}>Upload Photo</Text>
                            </View>


                            {/* NAME */}

                            <View style={styles.row}>

                                {/* FIRST NAME */}
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
                                </View>

                            </View>

                            {/* GENDER */}
                            <Text style={styles.label}>Gender</Text>

                            <View style={styles.genderRow}>
                                {genderOptions.map((item : any) => (
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
                            <Text style={styles.label}>D.O.B</Text>
                            <View style={styles.row}>
                                <TextInput
                                    placeholder="DD"
                                    placeholderTextColor="#9CA3AF"
                                    value={dob.day}
                                    onChangeText={(t) => setDob({ ...dob, day: t })}
                                    style={[
                                        styles.inputThird,
                                        dob.day && styles.inputFilled
                                    ]}
                                    keyboardType="number-pad"
                                    maxLength={2}
                                />

                                <TextInput
                                    placeholder="MM"
                                    placeholderTextColor="#9CA3AF"
                                    value={dob.month}
                                    onChangeText={(t) => setDob({ ...dob, month: t })}
                                    style={[
                                        styles.inputThird,
                                        dob.month && styles.inputFilled
                                    ]}
                                    keyboardType="number-pad"
                                    maxLength={2}
                                />

                                <TextInput
                                    placeholder="YYYY"
                                    placeholderTextColor="#9CA3AF"
                                    value={dob.year}
                                    onChangeText={(t) => setDob({ ...dob, year: t })}
                                    style={[
                                        styles.inputThird,
                                        dob.year && styles.inputFilled
                                    ]}
                                    keyboardType="number-pad"
                                    maxLength={4}
                                />
                            </View>

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

                        </View>

                        
                        {/* BUTTON */}
                        <View style={styles.bottom}>
                            <CommonButton
                                title="Proceed"
                                onPress={handleProcees}
                                loading={isLoading}
                            />

                            <Text style={styles.loginText}>
                                Already have an account? <Text style={styles.login}>Login</Text>
                            </Text>
                        </View>

                    </ScrollView>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </View>
    );
};

export default Onboarding;


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },

    content: {
        paddingHorizontal: 20,
    },
    cameraImage: {
        width: 14,
        height: 14,
        resizeMode: 'contain',
    },
    cameraFullIcon: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 40,
        height: 40,
        resizeMode: 'contain',
    },

    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 40,
        marginBottom: 10,

    },

    title: {
        fontSize: 30,
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#18181B',
        fontWeight: 700,

    },
    profileImageFull: {
        width: 128,
        height: 128,
        borderRadius: 64,
        resizeMode: 'cover',
    },

    subtitle: {
        fontSize: 16,
        color: '#71717A',
        marginTop: 6,
        marginBottom: 25,
        fontFamily: Fonts.PoppinsRegular,
        lineHeight: 20,
        fontWeight: 400
    },

    imageWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 25,
    },

    imageCircle: {
        width: 138,
        height: 138,
        borderRadius: 64,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
    },

    profileImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    },
    backIcon: {
        width: 44,
        height: 44,

    },

    cameraIcon: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#C7E7DB',
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    inputWrapper: {
        width: '48%',
    },

    uploadText: {
        marginTop: 10,
        fontSize: 14,
        color: '#0D614E',
        fontFamily: Fonts.PoppinsMedium,
    },

    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
        alignItems: 'flex-start',
    },

    inputHalf: {
        width: '100%',
        height: 50,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 12,
        backgroundColor: '#fff',
        fontFamily: Fonts.PoppinsMedium,
        color: '#111827',
    },

    inputThird: {
        width: '30%',
        height: 50,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        textAlign: 'center',
        backgroundColor: '#fff',
        fontFamily: Fonts.PoppinsMedium,
        color: '#111827',
        padding: 0,
    },

    inputFull: {
        height: 50,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 12,
        backgroundColor: '#fff',
        fontFamily: Fonts.PoppinsMedium,
        color: '#111827',
    },

    inputFilled: {
        backgroundColor: '#0D614E0D',
        borderColor: '#0D614E33',
        color: '#0D614E',
    },

    label: {
        fontSize: 13,
        marginBottom: 6,
        color: '#111827',
        fontFamily: Fonts.PoppinsMedium,
    },

    genderRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 15,
    },

    genderBtn: {
        flex: 1,
        height: 45,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },

    genderActive: {
        backgroundColor: '#0D614E0D',
        borderColor: '#0D614E33',
    },

    genderText: {
        color: '#9CA3AF',
        fontFamily: Fonts.PoppinsMedium,
    },

    genderTextActive: {
        color: '#0D614E',
    },

    bottom: {
        paddingHorizontal: 20,
        marginTop: 20,
    },

    button: {
        backgroundColor: '#0D614E',
        height: 52,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },

    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: Fonts.PoppinsSemiBold,
    },

    loginText: {
        textAlign: 'center',
        marginTop: 15,
        color: '#6B7280',
    },

    login: {
        color: '#0D614E',
        fontFamily: Fonts.PoppinsSemiBold,
    },
});