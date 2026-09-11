import React, { useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Image,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ProgressBar from '../MedicalHistory/ProgressBar';
import OptionCard from '../MedicalHistory/OptionCard';
import BasicInfoForm from '../MedicalHistory/BasicInfoForm';
import BottomButton from '../MedicalHistory/BottomButton';
import Header from '../MedicalHistory/MedicalHeader';
import { styles, COLORS } from '../MedicalHistory/styles/MedicalHistor';
import { getStepKey } from './utils';
import { QuestionnaireConfig, QuestionStep } from './types';

type FlowProps = {
  loading: boolean;
  submitting: boolean;
  loadError?: string;
  step: number;
  steps: QuestionStep[];
  currentStep?: QuestionStep;
  progress: number;
  answers: Record<string, any>;
  isDisabled: boolean;
  showSkip: boolean;
  isLastStep: boolean;
  handleSelect: (choice: any) => void;
  handleNext: () => void;
  handleBack: () => void;
  handleSkip: () => void;
  retryLoad?: () => void;
  isSelected: (item: any) => boolean;
  basicInfoStep?: boolean;
  rawQuestions?: any[];
  handleBasicInfoChange?: (key: string, value: any) => void;
  handleTextChange?: (text: string) => void;
};

type Props = FlowProps & {
  config: QuestionnaireConfig;
};

const InfoCard = ({ text }: { text: string }) => (
  <View style={styles.infoCard}>
    <View style={styles.infoLeft}>
      <Image
        source={require('../../assets/images/ayurveda.png')}
        style={{ height: 32, width: 32, resizeMode: 'contain' }}
      />
    </View>
    <Text style={styles.infoText}>{text}</Text>
    <Image
      source={require('../../assets/images/ayurvedaLeaf.png')}
      style={{ height: 22, width: 22, resizeMode: 'contain' }}
    />
  </View>
);

const QuestionnaireLayout = ({
  loading,
  submitting,
  loadError,
  step,
  steps,
  currentStep,
  progress,
  answers,
  isDisabled,
  showSkip,
  isLastStep,
  handleSelect,
  handleNext,
  handleBack,
  handleSkip,
  retryLoad,
  isSelected,
  basicInfoStep,
  rawQuestions,
  handleBasicInfoChange,
  handleTextChange,
  config,
}: Props) => {
  const stepKey = getStepKey(currentStep);

  const renderOptions = useCallback(() => {
    const choices = currentStep?.choices ?? [];
    return choices.map((item, index) => (
      <OptionCard
        key={`${item?.index}-${index}`}
        item={item}
        active={isSelected(item)}
        type={currentStep?.answer_type}
        medical={config.medical}
        questionKey={currentStep?.key}
        onPress={() => handleSelect(item)}
      />
    ));
  }, [
    config.medical,
    currentStep,
    handleSelect,
    isSelected,
  ]);

  if (loading && !currentStep) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (loadError && !currentStep) {
    return (
      <View style={styles.loader}>
        <Text style={styles.description}>{loadError}</Text>
        {retryLoad && (
          <TouchableOpacity style={styles.nextBtn} onPress={retryLoad}>
            <Text style={styles.nextText}>Retry</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  if (!currentStep) {
    return null;
  }

  const showInfo =
    step >= (config.infoFromStep ?? 0) &&
    (config.infoFromStep === 0 || step > 0);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor={COLORS.screen} barStyle="dark-content" />

      <View style={styles.container}>
        <Header
          step={step}
          total={steps.length}
          onBack={handleBack}
          onSkip={handleSkip}
          showSkip={showSkip}
        />

        <ProgressBar progress={progress} />

        <ScrollView
          keyboardShouldPersistTaps="always"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 72 }}
        >
          <Text style={styles.title}>
            {basicInfoStep
              ? 'Please share your basic information'
              : currentStep.question}
          </Text>

          {!!config.description && (
            <Text style={styles.description}>{config.description}</Text>
          )}

          {currentStep.answer_type === 'multi_choice' && (
            <View style={styles.multiSelectWrapper}>
              <Text style={styles.multiSelectText}>
                You can select multiple options
              </Text>
            </View>
          )}

          {basicInfoStep && rawQuestions && handleBasicInfoChange ? (
            <BasicInfoForm
              questions={rawQuestions}
              selectedAnswers={answers}
              onChange={handleBasicInfoChange}
            />
          ) : (
            <>
              {currentStep.answer_type !== 'text' && (
                <View style={{ paddingTop: 6 }}>{renderOptions()}</View>
              )}

              {currentStep.answer_type === 'text' && handleTextChange && (
                <TextInput
                  multiline
                  placeholder="Write your answer..."
                  placeholderTextColor="#94A3B8"
                  value={answers[stepKey] ?? ''}
                  onChangeText={handleTextChange}
                  style={styles.input}
                />
              )}
            </>
          )}

          {showInfo && <InfoCard text={config.infoText} />}
        </ScrollView>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 }}>
          {showSkip ? (
            <TouchableOpacity onPress={handleSkip} style={styles.skipBtn} activeOpacity={0.85}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 72 }} />
          )}

          <BottomButton
            loading={submitting}
            disabled={isDisabled || submitting}
            onPress={handleNext}
            title={isLastStep ? 'Finish' : 'Next'}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default QuestionnaireLayout;
