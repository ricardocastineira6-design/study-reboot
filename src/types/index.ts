export interface StudySession {
  id: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // in seconds
  date: string;
}

export interface Question {
  id: string;
  text: string;
  category: string;
  isResolved: boolean;
  notes?: string;
  createdAt: Date;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  text: string;
  isCompleted: boolean;
  createdAt: Date;
  category?: string;
}

export interface TodoItem {
  id: string;
  text: string;
  isCompleted: boolean;
  priority: 'low' | 'medium' | 'high';
  category: 'personal' | 'work' | 'study' | 'health' | 'other';
  createdAt: Date;
  completedAt?: Date;
  dueDate?: string;
}

export interface TodoList {
  id: string;
  title: string;
  type: 'weekly' | 'monthly';
  items: TodoItem[];
  createdAt: Date;
  weekStart?: string; // Para listas semanales (formato YYYY-MM-DD)
  month?: string; // Para listas mensuales (formato YYYY-MM)
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  type: 'exam' | 'assignment' | 'study' | 'other';
  category: 'personal' | 'estudio';
  description?: string;
}

export interface MoodEntry {
  id: string;
  date: string;
  mood: 'excellent' | 'good' | 'okay' | 'stressed' | 'sad';
  note?: string;
}

export interface StudyStats {
  totalHoursToday: number;
  totalHoursWeek: number;
  totalHoursMonth: number;
  averageDailyHours: number;
  mostProductiveDays: string[];
  weeklyData: { day: string; hours: number }[];
}

export type Page = 'home' | 'questions' | 'notes' | 'calendar' | 'mood' | 'stats' | 'todolist';

export interface User {
  id: string;
  email: string;
  displayName?: string;
  createdAt: Date;
}

export interface UserData {
  studySessions: StudySession[];
  questions: Question[];
  notes: Note[];
  tasks: Task[];
  calendarEvents: CalendarEvent[];
  moodEntries: MoodEntry[];
  settings?: UserSettings;
}

export interface UserSettings {
  theme?: 'light' | 'dark';
  notifications?: boolean;
  defaultStudyDuration?: number;
}
