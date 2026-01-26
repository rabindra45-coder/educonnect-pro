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
      attendance: {
        Row: {
          check_in_time: string | null
          check_out_time: string | null
          created_at: string
          date: string
          id: string
          marked_by: string | null
          notification_sent: boolean | null
          remarks: string | null
          status: Database["public"]["Enums"]["attendance_status"]
          student_id: string
          updated_at: string
        }
        Insert: {
          check_in_time?: string | null
          check_out_time?: string | null
          created_at?: string
          date?: string
          id?: string
          marked_by?: string | null
          notification_sent?: boolean | null
          remarks?: string | null
          status?: Database["public"]["Enums"]["attendance_status"]
          student_id: string
          updated_at?: string
        }
        Update: {
          check_in_time?: string | null
          check_out_time?: string | null
          created_at?: string
          date?: string
          id?: string
          marked_by?: string | null
          notification_sent?: boolean | null
          remarks?: string | null
          status?: Database["public"]["Enums"]["attendance_status"]
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "attendance_summary"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      book_issues: {
        Row: {
          book_id: string
          created_at: string
          due_date: string
          id: string
          issue_date: string
          issued_by: string | null
          remarks: string | null
          return_date: string | null
          returned_to: string | null
          status: string | null
          student_id: string
          updated_at: string
        }
        Insert: {
          book_id: string
          created_at?: string
          due_date: string
          id?: string
          issue_date?: string
          issued_by?: string | null
          remarks?: string | null
          return_date?: string | null
          returned_to?: string | null
          status?: string | null
          student_id: string
          updated_at?: string
        }
        Update: {
          book_id?: string
          created_at?: string
          due_date?: string
          id?: string
          issue_date?: string
          issued_by?: string | null
          remarks?: string | null
          return_date?: string | null
          returned_to?: string | null
          status?: string | null
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "book_issues_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "book_issues_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "attendance_summary"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "book_issues_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      book_reservations: {
        Row: {
          book_id: string
          created_at: string
          expiry_date: string
          id: string
          notes: string | null
          processed_at: string | null
          processed_by: string | null
          reservation_date: string
          status: string | null
          student_id: string
          updated_at: string
        }
        Insert: {
          book_id: string
          created_at?: string
          expiry_date: string
          id?: string
          notes?: string | null
          processed_at?: string | null
          processed_by?: string | null
          reservation_date?: string
          status?: string | null
          student_id: string
          updated_at?: string
        }
        Update: {
          book_id?: string
          created_at?: string
          expiry_date?: string
          id?: string
          notes?: string | null
          processed_at?: string | null
          processed_by?: string | null
          reservation_date?: string
          status?: string | null
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "book_reservations_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "book_reservations_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "attendance_summary"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "book_reservations_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      books: {
        Row: {
          author: string
          available_copies: number
          category: string | null
          cover_image_url: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          isbn: string | null
          pdf_url: string | null
          published_year: number | null
          publisher: string | null
          shelf_location: string | null
          title: string
          total_copies: number
          updated_at: string
        }
        Insert: {
          author: string
          available_copies?: number
          category?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          isbn?: string | null
          pdf_url?: string | null
          published_year?: number | null
          publisher?: string | null
          shelf_location?: string | null
          title: string
          total_copies?: number
          updated_at?: string
        }
        Update: {
          author?: string
          available_copies?: number
          category?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          isbn?: string | null
          pdf_url?: string | null
          published_year?: number | null
          publisher?: string | null
          shelf_location?: string | null
          title?: string
          total_copies?: number
          updated_at?: string
        }
        Relationships: []
      }
      budget_allocations: {
        Row: {
          academic_year: string
          allocated_amount: number
          created_at: string
          created_by: string | null
          department: string
          description: string | null
          id: string
          spent_amount: number
          updated_at: string
        }
        Insert: {
          academic_year: string
          allocated_amount?: number
          created_at?: string
          created_by?: string | null
          department: string
          description?: string | null
          id?: string
          spent_amount?: number
          updated_at?: string
        }
        Update: {
          academic_year?: string
          allocated_amount?: number
          created_at?: string
          created_by?: string | null
          department?: string
          description?: string | null
          id?: string
          spent_amount?: number
          updated_at?: string
        }
        Relationships: []
      }
      certificate_requests: {
        Row: {
          certificate_type: string
          created_at: string
          document_id: string | null
          id: string
          processed_at: string | null
          processed_by: string | null
          purpose: string | null
          remarks: string | null
          requested_by: string
          status: string | null
          student_id: string
          updated_at: string
        }
        Insert: {
          certificate_type: string
          created_at?: string
          document_id?: string | null
          id?: string
          processed_at?: string | null
          processed_by?: string | null
          purpose?: string | null
          remarks?: string | null
          requested_by: string
          status?: string | null
          student_id: string
          updated_at?: string
        }
        Update: {
          certificate_type?: string
          created_at?: string
          document_id?: string | null
          id?: string
          processed_at?: string | null
          processed_by?: string | null
          purpose?: string | null
          remarks?: string | null
          requested_by?: string
          status?: string | null
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificate_requests_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "student_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificate_requests_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "attendance_summary"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "certificate_requests_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_conversations: {
        Row: {
          created_at: string
          id: string
          importance_reason: string | null
          is_auto_flagged: boolean | null
          is_important: boolean | null
          status: string | null
          updated_at: string
          user_id: string | null
          visitor_email: string | null
          visitor_id: string
          visitor_name: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          importance_reason?: string | null
          is_auto_flagged?: boolean | null
          is_important?: boolean | null
          status?: string | null
          updated_at?: string
          user_id?: string | null
          visitor_email?: string | null
          visitor_id: string
          visitor_name?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          importance_reason?: string | null
          is_auto_flagged?: boolean | null
          is_important?: boolean | null
          status?: string | null
          updated_at?: string
          user_id?: string | null
          visitor_email?: string | null
          visitor_id?: string
          visitor_name?: string | null
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          is_flagged: boolean | null
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          is_flagged?: boolean | null
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          is_flagged?: boolean | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      digital_resources: {
        Row: {
          access_level: string | null
          author: string | null
          class: string | null
          cover_image_url: string | null
          created_at: string
          description: string | null
          download_count: number | null
          file_url: string
          id: string
          is_active: boolean | null
          is_downloadable: boolean | null
          publisher: string | null
          resource_type: string
          subject: string | null
          title: string
          updated_at: string
          uploaded_by: string | null
          view_count: number | null
        }
        Insert: {
          access_level?: string | null
          author?: string | null
          class?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          download_count?: number | null
          file_url: string
          id?: string
          is_active?: boolean | null
          is_downloadable?: boolean | null
          publisher?: string | null
          resource_type?: string
          subject?: string | null
          title: string
          updated_at?: string
          uploaded_by?: string | null
          view_count?: number | null
        }
        Update: {
          access_level?: string | null
          author?: string | null
          class?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          download_count?: number | null
          file_url?: string
          id?: string
          is_active?: boolean | null
          is_downloadable?: boolean | null
          publisher?: string | null
          resource_type?: string
          subject?: string | null
          title?: string
          updated_at?: string
          uploaded_by?: string | null
          view_count?: number | null
        }
        Relationships: []
      }
      exam_marks: {
        Row: {
          created_at: string
          entered_by: string | null
          exam_id: string
          grade: string | null
          grade_point: number | null
          id: string
          practical_marks: number | null
          remarks: string | null
          student_id: string
          subject_id: string
          theory_marks: number | null
          total_marks: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          entered_by?: string | null
          exam_id: string
          grade?: string | null
          grade_point?: number | null
          id?: string
          practical_marks?: number | null
          remarks?: string | null
          student_id: string
          subject_id: string
          theory_marks?: number | null
          total_marks?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          entered_by?: string | null
          exam_id?: string
          grade?: string | null
          grade_point?: number | null
          id?: string
          practical_marks?: number | null
          remarks?: string | null
          student_id?: string
          subject_id?: string
          theory_marks?: number | null
          total_marks?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_marks_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_marks_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "attendance_summary"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "exam_marks_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_marks_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
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
      exams: {
        Row: {
          academic_year: string
          class: string
          created_at: string
          created_by: string | null
          end_date: string | null
          exam_type: Database["public"]["Enums"]["exam_type"]
          id: string
          is_published: boolean | null
          section: string | null
          start_date: string | null
          title: string
          updated_at: string
        }
        Insert: {
          academic_year: string
          class: string
          created_at?: string
          created_by?: string | null
          end_date?: string | null
          exam_type: Database["public"]["Enums"]["exam_type"]
          id?: string
          is_published?: boolean | null
          section?: string | null
          start_date?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          academic_year?: string
          class?: string
          created_at?: string
          created_by?: string | null
          end_date?: string | null
          exam_type?: Database["public"]["Enums"]["exam_type"]
          id?: string
          is_published?: boolean | null
          section?: string | null
          start_date?: string | null
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
      fee_payments: {
        Row: {
          amount: number
          created_at: string
          gateway_response: Json | null
          id: string
          notes: string | null
          paid_at: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          receipt_number: string | null
          received_by: string | null
          student_fee_id: string
          student_id: string
          transaction_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          gateway_response?: Json | null
          id?: string
          notes?: string | null
          paid_at?: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          receipt_number?: string | null
          received_by?: string | null
          student_fee_id: string
          student_id: string
          transaction_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          gateway_response?: Json | null
          id?: string
          notes?: string | null
          paid_at?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          receipt_number?: string | null
          received_by?: string | null
          student_fee_id?: string
          student_id?: string
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fee_payments_student_fee_id_fkey"
            columns: ["student_fee_id"]
            isOneToOne: false
            referencedRelation: "student_fees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fee_payments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "attendance_summary"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "fee_payments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      fee_structures: {
        Row: {
          academic_year: string
          amount: number
          class: string
          created_at: string
          created_by: string | null
          description: string | null
          due_day: number | null
          fee_type: Database["public"]["Enums"]["fee_type"]
          frequency: string
          id: string
          is_active: boolean | null
          late_fee_percentage: number | null
          updated_at: string
        }
        Insert: {
          academic_year: string
          amount: number
          class: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_day?: number | null
          fee_type: Database["public"]["Enums"]["fee_type"]
          frequency?: string
          id?: string
          is_active?: boolean | null
          late_fee_percentage?: number | null
          updated_at?: string
        }
        Update: {
          academic_year?: string
          amount?: number
          class?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_day?: number | null
          fee_type?: Database["public"]["Enums"]["fee_type"]
          frequency?: string
          id?: string
          is_active?: boolean | null
          late_fee_percentage?: number | null
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
      homework: {
        Row: {
          allow_late_submission: boolean | null
          attachment_url: string | null
          class: string
          created_at: string
          description: string | null
          due_date: string
          id: string
          is_published: boolean | null
          max_marks: number | null
          section: string | null
          subject_id: string
          teacher_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          allow_late_submission?: boolean | null
          attachment_url?: string | null
          class: string
          created_at?: string
          description?: string | null
          due_date: string
          id?: string
          is_published?: boolean | null
          max_marks?: number | null
          section?: string | null
          subject_id: string
          teacher_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          allow_late_submission?: boolean | null
          attachment_url?: string | null
          class?: string
          created_at?: string
          description?: string | null
          due_date?: string
          id?: string
          is_published?: boolean | null
          max_marks?: number | null
          section?: string | null
          subject_id?: string
          teacher_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "homework_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "homework_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      homework_submissions: {
        Row: {
          created_at: string
          graded_at: string | null
          graded_by: string | null
          homework_id: string
          id: string
          is_late: boolean | null
          marks: number | null
          remarks: string | null
          status: string | null
          student_id: string
          submission_text: string | null
          submission_url: string | null
          submitted_at: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          graded_at?: string | null
          graded_by?: string | null
          homework_id: string
          id?: string
          is_late?: boolean | null
          marks?: number | null
          remarks?: string | null
          status?: string | null
          student_id: string
          submission_text?: string | null
          submission_url?: string | null
          submitted_at?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          graded_at?: string | null
          graded_by?: string | null
          homework_id?: string
          id?: string
          is_late?: boolean | null
          marks?: number | null
          remarks?: string | null
          status?: string | null
          student_id?: string
          submission_text?: string | null
          submission_url?: string | null
          submitted_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "homework_submissions_homework_id_fkey"
            columns: ["homework_id"]
            isOneToOne: false
            referencedRelation: "homework"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "homework_submissions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "attendance_summary"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "homework_submissions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
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
      library_fines: {
        Row: {
          book_issue_id: string
          created_at: string
          days_overdue: number | null
          fine_amount: number
          fine_reason: string
          id: string
          paid_amount: number | null
          paid_date: string | null
          status: string | null
          student_id: string
          updated_at: string
          waive_reason: string | null
          waived_by: string | null
        }
        Insert: {
          book_issue_id: string
          created_at?: string
          days_overdue?: number | null
          fine_amount: number
          fine_reason: string
          id?: string
          paid_amount?: number | null
          paid_date?: string | null
          status?: string | null
          student_id: string
          updated_at?: string
          waive_reason?: string | null
          waived_by?: string | null
        }
        Update: {
          book_issue_id?: string
          created_at?: string
          days_overdue?: number | null
          fine_amount?: number
          fine_reason?: string
          id?: string
          paid_amount?: number | null
          paid_date?: string | null
          status?: string | null
          student_id?: string
          updated_at?: string
          waive_reason?: string | null
          waived_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "library_fines_book_issue_id_fkey"
            columns: ["book_issue_id"]
            isOneToOne: false
            referencedRelation: "book_issues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "library_fines_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "attendance_summary"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "library_fines_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      library_memberships: {
        Row: {
          block_reason: string | null
          created_at: string
          id: string
          is_blocked: boolean | null
          max_books: number | null
          member_id: string
          member_type: string
          membership_end: string | null
          membership_number: string | null
          membership_start: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          block_reason?: string | null
          created_at?: string
          id?: string
          is_blocked?: boolean | null
          max_books?: number | null
          member_id: string
          member_type?: string
          membership_end?: string | null
          membership_number?: string | null
          membership_start?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          block_reason?: string | null
          created_at?: string
          id?: string
          is_blocked?: boolean | null
          max_books?: number | null
          member_id?: string
          member_type?: string
          membership_end?: string | null
          membership_number?: string | null
          membership_start?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      library_settings: {
        Row: {
          created_at: string
          default_issue_days: number | null
          fine_per_day: number | null
          id: string
          lost_book_fine_multiplier: number | null
          max_books_per_student: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          default_issue_days?: number | null
          fine_per_day?: number | null
          id?: string
          lost_book_fine_multiplier?: number | null
          max_books_per_student?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          default_issue_days?: number | null
          fine_per_day?: number | null
          id?: string
          lost_book_fine_multiplier?: number | null
          max_books_per_student?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          attachment_url: string | null
          content: string
          created_at: string
          id: string
          is_read: boolean | null
          parent_message_id: string | null
          read_at: string | null
          recipient_id: string
          recipient_type: string
          sender_id: string
          sender_type: string
          subject: string | null
        }
        Insert: {
          attachment_url?: string | null
          content: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          parent_message_id?: string | null
          read_at?: string | null
          recipient_id: string
          recipient_type: string
          sender_id: string
          sender_type: string
          subject?: string | null
        }
        Update: {
          attachment_url?: string | null
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          parent_message_id?: string | null
          read_at?: string | null
          recipient_id?: string
          recipient_type?: string
          sender_id?: string
          sender_type?: string
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_parent_message_id_fkey"
            columns: ["parent_message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
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
      parent_students: {
        Row: {
          created_at: string
          id: string
          is_primary: boolean | null
          parent_id: string
          relationship: string | null
          student_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_primary?: boolean | null
          parent_id: string
          relationship?: string | null
          student_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_primary?: boolean | null
          parent_id?: string
          relationship?: string | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "parent_students_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "parents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parent_students_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "attendance_summary"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "parent_students_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      parent_teacher_meetings: {
        Row: {
          created_at: string
          duration_minutes: number | null
          id: string
          meeting_date: string
          meeting_link: string | null
          meeting_time: string
          notes: string | null
          parent_id: string
          purpose: string | null
          status: string | null
          student_id: string
          teacher_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          duration_minutes?: number | null
          id?: string
          meeting_date: string
          meeting_link?: string | null
          meeting_time: string
          notes?: string | null
          parent_id: string
          purpose?: string | null
          status?: string | null
          student_id: string
          teacher_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          duration_minutes?: number | null
          id?: string
          meeting_date?: string
          meeting_link?: string | null
          meeting_time?: string
          notes?: string | null
          parent_id?: string
          purpose?: string | null
          status?: string | null
          student_id?: string
          teacher_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "parent_teacher_meetings_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "parents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parent_teacher_meetings_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "attendance_summary"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "parent_teacher_meetings_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parent_teacher_meetings_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      parents: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          language_preference: string | null
          notification_preferences: Json | null
          occupation: string | null
          phone: string | null
          photo_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          language_preference?: string | null
          notification_preferences?: Json | null
          occupation?: string | null
          phone?: string | null
          photo_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          language_preference?: string | null
          notification_preferences?: Json | null
          occupation?: string | null
          phone?: string | null
          photo_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      payment_transactions: {
        Row: {
          amount: number
          created_at: string
          gateway: string
          gateway_reference: string | null
          gateway_transaction_id: string | null
          id: string
          request_payload: Json | null
          response_payload: Json | null
          status: string | null
          student_fee_id: string
          student_id: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          gateway: string
          gateway_reference?: string | null
          gateway_transaction_id?: string | null
          id?: string
          request_payload?: Json | null
          response_payload?: Json | null
          status?: string | null
          student_fee_id: string
          student_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          gateway?: string
          gateway_reference?: string | null
          gateway_transaction_id?: string | null
          id?: string
          request_payload?: Json | null
          response_payload?: Json | null
          status?: string | null
          student_fee_id?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_student_fee_id_fkey"
            columns: ["student_fee_id"]
            isOneToOne: false
            referencedRelation: "student_fees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_transactions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "attendance_summary"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "payment_transactions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
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
      question_bank: {
        Row: {
          chapter: string | null
          class: string | null
          correct_answer: string | null
          created_at: string
          difficulty: string | null
          id: string
          is_active: boolean | null
          marks: number | null
          options: Json | null
          question_text: string
          question_type: string | null
          subject_id: string
          teacher_id: string | null
          topic: string | null
          updated_at: string
        }
        Insert: {
          chapter?: string | null
          class?: string | null
          correct_answer?: string | null
          created_at?: string
          difficulty?: string | null
          id?: string
          is_active?: boolean | null
          marks?: number | null
          options?: Json | null
          question_text: string
          question_type?: string | null
          subject_id: string
          teacher_id?: string | null
          topic?: string | null
          updated_at?: string
        }
        Update: {
          chapter?: string | null
          class?: string | null
          correct_answer?: string | null
          created_at?: string
          difficulty?: string | null
          id?: string
          is_active?: boolean | null
          marks?: number | null
          options?: Json | null
          question_text?: string
          question_type?: string | null
          subject_id?: string
          teacher_id?: string | null
          topic?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_bank_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_bank_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      school_expenses: {
        Row: {
          academic_year: string | null
          amount: number
          approved_by: string | null
          category: string
          created_at: string
          department: string | null
          description: string
          expense_date: string
          id: string
          notes: string | null
          payment_method: string | null
          receipt_url: string | null
          recorded_by: string | null
          updated_at: string
          vendor_name: string | null
        }
        Insert: {
          academic_year?: string | null
          amount: number
          approved_by?: string | null
          category: string
          created_at?: string
          department?: string | null
          description: string
          expense_date?: string
          id?: string
          notes?: string | null
          payment_method?: string | null
          receipt_url?: string | null
          recorded_by?: string | null
          updated_at?: string
          vendor_name?: string | null
        }
        Update: {
          academic_year?: string | null
          amount?: number
          approved_by?: string | null
          category?: string
          created_at?: string
          department?: string | null
          description?: string
          expense_date?: string
          id?: string
          notes?: string | null
          payment_method?: string | null
          receipt_url?: string | null
          recorded_by?: string | null
          updated_at?: string
          vendor_name?: string | null
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
            referencedRelation: "attendance_summary"
            referencedColumns: ["student_id"]
          },
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
      student_fees: {
        Row: {
          amount: number
          balance: number | null
          created_at: string
          discount: number | null
          discount_reason: string | null
          due_date: string
          fee_structure_id: string
          id: string
          late_fee: number | null
          month_year: string | null
          paid_amount: number | null
          remarks: string | null
          status: Database["public"]["Enums"]["payment_status"] | null
          student_id: string
          total_amount: number | null
          updated_at: string
        }
        Insert: {
          amount: number
          balance?: number | null
          created_at?: string
          discount?: number | null
          discount_reason?: string | null
          due_date: string
          fee_structure_id: string
          id?: string
          late_fee?: number | null
          month_year?: string | null
          paid_amount?: number | null
          remarks?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          student_id: string
          total_amount?: number | null
          updated_at?: string
        }
        Update: {
          amount?: number
          balance?: number | null
          created_at?: string
          discount?: number | null
          discount_reason?: string | null
          due_date?: string
          fee_structure_id?: string
          id?: string
          late_fee?: number | null
          month_year?: string | null
          paid_amount?: number | null
          remarks?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          student_id?: string
          total_amount?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_fees_fee_structure_id_fkey"
            columns: ["fee_structure_id"]
            isOneToOne: false
            referencedRelation: "fee_structures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_fees_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "attendance_summary"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "student_fees_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_results: {
        Row: {
          created_at: string
          exam_id: string
          gpa: number | null
          grade: string | null
          id: string
          passed_subjects: number | null
          percentage: number | null
          rank: number | null
          remarks: string | null
          result_status: string | null
          student_id: string
          total_marks: number | null
          total_subjects: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          exam_id: string
          gpa?: number | null
          grade?: string | null
          id?: string
          passed_subjects?: number | null
          percentage?: number | null
          rank?: number | null
          remarks?: string | null
          result_status?: string | null
          student_id: string
          total_marks?: number | null
          total_subjects?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          exam_id?: string
          gpa?: number | null
          grade?: string | null
          id?: string
          passed_subjects?: number | null
          percentage?: number | null
          rank?: number | null
          remarks?: string | null
          result_status?: string | null
          student_id?: string
          total_marks?: number | null
          total_subjects?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_results_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_results_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "attendance_summary"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "student_results_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
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
      subjects: {
        Row: {
          code: string
          created_at: string
          credit_hours: number | null
          display_order: number | null
          full_marks: number
          id: string
          is_active: boolean | null
          is_optional: boolean | null
          name: string
          pass_marks: number
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          credit_hours?: number | null
          display_order?: number | null
          full_marks?: number
          id?: string
          is_active?: boolean | null
          is_optional?: boolean | null
          name: string
          pass_marks?: number
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          credit_hours?: number | null
          display_order?: number | null
          full_marks?: number
          id?: string
          is_active?: boolean | null
          is_optional?: boolean | null
          name?: string
          pass_marks?: number
          updated_at?: string
        }
        Relationships: []
      }
      teacher_assignments: {
        Row: {
          academic_year: string
          class: string
          created_at: string
          id: string
          is_class_teacher: boolean | null
          section: string | null
          subject_id: string | null
          teacher_id: string
          updated_at: string
        }
        Insert: {
          academic_year: string
          class: string
          created_at?: string
          id?: string
          is_class_teacher?: boolean | null
          section?: string | null
          subject_id?: string | null
          teacher_id: string
          updated_at?: string
        }
        Update: {
          academic_year?: string
          class?: string
          created_at?: string
          id?: string
          is_class_teacher?: boolean | null
          section?: string | null
          subject_id?: string | null
          teacher_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teacher_assignments_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_assignments_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_leave_requests: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          end_date: string
          id: string
          leave_type: string
          reason: string | null
          remarks: string | null
          start_date: string
          status: string | null
          teacher_id: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          end_date: string
          id?: string
          leave_type: string
          reason?: string | null
          remarks?: string | null
          start_date: string
          status?: string | null
          teacher_id: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          end_date?: string
          id?: string
          leave_type?: string
          reason?: string | null
          remarks?: string | null
          start_date?: string
          status?: string | null
          teacher_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teacher_leave_requests_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_timetable: {
        Row: {
          academic_year: string
          class: string
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          period_number: number
          room: string | null
          section: string | null
          start_time: string
          subject_id: string | null
          teacher_id: string
          updated_at: string
        }
        Insert: {
          academic_year: string
          class: string
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          period_number: number
          room?: string | null
          section?: string | null
          start_time: string
          subject_id?: string | null
          teacher_id: string
          updated_at?: string
        }
        Update: {
          academic_year?: string
          class?: string
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          period_number?: number
          room?: string | null
          section?: string | null
          start_time?: string
          subject_id?: string | null
          teacher_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teacher_timetable_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_timetable_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
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
          user_id: string | null
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
          user_id?: string | null
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
          user_id?: string | null
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
      attendance_summary: {
        Row: {
          absent_days: number | null
          attendance_percentage: number | null
          class: string | null
          excused_days: number | null
          full_name: string | null
          guardian_email: string | null
          guardian_phone: string | null
          late_days: number | null
          month: string | null
          present_days: number | null
          roll_number: number | null
          section: string | null
          student_id: string | null
          total_days: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_gpa: {
        Args: { p_exam_id: string; p_student_id: string }
        Returns: number
      }
      calculate_neb_grade: {
        Args: { full_marks: number; marks: number }
        Returns: {
          grade: string
          grade_point: number
        }[]
      }
      generate_monthly_fees: { Args: never; Returns: undefined }
      get_parent_id: { Args: { _user_id: string }; Returns: string }
      get_teacher_id: { Args: { _user_id: string }; Returns: string }
      has_any_admin_role: { Args: { _user_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_accountant: { Args: { _user_id: string }; Returns: boolean }
      is_librarian: { Args: { _user_id: string }; Returns: boolean }
      is_parent: { Args: { _user_id: string }; Returns: boolean }
      is_teacher: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role:
        | "super_admin"
        | "admin"
        | "teacher"
        | "staff"
        | "student"
        | "librarian"
        | "accountant"
        | "parent"
      attendance_status: "present" | "absent" | "late" | "excused"
      exam_type: "terminal" | "unit" | "monthly" | "final" | "pre_board"
      fee_type:
        | "admission"
        | "tuition"
        | "exam"
        | "library"
        | "sports"
        | "computer"
        | "transport"
        | "uniform"
        | "other"
      payment_method:
        | "cash"
        | "esewa"
        | "khalti"
        | "imepay"
        | "bank_transfer"
        | "cheque"
      payment_status:
        | "pending"
        | "paid"
        | "partial"
        | "overdue"
        | "cancelled"
        | "refunded"
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
      app_role: [
        "super_admin",
        "admin",
        "teacher",
        "staff",
        "student",
        "librarian",
        "accountant",
        "parent",
      ],
      attendance_status: ["present", "absent", "late", "excused"],
      exam_type: ["terminal", "unit", "monthly", "final", "pre_board"],
      fee_type: [
        "admission",
        "tuition",
        "exam",
        "library",
        "sports",
        "computer",
        "transport",
        "uniform",
        "other",
      ],
      payment_method: [
        "cash",
        "esewa",
        "khalti",
        "imepay",
        "bank_transfer",
        "cheque",
      ],
      payment_status: [
        "pending",
        "paid",
        "partial",
        "overdue",
        "cancelled",
        "refunded",
      ],
    },
  },
} as const
