import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import { Upload, FileText, Type } from 'lucide-react-native';
import {
  Text,
  Input,
  Textarea,
  Button,
  Card,
  ProgressBar,
  CardPreview,
  EditCardModal,
} from '../../components';
import type { PreviewCard, EditableCard } from '../../components';
import { colors, spacing } from '../../constants';
import { materialsService } from '../../services/materialsService';
import { flashcardsService } from '../../services/flashcardsService';

type Tab = 'pdf' | 'text';
type Step = 'input' | 'uploading' | 'generating' | 'preview';

interface UploadedFile {
  uri: string;
  name: string;
  mimeType?: string;
  size?: number;
}

export default function UploadScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('pdf');
  const [step, setStep] = useState<Step>('input');

  // Form state
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);
  const [pastedText, setPastedText] = useState('');
  const [filename, setFilename] = useState('');
  const [cardCount, setCardCount] = useState('20');
  const [error, setError] = useState('');

  // Progress state
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');

  // Generated cards state
  const [generatedCards, setGeneratedCards] = useState<PreviewCard[]>([]);
  const [materialId, setMaterialId] = useState<string | null>(null);

  // Edit modal state
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingCard, setEditingCard] = useState<EditableCard | null>(null);

  // Handle PDF file selection
  const handleSelectPDF = async () => {
    try {
      setError('');
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      const file = result.assets[0];

      // Validate file size (10MB max)
      if (file.size && file.size > 10 * 1024 * 1024) {
        setError('PDF file must be smaller than 10MB');
        return;
      }

      setSelectedFile({
        uri: file.uri,
        name: file.name,
        mimeType: file.mimeType,
        size: file.size,
      });

      // Auto-fill filename
      if (!filename) {
        setFilename(file.name.replace('.pdf', ''));
      }
    } catch (err) {
      console.error('Error selecting PDF:', err);
      setError('Failed to select PDF file');
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    setError('');

    if (!filename.trim()) {
      setError('Please provide a name for this material');
      return false;
    }

    if (activeTab === 'pdf') {
      if (!selectedFile) {
        setError('Please select a PDF file');
        return false;
      }
    } else {
      if (!pastedText.trim()) {
        setError('Please paste some text');
        return false;
      }
      if (pastedText.trim().length < 50) {
        setError('Text must be at least 50 characters');
        return false;
      }
    }

    const count = parseInt(cardCount);
    if (isNaN(count) || count < 1 || count > 100) {
      setError('Card count must be between 1 and 100');
      return false;
    }

    return true;
  };

  // Handle upload and generation
  const handleGenerateCards = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      // Step 1: Upload material
      setStep('uploading');
      setProgress(0.2);
      setProgressMessage('Uploading material...');

      const uploadResponse = await materialsService.uploadMaterial({
        file: activeTab === 'pdf' ? selectedFile : undefined,
        text: activeTab === 'text' ? pastedText : undefined,
        filename: filename.trim(),
      });

      console.log('[Upload] Upload response:', uploadResponse);
      console.log('[Upload] Material ID:', uploadResponse.id);
      setMaterialId(uploadResponse.id);

      // Step 2: Extract text (already done by backend)
      setProgress(0.4);
      setProgressMessage(
        activeTab === 'pdf' ? 'Extracting text from PDF...' : 'Processing text...'
      );

      // Small delay for UX
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Step 3: Generate flashcards
      setStep('generating');
      setProgress(0.6);
      setProgressMessage(`Generating ${cardCount} flashcards with AI...`);

      console.log('[Upload] About to call generateFlashcards with:', {
        material_id: uploadResponse.id,
        card_count: parseInt(cardCount),
      });

      const generateResponse = await flashcardsService.generateFlashcards({
        material_id: uploadResponse.id,
        card_count: parseInt(cardCount),
      });

      console.log('[Upload] Generate response received:', generateResponse);

      setProgress(1);
      setProgressMessage('Generation complete!');

      // Transform cards to local format with selection state
      const cards: PreviewCard[] = generateResponse.cards.map((card) => ({
        id: card.id,
        question: card.question,
        answer: card.answer,
        explanation: card.explanation,
        difficulty: card.difficulty,
        tags: card.tags || [],
        selected: true, // All cards selected by default
      }));

      setGeneratedCards(cards);

      // Move to preview step
      await new Promise((resolve) => setTimeout(resolve, 500));
      setStep('preview');
    } catch (err: any) {
      console.error('Error generating cards:', err);
      setError(err.message || 'Failed to generate flashcards. Please try again.');
      setStep('input');
      setProgress(0);
    }
  };

  // Card Preview handlers
  const handleToggleSelect = (id: string) => {
    setGeneratedCards((cards) =>
      cards.map((card) =>
        card.id === id ? { ...card, selected: !card.selected } : card
      )
    );
  };

  const handleSelectAll = () => {
    setGeneratedCards((cards) =>
      cards.map((card) => ({ ...card, selected: true }))
    );
  };

  const handleDeselectAll = () => {
    setGeneratedCards((cards) =>
      cards.map((card) => ({ ...card, selected: false }))
    );
  };

  const handleEditCard = (id: string) => {
    const card = generatedCards.find((c) => c.id === id);
    if (card) {
      setEditingCard(card);
      setEditModalVisible(true);
    }
  };

  const handleSaveEditedCard = (editedCard: EditableCard) => {
    setGeneratedCards((cards) =>
      cards.map((card) =>
        card.id === editedCard.id
          ? {
              ...card,
              question: editedCard.question,
              answer: editedCard.answer,
              explanation: editedCard.explanation,
              difficulty: editedCard.difficulty,
              tags: editedCard.tags,
            }
          : card
      )
    );
  };

  const handleDeleteCard = (id: string) => {
    Alert.alert(
      'Delete Card',
      'Are you sure you want to delete this flashcard?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setGeneratedCards((cards) => cards.filter((card) => card.id !== id));
          },
        },
      ]
    );
  };

  // Handle save and navigate
  const handleSaveCards = async () => {
    try {
      const selectedCards = generatedCards.filter((c) => c.selected);

      if (selectedCards.length === 0) {
        Alert.alert('No Cards Selected', 'Please select at least one card to save');
        return;
      }

      // Confirm the selected cards
      const cardIds = selectedCards.map((c) => c.id);
      await flashcardsService.confirmFlashcards(cardIds);

      // Show success toast
      Alert.alert(
        'Success!',
        `${selectedCards.length} flashcards saved and ready to study`,
        [
          {
            text: 'Start Studying',
            onPress: () => router.push('/(tabs)/study'),
          },
          {
            text: 'View Dashboard',
            onPress: () => router.push('/(tabs)'),
          },
        ]
      );

      // Reset form
      resetForm();
    } catch (err: any) {
      console.error('Error saving cards:', err);
      Alert.alert('Error', 'Failed to save flashcards. Please try again.');
    }
  };

  // Reset form to initial state
  const resetForm = () => {
    setStep('input');
    setProgress(0);
    setProgressMessage('');
    setSelectedFile(null);
    setPastedText('');
    setFilename('');
    setCardCount('20');
    setError('');
    setGeneratedCards([]);
    setMaterialId(null);
  };

  // Render input step
  const renderInputStep = () => (
    <View style={styles.inputContainer}>
      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'pdf' && styles.tabActive]}
          onPress={() => setActiveTab('pdf')}
        >
          <Upload size={20} color={activeTab === 'pdf' ? colors.primary[500] : colors.neutral[500]} />
          <Text
            variant="button"
            style={[styles.tabText, activeTab === 'pdf' && styles.tabTextActive]}
          >
            Upload PDF
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'text' && styles.tabActive]}
          onPress={() => setActiveTab('text')}
        >
          <Type size={20} color={activeTab === 'text' ? colors.primary[500] : colors.neutral[500]} />
          <Text
            variant="button"
            style={[styles.tabText, activeTab === 'text' && styles.tabTextActive]}
          >
            Paste Text
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
        {/* PDF Upload Tab */}
        {activeTab === 'pdf' && (
          <View style={styles.tabContent}>
            <Text variant="h3" style={styles.sectionTitle}>
              Upload PDF Document
            </Text>
            <Text variant="body" color="secondary" style={styles.sectionDescription}>
              Select a PDF file (max 10MB) to extract text and generate flashcards
            </Text>

            <TouchableOpacity
              style={styles.filePickerButton}
              onPress={handleSelectPDF}
            >
              <FileText size={32} color={colors.primary[500]} />
              <Text variant="button" style={styles.filePickerText}>
                {selectedFile ? selectedFile.name : 'Select PDF File'}
              </Text>
              {selectedFile && selectedFile.size && (
                <Text variant="caption" color="secondary">
                  {(selectedFile.size / 1024).toFixed(0)} KB
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Text Paste Tab */}
        {activeTab === 'text' && (
          <View style={styles.tabContent}>
            <Text variant="h3" style={styles.sectionTitle}>
              Paste Text Content
            </Text>
            <Text variant="body" color="secondary" style={styles.sectionDescription}>
              Paste or type text content (min. 50 characters)
            </Text>

            <Textarea
              label="Text Content"
              value={pastedText}
              onChangeText={setPastedText}
              placeholder="Paste your study material here..."
              rows={10}
              maxLength={50000}
              showCharacterCount
            />
          </View>
        )}

        {/* Common Fields */}
        <View style={styles.commonFields}>
          <Input
            label="Material Name"
            value={filename}
            onChangeText={setFilename}
            placeholder="e.g., Biology Chapter 5"
            maxLength={100}
          />

          <Input
            label="Number of Flashcards"
            value={cardCount}
            onChangeText={setCardCount}
            keyboardType="numeric"
            placeholder="20"
            helperText="Generate between 1-100 flashcards"
          />
        </View>

        {error && (
          <Card variant="outlined" style={styles.errorCard}>
            <Text variant="body" style={styles.errorText}>
              {error}
            </Text>
          </Card>
        )}

        <Button
          title="Generate Flashcards"
          onPress={handleGenerateCards}
          fullWidth
          size="lg"
        />
      </ScrollView>
    </View>
  );

  // Render progress step
  const renderProgressStep = () => (
    <View style={styles.progressContainer}>
      <Card style={styles.progressCard}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
        <Text variant="h3" align="center" style={styles.progressTitle}>
          {progressMessage}
        </Text>
        <ProgressBar value={Math.round(progress * 100)} style={styles.progressBar} animated />
        <Text variant="caption" color="secondary" align="center">
          This may take 30-60 seconds...
        </Text>
      </Card>
    </View>
  );

  // Render preview step with full CardPreview integration
  const renderPreviewStep = () => (
    <View style={styles.previewContainer}>
      <View style={styles.previewHeader}>
        <View>
          <Text variant="h2">Review Flashcards</Text>
          <Text variant="body" color="secondary" style={styles.previewSubtitle}>
            Edit, select, or delete cards before saving
          </Text>
        </View>
      </View>

      <CardPreview
        cards={generatedCards}
        onToggleSelect={handleToggleSelect}
        onEdit={handleEditCard}
        onDelete={handleDeleteCard}
        onSelectAll={handleSelectAll}
        onDeselectAll={handleDeselectAll}
        style={styles.cardPreviewContainer}
      />

      <View style={styles.previewFooter}>
        <Button
          title="Generate More"
          variant="outline"
          onPress={resetForm}
          style={styles.previewButton}
        />
        <Button
          title={`Save ${generatedCards.filter((c) => c.selected).length} Cards`}
          onPress={handleSaveCards}
          disabled={generatedCards.filter((c) => c.selected).length === 0}
          style={styles.previewButton}
        />
      </View>

      {/* Edit Modal */}
      <EditCardModal
        visible={editModalVisible}
        card={editingCard}
        onClose={() => {
          setEditModalVisible(false);
          setEditingCard(null);
        }}
        onSave={handleSaveEditedCard}
      />
    </View>
  );

  // Main render
  return (
    <View style={styles.container}>
      {step === 'input' && renderInputStep()}
      {(step === 'uploading' || step === 'generating') && renderProgressStep()}
      {step === 'preview' && renderPreviewStep()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  inputContainer: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    paddingHorizontal: spacing[4],
    paddingTop: spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[3],
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    gap: spacing[2],
  },
  tabActive: {
    borderBottomColor: colors.primary[500],
  },
  tabText: {
    color: colors.neutral[500],
  },
  tabTextActive: {
    color: colors.primary[500],
  },
  formScroll: {
    flex: 1,
    padding: spacing[4],
  },
  tabContent: {
    marginBottom: spacing[6],
  },
  sectionTitle: {
    marginBottom: spacing[2],
  },
  sectionDescription: {
    marginBottom: spacing[4],
  },
  filePickerButton: {
    borderWidth: 2,
    borderColor: colors.border.default,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: spacing[6],
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutral[50],
    gap: spacing[2],
  },
  filePickerText: {
    marginTop: spacing[2],
  },
  commonFields: {
    marginTop: spacing[4],
  },
  errorCard: {
    backgroundColor: colors.error[50],
    borderColor: colors.error[200],
    marginBottom: spacing[4],
  },
  errorText: {
    color: colors.error[700],
  },
  progressContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[4],
  },
  progressCard: {
    width: '100%',
    maxWidth: 400,
    padding: spacing[6],
    alignItems: 'center',
    gap: spacing[4],
  },
  progressTitle: {
    marginTop: spacing[4],
  },
  progressBar: {
    width: '100%',
    marginVertical: spacing[2],
  },
  previewContainer: {
    flex: 1,
    backgroundColor: colors.white,
  },
  previewHeader: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  previewSubtitle: {
    marginTop: spacing[1],
  },
  cardPreviewContainer: {
    flex: 1,
  },
  previewFooter: {
    flexDirection: 'row',
    gap: spacing[3],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
    backgroundColor: colors.white,
  },
  previewButton: {
    flex: 1,
  },
});
