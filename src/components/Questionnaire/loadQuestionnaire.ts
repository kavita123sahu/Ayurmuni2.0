import { fetchQuestions } from './questionnaireApi';
import { QuestionStep } from './types';
import {
  buildMedicalInitialAnswers,
  collapseBasicInfoSteps,
  getPrefilledAnswers,
  normalizeApiQuestion,
} from './utils';
import { PRAKRITI_IMAGES } from '../../common/DataInterface';
import { QuestionnaireMode } from './configs';

export const KNOW_PRAKRITI_STEP: QuestionStep = {
  key: 'knowPrakriti',
  question: 'Do you know your Prakriti?',
  answer_type: 'choice',
  choices: [
    { index: 'No', value: 'No' },
    { index: 'Yes', value: 'Yes' },
  ],
};

type LoadResult = {
  steps: QuestionStep[];
  rawQuestions: any[];
  answers: Record<string, any>;
  cachedPrakritiQuestions: any[];
  error: string;
};

export const loadQuestionnaire = async (
  mode: QuestionnaireMode,
): Promise<LoadResult> => {
  const isPrakriti = mode === 'prakriti';
  const empty: LoadResult = {
    steps: [],
    rawQuestions: [],
    answers: {},
    cachedPrakritiQuestions: [],
    error: '',
  };

  try {
    const response: any = await fetchQuestions(
      isPrakriti ? 'prakriti' : 'medical_history',
    );
    const questions = response?.data?.questions ?? [];

    if (!questions.length && !isPrakriti) {
      return { ...empty, error: 'No questions available right now.' };
    }

    if (isPrakriti) {
      return {
        ...empty,
        steps: [KNOW_PRAKRITI_STEP],
        cachedPrakritiQuestions: questions,
      };
    }

    return {
      ...empty,
      rawQuestions: questions,
      answers: buildMedicalInitialAnswers(questions),
      steps: collapseBasicInfoSteps(questions),
    };
  } catch {
    return {
      ...empty,
      steps: isPrakriti ? [KNOW_PRAKRITI_STEP] : [],
      error: 'Failed to load questions. Please try again.',
    };
  }
};

export const buildPrakritiTypeStep = (options: string[]): QuestionStep => ({
  key: 'prakritiType',
  question: 'Select your Prakriti',
  answer_type: 'choice',
  choices: options.map(item => ({
    index: item,
    value: item,
    image_path: PRAKRITI_IMAGES[item] || '',
  })),
});

export const buildPrakritiSteps = (questions: any[]): QuestionStep[] => [
  KNOW_PRAKRITI_STEP,
  ...questions.map(normalizeApiQuestion),
];

export const buildPrakritiAnswers = (questions: any[]) =>
  getPrefilledAnswers(questions);
