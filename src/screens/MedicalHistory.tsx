import React, {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';

import {
    View,
    Text,
    FlatList,
    ScrollView,
    ActivityIndicator,
    TextInput,
    StatusBar,
    Image,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import * as _ASSESS_SERVICE from '../services/AssesmentService';
import { showSuccessToast } from '../config/Key';

import ProgressBar from '../components/MedicalHistory/ProgressBar';
import OptionCard from '../components/MedicalHistory/OptionCard';
import BasicInfoForm from '../components/MedicalHistory/BasicInfoForm';
import BottomButton from '../components/MedicalHistory/BottomButton';

import {
    styles,
    COLORS,
} from '../components/MedicalHistory/styles/MedicalHistor';
import Header from '../components/MedicalHistory/MedicalHeader';

const MedicalHistory = ({ navigation }: any) => {

    const [questions, setQuestions] = useState<any[]>([]);

    const [step, setStep] = useState(0);

    const [loading, setLoading] = useState(false);

    const [btnLoading, setBtnLoading] =
        useState(false);

    const [selectedAnswers, setSelectedAnswers] =
        useState<any>({});


    const handleBasicInfoChange =
        useCallback(
            (key: string, value: any) => {

                setSelectedAnswers(
                    (prev: any) => ({
                        ...prev,
                        [key]: value,
                    }),
                );
            },
            [],
        );

    /* =========================================================
       GET QUESTIONS
    ========================================================= */

    useEffect(() => {
        getQuestions();
    }, []);

    const getQuestions = async () => {

        try {

            setLoading(true);

            const response: any =
                await _ASSESS_SERVICE.GetQuestionOptions({
                    experience_type:
                        'medical_history',
                });

            const JSONDATA =
                await response.json();

            const fetchedQuestions =
                JSONDATA?.data?.questions || [];

            setQuestions(fetchedQuestions);

            const formattedAnswers: any = {};

            fetchedQuestions.forEach((question: any) => {

                if (
                    question?.answer_type === 'text'
                ) {

                    formattedAnswers[
                        question?.id
                    ] = question?.answer || '';
                }

                if (
                    question?.answer_type === 'choice'
                ) {

                    const selectedChoice =
                        question?.choices?.find(
                            (choice: any) =>
                                choice?.is_selected,
                        );

                    if (selectedChoice) {

                        formattedAnswers[
                            question?.id
                        ] =
                            selectedChoice?.index;
                    }
                }

                if (
                    question?.answer_type ===
                    'multi_choice'
                ) {

                    formattedAnswers[
                        question?.id
                    ] =
                        question?.choices
                            ?.filter(
                                (choice: any) =>
                                    choice?.is_selected,
                            )
                            ?.map(
                                (choice: any) =>
                                    choice?.index,
                            ) || [];
                }

                /*
                HEIGHT WEIGHT
                */

                if (
                    question?.question
                        ?.toLowerCase()
                        ?.includes('height')
                ) {

                    const value =
                        question?.answer || '';

                    const split =
                        value.split(',');

                    formattedAnswers[
                        `${question?.id}_height`
                    ] =
                        split?.[0]
                            ?.replace('cm', '')
                            ?.trim();

                    formattedAnswers[
                        `${question?.id}_weight`
                    ] =
                        split?.[1]
                            ?.replace('kg', '')
                            ?.trim();
                }
            });

            setSelectedAnswers(
                formattedAnswers,
            );

        } catch (error) {

            console.log(error);

        } finally {

            setLoading(false);
        }
    };

    /* =========================================================
       FILTER BASIC INFO QUESTIONS
    ========================================================= */

    const filteredQuestions = useMemo(() => {

        const used = new Set();

        return questions.filter((item: any) => {

            const question =
                item?.question
                    ?.toLowerCase()
                    ?.trim();

            const isBasicInfo =
                question?.includes('age') ||
                question?.includes('gender') ||
                question?.includes('height');

            if (!isBasicInfo) {
                return true;
            }

            if (used.has('basic_info')) {
                return false;
            }

            used.add('basic_info');

            return true;
        });

    }, [questions]);

    /* =========================================================
       CURRENT QUESTION
    ========================================================= */

    const currentQuestion =
        filteredQuestions?.[step];

    /* =========================================================
       BASIC INFO STEP
    ========================================================= */

    const isBasicInfoStep = useMemo(() => {

        const question =
            currentQuestion?.question
                ?.toLowerCase()
                ?.trim();

        return (
            question?.includes('age') ||
            question?.includes('gender') ||
            question?.includes('height')
        );

    }, [currentQuestion]);

    /* =========================================================
       BASIC QUESTIONS
    ========================================================= */

    const ageQuestion = questions.find(
        (item: any) =>
            item?.question
                ?.toLowerCase()
                ?.includes('age'),
    );

    const genderQuestion = questions.find(
        (item: any) =>
            item?.question
                ?.toLowerCase()
                ?.includes('gender'),
    );

    const heightQuestion = questions.find(
        (item: any) =>
            item?.question
                ?.toLowerCase()
                ?.includes('height'),
    );

    /* =========================================================
       PROGRESS
    ========================================================= */

    const progress = useMemo(() => {

        if (!filteredQuestions?.length) {
            return 0;
        }

        return (
            ((step + 1) /
                filteredQuestions.length) *
            100
        );

    }, [step, filteredQuestions]);

    /* =========================================================
       SELECT ANSWER
    ========================================================= */

    const handleSelect = useCallback(
        (choice: any) => {

            /*
            SINGLE CHOICE
            */

            if (
                currentQuestion?.answer_type ===
                'choice'
            ) {

                setSelectedAnswers((prev: any) => ({
                    ...prev,
                    [currentQuestion?.id]:
                        choice?.index,
                }));

                return;
            }

            /*
            MULTI CHOICE
            */

            if (
                currentQuestion?.answer_type ===
                'multi_choice'
            ) {

                setSelectedAnswers((prev: any) => {

                    const oldValues =
                        prev?.[
                        currentQuestion?.id
                        ] || [];

                    const exists =
                        oldValues.includes(
                            choice?.index,
                        );

                    return {
                        ...prev,
                        [currentQuestion?.id]:
                            exists
                                ? oldValues.filter(
                                    (item: number) =>
                                        item !==
                                        choice?.index,
                                )
                                : [
                                    ...oldValues,
                                    choice?.index,
                                ],
                    };
                });
            }
        },
        [currentQuestion],
    );

    /* =========================================================
       RENDER ITEM
    ========================================================= */

    const renderItem = useCallback(
        ({ item }: any) => {

            const selected =
                selectedAnswers?.[
                currentQuestion?.id
                ];

            const active =
                currentQuestion?.answer_type ===
                    'multi_choice'
                    ? selected?.includes?.(
                        item?.index,
                    )
                    : selected === item?.index;

            return (
                <OptionCard
                    item={item}
                     medical={true}
                    active={active}
                    type={
                        currentQuestion?.answer_type
                    }
                    onPress={() =>
                        handleSelect(item)
                    }
                />
            );
        },
        [
            currentQuestion,
            selectedAnswers,
        ],
    );

    /* =========================================================
       BUTTON DISABLED
    ========================================================= */

    const currentSelectedAnswer =
        selectedAnswers?.[
        currentQuestion?.id
        ];

    const isButtonDisabled = useMemo(() => {

        /*
        BASIC INFO VALIDATION
        */

        if (isBasicInfoStep) {

            return (
                !selectedAnswers?.[
                ageQuestion?.id
                ] ||

                selectedAnswers?.[
                genderQuestion?.id
                ] === undefined ||

                !selectedAnswers?.[
                `${heightQuestion?.id}_height`
                ] ||

                !selectedAnswers?.[
                `${heightQuestion?.id}_weight`
                ]
            );
        }

        /*
        TEXT VALIDATION
        */

        if (
            currentQuestion?.answer_type ===
            'text'
        ) {

            return !currentSelectedAnswer
                ?.trim?.();
        }

        /*
        MULTI CHOICE VALIDATION
        */

        if (
            currentQuestion?.answer_type ===
            'multi_choice'
        ) {

            return (
                !Array.isArray(
                    currentSelectedAnswer,
                ) ||

                currentSelectedAnswer
                    .length === 0
            );
        }

        /*
        SINGLE CHOICE VALIDATION
        */

        return (
            currentSelectedAnswer ===
            undefined
        );

    }, [
        selectedAnswers,
        currentQuestion,
        isBasicInfoStep,
    ]);

    /* =========================================================
       SUBMIT ANSWERS
    ========================================================= */

    const getFormattedAnswers = () => {

        const formattedAnswers: any = {
            ...selectedAnswers,
        };

        /*
        HEIGHT + WEIGHT FORMAT
        */

        if (heightQuestion?.id) {

            const height =
                selectedAnswers?.[
                `${heightQuestion?.id}_height`
                ];

            const weight =
                selectedAnswers?.[
                `${heightQuestion?.id}_weight`
                ];

            if (height || weight) {

                formattedAnswers[
                    heightQuestion?.id
                ] =
                    `${height || ''} cm, ${weight || ''
                    } kg`;

                delete formattedAnswers[
                    `${heightQuestion?.id}_height`
                ];

                delete formattedAnswers[
                    `${heightQuestion?.id}_weight`
                ];
            }
        }

        return formattedAnswers;
    };

    const submitAnswer = async () => {

        try {

            const payload = {
                experience_type:
                    'medical_history',

                answers:
                    getFormattedAnswers(),
            };

            console.log(
                'FINAL PAYLOAD =====>',
                JSON.stringify(
                    payload,
                    null,
                    2,
                ),
            );

            const response: any =
                await _ASSESS_SERVICE.QuestionnaireSubmit(
                    payload,
                );

            const JSONDATA =
                await response.json();

            console.log(
                'SUBMIT RESPONSE =====>',
                JSONDATA,
            );

            return JSONDATA?.success;

        } catch (error) {

            console.log(
                'SUBMIT ERROR',
                error,
            );

            return false;
        }
    };

    /* =========================================================
       NEXT
    ========================================================= */

    const handleNext = async () => {

        /*
        VALIDATION FIRST
        */

        if (isButtonDisabled) {

            showSuccessToast(
                'Please complete this step',
                'error',
            );

            return;
        }

        try {

            setBtnLoading(true);

            /*
            API CALL
            */

            const success =
                await submitAnswer();

            /*
            FAIL
            */

            if (!success) {

                showSuccessToast(
                    'Submission Failed',
                    'error',
                );

                return;
            }

            /*
            LAST STEP
            */

            const isLast =
                step ===
                filteredQuestions.length - 1;

            if (isLast) {

                navigation.replace(
                    'AssessmentType',
                    {
                        form: 'medical',
                    },
                );

                return;
            }

            /*
            SUCCESS => NEXT STEP
            */

            setStep(prev => prev + 1);

        } catch (error) {

            console.log(
                'NEXT ERROR',
                error,
            );

        } finally {

            setBtnLoading(false);
        }
    };

    /* =========================================================
       BACK
    ========================================================= */

    const handleBack = () => {

        if (step === 0) {

            navigation.goBack();

            return;
        }

        setStep(prev => prev - 1);
    };

    /* =========================================================
       LOADING
    ========================================================= */

    if (loading) {

        return (
            <View style={styles.loader}>

                <ActivityIndicator
                    size="large"
                    color={COLORS.primary}
                />

            </View>
        );
    }

    if (!currentQuestion) {
        return null;
    }

    /* =========================================================
       UI
    ========================================================= */

    return (
        <SafeAreaView style={styles.safeArea}>

            <StatusBar
                backgroundColor={COLORS.screen}
                barStyle="dark-content"
            />

            <View style={styles.container}>

                {/* HEADER */}

                <Header
                    step={step}
                    total={
                        filteredQuestions.length
                    }
                    onBack={handleBack}
                />

                {/* PROGRESS */}

                <ProgressBar
                    progress={progress}
                />

                {/* BODY */}



                <ScrollView
                    keyboardShouldPersistTaps="always"
                    keyboardDismissMode="none"
                    showsVerticalScrollIndicator={
                        false
                    }
                    contentContainerStyle={{
                        paddingBottom: 140,
                    }}
                >

                    {/* TITLE */}

                    <Text style={styles.title}>

                        {
                            isBasicInfoStep
                                ? 'Please share your basic information'
                                : currentQuestion?.question
                        }

                    </Text>

                    {/* BASIC INFO */}

                    {
                        isBasicInfoStep ? (

                            <BasicInfoForm
                                questions={questions}
                                selectedAnswers={selectedAnswers}
                                onChange={handleBasicInfoChange}
                            />

                        ) : (
                            <>
                                {/* OPTIONS */}

                                {
                                    currentQuestion?.answer_type !==
                                    'text' && (

                                        <FlatList
                                            scrollEnabled={
                                                false
                                            }
                                            data={
                                                currentQuestion?.choices ||
                                                []
                                            }
                                            renderItem={
                                                renderItem
                                            }
                                            keyExtractor={(
                                                item,
                                            ) =>
                                                item?.index?.toString()
                                            }
                                            contentContainerStyle={{
                                                paddingTop: 24,
                                            }}
                                        />
                                    )
                                }

                                {/* TEXT INPUT */}

                                {
                                    currentQuestion?.answer_type ===
                                    'text' && (

                                        <TextInput
                                            multiline
                                            placeholder="Write your answer..."
                                            placeholderTextColor="#94A3B8"
                                            value={
                                                selectedAnswers?.[
                                                currentQuestion?.id
                                                ] || ''
                                            }
                                            onChangeText={(
                                                text,
                                            ) => {

                                                setSelectedAnswers(
                                                    (
                                                        prev: any,
                                                    ) => ({
                                                        ...prev,
                                                        [currentQuestion?.id]:
                                                            text,
                                                    }),
                                                );
                                            }}
                                            style={
                                                styles.input
                                            }
                                        />
                                    )
                                }
                            </>
                        )
                    }


                    <View style={styles.infoCard}>

                        <View style={styles.infoLeft}>

                            <Image source={require('../assets/images/ayurveda.png')} style={{ height: 50, width: 50, }} />


                        </View>

                        <Text style={styles.infoText}>
                           Your information is Confidential and will help
                           us tailor the best wellness plan for you
                        </Text>

                        <Image source={require('../assets/images/ayurvedaLeaf.png')} style={{ height: 30, width: 30, resizeMode: 'contain' }} />


                    </View>
                </ScrollView>



                {/* BUTTON */}


                <BottomButton
                    loading={btnLoading}
                    disabled={isButtonDisabled}
                    onPress={handleNext}
                />


            </View>
        </SafeAreaView>
    );
};

export default MedicalHistory;