/*
  # Create AI task assists table

  1. New Tables
    - `ai_task_assists`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `task_id` (uuid, foreign key to focus_tasks)
      - `suggestion` (text, AI-generated suggestion)
      - `timestamp` (timestamp)
      - `mood` (text, mood when suggestion was generated)

  2. Security
    - Enable RLS on `ai_task_assists` table
    - Add policies for authenticated users to manage their own AI assists
*/

CREATE TABLE IF NOT EXISTS ai_task_assists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  task_id uuid REFERENCES focus_tasks ON DELETE CASCADE NOT NULL,
  suggestion text NOT NULL,
  timestamp timestamptz DEFAULT now(),
  mood text NOT NULL
);

ALTER TABLE ai_task_assists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own AI assists"
  ON ai_task_assists
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own AI assists"
  ON ai_task_assists
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own AI assists"
  ON ai_task_assists
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own AI assists"
  ON ai_task_assists
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS ai_task_assists_user_timestamp_idx 
ON ai_task_assists (user_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS ai_task_assists_task_idx 
ON ai_task_assists (task_id);