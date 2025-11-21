import { api } from './api';
import type {
  StudyCard,
  StudyQueueResponse,
  ReviewRequest,
  ReviewResponse,
  SessionSummary,
} from '../types';

export const studyService = {
  /**
   * Get the study queue - cards due for review today
   */
  async getStudyQueue(options?: {
    limit?: number;
    includeNew?: boolean;
    newCardsLimit?: number;
  }): Promise<StudyQueueResponse> {
    const params = new URLSearchParams();
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.includeNew !== undefined)
      params.append('include_new', options.includeNew.toString());
    if (options?.newCardsLimit)
      params.append('new_cards_limit', options.newCardsLimit.toString());

    const url = `/study/queue${params.toString() ? `?${params}` : ''}`;
    const response = await api.get<StudyQueueResponse>(url);
    return response.data;
  },

  /**
   * Submit a review for a flashcard
   */
  async submitReview(request: ReviewRequest): Promise<ReviewResponse> {
    const response = await api.post<ReviewResponse>('/study/review', request);
    return response.data;
  },

  /**
   * Get the current day's study session summary
   */
  async getCurrentSession(): Promise<SessionSummary | null> {
    try {
      const response = await api.get<SessionSummary>('/study/session');
      return response.data;
    } catch {
      return null;
    }
  },

  /**
   * End the current study session
   */
  async endSession(): Promise<SessionSummary> {
    const response = await api.post<SessionSummary>('/study/session/end');
    return response.data;
  },
};
