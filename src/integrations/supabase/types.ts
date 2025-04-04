export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      emergency_access_logs: {
        Row: {
          accessed_at: string
          id: string
          ip_address: string | null
          profile_id: string
        }
        Insert: {
          accessed_at?: string
          id?: string
          ip_address?: string | null
          profile_id: string
        }
        Update: {
          accessed_at?: string
          id?: string
          ip_address?: string | null
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "emergency_access_logs_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "emergency_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      emergency_profiles: {
        Row: {
          allergies: string | null
          blood_type: string | null
          conditions: string | null
          created_at: string
          emergency_contact_1_name: string | null
          emergency_contact_1_phone: string | null
          emergency_contact_1_relationship: string | null
          emergency_contact_2_name: string | null
          emergency_contact_2_phone: string | null
          emergency_contact_2_relationship: string | null
          id: string
          insurance_number: string | null
          insurance_provider: string | null
          medical_notes: string | null
          medications: string | null
          primary_physician: string | null
          primary_physician_phone: string | null
          surgeries: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          allergies?: string | null
          blood_type?: string | null
          conditions?: string | null
          created_at?: string
          emergency_contact_1_name?: string | null
          emergency_contact_1_phone?: string | null
          emergency_contact_1_relationship?: string | null
          emergency_contact_2_name?: string | null
          emergency_contact_2_phone?: string | null
          emergency_contact_2_relationship?: string | null
          id?: string
          insurance_number?: string | null
          insurance_provider?: string | null
          medical_notes?: string | null
          medications?: string | null
          primary_physician?: string | null
          primary_physician_phone?: string | null
          surgeries?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          allergies?: string | null
          blood_type?: string | null
          conditions?: string | null
          created_at?: string
          emergency_contact_1_name?: string | null
          emergency_contact_1_phone?: string | null
          emergency_contact_1_relationship?: string | null
          emergency_contact_2_name?: string | null
          emergency_contact_2_phone?: string | null
          emergency_contact_2_relationship?: string | null
          id?: string
          insurance_number?: string | null
          insurance_provider?: string | null
          medical_notes?: string | null
          medications?: string | null
          primary_physician?: string | null
          primary_physician_phone?: string | null
          surgeries?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      health_records: {
        Row: {
          category: string
          created_at: string
          description: string | null
          extracted_text: string | null
          file_url: string
          id: string
          is_shared: boolean | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          extracted_text?: string | null
          file_url: string
          id?: string
          is_shared?: boolean | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          extracted_text?: string | null
          file_url?: string
          id?: string
          is_shared?: boolean | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      medication_history: {
        Row: {
          created_at: string
          id: string
          medication_id: string
          notes: string | null
          status: string
          taken_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          medication_id: string
          notes?: string | null
          status: string
          taken_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          medication_id?: string
          notes?: string | null
          status?: string
          taken_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "medication_history_medication_id_fkey"
            columns: ["medication_id"]
            isOneToOne: false
            referencedRelation: "medications"
            referencedColumns: ["id"]
          },
        ]
      }
      medication_reminders: {
        Row: {
          created_at: string
          enabled: boolean
          id: string
          medication_id: string
          reminder_time: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          id?: string
          medication_id: string
          reminder_time: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          id?: string
          medication_id?: string
          reminder_time?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "medication_reminders_medication_id_fkey"
            columns: ["medication_id"]
            isOneToOne: false
            referencedRelation: "medications"
            referencedColumns: ["id"]
          },
        ]
      }
      medications: {
        Row: {
          created_at: string
          dosage: string
          end_date: string | null
          frequency: string
          id: string
          name: string
          notes: string | null
          start_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dosage: string
          end_date?: string | null
          frequency: string
          id?: string
          name: string
          notes?: string | null
          start_date: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          dosage?: string
          end_date?: string | null
          frequency?: string
          id?: string
          name?: string
          notes?: string | null
          start_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          phone: string | null
          role: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          name: string
          phone?: string | null
          role?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          phone?: string | null
          role?: string
        }
        Relationships: []
      }
      public_medical_records: {
        Row: {
          created_at: string
          id: string
          qr_id: string
          record_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          qr_id: string
          record_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          qr_id?: string
          record_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_medical_records_qr_id_fkey"
            columns: ["qr_id"]
            isOneToOne: false
            referencedRelation: "public_qr_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_medical_records_record_id_fkey"
            columns: ["record_id"]
            isOneToOne: false
            referencedRelation: "health_records"
            referencedColumns: ["id"]
          },
        ]
      }
      public_qr_codes: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          include_emergency_profile: boolean | null
          is_active: boolean | null
          label: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          include_emergency_profile?: boolean | null
          is_active?: boolean | null
          label?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          include_emergency_profile?: boolean | null
          is_active?: boolean | null
          label?: string | null
          user_id?: string
        }
        Relationships: []
      }
      qr_code_access: {
        Row: {
          accessed_at: string
          accessed_by: string | null
          id: string
          qr_code_id: string
        }
        Insert: {
          accessed_at?: string
          accessed_by?: string | null
          id?: string
          qr_code_id: string
        }
        Update: {
          accessed_at?: string
          accessed_by?: string | null
          id?: string
          qr_code_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "qr_code_access_qr_code_id_fkey"
            columns: ["qr_code_id"]
            isOneToOne: false
            referencedRelation: "qr_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      qr_codes: {
        Row: {
          created_at: string
          created_by: string
          expires_at: string
          id: string
          is_revoked: boolean | null
          record_id: string
        }
        Insert: {
          created_at?: string
          created_by: string
          expires_at: string
          id?: string
          is_revoked?: boolean | null
          record_id: string
        }
        Update: {
          created_at?: string
          created_by?: string
          expires_at?: string
          id?: string
          is_revoked?: boolean | null
          record_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "qr_codes_record_id_fkey"
            columns: ["record_id"]
            isOneToOne: false
            referencedRelation: "health_records"
            referencedColumns: ["id"]
          },
        ]
      }
      user_permanent_qr: {
        Row: {
          active: boolean | null
          created_at: string
          id: string
          name: string | null
          user_id: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          id?: string
          name?: string | null
          user_id: string
        }
        Update: {
          active?: boolean | null
          created_at?: string
          id?: string
          name?: string | null
          user_id?: string
        }
        Relationships: []
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
