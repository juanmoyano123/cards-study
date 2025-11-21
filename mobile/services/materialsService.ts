import { api } from './api';
import type { StudyMaterial, ApiResponse, PaginatedResponse } from '../types';

export interface UploadMaterialRequest {
  file?: any; // File from expo-document-picker
  text?: string;
  filename: string;
  subject_category?: string;
  tags?: string[];
}

export interface UploadMaterialResponse {
  id: string;
  filename: string;
  extracted_text: string;
  word_count: number;
  subject_category?: string;
  tags: string[];
  status: string;
  created_at: string;
}

export const materialsService = {
  /**
   * Upload a PDF file or paste text to create a study material
   */
  async uploadMaterial(request: UploadMaterialRequest): Promise<UploadMaterialResponse> {
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

    formData.append('filename', request.filename);

    if (request.subject_category) {
      formData.append('subject_category', request.subject_category);
    }

    if (request.tags && request.tags.length > 0) {
      formData.append('tags', JSON.stringify(request.tags));
    }

    const response = await api.post<UploadMaterialResponse>(
      '/materials/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
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
