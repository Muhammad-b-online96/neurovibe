import { create } from 'zustand';
import { FocusTask } from '@/types';
import { supabase } from '@/lib/supabase';

interface TaskState {
  tasks: FocusTask[];
  loading: boolean;
  fetchTasks: (userId: string) => Promise<void>;
  createTask: (task: Omit<FocusTask, 'id' | 'created_at'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<FocusTask>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTaskStatus: (id: string) => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  loading: false,

  fetchTasks: async (userId: string) => {
    set({ loading: true });

    try {
      const { data, error } = await supabase
        .from('focus_tasks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      set({ tasks: data || [], loading: false });
    } catch (error) {
      console.error('Error fetching tasks:', error);
      set({ loading: false });
    }
  },

  createTask: async (task: Omit<FocusTask, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('focus_tasks')
        .insert({
          ...task,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      set({ tasks: [data, ...get().tasks] });
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  },

  updateTask: async (id: string, updates: Partial<FocusTask>) => {
    try {
      const { data, error } = await supabase
        .from('focus_tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      set({
        tasks: get().tasks.map(task => 
          task.id === id ? { ...task, ...data } : task
        )
      });
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  },

  deleteTask: async (id: string) => {
    try {
      const { error } = await supabase
        .from('focus_tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set({
        tasks: get().tasks.filter(task => task.id !== id)
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  },

  toggleTaskStatus: async (id: string) => {
    const task = get().tasks.find(t => t.id === id);
    if (!task) return;

    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    await get().updateTask(id, { status: newStatus });
  },
}));