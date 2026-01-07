import { api } from './api';
import type {
  StudyMaterial,
  ApiResponse,
  PaginatedResponse,
  MaterialFlashcardsResponse,
  MaterialListResponse
} from '../types';

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
    console.log('[MaterialsService] Starting upload:', request.filename);
    const startTime = Date.now();

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
        timeout: 60000, // 1 minute timeout for PDF upload
      }
    );

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`[MaterialsService] Upload completed in ${elapsed}s`);

    return response.data;
  },

  /**
   * Get all user's study materials
   */
  async getMaterials(
    page: number = 1,
    pageSize: number = 20
  ): Promise<MaterialListResponse> {
    const response = await api.get<MaterialListResponse>(
      `/materials?page=${page}&page_size=${pageSize}`
    );
    return response.data;
  },

  /**
   * Get a specific material by ID
   */
  async getMaterial(id: string): Promise<StudyMaterial> {
    const response = await api.get<StudyMaterial>(`/materials/${id}`);
    return response.data;
  },

  /**
   * Get all flashcards for a specific material
   */
  async getMaterialFlashcards(materialId: string): Promise<MaterialFlashcardsResponse> {
    console.log('[MaterialsService] Fetching flashcards for material:', materialId);
    const response = await api.get<MaterialFlashcardsResponse>(
      `/materials/${materialId}/flashcards`
    );
    return response.data;
  },

  /**
   * Delete a material
   */
  async deleteMaterial(id: string): Promise<void> {
    await api.delete(`/materials/${id}`);
  },
};
