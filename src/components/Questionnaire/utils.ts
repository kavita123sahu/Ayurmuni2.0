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
    if (!question?.question?.toLowerCase().includes('height')) {
      return;
    }

    const id = String(question.id);
    const value = question?.answer ?? '';
    const [height = '', weight = ''] = value.split(',');
    answers[`${id}_height`] = height.replace('cm', '').trim();
    answers[`${id}_weight`] = weight.replace('kg', '').trim();
  });

  return answers;
};

export const findBasicQuestions = (questions: any[]) => {
  const find = (keyword: string) =>
    questions.find(q => q?.question?.toLowerCase().includes(keyword));

  return {
    age: find('age'),
    gender: find('gender'),
    height: find('height'),
    weight: find('weight'),
  };
};

export const collapseBasicInfoSteps = (questions: any[]): QuestionStep[] => {
  const basics = findBasicQuestions(questions);
  const basicIds = [
    basics.age?.id,
    basics.gender?.id,
    basics.height?.id,
    basics.weight?.id,
  ].filter(Boolean);

  let basicAdded = false;

  return questions
    .filter(item => {
      if (!basicIds.includes(item?.id)) {
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

  return [
    basics.age?.id,
    basics.gender?.id,
    basics.height?.id,
    basics.weight?.id,
  ].includes(step.id);
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
    const ageId = String(basics?.age?.id ?? '');
    const genderId = String(basics?.gender?.id ?? '');
    const heightId = String(basics?.height?.id ?? '');

    return (
      !answers[ageId] ||
      answers[genderId] === undefined ||
      !answers[`${heightId}_height`] ||
      !answers[`${heightId}_weight`]
    );
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
