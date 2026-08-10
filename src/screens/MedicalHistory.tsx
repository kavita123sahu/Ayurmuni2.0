import React from 'react';
import QuestionnaireScreen from '../components/Questionnaire/QuestionnaireScreen';

const MedicalHistory = ({ navigation }: any) => (
  <QuestionnaireScreen navigation={navigation} mode="medical" />
);

export default MedicalHistory;
