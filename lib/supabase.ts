import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

export interface BudgetUpload {
  id: string
  file_name: string
  file_size: number
  file_url: string
  county: string
  budget_year: string
  upload_status: 'pending' | 'processing' | 'completed' | 'failed'
  uploaded_at: string
  user_id: string | null
}

export interface BudgetAnalysis {
  id: string
  upload_id: string
  extracted_text: string | null
  summary: string | null
  key_insights: string[]
  transparency_score: number
  flagged_issues: string[]
  analyzed_at: string
}

export async function createBudgetUpload(data: {
  file_name: string
  file_size: number
  file_url: string
  county: string
  budget_year: string
  user_id: string | null
}) {
  const { data: upload, error } = await supabase
    .from('budget_uploads')
    .insert({
      file_name: data.file_name,
      file_size: data.file_size,
      file_url: data.file_url,
      county: data.county,
      budget_year: data.budget_year,
      user_id: data.user_id,
      upload_status: 'pending',
    })
    .select()
    .maybeSingle()

  if (error) throw error
  return upload
}

export async function updateUploadStatus(uploadId: string, status: 'pending' | 'processing' | 'completed' | 'failed') {
  const { error } = await supabase
    .from('budget_uploads')
    .update({ upload_status: status })
    .eq('id', uploadId)

  if (error) throw error
}

export async function createBudgetAnalysis(data: {
  upload_id: string
  extracted_text: string
  summary: string
  key_insights: string[]
  transparency_score: number
  flagged_issues: string[]
}) {
  const { data: analysis, error } = await supabase
    .from('budget_analysis')
    .insert({
      upload_id: data.upload_id,
      extracted_text: data.extracted_text,
      summary: data.summary,
      key_insights: data.key_insights,
      transparency_score: data.transparency_score,
      flagged_issues: data.flagged_issues,
    })
    .select()
    .maybeSingle()

  if (error) throw error
  return analysis
}

export async function getBudgetUploads() {
  const { data, error } = await supabase
    .from('budget_uploads')
    .select('*')
    .order('uploaded_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getBudgetAnalysis(uploadId: string) {
  const { data, error } = await supabase
    .from('budget_analysis')
    .select('*')
    .eq('upload_id', uploadId)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function getUploadWithAnalysis(uploadId: string) {
  const { data, error } = await supabase
    .from('budget_uploads')
    .select(`
      *,
      budget_analysis (*)
    `)
    .eq('id', uploadId)
    .maybeSingle()

  if (error) throw error
  return data
}
