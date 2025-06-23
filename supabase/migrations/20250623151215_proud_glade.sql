/*
  # Create focus tasks table

  1. New Tables
    - `focus_tasks`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `title` (text, required)
      - `description` (text, optional)
      - `status` (text, default 'pending')
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `focus_tasks` table
    - Add policies for authenticated users to manage their own tasks
*/

CREATE TABLE IF NOT EXISTS focus_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE focus_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own tasks"
  ON focus_tasks
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tasks"
  ON focus_tasks
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks"
  ON focus_tasks
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks"
  ON focus_tasks
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS focus_tasks_user_created_idx 
ON focus_tasks (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS focus_tasks_user_status_idx 
ON focus_tasks (user_id, status);