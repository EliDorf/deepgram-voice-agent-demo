/*
  # Create patient responses table

  1. New Tables
    - `patient_responses`
      - `id` (uuid, primary key)
      - `question` (text)
      - `answer` (text)
      - `session_id` (uuid)
      - `created_at` (timestamp)
      - `question_type` (text) - either 'multiple_choice' or 'open_ended'
      - `options` (text[]) - array of options for multiple choice questions
      - `selected_option` (integer) - index of selected option for multiple choice

  2. Security
    - Enable RLS on `patient_responses` table
    - Add policy for authenticated users to read/write their own data
*/

CREATE TABLE IF NOT EXISTS patient_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL,
  question text NOT NULL,
  answer text,
  question_type text NOT NULL,
  options text[],
  selected_option integer,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE patient_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own responses"
  ON patient_responses
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = session_id::text);

CREATE POLICY "Users can insert own responses"
  ON patient_responses
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = session_id::text);