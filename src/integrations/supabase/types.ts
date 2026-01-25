export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      about_content: {
        Row: {
          content: string | null
          id: string
          metadata: Json | null
          section_key: string
          title: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          content?: string | null
          id?: string
          metadata?: Json | null
          section_key: string
          title?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          content?: string | null
          id?: string
          metadata?: Json | null
          section_key?: string
          title?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      academic_calendar: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          end_date: string | null
          event_date: string
          event_type: string
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          event_date: string
          event_type?: string
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          event_date?: string
          event_type?: string
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      activity_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      admissions: {
        Row: {
          address: string
          application_number: string
          applying_for_class: string
          created_at: string
          date_of_birth: string
          documents_url: string | null
          gender: string
          guardian_email: string | null
          guardian_name: string
          guardian_phone: string
          id: string
          notes: string | null
          previous_school: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          student_name: string
          updated_at: string
        }
        Insert: {
          address: string
          application_number: string
          applying_for_class: string
          created_at?: string
          date_of_birth: string
          documents_url?: string | null
          gender: string
          guardian_email?: string | null
          guardian_name: string
          guardian_phone: string
          id?: string
          notes?: string | null
          previous_school?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          student_name: string
          updated_at?: string
        }
        Update: {
          address?: string
          application_number?: string
          applying_for_class?: string
          created_at?: string
          date_of_birth?: string
          documents_url?: string | null
          gender?: string
          guardian_email?: string | null
          guardian_name?: string
          guardian_phone?: string
          id?: string
          notes?: string | null
          previous_school?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          student_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      exam_results: {
        Row: {
          academic_year: string
          class: string
          created_at: string
          created_by: string | null
          exam_type: string
          id: string
          is_published: boolean | null
          result_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          academic_year: string
          class: string
          created_at?: string
          created_by?: string | null
          exam_type: string
          id?: string
          is_published?: boolean | null
          result_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          academic_year?: string
          class?: string
          created_at?: string
          created_by?: string | null
          exam_type?: string
          id?: string
          is_published?: boolean | null
          result_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      facilities: {
        Row: {
          created_at: string
          created_by: string | null
          description: string
          display_order: number | null
          id: string
          image_url: string | null
          is_active: boolean | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description: string
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      gallery_images: {
        Row: {
          album: string
          created_at: string
          created_by: string | null
          id: string
          image_url: string
          title: string
          updated_at: string
        }
        Insert: {
          album?: string
          created_at?: string
          created_by?: string | null
          id?: string
          image_url: string
          title: string
          updated_at?: string
        }
        Update: {
          album?: string
          created_at?: string
          created_by?: string | null
          id?: string
          image_url?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      hero_slides: {
        Row: {
          created_at: string
          created_by: string | null
          display_order: number | null
          id: string
          image_url: string
          is_active: boolean | null
          link_text: string | null
          link_url: string | null
          subtitle: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          display_order?: number | null
          id?: string
          image_url: string
          is_active?: boolean | null
          link_text?: string | null
          link_url?: string | null
          subtitle?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          display_order?: number | null
          id?: string
          image_url?: string
          is_active?: boolean | null
          link_text?: string | null
          link_url?: string | null
          subtitle?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      leadership: {
        Row: {
          created_at: string
          display_order: number | null
          experience: string | null
          id: string
          is_active: boolean | null
          name: string
          photo_url: string | null
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          experience?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          photo_url?: string | null
          role: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number | null
          experience?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          photo_url?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      notices: {
        Row: {
          attachment_url: string | null
          category: string | null
          content: string
          created_at: string
          created_by: string | null
          expire_at: string | null
          id: string
          is_pinned: boolean | null
          is_published: boolean | null
          title: string
          updated_at: string
        }
        Insert: {
          attachment_url?: string | null
          category?: string | null
          content: string
          created_at?: string
          created_by?: string | null
          expire_at?: string | null
          id?: string
          is_pinned?: boolean | null
          is_published?: boolean | null
          title: string
          updated_at?: string
        }
        Update: {
          attachment_url?: string | null
          category?: string | null
          content?: string
          created_at?: string
          created_by?: string | null
          expire_at?: string | null
          id?: string
          is_pinned?: boolean | null
          is_published?: boolean | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          photo_url: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          photo_url?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          photo_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      school_settings: {
        Row: {
          created_at: string
          established_year: number | null
          id: string
          logo_url: string | null
          principal_message: string | null
          principal_name: string | null
          principal_photo_url: string | null
          principal_years_experience: number | null
          school_address: string | null
          school_email: string | null
          school_name: string
          school_phone: string | null
          school_website: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          established_year?: number | null
          id?: string
          logo_url?: string | null
          principal_message?: string | null
          principal_name?: string | null
          principal_photo_url?: string | null
          principal_years_experience?: number | null
          school_address?: string | null
          school_email?: string | null
          school_name?: string
          school_phone?: string | null
          school_website?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          established_year?: number | null
          id?: string
          logo_url?: string | null
          principal_message?: string | null
          principal_name?: string | null
          principal_photo_url?: string | null
          principal_years_experience?: number | null
          school_address?: string | null
          school_email?: string | null
          school_name?: string
          school_phone?: string | null
          school_website?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      stats: {
        Row: {
          display_order: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          label: string
          updated_at: string
          value: string
        }
        Insert: {
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          label: string
          updated_at?: string
          value: string
        }
        Update: {
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          label?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      student_documents: {
        Row: {
          created_at: string
          created_by: string | null
          document_data: Json | null
          document_image_url: string | null
          document_type: string
          id: string
          is_active: boolean | null
          issued_by: string | null
          issued_date: string | null
          serial_number: string | null
          student_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          document_data?: Json | null
          document_image_url?: string | null
          document_type: string
          id?: string
          is_active?: boolean | null
          issued_by?: string | null
          issued_date?: string | null
          serial_number?: string | null
          student_id: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          document_data?: Json | null
          document_image_url?: string | null
          document_type?: string
          id?: string
          is_active?: boolean | null
          issued_by?: string | null
          issued_date?: string | null
          serial_number?: string | null
          student_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_documents_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_face_data: {
        Row: {
          created_at: string
          face_image_url: string
          id: string
          is_active: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          face_image_url: string
          id?: string
          is_active?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          face_image_url?: string
          id?: string
          is_active?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      students: {
        Row: {
          address: string | null
          admission_year: number | null
          class: string
          created_at: string
          date_of_birth: string | null
          full_name: string
          gender: string | null
          guardian_email: string | null
          guardian_name: string | null
          guardian_phone: string | null
          id: string
          photo_url: string | null
          registration_number: string
          roll_number: number | null
          section: string | null
          status: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address?: string | null
          admission_year?: number | null
          class: string
          created_at?: string
          date_of_birth?: string | null
          full_name: string
          gender?: string | null
          guardian_email?: string | null
          guardian_name?: string | null
          guardian_phone?: string | null
          id?: string
          photo_url?: string | null
          registration_number: string
          roll_number?: number | null
          section?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address?: string | null
          admission_year?: number | null
          class?: string
          created_at?: string
          date_of_birth?: string | null
          full_name?: string
          gender?: string | null
          guardian_email?: string | null
          guardian_name?: string | null
          guardian_phone?: string | null
          id?: string
          photo_url?: string | null
          registration_number?: string
          roll_number?: number | null
          section?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      teachers: {
        Row: {
          created_at: string
          department: string | null
          email: string | null
          employee_id: string
          full_name: string
          id: string
          joined_date: string | null
          phone: string | null
          photo_url: string | null
          qualification: string | null
          status: string | null
          subject: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          department?: string | null
          email?: string | null
          employee_id: string
          full_name: string
          id?: string
          joined_date?: string | null
          phone?: string | null
          photo_url?: string | null
          qualification?: string | null
          status?: string | null
          subject?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          department?: string | null
          email?: string | null
          employee_id?: string
          full_name?: string
          id?: string
          joined_date?: string | null
          phone?: string | null
          photo_url?: string | null
          qualification?: string | null
          status?: string | null
          subject?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          content: string
          created_at: string
          display_order: number | null
          id: string
          is_active: boolean | null
          name: string
          photo_url: string | null
          rating: number | null
          role: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          photo_url?: string | null
          rating?: number | null
          role: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          photo_url?: string | null
          rating?: number | null
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_any_admin_role: { Args: { _user_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "super_admin" | "admin" | "teacher" | "staff" | "student"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["super_admin", "admin", "teacher", "staff", "student"],
    },
  },
} as const
