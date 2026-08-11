import { QuestionnaireConfig } from './types';

export type QuestionnaireMode = 'prakriti' | 'medical';

type Setup = {
  config: QuestionnaireConfig;
  finishRoute: string;
  finishParams?: Record<string, any>;
};

export const PRAKRITI_CONFIG: QuestionnaireConfig = {
  description:
    'Journey through the temple and discover your Ayurvedic constitution.',
  infoText:
    'Each answer shapes your Vata, Pitta, and Kapha balance — trust your first instinct.',
  infoFromStep: 1,
};

export const MEDICAL_CONFIG: QuestionnaireConfig = {
  description:
    'Complete your health quest so we can tailor the best wellness plan for you.',
  infoText:
    'Your answers stay confidential — each level unlocks smarter care.',
  infoFromStep: 0,
  medical: true,
};

export const QUESTIONNAIRE_SETUP: Record<QuestionnaireMode, Setup> = {
  prakriti: {
    config: PRAKRITI_CONFIG,
    // Show Prakriti result screen immediately after assessment
    finishRoute: 'PrakritiProfile',
    finishParams: { fromAssessment: true },
  },
  medical: {
    config: MEDICAL_CONFIG,
    finishRoute: 'PrakritiProfile',
    finishParams: { fromMedical: true },
  },
};
