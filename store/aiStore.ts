import { create } from 'zustand';
import { AITaskAssist, AITaskBreakdown, AITaskPrioritization, FocusTask, MoodType } from '@/types';
import { supabase } from '@/lib/supabase';

interface AIState {
  loading: boolean;
  error: string | null;
  getTaskBreakdown: (task: FocusTask, mood: MoodType, userId: string) => Promise<AITaskBreakdown>;
  getTaskPrioritization: (tasks: FocusTask[], mood: MoodType, userId: string) => Promise<AITaskPrioritization>;
  getTaskAssists: (taskId: string) => Promise<AITaskAssist[]>;
}

export const useAIStore = create<AIState>((set, get) => ({
  loading: false,
  error: null,

  getTaskBreakdown: async (task: FocusTask, mood: MoodType, userId: string) => {
    set({ loading: true, error: null });

    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/ai-task-breakdown`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskId: task.id,
          userId,
          mood,
          taskTitle: task.title,
          taskDescription: task.description,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get AI breakdown');
      }

      const data = await response.json();
      set({ loading: false });
      return data.suggestion;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      set({ loading: false, error: errorMessage });
      throw error;
    }
  },

  getTaskPrioritization: async (tasks: FocusTask[], mood: MoodType, userId: string) => {
    set({ loading: true, error: null });

    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/ai-task-prioritization`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          mood,
          tasks: tasks.map(task => ({
            id: task.id,
            title: task.title,
            description: task.description,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get AI prioritization');
      }

      const data = await response.json();
      set({ loading: false });
      return data.suggestion;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      set({ loading: false, error: errorMessage });
      throw error;
    }
  },

  getTaskAssists: async (taskId: string) => {
    try {
      const { data, error } = await supabase
        .from('ai_task_assists')
        .select('*')
        .eq('task_id', taskId)
        .order('timestamp', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching task assists:', error);
      return [];
    }
  },
}));