import React, { useCallback, useEffect, useState } from 'react';
import { Alert, View, ActivityIndicator } from 'react-native';
import PrakritiQuestLayout from './PrakritiQuestLayout';
import PrakritiNoteModal from './PrakritiNoteModal';
import { QUESTIONNAIRE_SETUP, QuestionnaireMode } from './configs';
import { useQuestionnaireFlow } from './useQuestionnaireFlow';
import { safeGoBack } from '../../navigation/navigationUtils';
import { requireAuth } from '../../services/guestAuth';
import { Colors } from '../../common/Colors';

type Props = {
  navigation: any;
  mode: QuestionnaireMode;
  /** When false (legacy), still allow exit with confirm. */
  allowBack?: boolean;
  /** Skip note if already shown on AssessmentType. */
  noteSeen?: boolean;
  /**
   * Onboarding path (AssessmentType / CompleteDetails) may skip the guest gate.
   * Home / header entry must pass requireAuth first.
   */
  allowIncompleteProfile?: boolean;
};

const QuestionnaireScreen = ({
  navigation,
  mode,
  noteSeen = false,
  allowIncompleteProfile = false,
}: Props) => {
  const flow = useQuestionnaireFlow(navigation, mode, { allowBack: true });
  const { config } = QUESTIONNAIRE_SETUP[mode];
  const [accessChecked, setAccessChecked] = useState(
    mode !== 'prakriti' || allowIncompleteProfile,
  );
  const [questReady, setQuestReady] = useState(
    mode !== 'prakriti' || noteSeen,
  );

  useEffect(() => {
    if (mode !== 'prakriti' || allowIncompleteProfile) {
      setAccessChecked(true);
      return;
    }

    let cancelled = false;
    (async () => {
      const ok = await requireAuth(
        'Complete your profile to start prakriti assessment',
      );
      if (cancelled) return;
      if (!ok) {
        safeGoBack(navigation);
        return;
      }
      setAccessChecked(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [mode, allowIncompleteProfile, navigation]);

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

  if (!accessChecked) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#FFFFFF',
        }}
      >
        <ActivityIndicator size="large" color={Colors.primaryColor} />
      </View>
    );
  }

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
