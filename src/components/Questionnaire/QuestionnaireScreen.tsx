import React from 'react';
import QuestionnaireLayout from './QuestionnaireLayout';
import { QUESTIONNAIRE_SETUP, QuestionnaireMode } from './configs';
import { useQuestionnaireFlow } from './useQuestionnaireFlow';

type Props = {
  navigation: any;
  mode: QuestionnaireMode;
};

const QuestionnaireScreen = ({ navigation, mode }: Props) => {
  const flow = useQuestionnaireFlow(navigation, mode);
  const { config } = QUESTIONNAIRE_SETUP[mode];

  return <QuestionnaireLayout {...flow} config={config} />;
};

export default QuestionnaireScreen;
