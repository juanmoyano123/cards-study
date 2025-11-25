/**
 * StudyMaster Type Definitions
 * Shared types across the application
 */

// User types
export interface User {
  id: string;
  email: string;
  name?: string;
  subject?: string;
  created_at: string;
  updated_at: string;
}

// Auth types
export interface AuthSession {
  user: User;
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

export interface SignUpCredentials {
  email: string;
  password: string;
  name?: string;
}

export interface SignInCredentials {
  email: string;
  password: string;
}

// Study Material types
export interface StudyMaterial {
  id: string;
  user_id: string;
  title: string;
  source_type: 'pdf' | 'text' | 'manual';
  extracted_text: string;
  subject?: string;
  created_at: string;
  updated_at: string;
}

// Flashcard types
export interface Flashcard {
  id: string;
  user_id: string;
  material_id?: string;
  question: string;
  answer: string;
  difficulty?: number;
  tags?: string[];
  status: 'draft' | 'active' | 'archived';
  created_at: string;
  updated_at: string;
}

// Card Stats types
export interface CardStats {
  id: string;
  card_id: string;
  ease_factor: number;
  interval: number;
  repetitions: number;
  due_date: string;
  last_reviewed?: string;
  created_at: string;
  updated_at: string;
}

// Card Review types
export interface CardReview {
  id: string;
  card_id: string;
  user_id: string;
  rating: 1 | 2 | 3 | 4; // Again, Hard, Good, Easy
  time_spent: number; // seconds
  reviewed_at: string;
}

// Study Session types
export interface StudySession {
  id: string;
  user_id: string;
  cards_studied: number;
  duration: number; // seconds
  started_at: string;
  ended_at?: string;
}

// User Stats types
export interface UserStats {
  id: string;
  user_id: string;
  total_cards: number;
  cards_mastered: number;
  current_streak: number;
  longest_streak: number;
  total_study_time: number; // seconds
  last_study_date?: string;
  created_at: string;
  updated_at: string;
}

// Dashboard types
export interface DashboardStats {
  current_streak: number;
  longest_streak: number;
  cards_due_today: number;
  cards_studied_today: number;
  total_cards_mastered: number;
  heatmap_data: HeatmapData[];
  progress_by_subject: SubjectProgress[];
}

export interface HeatmapData {
  date: string; // YYYY-MM-DD
  count: number;
}

export interface SubjectProgress {
  subject: string;
  mastered: number;
  total: number;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// Study Mode types
export interface StudyCard {
  id: string;
  question: string;
  answer: string;
  explanation?: string;
  tags?: string[];
  difficulty: number;
  interval_days: number;
  ease_factor: number;
  review_count: number;
  mastery_level: 'new' | 'learning' | 'young' | 'mature' | 'mastered';
  next_intervals: {
    1: string;
    2: string;
    3: string;
    4: string;
  };
}

export interface StudyQueueResponse {
  cards: StudyCard[];
  total_due: number;
  new_cards: number;
  review_cards: number;
  overdue_cards: number;
}

export interface ReviewRequest {
  card_id: string;
  rating: 1 | 2 | 3 | 4;
  time_spent_seconds?: number;
}

export interface ReviewResponse {
  success: boolean;
  card_id: string;
  new_interval_days: number;
  new_ease_factor: number;
  new_due_date: string;
  mastery_level: string;
  cards_remaining: number;
}

export interface SessionSummary {
  session_id: string;
  cards_studied: number;
  cards_again: number;
  cards_hard: number;
  cards_good: number;
  cards_easy: number;
  time_spent_minutes: number;
  streak_day: number;
  pomodoro_sessions?: number;
}

// Pomodoro types
export interface PomodoroStats {
  pomodoro_sessions: number;
  total_focus_minutes: number;
  date: string;
}

export interface PomodoroSettings {
  work_duration: number;
  break_duration: number;
  long_break_duration: number;
  pomodoros_until_long_break: number;
  auto_start_break: boolean;
  auto_start_work: boolean;
  sound_enabled: boolean;
  vibration_enabled: boolean;
}
