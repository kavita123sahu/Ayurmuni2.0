import React, {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';

import {
    View,
    Text,
    ScrollView,
    StatusBar,
    ActivityIndicator,
    FlatList,
    Image,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import * as _ASSESS_SERVICE from '../services/AssesmentService';

import { Utils } from '../common/Utils';

import { showSuccessToast } from '../config/Key';

import ProgressBar from '../components/MedicalHistory/ProgressBar';
import OptionCard from '../components/MedicalHistory/OptionCard';
import BottomButton from '../components/MedicalHistory/BottomButton';

import {
    styles,
    COLORS,
} from '../components/MedicalHistory/styles/MedicalHistor';
import Header from '../components/MedicalHistory/MedicalHeader';
import { Ionicons } from '../common/Vector';

const PatientFAQ = ({ navigation }: any) => {

    const [step, setStep] = useState(0);

    const [answers, setAnswers] =
        useState<any>({});

    const [steps, setSteps] =
        useState<any[]>([]);

    const [loading, setLoading] =
        useState(false);

    const [customerId, setCustomerId] =
        useState('');

    /* ===================================================== */

    useEffect(() => {
        init();
    }, []);

    /* ===================================================== */

    const init = async () => {

        try {

            const id =
                await Utils.getData(
                    '_CUSTOMER_ID',
                );

            setCustomerId(id);

            setSteps([
                {
                    key: 'knowPrakriti',

                    question:
                        'Do you know your Prakriti?',

                    answer_type: 'choice',

                    choices: [
                        {
                            index: 'No',
                            value: 'No',
                        },
                        {
                            index: 'Yes',
                            value: 'Yes',
                        },
                    ],
                },
            ]);

        } catch (error) {
            console.log(error);
        }
    };

    /* ===================================================== */

    const currentQuestion =
        steps?.[step];

    /* ===================================================== */

    const progress = useMemo(() => {

        if (!steps?.length) {
            return 0;
        }

        return (
            ((step + 1) /
                steps.length) *
            100
        );

    }, [step, steps]);

    /* ===================================================== */

    const handleKnowPrakritiSelection =
        async (value: string) => {

            setAnswers((prev: any) => ({
                ...prev,
                knowPrakriti: value,
            }));

            try {

                setLoading(true);

                /*
                    YES
                */

                if (value === 'Yes') {

                    const response: any =
                        await _ASSESS_SERVICE.KnowPrakritiSubmit(
                            {
                                does_know_prakriti:
                                    true,
                            },
                        );

                    console.log("prakritiresponse", response)
                   
                    const options =
                        response?.data
                            ?.prakriti_result_options ||
                        [];

                    setSteps([
                        {
                            key: 'knowPrakriti',

                            question:
                                'Do you know your Prakriti?',

                            answer_type:
                                'choice',

                            choices: [
                                {
                                    index: 'No',
                                    value: 'No',
                                },
                                {
                                    index: 'Yes',
                                    value: 'Yes',
                                },
                            ],
                        },

                        {
                            key: 'prakritiType',

                            question:
                                'Select your Prakriti',

                            answer_type:
                                'choice',

                            choices:
                                options.map(
                                    (
                                        item: string,
                                    ) => ({
                                        index:
                                            item,
                                        value:
                                            item,
                                    }),
                                ),
                        },
                    ]);

                    setStep(1);

                    return;
                }

                /*
                    NO
                */

                const response: any =
                    await _ASSESS_SERVICE.GetQuestionOptions(
                        {
                            experience_type:
                                'prakriti',
                        },
                    );

                // const JSONDATA = await response.json();

                console.log(
                    'PRATIKRIQUESTION ===>',
                    response,
                );
                const questions =
                    response?.data?.questions || [];

                console.log("qustionnn", questions);

                const formattedQuestions =
                    questions.map((item: any) => ({
                        id: item?.id,

                        key: String(item?.id),

                        question: item?.question,

                        answer_type: item?.answer_type,

                        choices: item?.choices || [],
                    }));

                /*
                    PREFILLED ANSWERS
                */

                const prefilledAnswers =
                    getPrefilledAnswers(questions);

                setAnswers((prev: any) => ({
                    ...prev,
                    ...prefilledAnswers,
                }));

                setSteps(prev => [
                    prev[0],
                    ...formattedQuestions,
                ]);

                setStep(1);

            } catch (error) {

                console.log(error);

                showSuccessToast(
                    'Something went wrong',
                    'error',
                );

            } finally {

                setLoading(false);
            }
        };

    /* ===================================================== */

    const handleSelect = useCallback(
        (choice: any) => {

            if (
                currentQuestion?.key ===
                'knowPrakriti'
            ) {

                handleKnowPrakritiSelection(
                    choice?.index,
                );

                return;
            }

            /*
                MULTI
            */

            if (
                currentQuestion?.answer_type ===
                'multi_choice'
            ) {

                setAnswers((prev: any) => {

                    const oldValues =
                        prev?.[
                        currentQuestion?.key
                        ] || [];

                    const exists =
                        oldValues.includes(
                            choice?.index,
                        );

                    return {
                        ...prev,

                        [currentQuestion?.key]:
                            exists
                                ? oldValues.filter(
                                    (
                                        x: any,
                                    ) =>
                                        x !==
                                        choice?.index,
                                )
                                : [
                                    ...oldValues,
                                    choice?.index,
                                ],
                    };
                });

                return;
            }

            /*
                SINGLE
            */

            setAnswers((prev: any) => ({
                ...prev,

                [currentQuestion?.key]:
                    choice?.index,
            }));
        },
        [currentQuestion],
    );

    const getPrefilledAnswers = (
        questions: any[],
    ) => {

        const prefilled: any = {};

        questions.forEach(
            (question: any) => {

                /*
                    MULTI SELECT
                */

                if (
                    question?.answer_type ===
                    'multi_choice'
                ) {

                    prefilled[
                        String(question?.id)
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
                    SINGLE SELECT
                */

                else {

                    const selectedChoice =
                        question?.choices?.find(
                            (choice: any) =>
                                choice?.is_selected,
                        );

                    if (selectedChoice) {

                        prefilled[
                            String(question?.id)
                        ] =
                            selectedChoice?.index;
                    }
                }
            },
        );

        return prefilled;
    };

    /* ===================================================== */

    const isSelected = useCallback(
        (item: any) => {

            const selected =
                answers?.[
                currentQuestion?.key
                ];

            /*
                MULTI
            */

            if (
                currentQuestion?.answer_type ===
                'multi_choice'
            ) {

                return (
                    Array.isArray(
                        selected,
                    ) &&
                    selected.includes(
                        item?.index,
                    )
                );
            }

            /*
                SINGLE
            */

            return (
                selected === item?.index
            );
        },
        [answers, currentQuestion],
    );

    /* ===================================================== */

    const renderItem = useCallback(
        ({ item }: any) => {

            const active =
                isSelected(item);

            return (
                // <OptionCard
                //     item={item}
                //     active={active}
                //     type={
                //         currentQuestion?.answer_type
                //     }
                //     onPress={() =>
                //         handleSelect(item)
                //     }
                // />

                <OptionCard
                    item={item}

                    active={active}
                    type={currentQuestion?.answer_type}
                    questionKey={currentQuestion?.key}
                    onPress={() =>
                        handleSelect(item)
                    }
                />
            );
        },
        [
            currentQuestion,
            isSelected,
            handleSelect,
        ],
    );

    /* ===================================================== */

    const submitAnswers = async () => {

        try {

            /*
                KNOW PRAKRITI
            */

            if (
                answers?.knowPrakriti ===
                'Yes'
            ) {

                const selectedPrakriti =
                    answers?.prakritiType;

                if (
                    !selectedPrakriti
                ) {

                    showSuccessToast(
                        'Please select your prakriti',
                        'error',
                    );

                    return false;
                }

                const response: any =
                    await _ASSESS_SERVICE.AssesmentYesSubmit(
                        {
                            answer:
                                selectedPrakriti,
                        },
                    );

                    console.log("assessement yes response", response)

                if (
                    response?.success
                ) {

                    showSuccessToast(
                        response?.message ||
                        'Submitted Successfully',
                        'success',
                    );

                    return true;
                }

                showSuccessToast(
                    response?.message ||
                    'Submission Failed',
                    'error',
                );

                return false;
            }

            /*
                FULL QUESTIONNAIRE
            */

            const payload = {
                experience_type:
                    'prakriti',

                answers,
            };

            console.log(
                'FINAL PAYLOAD ===>',
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

            // const JSONDATA =
            //     await response.json();

            console.log('sucessfully', response);

            if (
                response?.success
            ) {

                showSuccessToast(
                    response?.message ||
                    'Submitted Successfully',
                    'success',
                );

                return true;
            }

            showSuccessToast(
                response?.message ||
                'Submission Failed',
                'error',
            );

            return false;

        } catch (error) {

            console.log(error);

            showSuccessToast(
                'Something went wrong',
                'error',
            );

            return false;
        }
    };

    /* ===================================================== */

    const handleNext = async () => {

        try {

            /*
                VALIDATION
            */

            const currentAnswer =
                answers?.[
                currentQuestion?.key
                ];

            if (
                currentAnswer === undefined ||

                (
                    Array.isArray(currentAnswer) &&
                    currentAnswer.length === 0
                )
            ) {

                showSuccessToast(
                    'Please select option',
                    'error',
                );

                return;
            }

            setLoading(true);

            /*
                SUBMIT ON EVERY NEXT
            */

            const success =
                await submitAnswers();

            if (!success) {
                return;
            }

            /*
                LAST STEP
            */

            const isLast =
                step === steps.length - 1;

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
                NEXT STEP
            */

            setStep(prev => prev + 1);

        } catch (error) {

            console.log(error);

        } finally {

            setLoading(false);
        }
    };

    /* ===================================================== */

    const handleBack = () => {

        if (step === 0) {

            navigation.goBack();

            return;
        }

        setStep(prev => prev - 1);
    };

    /* ===================================================== */

    const currentSelectedAnswer =
        answers?.[
        currentQuestion?.key
        ];

    const isButtonDisabled =
        useMemo(() => {

            if (
                currentQuestion?.answer_type ===
                'multi_choice'
            ) {

                return (
                    !Array.isArray(
                        currentSelectedAnswer,
                    ) ||

                    currentSelectedAnswer.length ===
                    0
                );
            }

            return (
                currentSelectedAnswer ===
                undefined
            );

        }, [
            currentSelectedAnswer,
            currentQuestion,
        ]);

    /* ===================================================== */

    if (!currentQuestion) {
        return null;
    }

    /* ===================================================== */

    return (
        <SafeAreaView
            style={styles.safeArea}
        >
            <StatusBar
                backgroundColor={
                    COLORS.screen
                }
                barStyle="dark-content"
            />

            <View style={styles.container}>

                {/* HEADER */}

                <Header
                    step={step}
                    total={steps.length}
                    onBack={handleBack}
                />

                {/* PROGRESS */}

                <ProgressBar
                    progress={progress}
                />

                {/* BODY */}

                <ScrollView
                    showsVerticalScrollIndicator={
                        false
                    }
                    contentContainerStyle={{
                        paddingBottom: 140,
                    }}
                >

                    {/* TITLE */}

                    <Text
                        style={styles.title}
                    >
                        {
                            currentQuestion?.question
                        }
                    </Text>

                    {/* SUB TITLE */}

                    <Text
                        style={
                            styles.description
                        }
                    >
                        This helps us
                        understand your
                        prakriti better and
                        give you
                        personalized
                        recommendations.
                    </Text>

                    {/* MULTI SELECT TAG */}

                    {
                        currentQuestion?.answer_type ===
                        'multi_choice' && (
                            <View
                                style={
                                    styles.multiSelectWrapper
                                }
                            >
                                <Text
                                    style={
                                        styles.multiSelectText
                                    }
                                >
                                    You can
                                    select
                                    multiple
                                    options
                                </Text>
                            </View>
                        )
                    }

                    {/* OPTIONS */}

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
                            index,
                        ) =>
                            `${item?.index}-${index}`
                        }
                        contentContainerStyle={{
                            paddingTop: 24,
                        }}
                    />

                    <View style={styles.infoCard}>

                        <View style={styles.infoLeft}>

                            <Image source={require('../assets/images/ayurveda.png')} style={{ height: 50, width: 50, }} />



                        </View>

                        <Text style={styles.infoText}>
                            Ayurveda believes your hair reflects your
                            inner balance and overall well-being.
                        </Text>

                        <Image source={require('../assets/images/ayurvedaLeaf.png')} style={{ height: 30, width: 30, resizeMode: 'contain' }} />


                    </View>
                </ScrollView>

                {/* FOOTER */}

                <BottomButton
                    loading={loading}
                    disabled={isButtonDisabled}
                    onPress={handleNext}
                    title={
                        step === steps.length - 1
                            ? 'Finish'
                            : 'Next'
                    }
                />
            </View>
        </SafeAreaView>
    );
};

export default PatientFAQ;