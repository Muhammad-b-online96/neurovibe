import { create } from 'zustand';
import { MoodType, EmotionalState } from '@/types';
import { supabase } from '@/lib/supabase';

interface MoodState {
  currentMood: MoodType | null;
  moodHistory: EmotionalState[];
  loading: boolean;
  setMood: (mood: MoodType, userId: string) => Promise<void>;
  fetchMoodHistory: (userId: string) => Promise<void>;
  getCurrentMood: (userId: string) => Promise<MoodType | null>;
}

export const useMoodStore = create<MoodState>((set, get) => ({
  currentMood: null,
  moodHistory: [],
  loading: false,

  setMood: async (mood: MoodType, userId: string) => {
    set({ loading: true });
    
    try {
      const { data, error } = await supabase
        .from('emotional_states')
        .insert({
          user_id: userId,
          mood,
          timestamp: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      set({ 
        currentMood: mood,
        moodHistory: [data, ...get().moodHistory],
        loading: false 
      });
    } catch (error) {
      console.error('Error setting mood:', error);
      set({ loading: false });
      throw error;
    }
  },

  fetchMoodHistory: async (userId: string) => {
    set({ loading: true });

    try {
      const { data, error } = await supabase
        .from('emotional_states')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(50);

      if (error) throw error;

      const moodHistory = data || [];
      const currentMood = moodHistory.length > 0 ? moodHistory[0].mood as MoodType : null;

      set({ 
        moodHistory,
        currentMood,
        loading: false 
      });
    } catch (error) {
      console.error('Error fetching mood history:', error);
      set({ loading: false });
    }
  },

  getCurrentMood: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('emotional_states')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      const mood = data?.mood as MoodType || null;
      set({ currentMood: mood });
      return mood;
    } catch (error) {
      console.error('Error getting current mood:', error);
      return null;
    }
  },
}));