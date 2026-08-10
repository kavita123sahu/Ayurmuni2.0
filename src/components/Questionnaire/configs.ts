import { QuestionnaireConfig } from './types';

export type QuestionnaireMode = 'prakriti' | 'medical';

type Setup = {
  config: QuestionnaireConfig;
  finishRoute: string;
  finishParams?: Record<string, any>;
};

export const PRAKRITI_CONFIG: QuestionnaireConfig = {
  description:
    'This helps us understand your prakriti better and give you personalized recommendations.',
  infoText:
    'Ayurveda believes your hair reflects your inner balance and overall well-being.',
  infoFromStep: 1,
};

export const MEDICAL_CONFIG: QuestionnaireConfig = {
  infoText:
    'Your information is Confidential and will help us tailor the best wellness plan for you',
  infoFromStep: 0,
  medical: true,
};

export const QUESTIONNAIRE_SETUP: Record<QuestionnaireMode, Setup> = {
  prakriti: {
    config: PRAKRITI_CONFIG,
    finishRoute: 'AssessmentType',
    finishParams: { form: 'medical' },
  },
  medical: {
    config: MEDICAL_CONFIG,
    finishRoute: 'PrakritiProfile',
  },
};
