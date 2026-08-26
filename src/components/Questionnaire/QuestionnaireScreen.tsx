import React, { useCallback } from 'react';
import PrakritiQuestLayout from './PrakritiQuestLayout';
import { QUESTIONNAIRE_SETUP, QuestionnaireMode } from './configs';
import { useQuestionnaireFlow } from './useQuestionnaireFlow';
import { safeGoBack } from '../../navigation/navigationUtils';

type Props = {
  navigation: any;
  mode: QuestionnaireMode;
  /** When false (onboarding / home CTA), exit on step 0 is blocked. */
  allowBack?: boolean;
};

const QuestionnaireScreen = ({
  navigation,
  mode,
  allowBack = true,
}: Props) => {
  const flow = useQuestionnaireFlow(navigation, mode, { allowBack });
  const { config } = QUESTIONNAIRE_SETUP[mode];

  const onExit = useCallback(() => {
    if (!allowBack) {
      return;
    }
    safeGoBack(navigation);
  }, [allowBack, navigation]);

  return (
    <PrakritiQuestLayout
      {...flow}
      mode={mode}
      config={config}
      onExit={onExit}
      allowExit={allowBack}
    />
  );
};

export default QuestionnaireScreen;
