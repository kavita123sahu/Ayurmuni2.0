// import React, { useEffect, useState } from 'react';
// import {
//     View,
//     Text,
//     TouchableOpacity,
//     StyleSheet,
//     ScrollView,
//     StatusBar,
//     Image,
//     Platform
// } from 'react-native';

// import LottieView from 'lottie-react-native';
// import { useNavigation } from '@react-navigation/native';
// import { Colors } from '../common/Colors';
// import { Fonts } from '../common/Fonts';
// import { Ionicons } from '../common/Vector';
// import *as _ASSESS_SERVICE from '../services/AssesmentService';
// import { Images } from '../common/Images';
// import { utils } from 'xlsx';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { Utils } from '../common/Utils';



// type StepType = 'intro' | 'single' | 'thankyou';

// interface StepConfig {
//     type: StepType;
//     question: string;
//     key?: string;
//     options?: any[];
//     conditional?: (answers: any) => boolean;
// }

// const PatientFAQ = (props: any) => {

//     const navigation = useNavigation();

//     const [CUSTOMER_ID, setCUSTOMER_ID] = useState('')


//     useEffect(() => {
//         myFunc()
//     }, [])


//     const myFunc = async () => {
//         const data = await Utils.getData('_USER_INFO');
//         console.log("customeridddd",data?.id);
//         setCUSTOMER_ID(data?.id)

//     };



//     const [step, setStep] = useState(0);
//     const [answers, setAnswers] = useState<any>({});
//     const [selectedChoices, setSelectedChoices] = useState<Record<string, string>>({});
//     const [dynamicSteps, setDynamicSteps] = useState<StepConfig[]>([]);

//     useEffect(() => {
//         getQuestionList();
//     }, []);




//     const getQuestionList = async () => {
//         try {
//             let response: any = await _ASSESS_SERVICE.GetQuestionOptions();

//             const apiSteps: StepConfig[] = response.map((q: any) => ({
//                 type: 'single',
//                 question: q.text,
//                 key: q.id,
//                 conditional: (a: any) => a.knowPrakriti === 'No',
//                 options: q.choices
//             }));

//             setDynamicSteps(apiSteps);

//         } catch (error) {
//             console.log("CATEGORY DATA ERROR:", error);
//         }
//     };

//     const steps: StepConfig[] = [
//         { type: 'intro', question: '' },

//         {
//             type: 'single',
//             question: 'Do you know your Prakriti?',
//             key: 'knowPrakriti',
//             options: ['Yes', 'No']
//         },

//         {
//             type: 'single',
//             question: 'Select your Prakriti',
//             key: 'prakritiType',
//             conditional: (a: any) => a.knowPrakriti === 'Yes',
//             options: [
//                 { id: 'Vata', text: 'Vata' },
//                 { id: 'Pitta', text: 'Pitta' },
//                 { id: 'Kapha', text: 'Kapha' },
//                 { id: 'Vata-Pitta', text: 'Vata-Pitta' },
//                 { id: 'Pitta-Vata', text: 'Pitta-Vata' },
//                 { id: 'Pitta-Kapha', text: 'Pitta-Kapha' },
//                 { id: 'Kapha-Pitta', text: 'Kapha-Pitta' },
//                 { id: 'Vata-Kapha', text: 'Vata-Kapha' },
//                 { id: 'Kapha-Vata', text: 'Kapha-Vata' },
//                 { id: 'Tri-Dosha', text: 'Trihoshaja (Vata Pitta Kapha)' },
//             ]
//         },

//         ...dynamicSteps,

//         { type: 'thankyou', question: '' }
//     ];

//     const visibleSteps = steps.filter(
//         (s) => !s.conditional || s.conditional(answers)
//     );

//     const current = visibleSteps[step];

//     const progress = step / (visibleSteps.length - 1);

//     // ✅ helper (convert ID → lowercase single dosha)
//     const getSingleDosha = (value: string) => {
//         return value.toLowerCase().split(/[-\s]+/)[0];
//     };


