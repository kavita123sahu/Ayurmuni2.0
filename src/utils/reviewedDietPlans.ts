import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@ayurmuni_reviewed_diet_assignments';

let reviewedIds = new Set<string>();
let hydrated = false;

export const hydrateReviewedDietPlans = async (): Promise<void> => {
  if (hydrated) return;
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    reviewedIds = new Set(
      Array.isArray(parsed) ? parsed.map((id: unknown) => String(id)) : [],
    );
  } catch {
    reviewedIds = new Set();
  }
  hydrated = true;
};

export const markDietPlanAssignmentReviewed = async (
  patientDietPlanId: string,
): Promise<void> => {
  const id = String(patientDietPlanId || '').trim();
  if (!id) return;
  reviewedIds.add(id);
  hydrated = true;
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([...reviewedIds]));
  } catch {
    /* non-blocking */
  }
};

export const isDietPlanAssignmentReviewed = (
  patientDietPlanId?: string | null,
): boolean => {
  const id = String(patientDietPlanId || '').trim();
  if (!id) return false;
  return reviewedIds.has(id);
};
