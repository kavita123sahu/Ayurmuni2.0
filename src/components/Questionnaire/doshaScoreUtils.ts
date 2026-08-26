import { QuestionStep } from './types';
import { getStepKey } from './utils';
import { DoshaKey } from './PrakritiQuestTheme';

export type DoshaScores = Record<DoshaKey, number>;

export const emptyDoshaScores = (): DoshaScores => ({
  vata: 0,
  pitta: 0,
  kapha: 0,
});

const DOSHA_ORDER: DoshaKey[] = ['vata', 'pitta', 'kapha'];

const detectDoshaFromText = (text: string): DoshaKey | null => {
  const v = text.toLowerCase();
  if (v.includes('vata')) return 'vata';
  if (v.includes('pitta')) return 'pitta';
  if (v.includes('kapha')) return 'kapha';
  return null;
};

const bumpFromChoice = (
  scores: DoshaScores,
  choice: any,
  fallbackIndex: number,
) => {
  const fromText = detectDoshaFromText(String(choice?.value ?? choice?.index ?? ''));
  if (fromText) {
    scores[fromText] += 1;
    return;
  }
  scores[DOSHA_ORDER[fallbackIndex % 3]] += 1;
};

/** Map answered choices → running Vata / Pitta / Kapha tally for the quest HUD */
export const computeDoshaScores = (
  answers: Record<string, any>,
  steps: QuestionStep[],
): DoshaScores => {
  const scores = emptyDoshaScores();

  steps.forEach(step => {
    if (!step || step.key === 'knowPrakriti') return;

    const key = getStepKey(step);
    const selected = answers[key];
    if (selected === undefined || selected === null || selected === '') return;

    if (step.key === 'prakritiType') {
      const label = String(selected);
      const parts = label.split(/[-/,&+]+/).map(s => s.trim());
      parts.forEach(part => {
        const d = detectDoshaFromText(part);
        if (d) scores[d] += 1;
      });
      return;
    }

    const choices = step.choices ?? [];

    if (step.answer_type === 'multi_choice' && Array.isArray(selected)) {
      selected.forEach((idx: any) => {
        const i = choices.findIndex(c => c.index === idx);
        if (i >= 0) bumpFromChoice(scores, choices[i], i);
      });
      return;
    }

    const i = choices.findIndex(c => c.index === selected);
    if (i >= 0) bumpFromChoice(scores, choices[i], i);
  });

  return scores;
};

export const dominantDosha = (scores: DoshaScores): DoshaKey => {
  let best: DoshaKey = 'vata';
  let max = -1;
  (Object.keys(scores) as DoshaKey[]).forEach(key => {
    if (scores[key] > max) {
      max = scores[key];
      best = key;
    }
  });
  return best;
};
