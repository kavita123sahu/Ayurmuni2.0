import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    StatusBar,
    Dimensions,
    TextInput,
    Image,
} from 'react-native';

import { Colors } from '../common/Colors';
import { Fonts } from '../common/Fonts';
import { Ionicons } from '../common/Vector';
import * as _ASSESS_SERVICE from '../services/AssesmentService';
import LottieView from 'lottie-react-native';
import { Images } from '../common/Images';

const { width, height } = Dimensions.get('window');
const scale = (size: number) => (width / 375) * size;


const MedicalHistory = (props: any) => {
    const [step, setStep] = useState(0);
    const [questions, setQuestions] = useState<any[]>([]);
    const [answers, setAnswers] = useState<any>({});
    const [selectedChoices, setSelectedChoices] = useState<any>({});
    const [showThankYou, setShowThankYou] = useState(false);
    const [showIntro, setShowIntro] = useState(true);


    useEffect(() => {
        if (showThankYou) {
            const timer = setTimeout(() => {
                props.navigation.replace('HomeStack', { screen: 'Home' });
            }, 1000);

            return () => clearTimeout(timer); // cleanup
        }
    }, [showThankYou]);

    useEffect(() => {
        getQuestions();
    }, [showIntro]);

    const getQuestions = async () => {
        try {
            const res: any = await _ASSESS_SERVICE.GetPatientPersonalization();
            setQuestions(res || []);
            console.log('QUESTIONS', res);
        } catch (e) {
            console.log('API ERROR', e);
        }
    };



    const current = questions[step];


    const progress = step / (questions.length - 1);

    // ✅ AUTO SELECT
    useEffect(() => {
        if (!current) return;

        const selected = current.choices?.filter((c: any) => c.is_selected);

        if (selected?.length) {
            if (current.question_type === 'single') {
                setAnswers((p: any) => ({
                    ...p,
                    [current.id]: selected[0].text,
                }));

                setSelectedChoices((p: any) => ({
                    ...p,
                    [current.id]: [selected[0].id],
                }));
            }

            if (current.question_type === 'multi') {
                setSelectedChoices((p: any) => ({
                    ...p,
                    [current.id]: selected.map((i: any) => i.id),
                }));
            }
        }
    }, [current]);

    // ✅ SELECT HANDLER
    const handleSelect = (item: any) => {
        const type = current.question_type;

        if (type === 'single' || type === 'boolean') {
            setAnswers({ ...answers, [current.id]: item.text });

            setSelectedChoices({
                ...selectedChoices,
                [current.id]: [item.id],
            });
        }

        if (type === 'multi') {
            const prev = selectedChoices[current.id] || [];

            const updated = prev.includes(item.id)
                ? prev.filter((id: any) => id !== item.id)
                : [...prev, item.id];

            setSelectedChoices({
                ...selectedChoices,
                [current.id]: updated,
            });
        }
    };

    // ✅ API CALL
    const submitAnswer = async () => {
        try {
            const payload = {
                answers: [
                    {
                        question_id: current.id,
                        choice_id: selectedChoices[current.id]?.[0] || null,
                        text_answer: answers[current.id] || null,
                    },
                ],
            };

            await _ASSESS_SERVICE.PatientPersonalSubmit(payload);
        } catch (e) {
            console.log('SUBMIT ERROR', e);
        }
    };

    // ✅ NEXT
    const handleNext = async () => {
        await submitAnswer();

        if (step === questions.length - 1) {
            console.log('All steps completed');
            // setShowThankYou(true);
            props.navigation.replace('AssessmentType', { form: 'medical' });
            return;
        }
        console.log('Next Step');

        setStep(step + 1);
    };

    const handleSkip = () => {

        if (step === questions.length - 1) {
            console.log('All steps complete11111111111d');
            // setShowThankYou(true);
            props.navigation.replace('AssessmentType', { form: 'medical' });

            return;
        }

        console.log('SkipppppppppppppppppppppStep');
        setStep(step + 1);
    }


    const handleBack = () => {
        if (step > 0) setStep(step - 1);
    };

    // ✅ OPTIONS UI
    const renderOptions = () => {
        if (!current) return null;

        let options = current.choices;

        // ✅ BOOLEAN UI
        if (current.question_type === 'boolean') {
            return (
                <View style={styles.booleanRow}>
                    {['Yes', 'No'].map((item) => {
                        const active = answers[current.id] === item;

                        return (
                            <TouchableOpacity
                                key={item}
                                style={[styles.booleanBtn, active && styles.activeBoolean]}
                                onPress={() =>
                                    handleSelect({ id: item.toLowerCase(), text: item })
                                }
                            >
                                <Text style={[styles.booleanText, active && { color: '#fff' }]}>
                                    {item}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            );
        }

        // ✅ TEXT INPUT
        if (current.question_type === 'text') {
            return (
                <TextInput
                    placeholder="Type your answer..."
                    style={styles.input}
                    value={answers[current.id]}
                    placeholderTextColor={Colors.placeholderColor}
                    onChangeText={(text) =>
                        setAnswers({ ...answers, [current.id]: text })
                    }
                />
            );
        }

        // ✅ SINGLE + MULTI
        return (
            <>
                {current.question_type === 'multi' && (
                    <Text style={styles.multiHint}>
                        You can select multiple options
                    </Text>
                )}

                {options?.map((item: any, index: number) => {
                    const isActive =
                        current.question_type === 'single'
                            ? answers[current.id] === item.text
                            : selectedChoices[current.id]?.includes(item.id);

                    return (
                        <TouchableOpacity
                            key={index}
                            style={[styles.card, isActive && styles.activeCard]}
                            onPress={() => handleSelect(item)}
                        >
                            <Text
                                style={[styles.text, isActive && styles.activeText]}
                            >
                                {item.text}
                            </Text>

                            {isActive && (
                                <View style={styles.iconContainer}>
                                    <View style={styles.tickCircle}>
                                        <Ionicons
                                            name="checkmark"
                                            size={12}
                                            color={Colors.primaryColor}
                                        />
                                    </View>
                                </View>
                            )}
                        </TouchableOpacity>
                    );
                })}
            </>
        );
    };



    if (showIntro) {
        return (
            <View style={styles.introContainer}>
                <Image source={Images.QnAMain} style={styles.introImage} />

                <Text style={styles.introTitle}>
                    Personalize Your Experience
                </Text>

                <Text style={styles.introSub}>
                    Answer a few questions to help us understand you better
                </Text>

                <TouchableOpacity
                    style={styles.startBtn}
                    onPress={() => setShowIntro(false)}
                >
                    <Text style={styles.startText}>Start</Text>
                </TouchableOpacity>
            </View>
        );
    }


    if (showThankYou) {
        return (
            <View style={styles.thankYouContainer}>
                <LottieView
                    source={require('../assets/animations/thankyou.json')}
                    autoPlay
                    loop
                    style={{ width: 280, height: 280 }}
                />
                <Text style={styles.thankYouTitle}>Thank You 🙏</Text>
            </View>
        );
    }

    if (!current) return null;

    const isDisabled =
        current.question_type === 'multi'
            ? !(selectedChoices[current.id]?.length > 0)
            : !answers[current.id];

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />


            <View style={styles.content}>

                {/* HEADER */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                        <Image source={Images.backIcon} style={styles.backIcon} />
                    </TouchableOpacity>

                    <Text style={styles.headerTitle}>Health Questionnaire </Text>

                    <TouchableOpacity style={styles.skipHeaderBtn} onPress={handleSkip}>
                        <Text style={styles.skipHeaderText}>Skip</Text>
                    </TouchableOpacity>
                </View>

                <>
                    <Text style={styles.stepText}>
                        Step {step + 1} of {questions.length}
                    </Text>

                    <View style={styles.progressContainer}>
                        <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
                    </View>
                </>

                {/* CONTENT */}
                <ScrollView showsVerticalScrollIndicator={false}>
                    <Text style={styles.questionText}>{current.text}</Text>
                    {renderOptions()}
                </ScrollView>

            </View>
            {/* FOOTER */}
            <View style={styles.footer}>
                <TouchableOpacity
                    disabled={isDisabled}
                    style={[styles.button, isDisabled && styles.disabledBtn]}
                    onPress={handleNext}
                >
                    <Text style={styles.buttonText}>Next</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default MedicalHistory;

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
    header: {
        height: height * 0.09,
        alignItems: 'center',
        justifyContent: 'center',
    },



    stepText: {
        marginTop: 10,
        fontSize: scale(14),
        color: '#6B7280',
        fontFamily: Fonts.PoppinsMedium,
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

    questionText: {
        fontSize: 20,
        marginVertical: 10,
        fontFamily: Fonts.PoppinsSemiBold,
    },

    // ✅ CARD UI (FINAL)
    card: {
        minHeight: height * 0.08,
        marginBottom: 12,
        borderWidth: 1,
        borderRadius: 14,
        // alignItems: 'center',
        // alignContent: 'center',
        justifyContent: 'center',
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

        fontFamily: Fonts.PoppinsMedium,
    },

    activeText: {
        color: '#fff',
        fontFamily: Fonts.PoppinsMedium,
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
    introContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 30,
    },

    introImage: {
        width: 180,
        height: 180,
        resizeMode: 'contain',
        marginBottom: 20,
    },

    introTitle: {
        fontSize: scale(22),
        fontFamily: Fonts.PoppinsSemiBold,
        textAlign: 'center',
        color: '#111827',
    },

    introSub: {
        marginTop: 10,
        fontSize: scale(14),
        color: '#6B7280',
        textAlign: 'center',
        fontFamily: Fonts.PoppinsMedium,
    },

    startBtn: {
        marginTop: 30,
        backgroundColor: Colors.questionGreen,
        paddingVertical: 14,
        paddingHorizontal: 20,

        borderRadius: 12,
    },

    startText: {
        color: '#fff',
        fontFamily: Fonts.PoppinsMedium,
    },

    thankYouSub: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 8,
        fontFamily: Fonts.PoppinsMedium,
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

    booleanRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },

    booleanBtn: {
        flex: 1,
        padding: 14,
        borderWidth: 1,
        borderRadius: 12,
        marginHorizontal: 5,
        alignItems: 'center',
        borderColor: '#E5E7EB',
    },


    backButton: {
        position: 'absolute',
        left: 0,
    },

    backIcon: {
        width: 40,
        height: 40,
        resizeMode: 'contain',
    },

    headerTitle: {
        fontSize: scale(18),
        fontFamily: Fonts.PoppinsSemiBold,
        color: '#1A1A1A',
    },

    skipHeaderBtn: {
        position: 'absolute',
        right: 0,
    },

    skipHeaderText: {
        fontSize: scale(15),
        color: Colors.questionGreen,
        fontFamily: Fonts.PoppinsMedium
    },



    activeBoolean: {
        backgroundColor: Colors.questionGreen,
    },

    booleanText: {
        fontFamily: Fonts.PoppinsMedium,
    },

    input: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        padding: 15,
        borderRadius: 12,
        color: '#111827',
        fontFamily: Fonts.PoppinsMedium,
        marginTop: 10,

    },

    multiHint: {
        marginBottom: 10,
        color: '#64748B',
        fontFamily: Fonts.PoppinsMedium,
    },

    footer: {
        paddingHorizontal: width * 0.04,
        paddingBottom: height * 0.03,
        paddingTop: height * 0.02,
    },

    button: {
        backgroundColor: Colors.questionGreen,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },

    disabledBtn: {
        backgroundColor: '#ccc',
    },

    buttonText: {
        color: '#fff',
        fontFamily: Fonts.PoppinsMedium,
    },

    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    thankYou: {
        fontSize: 22,
        fontFamily: Fonts.PoppinsSemiBold,
    },
});