//     useEffect(() => {
//         if (current?.type === 'thankyou') {
//             const timer = setTimeout(() => {
//                 props.navigation.replace('HomeStack', { screen: 'Home' });
//             }, 2000);

//             return () => clearTimeout(timer);
//         }
//     }, [current?.type]);

//     const handleNext = async () => {
//         console.log("=======.>", current)

//         // ✅ YES FLOW API
//         if (current.key === 'prakritiType') {

//             const selectedId = selectedChoices['prakritiType'];
//             console.log("=========>  id", selectedId)


//             if (selectedId) {
//                 const payload = {
//                     customer: CUSTOMER_ID,
//                     dominant_dosha: getSingleDosha(selectedId)
//                 };
//                 console.log("========payload", payload)
//                 try {
//                     await _ASSESS_SERVICE.AssesmentYesSubmit(payload);
//                     console.log("YES API:", payload);
//                 } catch (e) {
//                     console.log("YES API ERROR:", e);
//                 }
//             }
//         }

//         // EXISTING NO FLOW
//         if (
//             current.key !== 'knowPrakriti' &&
//             current.key !== 'prakritiType' &&
//             current.type === 'single'
//         ) {
//             const choice_id = selectedChoices[current.key!];

//             if (choice_id) {
//                 const payload = {
//                     customer_id: CUSTOMER_ID,
//                     answers: [
//                         {
//                             question_id: current.key,
//                             choice_id: choice_id,
//                         },
//                     ],
//                 };
//                 console.log("payloaddddd", payload);

//                 try {
//                     const response = await _ASSESS_SERVICE.AssesmentSubmit(payload);

//                     // ✅ yaha pura response print hoga
//                     console.log("APIRESPONSEassessment:", response);

//                 } catch (error) {
//                     // ❌ error bhi properly print hoga
//                     console.log("POST ERROR:", error);
//                 }
//             }
//         }
//         if (current.type === 'thankyou') {
//             props.navigation.replace('HomeStack', { screen: 'Home' });
//             return;
//         }

//         setStep(step + 1);
//     };

//     const handleBack = () => {
//         if (step > 0) setStep(step - 1);
//     };

//     const handleSkip = () => setStep(step + 1);

//     const handleSkipHome = () => {
//         props.navigation.replace('HomeStack', { screen: 'Home' });
//     };

//     const isDisabled =
//         step === 0
//             ? false
//             : current.type === 'single'
//                 ? !answers[current.key!]
//                 : false;

//     return (

//         <View style={styles.container} >

//             <StatusBar barStyle="dark-content" />

//             <ScrollView
//                 contentContainerStyle={{ flexGrow: 1 }}
//                 scrollEnabled={current.key === 'knowPrakriti'}
//             >
//                 <View style={styles.content}>

//                     {/* HEADER */}
//                     {current.type !== 'intro' && (
//                         <View style={styles.header}>
//                             <TouchableOpacity onPress={handleBack} style={styles.backButton}>
//                                 <Image source={Images.backIcon} style={styles.backIcon} />
//                             </TouchableOpacity>

//                             <Text style={styles.headerTitle}>Onboarding</Text>

//                             {current.key !== 'knowPrakriti' && step > 0 && (
//                                 <TouchableOpacity style={styles.skipHeaderBtn} onPress={handleSkip}>
//                                     <Text style={styles.skipHeaderText}>Skip</Text>
//                                 </TouchableOpacity>
//                             )}
//                         </View>
//                     )}

//                     {/* PROGRESS */}
//                     {step > 0 && (
//                         <>
//                             <Text style={styles.stepText}>
//                                 Step {step} of {visibleSteps.length - 1}
//                             </Text>

//                             <View style={styles.progressContainer}>
//                                 <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
//                             </View>
//                         </>
//                     )}

//                     {/* INTRO */}
//                     {step === 0 && (
//                         <View style={styles.introContainer}>
//                             <Image source={Images.QnAMain} style={styles.qnaImage} />
//                             <Text style={styles.title}>
//                                 Your Health, <Text style={styles.greenText}>Simplified</Text>
//                             </Text>
//                             <Text style={styles.subtitle}>
//                                 Discover top-rated doctors and
//                                 authentic medicines delivered right
//                                 to your doorstep
//                             </Text>
//                         </View>
//                     )}

