import { api } from './api';
import type { StudyMaterial, ApiResponse, PaginatedResponse } from '../types';

export interface ExtractTextRequest {
  file?: any; // File from expo-document-picker
  text?: string;
  title?: string;
  subject?: string;
}

export interface ExtractTextResponse {
  material_id: string;
  title: string;
  extracted_text: string;
  word_count: number;
}

export const materialsService = {
  /**
   * Extract text from PDF or accept manual text
   */
  async extractText(request: ExtractTextRequest): Promise<ExtractTextResponse> {
    const formData = new FormData();

    if (request.file) {
      formData.append('file', {
        uri: request.file.uri,
        type: request.file.mimeType || 'application/pdf',
        name: request.file.name || 'document.pdf',
      } as any);
    }

    if (request.text) {
      formData.append('text', request.text);
    }

    if (request.title) {
      formData.append('title', request.title);
    }

    if (request.subject) {
      formData.append('subject', request.subject);
    }

    const response = await api.post<ApiResponse<ExtractTextResponse>>(
      '/materials/extract',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    if (response.data.error) {
      throw new Error(response.data.error);
    }

    return response.data.data!;
  },

  /**
   * Get all user's study materials
   */
  async getMaterials(
    page: number = 1,
    perPage: number = 20
  ): Promise<PaginatedResponse<StudyMaterial>> {
    const response = await api.get<PaginatedResponse<StudyMaterial>>(
      `/materials?page=${page}&per_page=${perPage}`
    );
    return response.data;
  },

  /**
   * Get a specific material by ID
   */
  async getMaterial(id: string): Promise<StudyMaterial> {
    const response = await api.get<ApiResponse<StudyMaterial>>(`/materials/${id}`);
    if (response.data.error) {
      throw new Error(response.data.error);
    }
    return response.data.data!;
  },

  /**
   * Delete a material
   */
  async deleteMaterial(id: string): Promise<void> {
    const response = await api.delete<ApiResponse<void>>(`/materials/${id}`);
    if (response.data.error) {
      throw new Error(response.data.error);
    }
  },
};
