import { flashcardsService } from '../flashcardsService';
import { api } from '../api';

// Mock the api module
jest.mock('../api');

describe('flashcardsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateFlashcards', () => {
    it('generates flashcards successfully', async () => {
      const mockResponse = {
        data: {
          cards: [
            {
              id: 'card-1',
              question: 'What is React?',
              answer: 'A JavaScript library',
              difficulty: 2,
              tags: ['react'],
            },
            {
              id: 'card-2',
              question: 'What is TypeScript?',
              answer: 'A typed superset of JavaScript',
              difficulty: 3,
              tags: ['typescript'],
            },
          ],
          count: 2,
          material_id: 'material-123',
        },
      };

      (api.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await flashcardsService.generateFlashcards({
        material_id: 'material-123',
        card_count: 2,
      });

      expect(api.post).toHaveBeenCalledWith(
        '/flashcards/generate',
        {
          material_id: 'material-123',
          card_count: 2,
        },
        { timeout: 90000 }
      );

      expect(result.cards).toHaveLength(2);
      expect(result.count).toBe(2);
      expect(result.material_id).toBe('material-123');
    });

    it('includes difficulty when provided', async () => {
      const mockResponse = {
        data: {
          cards: [],
          count: 0,
          material_id: 'material-123',
        },
      };

      (api.post as jest.Mock).mockResolvedValue(mockResponse);

      await flashcardsService.generateFlashcards({
        material_id: 'material-123',
        card_count: 10,
        difficulty: 4,
      });

      expect(api.post).toHaveBeenCalledWith(
        '/flashcards/generate',
        expect.objectContaining({
          difficulty: 4,
        }),
        { timeout: 90000 }
      );
    });

    it('throws error when generation fails', async () => {
      (api.post as jest.Mock).mockRejectedValue(
        new Error('Failed to generate flashcards')
      );

      await expect(
        flashcardsService.generateFlashcards({
          material_id: 'material-123',
          card_count: 10,
        })
      ).rejects.toThrow('Failed to generate flashcards');
    });
  });

  describe('getFlashcards', () => {
    it('fetches flashcards list successfully', async () => {
      const mockResponse = {
        data: {
          data: [
            { id: 'card-1', question: 'Q1', answer: 'A1' },
            { id: 'card-2', question: 'Q2', answer: 'A2' },
          ],
          total: 2,
          page: 1,
          per_page: 50,
          total_pages: 1,
        },
      };

      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await flashcardsService.getFlashcards(1, 50);

      expect(api.get).toHaveBeenCalledWith('/flashcards?page=1&per_page=50');
      expect(result.data).toHaveLength(2);
    });

    it('includes status filter when provided', async () => {
      const mockResponse = {
        data: {
          data: [],
          total: 0,
          page: 1,
          per_page: 50,
          total_pages: 0,
        },
      };

      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      await flashcardsService.getFlashcards(1, 50, 'draft');

      expect(api.get).toHaveBeenCalledWith(
        '/flashcards?page=1&per_page=50&status=draft'
      );
    });
  });

  describe('updateFlashcard', () => {
    it('updates a flashcard successfully', async () => {
      const mockResponse = {
        data: {
          data: {
            id: 'card-1',
            question: 'Updated Question',
            answer: 'Updated Answer',
            difficulty: 4,
          },
        },
      };

      (api.put as jest.Mock).mockResolvedValue(mockResponse);

      const result = await flashcardsService.updateFlashcard('card-1', {
        question: 'Updated Question',
        answer: 'Updated Answer',
        difficulty: 4,
      });

      expect(api.put).toHaveBeenCalledWith('/flashcards/card-1', {
        question: 'Updated Question',
        answer: 'Updated Answer',
        difficulty: 4,
      });

      expect(result.question).toBe('Updated Question');
    });
  });

  describe('deleteFlashcard', () => {
    it('deletes a flashcard successfully', async () => {
      const mockResponse = {
        data: {},
      };

      (api.delete as jest.Mock).mockResolvedValue(mockResponse);

      await flashcardsService.deleteFlashcard('card-1');

      expect(api.delete).toHaveBeenCalledWith('/flashcards/card-1');
    });
  });

  describe('confirmFlashcards', () => {
    it('confirms draft flashcards successfully', async () => {
      const mockResponse = {
        data: {
          confirmed_count: 5,
          message: 'Confirmed 5 flashcards',
        },
      };

      (api.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await flashcardsService.confirmFlashcards([
        'card-1',
        'card-2',
        'card-3',
        'card-4',
        'card-5',
      ]);

      expect(api.post).toHaveBeenCalledWith('/flashcards/confirm', {
        flashcard_ids: ['card-1', 'card-2', 'card-3', 'card-4', 'card-5'],
      });

      expect(result.confirmed_count).toBe(5);
    });

    it('handles empty array', async () => {
      const mockResponse = {
        data: {
          confirmed_count: 0,
          message: 'Confirmed 0 flashcards',
        },
      };

      (api.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await flashcardsService.confirmFlashcards([]);

      expect(result.confirmed_count).toBe(0);
    });
  });
});