//                     {/* KNOW PRAKRITI */}
//                     {current.key === 'knowPrakriti' && (
//                         <>
//                             <Text style={styles.questionText}>{current.question}</Text>

//                             <Text style={styles.prakritiDesc}>
//                                 Prakriti is your unique, lifelong Ayurvedic blueprint—the birth-given balance of Vata, Pitta, and Kapha that defines your nature.
//                             </Text>

//                             <View style={styles.prakritiRow}>
//                                 {['No', 'Yes'].map((item) => {
//                                     const active = answers.knowPrakriti === item;

//                                     return (
//                                         <TouchableOpacity
//                                             key={item}
//                                             style={[styles.prakritiBtn, active && styles.prakritiBtnActive]}
//                                             onPress={() => setAnswers({ ...answers, knowPrakriti: item })}
//                                         >
//                                             <Text style={[styles.prakritiText, active && styles.prakritiTextActive]}>
//                                                 {item}
//                                             </Text>
//                                         </TouchableOpacity>
//                                     );
//                                 })}
//                             </View>

//                             <Image source={Images.PlusBag} style={styles.prakritiImage} />
//                         </>
//                     )}

//                     {/* OPTIONS */}
//                     {current.type === 'single' && current.key !== 'knowPrakriti' && (
//                         <>
//                             <Text style={styles.questionText}>{current.question}</Text>

//                             <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false}>
//                                 {(current.options as any[])?.map((item: any, index: number) => {

//                                     const text = item.text || item;
//                                     const active = answers[current.key!] === text;

//                                     return (
//                                         <TouchableOpacity
//                                             key={index}
//                                             style={[styles.card, active && styles.activeCard]}
//                                             onPress={() => {
//                                                 setAnswers({ ...answers, [current.key!]: text });

//                                                 if (item.id) {
//                                                     setSelectedChoices((prev) => ({
//                                                         ...prev,
//                                                         [current.key!]: item.id
//                                                     }));
//                                                 }
//                                             }}
//                                         >
//                                             <Text style={[styles.text, active && styles.activeText]}>
//                                                 {text}
//                                             </Text>

//                                             {active && (
//                                                 <View style={styles.iconContainer}>
//                                                     <View style={styles.tickCircle}>
//                                                         <Ionicons name="checkmark" size={13} color={Colors.questionGreen} />
//                                                     </View>
//                                                 </View>
//                                             )}
//                                         </TouchableOpacity>
//                                     );
//                                 })}
//                             </ScrollView>
//                         </>
//                     )}

//                     {/* THANK YOU */}
//                     {current.type === 'thankyou' && (
//                         <View style={styles.thankYouContainer}>
//                             <LottieView
//                                 source={require('../assets/animations/thankyou.json')}
//                                 autoPlay
//                                 loop
//                                 style={{ width: 280, height: 280 }}
//                             />
//                             <Text style={styles.thankYouTitle}>Thank You 🙏</Text>
//                         </View>
//                     )}

//                 </View>
//             </ScrollView>

//             {/* FOOTER */}
//             {current.type !== 'thankyou' && (
//                 <View style={styles.footer}>

//                     <TouchableOpacity
//                         style={[styles.proceedButton, isDisabled && styles.proceedButtonDisabled]}
//                         disabled={isDisabled}
//                         onPress={handleNext}
//                     >
//                         <View style={styles.nextRow}>
//                             <Text style={styles.proceedButtonText}>
//                                 {step === 0 ? 'Continue' : 'Next'}
//                             </Text>
//                             <Image source={Images.NextArrow} style={styles.nextArrow} />
//                         </View>
//                     </TouchableOpacity>

//                     {current.key === 'knowPrakriti' && (
//                         <TouchableOpacity style={styles.bottomSkipBtn} onPress={handleSkipHome}>
//                             <Text style={styles.bottomSkipText}>Skip</Text>
//                         </TouchableOpacity>
//                     )}

//                 </View>
//             )}

//         </View>
//     );
// };

