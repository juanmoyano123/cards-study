import { api } from './api';
import type { Flashcard, ApiResponse, PaginatedResponse } from '../types';

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
    const response = await api.post<ApiResponse<GenerateFlashcardsResponse>>(
      '/flashcards/generate',
      request
    );

    if (response.data.error) {
      throw new Error(response.data.error);
    }

    return response.data.data!;
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
    if (response.data.error) {
      throw new Error(response.data.error);
    }
    return response.data.data!;
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

    if (response.data.error) {
      throw new Error(response.data.error);
    }

    return response.data.data!;
  },

  /**
   * Delete a flashcard
   */
  async deleteFlashcard(id: string): Promise<void> {
    const response = await api.delete<ApiResponse<void>>(`/flashcards/${id}`);
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

    if (response.data.error) {
      throw new Error(response.data.error);
    }

    return response.data.data!;
  },
};
