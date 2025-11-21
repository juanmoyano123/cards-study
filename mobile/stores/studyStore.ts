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
  cardStartTime: number | null;

  // Rating breakdown tracking
  ratingsAgain: number;
  ratingsHard: number;
  ratingsGood: number;
  ratingsEasy: number;

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
  cardStartTime: null,
  ratingsAgain: 0,
  ratingsHard: 0,
  ratingsGood: 0,
  ratingsEasy: 0,
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
        cardStartTime: Date.now(),
        ratingsAgain: 0,
        ratingsHard: 0,
        ratingsGood: 0,
        ratingsEasy: 0,
        sessionSummary: null,
      });
    } catch (error) {
      console.error('Failed to load study queue:', error);
      const message =
        error instanceof Error ? error.message : 'Failed to load study queue';
      set({ error: message });
    } finally {
      set({ loading: false });
    }
  },

  flipCard: () => {
    set((state) => ({ isFlipped: !state.isFlipped }));
  },

  submitReview: async (rating) => {
    const { queue, currentIndex, cardStartTime } = get();
    const currentCard = queue[currentIndex];

    if (!currentCard) {
      throw new Error('No card to review');
    }

    try {
      set({ submitting: true, error: null });

      // Calculate time spent on this card
      const timeSpent = cardStartTime
        ? Math.floor((Date.now() - cardStartTime) / 1000)
        : undefined;

      const response = await studyService.submitReview({
        card_id: currentCard.id,
        rating,
        time_spent_seconds: timeSpent,
      });

      // Track rating breakdown
      set((state) => {
        const updates: Partial<StudyState> = {
          cardsStudied: state.cardsStudied + 1,
        };

        switch (rating) {
          case 1:
            updates.ratingsAgain = state.ratingsAgain + 1;
            break;
          case 2:
            updates.ratingsHard = state.ratingsHard + 1;
            break;
          case 3:
            updates.ratingsGood = state.ratingsGood + 1;
            break;
          case 4:
            updates.ratingsEasy = state.ratingsEasy + 1;
            break;
        }

        return updates;
      });

      return response;
    } catch (error) {
      console.error('Failed to submit review:', error);
      const message =
        error instanceof Error ? error.message : 'Failed to submit review';
      set({ error: message });
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
        cardStartTime: Date.now(), // Reset timer for next card
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
      cardStartTime: null,
      ratingsAgain: 0,
      ratingsHard: 0,
      ratingsGood: 0,
      ratingsEasy: 0,
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
