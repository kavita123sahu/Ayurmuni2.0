import React, { useCallback, useState } from 'react';
import { Alert, View } from 'react-native';
import PrakritiQuestLayout from './PrakritiQuestLayout';
import PrakritiNoteModal from './PrakritiNoteModal';
import { QUESTIONNAIRE_SETUP, QuestionnaireMode } from './configs';
import { useQuestionnaireFlow } from './useQuestionnaireFlow';
import { safeGoBack } from '../../navigation/navigationUtils';

type Props = {
  navigation: any;
  mode: QuestionnaireMode;
  /** When false (legacy), still allow exit with confirm. */
  allowBack?: boolean;
  /** Skip note if already shown on AssessmentType. */
  noteSeen?: boolean;
};

const QuestionnaireScreen = ({
  navigation,
  mode,
  noteSeen = false,
}: Props) => {
  const flow = useQuestionnaireFlow(navigation, mode, { allowBack: true });
  const { config } = QUESTIONNAIRE_SETUP[mode];
  const [questReady, setQuestReady] = useState(
    mode !== 'prakriti' || noteSeen,
  );

  const confirmExit = useCallback(() => {
    Alert.alert(
      mode === 'medical' ? 'Exit Health Quest?' : 'Exit Prakriti Quest?',
      'Your progress on this attempt will be lost.',
      [
        { text: 'Stay', style: 'cancel' },
        {
          text: 'Exit',
          style: 'destructive',
          onPress: () => safeGoBack(navigation),
        },
      ],
    );
  }, [mode, navigation]);

  const onExit = useCallback(() => {
    confirmExit();
  }, [confirmExit]);

  if (mode === 'prakriti' && !questReady) {
    return (
      <View style={{ flex: 1, backgroundColor: 'rgba(10, 51, 40, 0.92)' }}>
        <PrakritiNoteModal
          visible
          onClose={() => {
            safeGoBack(navigation);
          }}
          onBegin={() => {
            setQuestReady(true);
          }}
        />
      </View>
    );
  }

  return (
    <PrakritiQuestLayout
      {...flow}
      mode={mode}
      config={config}
      onExit={onExit}
      allowExit
    />
  );
};

export default QuestionnaireScreen;