// export default PatientFAQ;

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: '#fff',
//     },

//     content: {
//         flex: 1,
//         paddingHorizontal: 24,
//     },

//     introContainer: {
//         flex: 1,
//         alignItems: 'center',
//         justifyContent: 'center',
//     },

//     qnaImage: {
//         width: 400,
//         height: 400,
//         resizeMode: 'contain',
//         marginBottom: 40,
//     },

//     title: {
//         fontSize: 30,
//         color: '#111827',
//         fontFamily: Fonts.PoppinsSemiBold,
//     },

//     greenText: {
//         color: Colors.questionGreen,
//     },

//     subtitle: {
//         fontSize: 19,
//         color: '#6B7280',
//         textAlign: 'center',
//         marginTop: 10,
//         paddingHorizontal: 30,
//     },

//     questionText: {
//         fontSize: 30,
//         marginVertical: 20,
//         fontFamily: Fonts.PoppinsSemiBold,
//     },

//     header: {
//         height: 70,
//         alignItems: 'center',
//         justifyContent: 'center',
//     },

//     backButton: {
//         position: 'absolute',
//         left: 0,
//     },

//     backIcon: {
//         width: 60,
//         height: 60,
//         resizeMode: 'contain',
//     },

//     headerTitle: {
//         fontSize: 18,
//         fontWeight: '600',
//         color: '#1A1A1A',
//     },

//     skipHeaderBtn: {
//         position: 'absolute',
//         right: 0,
//     },

//     skipHeaderText: {
//         fontSize: 16,
//         color: Colors.questionGreen,
//     },

//     stepText: {
//         marginTop: 10,
//         fontSize: 17,
//         color: '#6B7280',
//     },

//     progressContainer: {
//         height: 6,
//         marginVertical: 10,
//         borderRadius: 50,
//         overflow: 'hidden',
//         backgroundColor: '#E5E7EB',
//     },

//     progressBar: {
//         height: '100%',
//         borderRadius: 50,
//         backgroundColor: Colors.questionGreen,
//     },

//     footer: {
//         padding: 24,
//     },

//     proceedButton: {
//         padding: 16,
//         borderRadius: 16,
//         marginBottom: 10,
//         backgroundColor: Colors.questionGreen,
//     },

//     proceedButtonDisabled: {
//         backgroundColor: '#D1D5DB',
//     },

//     proceedButtonText: {
//         color: '#fff',
//         fontFamily: Fonts.PoppinsMedium,
//     },

//     nextRow: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'center',
//     },

//     nextArrow: {
//         width: 18,
//         height: 18,
//         marginLeft: 5,
//     },

//     bottomSkipBtn: {
//         marginTop: 10,
//         padding: 16,
//         borderWidth: 1,
//         borderRadius: 16,
//         alignItems: 'center',
//         borderColor: '#D1D5DB',
//     },

//     bottomSkipText: {
//         color: Colors.questionGreen,
//         fontFamily: Fonts.PoppinsMedium,
//     },

//     secureText: {
//         marginTop: 10,
//         fontSize: 14,
//         textAlign: 'center',
//         color: '#94A3B8',
//     },

//     prakritiDesc: {
//         fontSize: 16,
//         marginBottom: 20,
//         color: '#64748B',
//     },

//     prakritiRow: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         marginBottom: 20,
//     },

//     prakritiBtn: {
//         flex: 1,
//         marginHorizontal: 5,
//         paddingVertical: 14,
//         borderWidth: 1,
//         borderRadius: 12,
//         alignItems: 'center',
//         borderColor: '#E5E7EB',
//     },

//     prakritiBtnActive: {
//         backgroundColor: Colors.questionGreen,
//     },

//     prakritiText: {
//         color: '#111827',
//     },

//     prakritiTextActive: {
//         color: '#fff',
//     },

//     prakritiImage: {
//         width: 120,
//         height: 120,
//         marginTop: 60,
//         opacity: 0.2,
//         alignSelf: 'center',
//     },

//     thankYouContainer: {
//         flex: 1,
//         alignItems: 'center',
//         justifyContent: 'center',
//     },

