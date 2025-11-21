import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { EditCardModal, EditableCard } from '../EditCardModal';

const mockCard: EditableCard = {
  id: '1',
  question: 'What is React?',
  answer: 'A JavaScript library',
  explanation: 'React is popular',
  difficulty: 3,
  tags: ['react', 'frontend'],
};

describe('EditCardModal', () => {
  const mockOnClose = jest.fn();
  const mockOnSave = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders when visible with card data', () => {
    const { getByDisplayValue } = render(
      <EditCardModal
        visible={true}
        card={mockCard}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    expect(getByDisplayValue('What is React?')).toBeTruthy();
    expect(getByDisplayValue('A JavaScript library')).toBeTruthy();
  });

  it('does not render when not visible', () => {
    const { queryByText } = render(
      <EditCardModal
        visible={false}
        card={mockCard}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    expect(queryByText('Edit Flashcard')).toBeNull();
  });

  it('calls onClose when cancel button is pressed', () => {
    const { getByText } = render(
      <EditCardModal
        visible={true}
        card={mockCard}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    const cancelButton = getByText('Cancel');
    fireEvent.press(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('validates that question is required', async () => {
    const { getByText, getByDisplayValue } = render(
      <EditCardModal
        visible={true}
        card={mockCard}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    // Clear question field
    const questionInput = getByDisplayValue('What is React?');
    fireEvent.changeText(questionInput, '');

    const saveButton = getByText('Save Changes');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(mockOnSave).not.toHaveBeenCalled();
    });
  });

  it('validates that answer is required', async () => {
    const { getByText, getByDisplayValue } = render(
      <EditCardModal
        visible={true}
        card={mockCard}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    // Clear answer field
    const answerInput = getByDisplayValue('A JavaScript library');
    fireEvent.changeText(answerInput, '');

    const saveButton = getByText('Save Changes');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(mockOnSave).not.toHaveBeenCalled();
    });
  });

  it('calls onSave with updated data when save is pressed', async () => {
    const { getByText, getByDisplayValue } = render(
      <EditCardModal
        visible={true}
        card={mockCard}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    // Update question
    const questionInput = getByDisplayValue('What is React?');
    fireEvent.changeText(questionInput, 'What is React Native?');

    const saveButton = getByText('Save Changes');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          id: '1',
          question: 'What is React Native?',
        })
      );
    });
  });

  it('parses tags from comma-separated input', async () => {
    const { getByText, getByPlaceholderText } = render(
      <EditCardModal
        visible={true}
        card={mockCard}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    // Update tags
    const tagsInput = getByPlaceholderText('biology, cells, photosynthesis');
    fireEvent.changeText(tagsInput, 'javascript, typescript, web');

    const saveButton = getByText('Save Changes');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          tags: ['javascript', 'typescript', 'web'],
        })
      );
    });
  });

  it('allows changing difficulty level', async () => {
    const { getByText } = render(
      <EditCardModal
        visible={true}
        card={mockCard}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    // Select difficulty 5
    const difficulty5 = getByText('5 - Very Hard');
    fireEvent.press(difficulty5);

    const saveButton = getByText('Save Changes');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          difficulty: 5,
        })
      );
    });
  });

  it('shows character count for fields', () => {
    const { getAllByText } = render(
      <EditCardModal
        visible={true}
        card={mockCard}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    // Should show character counts (implementation dependent)
    expect(getAllByText(/\/\d+/).length).toBeGreaterThan(0);
  });
});
