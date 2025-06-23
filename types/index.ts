export type MoodType = 'overwhelmed' | 'focused' | 'lowenergy';

export interface EmotionalState {
  id: string;
  user_id: string;
  mood: MoodType;
  timestamp: string;
}

export interface FocusTask {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed';
  created_at: string;
}

export interface UserProfile {
  id: string;
  display_name?: string;
  neurodivergent_status?: string;
  dev_mode_enabled?: boolean;
  created_at: string;
  updated_at: string;
}

export interface MoodQuote {
  text: string;
  author?: string;
  mood: MoodType;
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  accent: string;
}

export interface AITaskAssist {
  id: string;
  user_id: string;
  task_id: string;
  suggestion: string;
  timestamp: string;
  mood: MoodType;
}

export interface AISubtask {
  title: string;
  description: string;
  estimatedTime: string;
  priority: 'high' | 'medium' | 'low';
}

export interface AITaskBreakdown {
  subtasks: AISubtask[];
  tips: string[];
  moodSpecificAdvice: string;
}

export interface AIPrioritizedTask {
  title: string;
  priority: number;
  reasoning: string;
  moodFit: 'high' | 'medium' | 'low';
}

export interface AITaskPrioritization {
  prioritizedTasks: AIPrioritizedTask[];
  generalAdvice: string;
  energyManagement: string;
}