//     thankYouTitle: {
//         fontSize: 26,
//         fontFamily: Fonts.PoppinsSemiBold,
//     },

//     card: {
//         minHeight: 60,
//         marginBottom: 12,
//         borderWidth: 1,
//         borderRadius: 14,
//         paddingVertical: 16,
//         paddingHorizontal: 18,
//         paddingRight: 48,
//         backgroundColor: '#fff',
//         borderColor: '#E5E7EB',
//     },

//     activeCard: {
//         backgroundColor: Colors.questionGreen,
//         borderColor: Colors.questionGreen,
//     },

//     text: {
//         fontSize: 15,
//         lineHeight: 20,
//         color: '#111827',
//     },

//     activeText: {
//         color: '#fff',
//     },

//     iconContainer: {
//         position: 'absolute',
//         right: 16,
//         top: 0,
//         bottom: 0,
//         alignItems: 'center',
//         justifyContent: 'center',
//     },

//     tickCircle: {
//         width: 20,
//         height: 20,
//         borderRadius: 20,
//         alignItems: 'center',
//         justifyContent: 'center',
//         backgroundColor: '#F1F5F9',
//     },
// });




import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    StatusBar,
    Image,
    Dimensions
} from 'react-native';

import LottieView from 'lottie-react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../common/Colors';
import { Fonts } from '../common/Fonts';
import { Ionicons } from '../common/Vector';
import *as _ASSESS_SERVICE from '../services/AssesmentService';
import { Images } from '../common/Images';
import { Utils } from '../common/Utils';



type StepType = 'intro' | 'single' | 'thankyou';

interface StepConfig {
    type: StepType;
    question: string;
    key?: string;
    options?: any[];
    conditional?: (answers: any) => boolean;
}

const { width, height } = Dimensions.get('window');

const scale = (size: number) => (width / 375) * size;

