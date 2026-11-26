/** Vikriti (current imbalance) outcomes derived from medical_history answers. */

export type VikritiOutcome = {
  id: string;
  name: string;
  trait: string;
  guidance: string;
  match: string[];
  selected?: boolean;
};

export type VikritiGroup = {
  answer: string;
  selectedId: string;
  outcomes: VikritiOutcome[];
};

export type VikritiResult = {
  gut: VikritiGroup | null;
  agni: VikritiGroup | null;
};

export const GUT_CONSTITUTION_OUTCOMES: VikritiOutcome[] = [
  {
    id: 'krura',
    name: 'Krura Koshtha',
    trait: 'Vata dominant gut',
    guidance:
      'Hydrate, fibre-rich and unctuous meals. Nabhi purana (oil on navel) at bedtime.',
    match: [
      'krura',
      'vata',
      'vata dominant gut',
      'vata dominant',
      'constipated',
      'hard stools',
    ],
  },
  {
    id: 'mridu',
    name: 'Mridu Koshtha',
    trait: 'Pitta dominant gut',
    guidance:
      'Avoid hot, spicy, acidic food. Use gulkand, ash gourd, amla.',
    match: [
      'mridu',
      'pitta',
      'pitta dominant gut',
      'pitta dominant',
      'loose stools',
      'frequent stools',
      'loose or frequent',
    ],
  },
  {
    id: 'madhya',
    name: 'Madhya Koshtha',
    trait: 'Kapha dominant gut',
    guidance: 'No intervention. Bowel is regular.',
    match: [
      'madhya',
      'kapha',
      'kapha dominant',
      'regular',
      'regular bowel',
      'normal bowel',
    ],
  },
];

export const AGNI_OUTCOMES: VikritiOutcome[] = [
  {
    id: 'teekshna',
    name: 'Teekshna Agni',
    trait: 'Strong, quick digestion',
    guidance:
      'Avoid long fasting. Fibre-rich, filling food (chia, steamed salad) with meals.',
    match: [
      'teekshna',
      'strong',
      'hungry quickly',
      'frequently hungry',
      'digest food quickly',
    ],
  },
  {
    id: 'manda',
    name: 'Manda Agni',
    trait: 'Slow digestion',
    guidance:
      'Avoid heavy, raw, and frequent meals. Warm, light, freshly cooked food with seasoning.',
    match: [
      'manda',
      'slow',
      'sluggish',
      'weak',
      'weak digestion',
      'low appetite',
    ],
  },
  {
    id: 'visham',
    name: 'Visham Agni',
    trait: 'Irregular digestion',
    guidance: 'Fixed meal times, pranayama, relaxation yoga.',
    match: ['visham', 'irregular', 'variable', 'unpredictable'],
  },
  {
    id: 'sama',
    name: 'Sama Agni',
    trait: 'Balanced digestion',
    guidance: 'Normal digestion. No intervention.',
    match: ['sama', 'balanced', 'normal', 'steady digestion'],
  },
];

const normalize = (value: unknown) =>
  String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const answerText = (answer: unknown): string => {
  if (answer == null) return '';
  if (typeof answer === 'string') return answer;
  if (Array.isArray(answer)) {
    return answer.map(item => answerText(item)).filter(Boolean).join(' ');
  }
  if (typeof answer === 'object') {
    const obj = answer as Record<string, unknown>;
    return String(obj.value ?? obj.label ?? obj.text ?? '');
  }
  return String(answer);
};

const questionText = (item: any) =>
  normalize(item?.question || item?.title || '');

export const findMedicalAnswer = (
  questions: any[],
  predicates: Array<string | ((q: string, item: any) => boolean)>,
) => {
  if (!Array.isArray(questions) || !questions.length) return '';
  const matchers = Array.isArray(predicates) ? predicates : [predicates];
  const hit = questions.find(item => {
    const q = questionText(item);
    return matchers.some(pred =>
      typeof pred === 'function' ? pred(q, item) : q.includes(normalize(pred)),
    );
  });
  return answerText(hit?.answer);
};

export const matchOutcome = (
  answer: string,
  outcomes: VikritiOutcome[],
): string | null => {
  const text = normalize(answer);
  if (!text || !Array.isArray(outcomes)) return null;
  let best: string | null = null;
  let bestScore = 0;
  for (const outcome of outcomes) {
    const score = (outcome.match || []).reduce((sum, token) => {
      const needle = normalize(token);
      return needle && text.includes(needle) ? sum + needle.length : sum;
    }, 0);
    if (score > bestScore) {
      bestScore = score;
      best = outcome.id;
    }
  }
  return best;
};

export const buildVikritiFromMedicalHistory = (
  medicalHistory: any,
): VikritiResult | null => {
  const questions = Array.isArray(medicalHistory?.questions)
    ? medicalHistory.questions
    : Array.isArray(medicalHistory)
      ? medicalHistory
      : [];

  if (!questions.length) return null;

  const gutAnswer = findMedicalAnswer(questions, [
    'gut constitution',
    'koshtha',
  ]);
  const agniAnswer = findMedicalAnswer(questions, [
    'digestive and metabolic',
    'agni',
    'metabolic health',
  ]);

  const selectedGutId = matchOutcome(gutAnswer, GUT_CONSTITUTION_OUTCOMES);
  const selectedAgniId = matchOutcome(agniAnswer, AGNI_OUTCOMES);

  if (!selectedGutId && !selectedAgniId) return null;

  return {
    gut: selectedGutId
      ? {
          answer: gutAnswer,
          selectedId: selectedGutId,
          outcomes: GUT_CONSTITUTION_OUTCOMES.map(item => ({
            ...item,
            selected: item.id === selectedGutId,
          })),
        }
      : null,
    agni: selectedAgniId
      ? {
          answer: agniAnswer,
          selectedId: selectedAgniId,
          outcomes: AGNI_OUTCOMES.map(item => ({
            ...item,
            selected: item.id === selectedAgniId,
          })),
        }
      : null,
  };
};
