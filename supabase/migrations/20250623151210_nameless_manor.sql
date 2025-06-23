/*
  # Create emotional states table

  1. New Tables
    - `emotional_states`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `mood` (text)
      - `timestamp` (timestamp)

  2. Security
    - Enable RLS on `emotional_states` table
    - Add policies for authenticated users to manage their own emotional states
*/

CREATE TABLE IF NOT EXISTS emotional_states (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  mood text NOT NULL,
  timestamp timestamptz DEFAULT now()
);

ALTER TABLE emotional_states ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own emotional states"
  ON emotional_states
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own emotional states"
  ON emotional_states
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own emotional states"
  ON emotional_states
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own emotional states"
  ON emotional_states
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS emotional_states_user_timestamp_idx 
ON emotional_states (user_id, timestamp DESC);