export type PendingDietPlanReview = {
  patientDietPlanId: string;
  dietPlanId?: string;
  rating: number;
  avg_rating?: number | null;
};

let pending: PendingDietPlanReview | null = null;

/** Set just before goBack() from Share Experience (diet plan). */
export const setPendingDietPlanReview = (payload: PendingDietPlanReview) => {
  pending = payload;
};

/** Read once on Diet screen focus, then clear. */
export const consumePendingDietPlanReview = (): PendingDietPlanReview | null => {
  const next = pending;
  pending = null;
  return next;
};
