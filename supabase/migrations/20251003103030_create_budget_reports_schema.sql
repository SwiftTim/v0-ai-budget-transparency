/*
  # Budget Reports Database Schema

  ## Overview
  Creates tables for storing uploaded budget reports, their metadata, and OCR/NLP analysis results.

  ## New Tables
  
  ### `budget_uploads`
  Stores information about uploaded budget report files
  - `id` (uuid, primary key) - Unique identifier for each upload
  - `file_name` (text) - Original name of the uploaded file
  - `file_size` (bigint) - Size of the file in bytes
  - `file_url` (text) - URL or path to the stored file
  - `county` (text) - County the budget report belongs to
  - `budget_year` (text) - Year of the budget report
  - `upload_status` (text) - Status of the upload (pending, processing, completed, failed)
  - `uploaded_at` (timestamptz) - Timestamp when the file was uploaded
  - `user_id` (uuid) - Reference to the user who uploaded the file

  ### `budget_analysis`
  Stores OCR and NLP analysis results for each budget report
  - `id` (uuid, primary key) - Unique identifier for each analysis
  - `upload_id` (uuid, foreign key) - References the budget_uploads table
  - `extracted_text` (text) - Full text extracted via OCR
  - `summary` (text) - AI-generated summary of the document
  - `key_insights` (jsonb) - Array of key insights from the analysis
  - `transparency_score` (integer) - Score from 0-100 indicating transparency
  - `flagged_issues` (jsonb) - Array of identified issues or concerns
  - `analyzed_at` (timestamptz) - Timestamp when analysis was completed

  ## Security
  - Enable RLS on both tables
  - Add policies for authenticated users to manage their own uploads
  - Add policies for viewing analysis results
*/

CREATE TABLE IF NOT EXISTS budget_uploads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name text NOT NULL,
  file_size bigint NOT NULL,
  file_url text NOT NULL,
  county text NOT NULL,
  budget_year text NOT NULL,
  upload_status text DEFAULT 'pending',
  uploaded_at timestamptz DEFAULT now(),
  user_id uuid
);

CREATE TABLE IF NOT EXISTS budget_analysis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  upload_id uuid NOT NULL REFERENCES budget_uploads(id) ON DELETE CASCADE,
  extracted_text text,
  summary text,
  key_insights jsonb DEFAULT '[]'::jsonb,
  transparency_score integer DEFAULT 0,
  flagged_issues jsonb DEFAULT '[]'::jsonb,
  analyzed_at timestamptz DEFAULT now()
);

ALTER TABLE budget_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_analysis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all budget uploads"
  ON budget_uploads
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create their own uploads"
  ON budget_uploads
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own uploads"
  ON budget_uploads
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own uploads"
  ON budget_uploads
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view all analysis results"
  ON budget_analysis
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can create analysis results"
  ON budget_analysis
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "System can update analysis results"
  ON budget_analysis
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_budget_uploads_county ON budget_uploads(county);
CREATE INDEX IF NOT EXISTS idx_budget_uploads_year ON budget_uploads(budget_year);
CREATE INDEX IF NOT EXISTS idx_budget_uploads_user ON budget_uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_budget_analysis_upload ON budget_analysis(upload_id);