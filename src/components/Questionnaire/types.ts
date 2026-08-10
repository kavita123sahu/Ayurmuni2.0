export type AnswerType = 'choice' | 'multi_choice' | 'text';

export type QuestionChoice = {
  index: string | number;
  value: string;
  image_path?: string;
  is_selected?: boolean;
};

export type QuestionStep = {
  id?: string | number;
  key: string;
  question: string;
  answer_type: AnswerType;
  choices?: QuestionChoice[];
  answer?: string;
};

export type QuestionnaireConfig = {
  description?: string;
  infoText: string;
  infoFromStep?: number;
  medical?: boolean;
  skipHiddenKeys?: string[];
};
