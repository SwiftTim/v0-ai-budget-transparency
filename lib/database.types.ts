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
      budget_uploads: {
        Row: {
          id: string
          file_name: string
          file_size: number
          file_url: string
          county: string
          budget_year: string
          upload_status: string
          uploaded_at: string
          user_id: string | null
        }
        Insert: {
          id?: string
          file_name: string
          file_size: number
          file_url: string
          county: string
          budget_year: string
          upload_status?: string
          uploaded_at?: string
          user_id?: string | null
        }
        Update: {
          id?: string
          file_name?: string
          file_size?: number
          file_url?: string
          county?: string
          budget_year?: string
          upload_status?: string
          uploaded_at?: string
          user_id?: string | null
        }
      }
      budget_analysis: {
        Row: {
          id: string
          upload_id: string
          extracted_text: string | null
          summary: string | null
          key_insights: Json
          transparency_score: number
          flagged_issues: Json
          analyzed_at: string
        }
        Insert: {
          id?: string
          upload_id: string
          extracted_text?: string | null
          summary?: string | null
          key_insights?: Json
          transparency_score?: number
          flagged_issues?: Json
          analyzed_at?: string
        }
        Update: {
          id?: string
          upload_id?: string
          extracted_text?: string | null
          summary?: string | null
          key_insights?: Json
          transparency_score?: number
          flagged_issues?: Json
          analyzed_at?: string
        }
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}
