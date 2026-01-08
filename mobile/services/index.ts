/**
 * StudyMaster API Services
 * Centralized export of all API service modules
 */

export { api } from './api';
export { authService } from './authService';
export { materialsService } from './materialsService';
export { flashcardsService } from './flashcardsService';
export { studyService } from './studyService';
export { pomodoroService } from './pomodoroService';
export * from './goalService';
export * from './statsService';

export type {
  GenerateFlashcardsRequest,
  GenerateFlashcardsResponse,
  UpdateFlashcardRequest,
} from './flashcardsService';
export type {
  PomodoroStats,
  PomodoroSessionResponse,
  PomodoroSettingsResponse,
} from './pomodoroService';
