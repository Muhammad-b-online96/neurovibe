export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          display_name: string | null
          neurodivergent_status: string | null
          dev_mode_enabled: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          display_name?: string | null
          neurodivergent_status?: string | null
          dev_mode_enabled?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          display_name?: string | null
          neurodivergent_status?: string | null
          dev_mode_enabled?: boolean | null
          created_at?: string
          updated_at?: string
        }
      }
      emotional_states: {
        Row: {
          id: string
          user_id: string
          mood: string
          timestamp: string
        }
        Insert: {
          id?: string
          user_id: string
          mood: string
          timestamp?: string
        }
        Update: {
          id?: string
          user_id?: string
          mood?: string
          timestamp?: string
        }
      }
      focus_tasks: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          status?: string
          created_at?: string
        }
      }
      ai_task_assists: {
        Row: {
          id: string
          user_id: string
          task_id: string
          suggestion: string
          timestamp: string
          mood: string
        }
        Insert: {
          id?: string
          user_id: string
          task_id: string
          suggestion: string
          timestamp?: string
          mood: string
        }
        Update: {
          id?: string
          user_id?: string
          task_id?: string
          suggestion?: string
          timestamp?: string
          mood?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}