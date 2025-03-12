
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
      profiles: {
        Row: {
          id: string
          name: string
          email: string
          phone: string | null
          role: 'patient' | 'doctor' | 'admin'
          created_at: string
        }
        Insert: {
          id: string
          name: string
          email: string
          phone?: string | null
          role?: 'patient' | 'doctor' | 'admin'
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string | null
          role?: 'patient' | 'doctor' | 'admin'
          created_at?: string
        }
      }
      health_records: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          category: 'blood_test' | 'xray_mri' | 'prescription' | 'doctor_note' | 'other'
          file_url: string
          extracted_text: string | null
          is_shared: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          category: 'blood_test' | 'xray_mri' | 'prescription' | 'doctor_note' | 'other'
          file_url: string
          extracted_text?: string | null
          is_shared?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          category?: 'blood_test' | 'xray_mri' | 'prescription' | 'doctor_note' | 'other'
          file_url?: string
          extracted_text?: string | null
          is_shared?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      qr_codes: {
        Row: {
          id: string
          record_id: string
          created_by: string
          created_at: string
          expires_at: string
          is_revoked: boolean
        }
        Insert: {
          id?: string
          record_id: string
          created_by: string
          created_at?: string
          expires_at: string
          is_revoked?: boolean
        }
        Update: {
          id?: string
          record_id?: string
          created_by?: string
          created_at?: string
          expires_at?: string
          is_revoked?: boolean
        }
      }
      qr_code_access: {
        Row: {
          id: string
          qr_code_id: string
          accessed_by: string | null
          accessed_at: string
        }
        Insert: {
          id?: string
          qr_code_id: string
          accessed_by?: string | null
          accessed_at?: string
        }
        Update: {
          id?: string
          qr_code_id?: string
          accessed_by?: string | null
          accessed_at?: string
        }
      }
    }
  }
  storage: {
    Buckets: {
      medical_records: {
        Row: {
          id: string
          name: string
          owner: string | null
          created_at: string | null
          updated_at: string | null
          public: boolean | null
        }
      }
    }
  }
}
