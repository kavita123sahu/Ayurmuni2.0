import React, { useCallback } from 'react';
import PrakritiQuestLayout from './PrakritiQuestLayout';
import { QUESTIONNAIRE_SETUP, QuestionnaireMode } from './configs';
import { useQuestionnaireFlow } from './useQuestionnaireFlow';
import { safeGoBack } from '../../navigation/navigationUtils';

type Props = {
  navigation: any;
  mode: QuestionnaireMode;
};

const QuestionnaireScreen = ({ navigation, mode }: Props) => {
  const flow = useQuestionnaireFlow(navigation, mode);
  const { config } = QUESTIONNAIRE_SETUP[mode];

  const onExit = useCallback(() => {
    safeGoBack(navigation);
  }, [navigation]);

  return (
    <PrakritiQuestLayout
      {...flow}
      mode={mode}
      config={config}
      onExit={onExit}
    />
  );
};

export default QuestionnaireScreen;
