import React from 'react';
import QuestionnaireScreen from '../components/Questionnaire/QuestionnaireScreen';

const PatientFAQ = ({ navigation, route }: any) => (
  <QuestionnaireScreen
    navigation={navigation}
    mode="prakriti"
    allowBack={route?.params?.allowBack !== false}
    noteSeen={Boolean(route?.params?.noteSeen)}
  />
);

export default PatientFAQ;
