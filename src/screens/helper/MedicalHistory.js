export const getBasicInfoQuestions = questions => {
  return questions.filter(item => item.type === 'basic');
};

export const getFilteredQuestions = (
  questions,
  answers,
  currentIndex,
) => {
  return questions.filter((question, index) => {
    if (!question.dependsOn) return true;

    return answers[question.dependsOn.questionId] === question.dependsOn.value;
  });
};

export const isBasicQuestion = question => {
  return question?.type === 'basic';
};

export const isQuestionAnswered = (question, answers) => {
  return !!answers?.[question?.id];
};



export const buildSubmitPayload = (
    selectedAnswers,
) => {

    return {
        experience_type:
            'medical_history',

        answers: selectedAnswers,
    };
};