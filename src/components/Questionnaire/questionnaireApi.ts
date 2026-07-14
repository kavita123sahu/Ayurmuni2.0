import * as AssessService from '../../services/AssesmentService';

export type ExperienceType = 'prakriti' | 'medical_history';

export const fetchQuestions = (experienceType: ExperienceType) =>
  AssessService.GetQuestionOptions({ experience_type: experienceType });

export const submitKnowPrakriti = (doesKnow: boolean) =>
  AssessService.KnowPrakritiSubmit({ does_know_prakriti: doesKnow });

export const submitPrakritiType = (answer: string) =>
  AssessService.AssesmentYesSubmit({ answer });

export const submitQuestionnaire = (
  experienceType: ExperienceType,
  answers: Record<string, any>,
) =>
  AssessService.QuestionnaireSubmit({
    experience_type: experienceType,
    answers,
  });
