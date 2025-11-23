import { api } from './api';
import type { Flashcard, ApiResponse, PaginatedResponse } from '../types';
import { handleApiResponse } from '../utils/apiHelpers';

export interface GenerateFlashcardsRequest {
  material_id: string;
  card_count?: number;
  difficulty?: number;
}

export interface GenerateFlashcardsResponse {
  cards: Flashcard[];
  count: number;
  material_id: string;
}

export interface UpdateFlashcardRequest {
  question?: string;
  answer?: string;
  difficulty?: number;
  tags?: string[];
  status?: 'draft' | 'active' | 'archived';
}

export const flashcardsService = {
  /**
   * Generate flashcards using AI
   */
  async generateFlashcards(
    request: GenerateFlashcardsRequest
  ): Promise<GenerateFlashcardsResponse> {
    console.log('[FlashcardsService] Starting generation:', request);
    const startTime = Date.now();

    const response = await api.post<GenerateFlashcardsResponse>(
      '/flashcards/generate',
      request,
      {
        timeout: 90000, // 90 seconds - should be enough for most PDFs
      }
    );

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`[FlashcardsService] Generation completed in ${elapsed}s`);
    console.log('[FlashcardsService] Response:', response.data);

    return response.data;
  },

  /**
   * Get all user's flashcards
   */
  async getFlashcards(
    page: number = 1,
    perPage: number = 50,
    status?: 'draft' | 'active' | 'archived'
  ): Promise<PaginatedResponse<Flashcard>> {
    let url = `/flashcards?page=${page}&per_page=${perPage}`;
    if (status) {
      url += `&status=${status}`;
    }

    const response = await api.get<PaginatedResponse<Flashcard>>(url);
    return response.data;
  },

  /**
   * Get a specific flashcard
   */
  async getFlashcard(id: string): Promise<Flashcard> {
    const response = await api.get<ApiResponse<Flashcard>>(`/flashcards/${id}`);
    return handleApiResponse(response);
  },

  /**
   * Update a flashcard
   */
  async updateFlashcard(
    id: string,
    data: UpdateFlashcardRequest
  ): Promise<Flashcard> {
    const response = await api.put<ApiResponse<Flashcard>>(
      `/flashcards/${id}`,
      data
    );
    return handleApiResponse(response);
  },

  /**
   * Delete a flashcard
   */
  async deleteFlashcard(id: string): Promise<void> {
    const response = await api.delete<ApiResponse<void>>(`/flashcards/${id}`);
    // For void responses, we just need to check for errors
    if (response.data.error) {
      throw new Error(response.data.error);
    }
  },

  /**
   * Batch save flashcards (for saving generated cards)
   */
  async saveFlashcards(cards: Partial<Flashcard>[]): Promise<Flashcard[]> {
    const response = await api.post<ApiResponse<Flashcard[]>>(
      '/flashcards/batch',
      { cards }
    );
    return handleApiResponse(response);
  },

  /**
   * Confirm draft flashcards (activate them for study)
   */
  async confirmFlashcards(flashcardIds: string[]): Promise<{ confirmed_count: number }> {
    const response = await api.post<{ confirmed_count: number; message: string }>(
      '/flashcards/confirm',
      { flashcard_ids: flashcardIds }
    );

    return response.data;
  },

  /**
   * Delete multiple flashcards
   */
  async deleteFlashcards(flashcardIds: string[]): Promise<{ deleted_count: number }> {
    let deletedCount = 0;

    // Delete each flashcard individually
    for (const id of flashcardIds) {
      try {
        await api.delete(`/flashcards/${id}`);
        deletedCount++;
      } catch (error) {
        console.error(`Failed to delete flashcard ${id}:`, error);
      }
    }

    return { deleted_count: deletedCount };
  },
};
