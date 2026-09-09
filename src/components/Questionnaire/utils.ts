import { QuestionStep } from './types';

export const getStepKey = (step?: QuestionStep) =>
  step?.key ?? String(step?.id ?? '');

export const normalizeApiQuestion = (item: any): QuestionStep => ({
  id: item?.id,
  key: String(item?.id ?? item?.key),
  question: item?.question ?? '',
  answer_type: item?.answer_type ?? 'choice',
  choices: item?.choices ?? [],
  answer: item?.answer,
});

export const getPrefilledAnswers = (questions: any[]): Record<string, any> => {
  const prefilled: Record<string, any> = {};

  questions.forEach(question => {
    const key = String(question?.id ?? question?.key);

    if (question?.answer_type === 'multi_choice') {
      prefilled[key] =
        question?.choices
          ?.filter((c: any) => c?.is_selected)
          ?.map((c: any) => c?.index) ?? [];
      return;
    }

    if (question?.answer_type === 'text') {
      prefilled[key] = question?.answer ?? '';
      return;
    }

    const selected = question?.choices?.find((c: any) => c?.is_selected);
    if (selected) {
      prefilled[key] = selected.index;
    }
  });

  return prefilled;
};

export const buildMedicalInitialAnswers = (questions: any[]) => {
  const answers = getPrefilledAnswers(questions);

  questions.forEach(question => {
    const q = String(question?.question ?? '').toLowerCase();
    if (!q.includes('height') && !q.includes('weight') && !q.includes('body')) {
      return;
    }

    const id = String(question.id);
    const value = String(question?.answer ?? '');
    if (!value) return;
    const [height = '', weight = ''] = value.split(',');
    answers[`${id}_height`] = height.replace(/cm/gi, '').trim();
    answers[`${id}_weight`] = weight.replace(/kg/gi, '').trim();
  });

  return answers;
};

export const findBasicQuestions = (
  questions: any[],
): {
  age?: any;
  gender?: any;
  height?: any;
  weight?: any;
} => {
  const find = (keyword: string) =>
    questions.find(q => q?.question?.toLowerCase().includes(keyword));

  const height =
    find('height') ||
    find('weight') ||
    find('body type') ||
    find('body');

  return {
    age: undefined,
    gender: undefined,
    height,
    weight: find('weight'),
  };
};

export const collapseBasicInfoSteps = (questions: any[]): QuestionStep[] => {
  const basics = findBasicQuestions(questions);
  const basicIds = new Set(
    [basics.age?.id, basics.gender?.id, basics.height?.id, basics.weight?.id]
      .filter(id => id != null && String(id).trim() !== '')
      .map(id => String(id)),
  );

  let basicAdded = false;

  return questions
    .filter(item => {
      const id = String(item?.id ?? '');
      if (!basicIds.has(id)) {
        return true;
      }
      if (basicAdded) {
        return false;
      }
      basicAdded = true;
      return true;
    })
    .map(normalizeApiQuestion);
};

export const isBasicInfoStep = (
  step?: QuestionStep,
  basics?: ReturnType<typeof findBasicQuestions>,
) => {
  if (!step || !basics) {
    return false;
  }

  const stepId = String(step.id ?? '');
  return [
    basics.age?.id,
    basics.gender?.id,
    basics.height?.id,
    basics.weight?.id,
  ]
    .filter(id => id != null)
    .map(id => String(id))
    .includes(stepId);
};

export const toggleAnswer = (
  prev: Record<string, any>,
  key: string,
  choiceIndex: string | number,
  isMulti: boolean,
) => {
  if (!isMulti) {
    return { ...prev, [key]: choiceIndex };
  }

  const current = prev[key] ?? [];
  const exists = current.includes(choiceIndex);

  return {
    ...prev,
    [key]: exists
      ? current.filter((v: any) => v !== choiceIndex)
      : [...current, choiceIndex],
  };
};

export const isChoiceSelected = (
  answers: Record<string, any>,
  step?: QuestionStep,
  choiceIndex?: string | number,
) => {
  const key = getStepKey(step);
  const selected = answers[key];

  if (step?.answer_type === 'multi_choice') {
    return Array.isArray(selected) && selected.includes(choiceIndex);
  }

  return selected === choiceIndex;
};

export const isAnswerEmpty = (
  answers: Record<string, any>,
  step?: QuestionStep,
  basics?: ReturnType<typeof findBasicQuestions>,
) => {
  if (!step) {
    return true;
  }

  if (isBasicInfoStep(step, basics)) {
    const heightId =
      basics?.height?.id != null
        ? String(basics.height.id)
        : basics?.weight?.id != null
          ? String(basics.weight.id)
          : '';

    // Medical basic-info flow currently uses only the measurement fields
    // returned by the API (height / weight or combined body-type question).
    if (heightId) {
      if (!answers[`${heightId}_height`]) return true;
      if (!answers[`${heightId}_weight`]) return true;
    }
    return false;
  }

  const key = getStepKey(step);
  const value = answers[key];

  if (step.answer_type === 'text') {
    return !value?.trim?.();
  }

  if (step.answer_type === 'multi_choice') {
    return !Array.isArray(value) || value.length === 0;
  }

  return value === undefined;
};

export const formatMedicalAnswers = (
  answers: Record<string, any>,
  heightQuestionId?: string | number,
) => {
  if (!heightQuestionId) {
    return { ...answers };
  }

  const heightId = String(heightQuestionId);
  const formatted = { ...answers };
  const height = formatted[`${heightId}_height`];
  const weight = formatted[`${heightId}_weight`];

  if (height || weight) {
    formatted[heightId] = `${height || ''} cm, ${weight || ''} kg`;
    delete formatted[`${heightId}_height`];
    delete formatted[`${heightId}_weight`];
  }

  return formatted;
};
