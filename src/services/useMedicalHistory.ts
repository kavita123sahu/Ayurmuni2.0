import { useState } from "react";
import * as _ASSESS_SERVICE from "../services/AssesmentService";

export const useMedicalHistory = () => {
  const [questions, setQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [loading, setLoading] = useState(false);

  const getQuestions = async () => {
    try {
      setLoading(true);

      const res =
        await _ASSESS_SERVICE.GetQuestionOptions({
          experience_type: 'medical_history',
        });

      const json = await res.json();

      setQuestions(json?.data?.questions || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return {
    questions,
    selectedAnswers,
    setSelectedAnswers,
    loading,
    getQuestions,
  };
};


export const isBasicQuestion = (question: string = '') => {
  const q = question.toLowerCase();

  return (
    q.includes('age') ||
    q.includes('gender') ||
    q.includes('height')
  );
};

export const getQuestionTitle = (question: string) => {
  if (question?.toLowerCase()?.includes('age')) {
    return 'Please share your basic information';
  }

  return question;
};