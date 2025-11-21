import { create } from 'zustand';
import { studyService } from '../services';
import type {
  StudyCard,
  StudyQueueResponse,
  ReviewResponse,
  SessionSummary,
} from '../types';

interface StudyState {
  // Queue state
  queue: StudyCard[];
  currentIndex: number;
  isFlipped: boolean;

  // Loading states
  loading: boolean;
  submitting: boolean;
  error: string | null;

  // Session stats
  totalDue: number;
  newCards: number;
  reviewCards: number;
  overdueCards: number;
  cardsStudied: number;
  sessionStartTime: number | null;

  // Session summary (after completing)
  sessionSummary: SessionSummary | null;

  // Actions
  loadQueue: (options?: {
    limit?: number;
    includeNew?: boolean;
    newCardsLimit?: number;
  }) => Promise<void>;
  flipCard: () => void;
  submitReview: (rating: 1 | 2 | 3 | 4) => Promise<ReviewResponse>;
  nextCard: () => void;
  previousCard: () => void;
  resetSession: () => void;
  endSession: () => Promise<void>;

  // Computed getters
  getCurrentCard: () => StudyCard | null;
  getProgress: () => { current: number; total: number; percentage: number };
  isSessionComplete: () => boolean;
}

export const useStudyStore = create<StudyState>((set, get) => ({
  // Initial state
  queue: [],
  currentIndex: 0,
  isFlipped: false,
  loading: false,
  submitting: false,
  error: null,
  totalDue: 0,
  newCards: 0,
  reviewCards: 0,
  overdueCards: 0,
  cardsStudied: 0,
  sessionStartTime: null,
  sessionSummary: null,

  loadQueue: async (options) => {
    try {
      set({ loading: true, error: null });

      const response: StudyQueueResponse = await studyService.getStudyQueue(options);

      set({
        queue: response.cards,
        totalDue: response.total_due,
        newCards: response.new_cards,
        reviewCards: response.review_cards,
        overdueCards: response.overdue_cards,
        currentIndex: 0,
        isFlipped: false,
        cardsStudied: 0,
        sessionStartTime: Date.now(),
        sessionSummary: null,
      });
    } catch (error: any) {
      console.error('Failed to load study queue:', error);
      set({ error: error.message || 'Failed to load study queue' });
    } finally {
      set({ loading: false });
    }
  },

  flipCard: () => {
    set((state) => ({ isFlipped: !state.isFlipped }));
  },

  submitReview: async (rating) => {
    const { queue, currentIndex, sessionStartTime } = get();
    const currentCard = queue[currentIndex];

    if (!currentCard) {
      throw new Error('No card to review');
    }

    try {
      set({ submitting: true, error: null });

      // Calculate time spent (rough estimate)
      const timeSpent = sessionStartTime
        ? Math.floor((Date.now() - sessionStartTime) / 1000)
        : undefined;

      const response = await studyService.submitReview({
        card_id: currentCard.id,
        rating,
        time_spent_seconds: timeSpent,
      });

      set((state) => ({
        cardsStudied: state.cardsStudied + 1,
      }));

      return response;
    } catch (error: any) {
      console.error('Failed to submit review:', error);
      set({ error: error.message || 'Failed to submit review' });
      throw error;
    } finally {
      set({ submitting: false });
    }
  },

  nextCard: () => {
    set((state) => {
      const newIndex = state.currentIndex + 1;
      return {
        currentIndex: newIndex,
        isFlipped: false,
        sessionStartTime: Date.now(), // Reset timer for next card
      };
    });
  },

  previousCard: () => {
    set((state) => ({
      currentIndex: Math.max(0, state.currentIndex - 1),
      isFlipped: false,
    }));
  },

  resetSession: () => {
    set({
      queue: [],
      currentIndex: 0,
      isFlipped: false,
      loading: false,
      submitting: false,
      error: null,
      totalDue: 0,
      newCards: 0,
      reviewCards: 0,
      overdueCards: 0,
      cardsStudied: 0,
      sessionStartTime: null,
      sessionSummary: null,
    });
  },

  endSession: async () => {
    try {
      const summary = await studyService.endSession();
      set({ sessionSummary: summary });
    } catch (error) {
      // Session might not exist, that's okay
      console.log('No active session to end');
    }
  },

  getCurrentCard: () => {
    const { queue, currentIndex } = get();
    return queue[currentIndex] ?? null;
  },

  getProgress: () => {
    const { cardsStudied, totalDue } = get();
    return {
      current: cardsStudied,
      total: totalDue,
      percentage: totalDue > 0 ? Math.round((cardsStudied / totalDue) * 100) : 0,
    };
  },

  isSessionComplete: () => {
    const { currentIndex, queue } = get();
    return currentIndex >= queue.length && queue.length > 0;
  },
}));
