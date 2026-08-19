import type { ClaimReview } from "../types";

const STORAGE_KEY = "warranty-flow.demo.reviews.v1";

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function readReviews(): ClaimReview[] {
  if (!canUseStorage()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ClaimReview[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeReviews(reviews: ClaimReview[]): void {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
}

export function upsertReview(review: ClaimReview): ClaimReview[] {
  const reviews = readReviews();
  const index = reviews.findIndex((existing) => existing.id === review.id);
  if (index === -1) reviews.unshift(review);
  else reviews[index] = review;
  writeReviews(reviews);
  return reviews;
}

export function clearReviews(): void {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(STORAGE_KEY);
}
