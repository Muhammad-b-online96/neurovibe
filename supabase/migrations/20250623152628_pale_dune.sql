/*
  # Add dev_mode_enabled to user_profiles

  1. Changes
    - Add `dev_mode_enabled` boolean column to `user_profiles` table
    - Set default value to false
    - Allow null values for backward compatibility

  2. Security
    - No changes to RLS policies needed
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'dev_mode_enabled'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN dev_mode_enabled boolean DEFAULT false;
  END IF;
END $$;