import { materialsService } from '../materialsService';
import { api } from '../api';

// Mock the api module
jest.mock('../api');

describe('materialsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadMaterial', () => {
    it('uploads a PDF file successfully', async () => {
      const mockFile = {
        uri: 'file://path/to/document.pdf',
        name: 'document.pdf',
        mimeType: 'application/pdf',
        size: 1024000,
      };

      const mockResponse = {
        data: {
          id: 'material-123',
          filename: 'document.pdf',
          extracted_text: 'This is the extracted text',
          word_count: 100,
          tags: [],
          status: 'completed',
          created_at: '2024-01-01T00:00:00Z',
        },
      };

      (api.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await materialsService.uploadMaterial({
        file: mockFile,
        filename: 'My Document',
      });

      expect(api.post).toHaveBeenCalledWith(
        '/materials/upload',
        expect.any(Object), // FormData
        expect.objectContaining({
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
      );

      expect(result.id).toBe('material-123');
      expect(result.filename).toBe('document.pdf');
    });

    it('uploads pasted text successfully', async () => {
      const mockResponse = {
        data: {
          id: 'material-456',
          filename: 'My Text',
          extracted_text: 'This is my pasted text content',
          word_count: 50,
          tags: [],
          status: 'completed',
          created_at: '2024-01-01T00:00:00Z',
        },
      };

      (api.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await materialsService.uploadMaterial({
        text: 'This is my pasted text content',
        filename: 'My Text',
      });

      expect(api.post).toHaveBeenCalled();
      expect(result.id).toBe('material-456');
    });

    it('includes subject category and tags when provided', async () => {
      const mockResponse = {
        data: {
          id: 'material-789',
          filename: 'Biology Notes',
          extracted_text: 'Biology content',
          word_count: 200,
          subject_category: 'Biology',
          tags: ['cells', 'photosynthesis'],
          status: 'completed',
          created_at: '2024-01-01T00:00:00Z',
        },
      };

      (api.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await materialsService.uploadMaterial({
        text: 'Biology content',
        filename: 'Biology Notes',
        subject_category: 'Biology',
        tags: ['cells', 'photosynthesis'],
      });

      expect(result.subject_category).toBe('Biology');
      expect(result.tags).toEqual(['cells', 'photosynthesis']);
    });
  });

  describe('getMaterials', () => {
    it('fetches materials list successfully', async () => {
      const mockResponse = {
        data: {
          materials: [
            {
              id: 'mat-1',
              filename: 'Document 1',
              word_count: 100,
            },
            {
              id: 'mat-2',
              filename: 'Document 2',
              word_count: 200,
            },
          ],
          total: 2,
          page: 1,
          page_size: 20,
        },
      };

      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await materialsService.getMaterials(1, 20);

      expect(api.get).toHaveBeenCalledWith('/materials?page=1&page_size=20');
      expect(result.materials).toHaveLength(2);
      expect(result.total).toBe(2);
    });
  });

  describe('getMaterial', () => {
    it('fetches a single material by ID', async () => {
      const mockResponse = {
        data: {
          id: 'material-123',
          filename: 'My Document',
          extracted_text: 'Full text content',
          word_count: 500,
        },
      };

      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await materialsService.getMaterial('material-123');

      expect(api.get).toHaveBeenCalledWith('/materials/material-123');
      expect(result.id).toBe('material-123');
    });

    it('throws error when material not found', async () => {
      (api.get as jest.Mock).mockRejectedValue(
        new Error('Material not found')
      );

      await expect(
        materialsService.getMaterial('nonexistent')
      ).rejects.toThrow('Material not found');
    });
  });

  describe('deleteMaterial', () => {
    it('deletes a material successfully', async () => {
      const mockResponse = {
        data: {},
      };

      (api.delete as jest.Mock).mockResolvedValue(mockResponse);

      await materialsService.deleteMaterial('material-123');

      expect(api.delete).toHaveBeenCalledWith('/materials/material-123');
    });
  });
});