const PatientFAQ = (props: any) => {

    const navigation = useNavigation();

    console.log("propscustomer", props)

    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState<any>({});
    const [selectedChoices, setSelectedChoices] = useState<Record<string, string>>({});
    const [dynamicSteps, setDynamicSteps] = useState<StepConfig[]>([]);
    const [CUSTOMER_ID, setCUSTOMER_ID] = useState('')



    useEffect(() => {
        myFunc()
        getQuestionList();
    }, []);



    const myFunc = async () => {
        const data = await Utils.getData('_USER_INFO');
        console.log("customeridddd", data?.id);
        setCUSTOMER_ID(data?.id)

    };





    const getQuestionList = async () => {
        try {
            let response: any = await _ASSESS_SERVICE.GetQuestionOptions();

            const apiSteps: StepConfig[] = response.map((q: any) => ({
                type: 'single',
                question: q.text,
                key: q.id,
                conditional: (a: any) => a.knowPrakriti === 'No',
                options: q.choices
            }));

            setDynamicSteps(apiSteps);

        } catch (error) {
            console.log("CATEGORY DATA ERROR:", error);
        }
    };

    const steps: StepConfig[] = [
        { type: 'intro', question: '' },

        {
            type: 'single',
            question: 'Do you know your Prakriti?',
            key: 'knowPrakriti',
            options: ['Yes', 'No']
        },

        {
            type: 'single',
            question: 'Select your Prakriti',
            key: 'prakritiType',
            conditional: (a: any) => a.knowPrakriti === 'Yes',
            options: [
                { id: 'Vata', text: 'Vata' },
                { id: 'Pitta', text: 'Pitta' },
                { id: 'Kapha', text: 'Kapha' },
                { id: 'Vata-Pitta', text: 'Vata-Pitta' },
                { id: 'Pitta-Vata', text: 'Pitta-Vata' },
                { id: 'Pitta-Kapha', text: 'Pitta-Kapha' },
                { id: 'Kapha-Pitta', text: 'Kapha-Pitta' },
                { id: 'Vata-Kapha', text: 'Vata-Kapha' },
                { id: 'Kapha-Vata', text: 'Kapha-Vata' },
                { id: 'Tri-Dosha', text: 'Trihoshaja (Vata Pitta Kapha)' },
            ]
        },

        ...dynamicSteps,

        { type: 'thankyou', question: '' }
    ];

    const visibleSteps = steps.filter(
        (s) => !s.conditional || s.conditional(answers)
    );

    const current = visibleSteps[step];

    const progress = step / (visibleSteps.length - 1);

    const getSingleDosha = (value: string) => {
        return value.toLowerCase().split(/[-\s]+/)[0];
    };


    useEffect(() => {
        if (current?.type === 'thankyou') {
            const timer = setTimeout(() => {
                props.navigation.replace('HomeStack', { screen: 'Home' });
            }, 2000);

            return () => clearTimeout(timer);
        }
    }, [current?.type]);

    const handleNext = async () => {
        console.log("=======.>", current)

        // ✅ YES FLOW API
        if (current.key === 'prakritiType') {

            const selectedId = selectedChoices['prakritiType'];
            console.log("=========>  id", selectedId)


            if (selectedId) {
                const payload = {
                    customer: CUSTOMER_ID,
                    dominant_dosha: getSingleDosha(selectedId)
                };
                console.log("========payload", payload)
                try {
                    await _ASSESS_SERVICE.AssesmentYesSubmit(payload);
                    console.log("YES API:", payload);
                } catch (e) {
                    console.log("YES API ERROR:", e);
                }
            }
        }

        // EXISTING NO FLOW
        if (
            current.key !== 'knowPrakriti' &&
            current.key !== 'prakritiType' &&
            current.type === 'single'
        ) {
            const choice_id = selectedChoices[current.key!];

            if (choice_id) {
                const payload = {
                    customer_id: CUSTOMER_ID,
                    answers: [
                        {
                            question_id: current.key,
                            choice_id: choice_id,
                        },
                    ],
                };
                console.log("payloaddddd", payload);

                try {
                    const response = await _ASSESS_SERVICE.AssesmentSubmit(payload);

                    // ✅ yaha pura response print hoga
                    console.log("APIRESPONSEassessment:", response);

                } catch (error) {
                    // ❌ error bhi properly print hoga
                    console.log("POST ERROR:", error);
                }
            }
        }
        if (current.type === 'thankyou') {
            props.navigation.replace('HomeStack', { screen: 'Home' });
            return;
        }

        setStep(step + 1);
    };

    const handleBack = () => {
        if (step > 0) setStep(step - 1);
    };

    const handleSkip = () => setStep(step + 1);

    const handleSkipHome = () => {
        props.navigation.replace('HomeStack', { screen: 'Home' });
    };

    const isDisabled =
        step === 0
            ? false
            : current.type === 'single'
                ? !answers[current.key!]
                : false;

    return (

        <View style={styles.container} >

            <StatusBar barStyle="dark-content" />

            <ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                scrollEnabled={current.key === 'knowPrakriti'}
            >
                <View style={styles.content}>

                    {current.type !== 'intro' && (
                        <View style={styles.header}>
                            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                                <Image source={Images.backIcon} style={styles.backIcon} />
                            </TouchableOpacity>

                            <Text style={styles.headerTitle}>Onboarding</Text>

                            {current.key !== 'knowPrakriti' && step > 0 && (
                                <TouchableOpacity style={styles.skipHeaderBtn} onPress={handleSkip}>
                                    <Text style={styles.skipHeaderText}>Skip</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}

                    {step > 0 && (
                        <>
                            <Text style={styles.stepText}>
                                Step {step} of {visibleSteps.length - 1}
                            </Text>

                            <View style={styles.progressContainer}>
                                <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
                            </View>
                        </>
                    )}

                    {step === 0 && (
                        <View style={styles.introContainer}>
                            <Image source={Images.QnAMain} style={styles.qnaImage} />
                            <Text style={styles.title}>
                                Your Health, <Text style={styles.greenText}>Simplified</Text>
                            </Text>
                            <Text style={styles.subtitle}>
                                Discover top-rated doctors and
                                authentic medicines delivered right
                                to your doorstep
                            </Text>
                        </View>
                    )}

                    {current.key === 'knowPrakriti' && (
                        <>
                            <Text style={styles.questionText}>{current.question}</Text>

                            <Text style={styles.prakritiDesc}>
                                Prakriti is your unique, lifelong Ayurvedic blueprint—the birth-given balance of Vata, Pitta, and Kapha that defines your nature.
                            </Text>

                            <View style={styles.prakritiRow}>
                                {['No', 'Yes'].map((item) => {
                                    const active = answers.knowPrakriti === item;

                                    return (
                                        <TouchableOpacity
                                            key={item}
                                            style={[styles.prakritiBtn, active && styles.prakritiBtnActive]}
                                            onPress={() => setAnswers({ ...answers, knowPrakriti: item })}
                                        >
                                            <Text style={[styles.prakritiText, active && styles.prakritiTextActive]}>
                                                {item}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>

                            <Image source={Images.PlusBag} style={styles.prakritiImage} />
                        </>
                    )}

                    {current.type === 'single' && current.key !== 'knowPrakriti' && (
                        <>
                            <Text style={styles.questionText}>{current.question}</Text>

                            <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false}>
                                {(current.options as any[])?.map((item: any, index: number) => {

                                    const text = item.text || item;
                                    const active = answers[current.key!] === text;

                                    return (
                                        <TouchableOpacity
                                            key={index}
                                            style={[styles.card, active && styles.activeCard]}
                                            onPress={() => {
                                                setAnswers({ ...answers, [current.key!]: text });

                                                if (item.id) {
                                                    setSelectedChoices((prev) => ({
                                                        ...prev,
                                                        [current.key!]: item.id
                                                    }));
                                                }
                                            }}
                                        >
                                            <Text style={[styles.text, active && styles.activeText]}>
                                                {text}
                                            </Text>

                                            {active && (
                                                <View style={styles.iconContainer}>
                                                    <View style={styles.tickCircle}>
                                                        <Ionicons name="checkmark" size={13} color={Colors.questionGreen} />
                                                    </View>
                                                </View>
                                            )}
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>
                        </>
                    )}

                    {/* THANK YOU */}
                    {current.type === 'thankyou' && (
                        <View style={styles.thankYouContainer}>
                            <LottieView
                                source={require('../assets/animations/thankyou.json')}
                                autoPlay
                                loop
                                style={{ width: 280, height: 280 }}
                            />
                            <Text style={styles.thankYouTitle}>Thank You 🙏</Text>
                        </View>
                    )}

                </View>
            </ScrollView>

            {/* FOOTER */}
            {current.type !== 'thankyou' && (
                <View style={styles.footer}>

                    <TouchableOpacity
                        style={[styles.proceedButton, isDisabled && styles.proceedButtonDisabled]}
                        disabled={isDisabled}
                        onPress={handleNext}
                    >
                        <View style={styles.nextRow}>
                            <Text style={styles.proceedButtonText}>
                                {step === 0 ? 'Continue' : 'Next'}
                            </Text>
                            <Image source={Images.NextArrow} style={styles.nextArrow} />
                        </View>
                    </TouchableOpacity>

                    {current.key === 'knowPrakriti' && (
                        <TouchableOpacity style={styles.bottomSkipBtn} onPress={handleSkipHome}>
                            <Text style={styles.bottomSkipText}>Skip</Text>
                        </TouchableOpacity>
                    )}

                </View>
            )}

        </View>
    );
};

export default PatientFAQ;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        marginBottom: 20,
        marginTop: 30
    },

    content: {
        flex: 1,
        paddingHorizontal: width * 0.06,
    },

    introContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: height * 0.05,
    },

    qnaImage: {
        width: width * 0.5,
        height: width * 0.5,
        resizeMode: 'contain',
        marginBottom: height * 0.05,
    },

    title: {
        fontSize: scale(28),
        color: '#0F172A',
        fontFamily: Fonts.PoppinsSemiBold,
        textAlign: 'center',
    },

    greenText: {
        color: Colors.questionGreen,
    },

    subtitle: {
        fontSize: scale(15),
        color: '#6B7280',
        textAlign: 'center',
        marginTop: 10,
        paddingHorizontal: width * 0.08,
        lineHeight: scale(22),
    },

    questionText: {
        fontSize: scale(26),
        marginVertical: height * 0.02,
        fontFamily: Fonts.PoppinsSemiBold,
    },

    header: {
        height: height * 0.09,
        alignItems: 'center',
        justifyContent: 'center',
    },

    backButton: {
        position: 'absolute',
        left: 0,
    },

    backIcon: {
        width: width * 0.12,
        height: width * 0.12,
        resizeMode: 'contain',
    },

    headerTitle: {
        fontSize: scale(18),
        fontWeight: '600',
        color: '#1A1A1A',
    },

    skipHeaderBtn: {
        position: 'absolute',
        right: 0,
    },

    skipHeaderText: {
        fontSize: scale(15),
        color: Colors.questionGreen,
    },

    stepText: {
        marginTop: 10,
        fontSize: scale(14),
        color: '#6B7280',
    },

    progressContainer: {
        height: 6,
        marginVertical: 10,
        borderRadius: 50,
        overflow: 'hidden',
        backgroundColor: '#E5E7EB',
    },

    progressBar: {
        height: '100%',
        borderRadius: 50,
        backgroundColor: Colors.questionGreen,
    },

    footer: {
        paddingHorizontal: width * 0.06,
        paddingBottom: height * 0.03,
        paddingTop: height * 0.02,
    },

    proceedButton: {
        paddingVertical: height * 0.02,
        borderRadius: 16,
        marginBottom: 10,
        backgroundColor: Colors.questionGreen,
    },

    proceedButtonDisabled: {
        backgroundColor: '#D1D5DB',
    },

    proceedButtonText: {
        color: '#fff',
        fontSize: scale(16),
        fontFamily: Fonts.PoppinsMedium,
    },

    nextRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },

    nextArrow: {
        width: scale(16),
        height: scale(16),
        marginLeft: 5,
    },

    bottomSkipBtn: {
        marginTop: 10,
        paddingVertical: height * 0.02,
        borderWidth: 1,
        borderRadius: 16,
        alignItems: 'center',
        borderColor: '#D1D5DB',
    },

    bottomSkipText: {
        color: Colors.questionGreen,
        fontSize: scale(15),
        fontFamily: Fonts.PoppinsMedium,
    },

    prakritiDesc: {
        fontSize: scale(14),
        marginBottom: 20,
        color: '#64748B',
        lineHeight: scale(20),
    },

    prakritiRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },

    prakritiBtn: {
        flex: 1,
        marginHorizontal: 5,
        paddingVertical: height * 0.018,
        borderWidth: 1,
        borderRadius: 12,
        alignItems: 'center',
        borderColor: '#E5E7EB',
    },

    prakritiBtnActive: {
        backgroundColor: Colors.questionGreen,
    },

    prakritiText: {
        fontSize: scale(14),
        color: '#111827',
    },

    prakritiTextActive: {
        color: '#fff',
    },

    prakritiImage: {
        width: width * 0.3,
        height: width * 0.3,
        marginTop: height * 0.06,
        opacity: 0.2,
        alignSelf: 'center',
    },

    thankYouContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },

    thankYouTitle: {
        fontSize: scale(24),
        fontFamily: Fonts.PoppinsSemiBold,
    },

    card: {
        minHeight: height * 0.08,
        marginBottom: 12,
        borderWidth: 1,
        borderRadius: 14,
        paddingVertical: height * 0.02,
        paddingHorizontal: width * 0.05,
        paddingRight: 48,
        backgroundColor: '#fff',
        borderColor: '#E5E7EB',
    },

    activeCard: {
        backgroundColor: Colors.questionGreen,
        borderColor: Colors.questionGreen,
    },

    text: {
        fontSize: scale(14),
        lineHeight: scale(20),
        color: '#111827',
    },

    activeText: {
        color: '#fff',
    },

    iconContainer: {
        position: 'absolute',
        right: 16,
        top: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
    },

    tickCircle: {
        width: scale(20),
        height: scale(20),
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F1F5F9',
    },
});