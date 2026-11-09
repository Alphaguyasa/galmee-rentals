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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      audit_log: {
        Row: {
          action: string
          after: Json | null
          before: Json | null
          created_at: string
          id: number
          row_id: string | null
          table_name: string | null
          tenant_id: string
          user_id: string | null
        }
        Insert: {
          action: string
          after?: Json | null
          before?: Json | null
          created_at?: string
          id?: never
          row_id?: string | null
          table_name?: string | null
          tenant_id: string
          user_id?: string | null
        }
        Update: {
          action?: string
          after?: Json | null
          before?: Json | null
          created_at?: string
          id?: never
          row_id?: string | null
          table_name?: string | null
          tenant_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          created_at: string
          customer_id: string | null
          ends_at: string
          id: string
          notes: string | null
          resource_id: string
          resource_type: string
          starts_at: string
          status: string
          tenant_id: string
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          ends_at: string
          id?: string
          notes?: string | null
          resource_id: string
          resource_type: string
          starts_at: string
          status?: string
          tenant_id?: string
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          ends_at?: string
          id?: string
          notes?: string | null
          resource_id?: string
          resource_type?: string
          starts_at?: string
          status?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_balances"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "bookings_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      branches: {
        Row: {
          address: string | null
          created_at: string
          id: string
          name: string
          tenant_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          id?: string
          name: string
          tenant_id?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          id?: string
          name?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "branches_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      cf_advances: {
        Row: {
          amount: number
          client_ref: string | null
          created_at: string
          created_by: string
          farmer_id: string
          id: string
          kind: string
          method: Database["public"]["Enums"]["pay_method"]
          note: string | null
          paid_on: string
          tenant_id: string
          void_reason: string | null
          voided_at: string | null
          voided_by: string | null
        }
        Insert: {
          amount: number
          client_ref?: string | null
          created_at?: string
          created_by?: string
          farmer_id: string
          id?: string
          kind?: string
          method?: Database["public"]["Enums"]["pay_method"]
          note?: string | null
          paid_on?: string
          tenant_id?: string
          void_reason?: string | null
          voided_at?: string | null
          voided_by?: string | null
        }
        Update: {
          amount?: number
          client_ref?: string | null
          created_at?: string
          created_by?: string
          farmer_id?: string
          id?: string
          kind?: string
          method?: Database["public"]["Enums"]["pay_method"]
          note?: string | null
          paid_on?: string
          tenant_id?: string
          void_reason?: string | null
          voided_at?: string | null
          voided_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cf_advances_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "cf_advances_tenant_id_farmer_id_fkey"
            columns: ["tenant_id", "farmer_id"]
            isOneToOne: false
            referencedRelation: "cf_farmer_balances"
            referencedColumns: ["tenant_id", "farmer_id"]
          },
          {
            foreignKeyName: "cf_advances_tenant_id_farmer_id_fkey"
            columns: ["tenant_id", "farmer_id"]
            isOneToOne: false
            referencedRelation: "cf_farmers"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "cf_advances_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cf_advances_voided_by_fkey"
            columns: ["voided_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      cf_farmers: {
        Row: {
          active: boolean
          created_at: string
          created_by: string | null
          farmer_no: number
          id: string
          kebele: string
          name: string
          phone: string | null
          tenant_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          created_by?: string | null
          farmer_no: number
          id?: string
          kebele: string
          name: string
          phone?: string | null
          tenant_id?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          created_by?: string | null
          farmer_no?: number
          id?: string
          kebele?: string
          name?: string
          phone?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cf_farmers_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "cf_farmers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      cf_grades: {
        Row: {
          active: boolean
          code: string
          created_at: string
          default_price: number
          id: string
          name: string
          tenant_id: string
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string
          default_price: number
          id?: string
          name: string
          tenant_id?: string
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string
          default_price?: number
          id?: string
          name?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cf_grades_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      cf_lots: {
        Row: {
          closed_at: string | null
          code: string
          created_at: string
          created_by: string | null
          dispatched_at: string | null
          dispatched_to: string | null
          grade_id: string
          id: string
          lot_no: number
          opened_on: string
          status: string
          tenant_id: string
        }
        Insert: {
          closed_at?: string | null
          code: string
          created_at?: string
          created_by?: string | null
          dispatched_at?: string | null
          dispatched_to?: string | null
          grade_id: string
          id?: string
          lot_no: number
          opened_on?: string
          status?: string
          tenant_id?: string
        }
        Update: {
          closed_at?: string | null
          code?: string
          created_at?: string
          created_by?: string | null
          dispatched_at?: string | null
          dispatched_to?: string | null
          grade_id?: string
          id?: string
          lot_no?: number
          opened_on?: string
          status?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cf_lots_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "cf_lots_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cf_lots_tenant_id_grade_id_fkey"
            columns: ["tenant_id", "grade_id"]
            isOneToOne: false
            referencedRelation: "cf_grades"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "cf_lots_tenant_id_grade_id_fkey"
            columns: ["tenant_id", "grade_id"]
            isOneToOne: false
            referencedRelation: "cf_stock_by_grade"
            referencedColumns: ["tenant_id", "grade_id"]
          },
        ]
      }
      cf_purchases: {
        Row: {
          amount: number | null
          client_ref: string | null
          created_at: string
          created_by: string
          farmer_id: string
          grade_id: string
          id: string
          kg: number
          lot_id: string
          moisture_note: string | null
          price_per_kg: number
          purchased_on: string
          tenant_id: string
          void_reason: string | null
          voided_at: string | null
          voided_by: string | null
        }
        Insert: {
          amount?: number | null
          client_ref?: string | null
          created_at?: string
          created_by?: string
          farmer_id: string
          grade_id: string
          id?: string
          kg: number
          lot_id: string
          moisture_note?: string | null
          price_per_kg: number
          purchased_on?: string
          tenant_id?: string
          void_reason?: string | null
          voided_at?: string | null
          voided_by?: string | null
        }
        Update: {
          amount?: number | null
          client_ref?: string | null
          created_at?: string
          created_by?: string
          farmer_id?: string
          grade_id?: string
          id?: string
          kg?: number
          lot_id?: string
          moisture_note?: string | null
          price_per_kg?: number
          purchased_on?: string
          tenant_id?: string
          void_reason?: string | null
          voided_at?: string | null
          voided_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cf_purchases_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "cf_purchases_tenant_id_farmer_id_fkey"
            columns: ["tenant_id", "farmer_id"]
            isOneToOne: false
            referencedRelation: "cf_farmer_balances"
            referencedColumns: ["tenant_id", "farmer_id"]
          },
          {
            foreignKeyName: "cf_purchases_tenant_id_farmer_id_fkey"
            columns: ["tenant_id", "farmer_id"]
            isOneToOne: false
            referencedRelation: "cf_farmers"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "cf_purchases_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cf_purchases_tenant_id_grade_id_fkey"
            columns: ["tenant_id", "grade_id"]
            isOneToOne: false
            referencedRelation: "cf_grades"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "cf_purchases_tenant_id_grade_id_fkey"
            columns: ["tenant_id", "grade_id"]
            isOneToOne: false
            referencedRelation: "cf_stock_by_grade"
            referencedColumns: ["tenant_id", "grade_id"]
          },
          {
            foreignKeyName: "cf_purchases_tenant_id_lot_id_fkey"
            columns: ["tenant_id", "lot_id"]
            isOneToOne: false
            referencedRelation: "cf_lot_totals"
            referencedColumns: ["tenant_id", "lot_id"]
          },
          {
            foreignKeyName: "cf_purchases_tenant_id_lot_id_fkey"
            columns: ["tenant_id", "lot_id"]
            isOneToOne: false
            referencedRelation: "cf_lots"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "cf_purchases_voided_by_fkey"
            columns: ["voided_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      credit_ledger: {
        Row: {
          amount: number
          created_at: string
          customer_id: string
          due_date: string | null
          id: string
          note: string | null
          ref_id: string | null
          ref_table: string | null
          tenant_id: string
          type: string
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          customer_id: string
          due_date?: string | null
          id?: string
          note?: string | null
          ref_id?: string | null
          ref_table?: string | null
          tenant_id?: string
          type: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          customer_id?: string
          due_date?: string | null
          id?: string
          note?: string | null
          ref_id?: string | null
          ref_table?: string | null
          tenant_id?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "credit_ledger_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_balances"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "credit_ledger_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_ledger_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          created_at: string
          credit_limit: number | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          telegram_chat_id: string | null
          tenant_id: string
        }
        Insert: {
          created_at?: string
          credit_limit?: number | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          telegram_chat_id?: string | null
          tenant_id?: string
        }
        Update: {
          created_at?: string
          credit_limit?: number | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          telegram_chat_id?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      dr_courses: {
        Row: {
          active: boolean
          created_at: string
          fee: number
          id: string
          lesson_minutes: number
          lessons_total: number
          licence_class: string | null
          name: string
          tenant_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          fee: number
          id?: string
          lesson_minutes?: number
          lessons_total: number
          licence_class?: string | null
          name: string
          tenant_id?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          fee?: number
          id?: string
          lesson_minutes?: number
          lessons_total?: number
          licence_class?: string | null
          name?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dr_courses_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      dr_documents: {
        Row: {
          enrollment_id: string
          id: string
          kind: string
          received_at: string
          received_by: string | null
          tenant_id: string
        }
        Insert: {
          enrollment_id: string
          id?: string
          kind: string
          received_at?: string
          received_by?: string | null
          tenant_id?: string
        }
        Update: {
          enrollment_id?: string
          id?: string
          kind?: string
          received_at?: string
          received_by?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dr_documents_tenant_id_enrollment_id_fkey"
            columns: ["tenant_id", "enrollment_id"]
            isOneToOne: false
            referencedRelation: "dr_enrollments"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "dr_documents_tenant_id_enrollment_id_fkey"
            columns: ["tenant_id", "enrollment_id"]
            isOneToOne: false
            referencedRelation: "dr_student_board"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "dr_documents_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      dr_enrollments: {
        Row: {
          balance: number | null
          client_ref: string | null
          course_id: string
          created_at: string
          created_by: string | null
          customer_id: string
          fee: number
          id: string
          lesson_minutes: number
          lessons_total: number
          national_id: string | null
          paid_total: number
          start_on: string
          status: string
          tenant_id: string
        }
        Insert: {
          balance?: number | null
          client_ref?: string | null
          course_id: string
          created_at?: string
          created_by?: string | null
          customer_id: string
          fee: number
          id?: string
          lesson_minutes: number
          lessons_total: number
          national_id?: string | null
          paid_total?: number
          start_on: string
          status?: string
          tenant_id?: string
        }
        Update: {
          balance?: number | null
          client_ref?: string | null
          course_id?: string
          created_at?: string
          created_by?: string | null
          customer_id?: string
          fee?: number
          id?: string
          lesson_minutes?: number
          lessons_total?: number
          national_id?: string | null
          paid_total?: number
          start_on?: string
          status?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dr_enrollments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_balances"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "dr_enrollments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dr_enrollments_tenant_id_course_id_fkey"
            columns: ["tenant_id", "course_id"]
            isOneToOne: false
            referencedRelation: "dr_courses"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "dr_enrollments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      dr_exams: {
        Row: {
          client_ref: string | null
          created_at: string
          created_by: string | null
          enrollment_id: string
          exam_on: string
          id: string
          kind: string
          place: string | null
          result: string
          tenant_id: string
        }
        Insert: {
          client_ref?: string | null
          created_at?: string
          created_by?: string | null
          enrollment_id: string
          exam_on: string
          id?: string
          kind: string
          place?: string | null
          result?: string
          tenant_id?: string
        }
        Update: {
          client_ref?: string | null
          created_at?: string
          created_by?: string | null
          enrollment_id?: string
          exam_on?: string
          id?: string
          kind?: string
          place?: string | null
          result?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dr_exams_tenant_id_enrollment_id_fkey"
            columns: ["tenant_id", "enrollment_id"]
            isOneToOne: false
            referencedRelation: "dr_enrollments"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "dr_exams_tenant_id_enrollment_id_fkey"
            columns: ["tenant_id", "enrollment_id"]
            isOneToOne: false
            referencedRelation: "dr_student_board"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "dr_exams_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      dr_installments: {
        Row: {
          amount: number
          due_on: string
          enrollment_id: string
          id: string
          paid: number
          seq: number
          tenant_id: string
        }
        Insert: {
          amount: number
          due_on: string
          enrollment_id: string
          id?: string
          paid?: number
          seq: number
          tenant_id?: string
        }
        Update: {
          amount?: number
          due_on?: string
          enrollment_id?: string
          id?: string
          paid?: number
          seq?: number
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dr_installments_tenant_id_enrollment_id_fkey"
            columns: ["tenant_id", "enrollment_id"]
            isOneToOne: false
            referencedRelation: "dr_enrollments"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "dr_installments_tenant_id_enrollment_id_fkey"
            columns: ["tenant_id", "enrollment_id"]
            isOneToOne: false
            referencedRelation: "dr_student_board"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "dr_installments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      dr_instructors: {
        Row: {
          active: boolean
          created_at: string
          id: string
          name: string
          phone: string | null
          tenant_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          name: string
          phone?: string | null
          tenant_id?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          name?: string
          phone?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dr_instructors_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      dr_lessons: {
        Row: {
          client_ref: string | null
          created_at: string
          created_by: string | null
          ends_at: string
          enrollment_id: string
          id: string
          instructor_booking_id: string | null
          instructor_id: string
          marked_at: string | null
          marked_by: string | null
          starts_at: string
          status: string
          tenant_id: string
          vehicle_booking_id: string | null
          vehicle_id: string | null
        }
        Insert: {
          client_ref?: string | null
          created_at?: string
          created_by?: string | null
          ends_at: string
          enrollment_id: string
          id?: string
          instructor_booking_id?: string | null
          instructor_id: string
          marked_at?: string | null
          marked_by?: string | null
          starts_at: string
          status?: string
          tenant_id?: string
          vehicle_booking_id?: string | null
          vehicle_id?: string | null
        }
        Update: {
          client_ref?: string | null
          created_at?: string
          created_by?: string | null
          ends_at?: string
          enrollment_id?: string
          id?: string
          instructor_booking_id?: string | null
          instructor_id?: string
          marked_at?: string | null
          marked_by?: string | null
          starts_at?: string
          status?: string
          tenant_id?: string
          vehicle_booking_id?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dr_lessons_instructor_booking_id_fkey"
            columns: ["instructor_booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dr_lessons_tenant_id_enrollment_id_fkey"
            columns: ["tenant_id", "enrollment_id"]
            isOneToOne: false
            referencedRelation: "dr_enrollments"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "dr_lessons_tenant_id_enrollment_id_fkey"
            columns: ["tenant_id", "enrollment_id"]
            isOneToOne: false
            referencedRelation: "dr_student_board"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "dr_lessons_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dr_lessons_tenant_id_instructor_id_fkey"
            columns: ["tenant_id", "instructor_id"]
            isOneToOne: false
            referencedRelation: "dr_instructors"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "dr_lessons_tenant_id_vehicle_id_fkey"
            columns: ["tenant_id", "vehicle_id"]
            isOneToOne: false
            referencedRelation: "dr_vehicles"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "dr_lessons_vehicle_booking_id_fkey"
            columns: ["vehicle_booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      dr_payments: {
        Row: {
          amount: number
          client_ref: string | null
          created_at: string
          created_by: string | null
          enrollment_id: string
          id: string
          method: Database["public"]["Enums"]["pay_method"]
          payment_id: string
          reference: string | null
          tenant_id: string
        }
        Insert: {
          amount: number
          client_ref?: string | null
          created_at?: string
          created_by?: string | null
          enrollment_id: string
          id?: string
          method: Database["public"]["Enums"]["pay_method"]
          payment_id: string
          reference?: string | null
          tenant_id?: string
        }
        Update: {
          amount?: number
          client_ref?: string | null
          created_at?: string
          created_by?: string | null
          enrollment_id?: string
          id?: string
          method?: Database["public"]["Enums"]["pay_method"]
          payment_id?: string
          reference?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dr_payments_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dr_payments_tenant_id_enrollment_id_fkey"
            columns: ["tenant_id", "enrollment_id"]
            isOneToOne: false
            referencedRelation: "dr_enrollments"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "dr_payments_tenant_id_enrollment_id_fkey"
            columns: ["tenant_id", "enrollment_id"]
            isOneToOne: false
            referencedRelation: "dr_student_board"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "dr_payments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      dr_vehicles: {
        Row: {
          active: boolean
          created_at: string
          id: string
          label: string | null
          plate: string
          tenant_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          label?: string | null
          plate: string
          tenant_id?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          label?: string | null
          plate?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dr_vehicles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      gr_job_cards: {
        Row: {
          balance: number | null
          client_ref: string | null
          complaint: string
          created_by: string | null
          customer_id: string
          debt_posted: number
          delivered_at: string | null
          id: string
          job_no: number
          labour_total: number
          mechanic_id: string | null
          odometer_km: number | null
          opened_at: string
          paid_total: number
          parts_total: number
          ready_at: string | null
          status: string
          tenant_id: string
          total: number | null
          vehicle_id: string
          work_done: string | null
        }
        Insert: {
          balance?: number | null
          client_ref?: string | null
          complaint: string
          created_by?: string | null
          customer_id: string
          debt_posted?: number
          delivered_at?: string | null
          id?: string
          job_no: number
          labour_total?: number
          mechanic_id?: string | null
          odometer_km?: number | null
          opened_at?: string
          paid_total?: number
          parts_total?: number
          ready_at?: string | null
          status?: string
          tenant_id?: string
          total?: number | null
          vehicle_id: string
          work_done?: string | null
        }
        Update: {
          balance?: number | null
          client_ref?: string | null
          complaint?: string
          created_by?: string | null
          customer_id?: string
          debt_posted?: number
          delivered_at?: string | null
          id?: string
          job_no?: number
          labour_total?: number
          mechanic_id?: string | null
          odometer_km?: number | null
          opened_at?: string
          paid_total?: number
          parts_total?: number
          ready_at?: string | null
          status?: string
          tenant_id?: string
          total?: number | null
          vehicle_id?: string
          work_done?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gr_job_cards_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_balances"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "gr_job_cards_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gr_job_cards_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gr_job_cards_tenant_id_mechanic_id_fkey"
            columns: ["tenant_id", "mechanic_id"]
            isOneToOne: false
            referencedRelation: "gr_mechanics"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "gr_job_cards_tenant_id_vehicle_id_fkey"
            columns: ["tenant_id", "vehicle_id"]
            isOneToOne: false
            referencedRelation: "gr_vehicles"
            referencedColumns: ["tenant_id", "id"]
          },
        ]
      }
      gr_job_labour: {
        Row: {
          amount: number
          client_ref: string | null
          created_at: string
          created_by: string | null
          description: string
          id: string
          job_id: string
          mechanic_id: string | null
          reversed_at: string | null
          reversed_by: string | null
          tenant_id: string
        }
        Insert: {
          amount: number
          client_ref?: string | null
          created_at?: string
          created_by?: string | null
          description: string
          id?: string
          job_id: string
          mechanic_id?: string | null
          reversed_at?: string | null
          reversed_by?: string | null
          tenant_id?: string
        }
        Update: {
          amount?: number
          client_ref?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          id?: string
          job_id?: string
          mechanic_id?: string | null
          reversed_at?: string | null
          reversed_by?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gr_job_labour_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gr_job_labour_tenant_id_job_id_fkey"
            columns: ["tenant_id", "job_id"]
            isOneToOne: false
            referencedRelation: "gr_job_cards"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "gr_job_labour_tenant_id_mechanic_id_fkey"
            columns: ["tenant_id", "mechanic_id"]
            isOneToOne: false
            referencedRelation: "gr_mechanics"
            referencedColumns: ["tenant_id", "id"]
          },
        ]
      }
      gr_job_parts: {
        Row: {
          client_ref: string | null
          created_at: string
          created_by: string | null
          id: string
          item_id: string
          job_id: string
          line_total: number | null
          qty: number
          reversed_at: string | null
          reversed_by: string | null
          tenant_id: string
          unit_price: number
        }
        Insert: {
          client_ref?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          item_id: string
          job_id: string
          line_total?: number | null
          qty: number
          reversed_at?: string | null
          reversed_by?: string | null
          tenant_id?: string
          unit_price: number
        }
        Update: {
          client_ref?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          item_id?: string
          job_id?: string
          line_total?: number | null
          qty?: number
          reversed_at?: string | null
          reversed_by?: string | null
          tenant_id?: string
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "gr_job_parts_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "item_stock"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "gr_job_parts_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gr_job_parts_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "ph_item_expiry"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "gr_job_parts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gr_job_parts_tenant_id_job_id_fkey"
            columns: ["tenant_id", "job_id"]
            isOneToOne: false
            referencedRelation: "gr_job_cards"
            referencedColumns: ["tenant_id", "id"]
          },
        ]
      }
      gr_job_payments: {
        Row: {
          amount: number
          client_ref: string | null
          created_at: string
          created_by: string | null
          id: string
          job_id: string
          method: Database["public"]["Enums"]["pay_method"]
          payment_id: string
          tenant_id: string
        }
        Insert: {
          amount: number
          client_ref?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          job_id: string
          method: Database["public"]["Enums"]["pay_method"]
          payment_id: string
          tenant_id?: string
        }
        Update: {
          amount?: number
          client_ref?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          job_id?: string
          method?: Database["public"]["Enums"]["pay_method"]
          payment_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gr_job_payments_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gr_job_payments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gr_job_payments_tenant_id_job_id_fkey"
            columns: ["tenant_id", "job_id"]
            isOneToOne: false
            referencedRelation: "gr_job_cards"
            referencedColumns: ["tenant_id", "id"]
          },
        ]
      }
      gr_mechanics: {
        Row: {
          active: boolean
          created_at: string
          id: string
          name: string
          phone: string | null
          tenant_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          name: string
          phone?: string | null
          tenant_id?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          name?: string
          phone?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gr_mechanics_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      gr_vehicles: {
        Row: {
          color: string | null
          created_at: string
          customer_id: string | null
          id: string
          make: string | null
          model: string | null
          notes: string | null
          plate: string
          plate_key: string | null
          tenant_id: string
          year: number | null
        }
        Insert: {
          color?: string | null
          created_at?: string
          customer_id?: string | null
          id?: string
          make?: string | null
          model?: string | null
          notes?: string | null
          plate: string
          plate_key?: string | null
          tenant_id?: string
          year?: number | null
        }
        Update: {
          color?: string | null
          created_at?: string
          customer_id?: string | null
          id?: string
          make?: string | null
          model?: string | null
          notes?: string | null
          plate?: string
          plate_key?: string | null
          tenant_id?: string
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "gr_vehicles_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_balances"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "gr_vehicles_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gr_vehicles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      ht_booking_requests: {
        Row: {
          adults: number
          check_in: string
          check_out: string
          created_at: string
          guest_name: string
          handled_by: string | null
          id: string
          message: string | null
          phone: string
          room_type_id: string | null
          status: string
          stay_id: string | null
          tenant_id: string
        }
        Insert: {
          adults?: number
          check_in: string
          check_out: string
          created_at?: string
          guest_name: string
          handled_by?: string | null
          id?: string
          message?: string | null
          phone: string
          room_type_id?: string | null
          status?: string
          stay_id?: string | null
          tenant_id?: string
        }
        Update: {
          adults?: number
          check_in?: string
          check_out?: string
          created_at?: string
          guest_name?: string
          handled_by?: string | null
          id?: string
          message?: string | null
          phone?: string
          room_type_id?: string | null
          status?: string
          stay_id?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ht_booking_requests_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ht_booking_requests_tenant_id_room_type_id_fkey"
            columns: ["tenant_id", "room_type_id"]
            isOneToOne: false
            referencedRelation: "ht_room_types"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "ht_booking_requests_tenant_id_stay_id_fkey"
            columns: ["tenant_id", "stay_id"]
            isOneToOne: false
            referencedRelation: "ht_stays"
            referencedColumns: ["tenant_id", "id"]
          },
        ]
      }
      ht_rate_plans: {
        Row: {
          active: boolean
          created_at: string
          id: string
          is_default: boolean
          name: string
          nightly_rate: number
          room_type_id: string
          tenant_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          is_default?: boolean
          name: string
          nightly_rate: number
          room_type_id: string
          tenant_id?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          is_default?: boolean
          name?: string
          nightly_rate?: number
          room_type_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ht_rate_plans_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ht_rate_plans_tenant_id_room_type_id_fkey"
            columns: ["tenant_id", "room_type_id"]
            isOneToOne: false
            referencedRelation: "ht_room_types"
            referencedColumns: ["tenant_id", "id"]
          },
        ]
      }
      ht_room_types: {
        Row: {
          capacity: number
          created_at: string
          description: string | null
          id: string
          name: string
          sort_order: number
          tenant_id: string
        }
        Insert: {
          capacity?: number
          created_at?: string
          description?: string | null
          id?: string
          name: string
          sort_order?: number
          tenant_id?: string
        }
        Update: {
          capacity?: number
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          sort_order?: number
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ht_room_types_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      ht_rooms: {
        Row: {
          created_at: string
          floor: string | null
          housekeeping: string
          id: string
          in_service: boolean
          notes: string | null
          number: string
          room_type_id: string
          tenant_id: string
        }
        Insert: {
          created_at?: string
          floor?: string | null
          housekeeping?: string
          id?: string
          in_service?: boolean
          notes?: string | null
          number: string
          room_type_id: string
          tenant_id?: string
        }
        Update: {
          created_at?: string
          floor?: string | null
          housekeeping?: string
          id?: string
          in_service?: boolean
          notes?: string | null
          number?: string
          room_type_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ht_rooms_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ht_rooms_tenant_id_room_type_id_fkey"
            columns: ["tenant_id", "room_type_id"]
            isOneToOne: false
            referencedRelation: "ht_room_types"
            referencedColumns: ["tenant_id", "id"]
          },
        ]
      }
      ht_sites: {
        Row: {
          about: string | null
          address: string | null
          created_at: string
          display_name: string
          headline: string | null
          phone: string | null
          published: boolean
          reception_telegram: string | null
          slug: string
          tenant_id: string
        }
        Insert: {
          about?: string | null
          address?: string | null
          created_at?: string
          display_name: string
          headline?: string | null
          phone?: string | null
          published?: boolean
          reception_telegram?: string | null
          slug: string
          tenant_id?: string
        }
        Update: {
          about?: string | null
          address?: string | null
          created_at?: string
          display_name?: string
          headline?: string | null
          phone?: string | null
          published?: boolean
          reception_telegram?: string | null
          slug?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ht_sites_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      ht_stay_charges: {
        Row: {
          amount: number
          client_ref: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          kind: string
          reverses_id: string | null
          stay_id: string
          tenant_id: string
        }
        Insert: {
          amount: number
          client_ref?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          kind: string
          reverses_id?: string | null
          stay_id: string
          tenant_id?: string
        }
        Update: {
          amount?: number
          client_ref?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          kind?: string
          reverses_id?: string | null
          stay_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ht_stay_charges_reverses_id_fkey"
            columns: ["reverses_id"]
            isOneToOne: true
            referencedRelation: "ht_stay_charges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ht_stay_charges_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ht_stay_charges_tenant_id_stay_id_fkey"
            columns: ["tenant_id", "stay_id"]
            isOneToOne: false
            referencedRelation: "ht_stays"
            referencedColumns: ["tenant_id", "id"]
          },
        ]
      }
      ht_stay_payments: {
        Row: {
          amount: number
          client_ref: string | null
          created_at: string
          id: string
          payment_id: string
          stay_id: string
          tenant_id: string
        }
        Insert: {
          amount: number
          client_ref?: string | null
          created_at?: string
          id?: string
          payment_id: string
          stay_id: string
          tenant_id?: string
        }
        Update: {
          amount?: number
          client_ref?: string | null
          created_at?: string
          id?: string
          payment_id?: string
          stay_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ht_stay_payments_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: true
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ht_stay_payments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ht_stay_payments_tenant_id_stay_id_fkey"
            columns: ["tenant_id", "stay_id"]
            isOneToOne: false
            referencedRelation: "ht_stays"
            referencedColumns: ["tenant_id", "id"]
          },
        ]
      }
      ht_stays: {
        Row: {
          adults: number
          booking_id: string
          check_in: string
          check_out: string
          checked_in_at: string | null
          checked_out_at: string | null
          children: number
          client_ref: string | null
          created_at: string
          created_by: string | null
          customer_id: string
          final_balance: number | null
          final_charges_total: number | null
          final_paid_total: number | null
          final_room_total: number | null
          id: string
          id_number: string | null
          id_type: string | null
          nationality: string | null
          nightly_rate: number
          notes: string | null
          rate_plan_id: string | null
          room_id: string
          source: string
          status: string
          tenant_id: string
        }
        Insert: {
          adults?: number
          booking_id: string
          check_in: string
          check_out: string
          checked_in_at?: string | null
          checked_out_at?: string | null
          children?: number
          client_ref?: string | null
          created_at?: string
          created_by?: string | null
          customer_id: string
          final_balance?: number | null
          final_charges_total?: number | null
          final_paid_total?: number | null
          final_room_total?: number | null
          id?: string
          id_number?: string | null
          id_type?: string | null
          nationality?: string | null
          nightly_rate: number
          notes?: string | null
          rate_plan_id?: string | null
          room_id: string
          source?: string
          status?: string
          tenant_id?: string
        }
        Update: {
          adults?: number
          booking_id?: string
          check_in?: string
          check_out?: string
          checked_in_at?: string | null
          checked_out_at?: string | null
          children?: number
          client_ref?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string
          final_balance?: number | null
          final_charges_total?: number | null
          final_paid_total?: number | null
          final_room_total?: number | null
          id?: string
          id_number?: string | null
          id_type?: string | null
          nationality?: string | null
          nightly_rate?: number
          notes?: string | null
          rate_plan_id?: string | null
          room_id?: string
          source?: string
          status?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ht_stays_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ht_stays_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_balances"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "ht_stays_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ht_stays_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ht_stays_tenant_id_rate_plan_id_fkey"
            columns: ["tenant_id", "rate_plan_id"]
            isOneToOne: false
            referencedRelation: "ht_rate_plans"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "ht_stays_tenant_id_room_id_fkey"
            columns: ["tenant_id", "room_id"]
            isOneToOne: false
            referencedRelation: "ht_rooms"
            referencedColumns: ["tenant_id", "id"]
          },
        ]
      }
      items: {
        Row: {
          active: boolean
          category: string | null
          cost: number
          created_at: string
          id: string
          name_am: string | null
          name_en: string
          name_om: string | null
          price: number
          reorder_level: number
          sku: string | null
          tenant_id: string
          tracks_expiry: boolean
          unit: string
        }
        Insert: {
          active?: boolean
          category?: string | null
          cost?: number
          created_at?: string
          id?: string
          name_am?: string | null
          name_en: string
          name_om?: string | null
          price?: number
          reorder_level?: number
          sku?: string | null
          tenant_id?: string
          tracks_expiry?: boolean
          unit?: string
        }
        Update: {
          active?: boolean
          category?: string | null
          cost?: number
          created_at?: string
          id?: string
          name_am?: string | null
          name_en?: string
          name_om?: string | null
          price?: number
          reorder_level?: number
          sku?: string | null
          tenant_id?: string
          tracks_expiry?: boolean
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "items_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          attempts: number
          body: string
          channel: string
          created_at: string
          id: string
          sent_at: string | null
          status: string
          tenant_id: string
          to_addr: string
        }
        Insert: {
          attempts?: number
          body: string
          channel: string
          created_at?: string
          id?: string
          sent_at?: string | null
          status?: string
          tenant_id?: string
          to_addr: string
        }
        Update: {
          attempts?: number
          body?: string
          channel?: string
          created_at?: string
          id?: string
          sent_at?: string | null
          status?: string
          tenant_id?: string
          to_addr?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          customer_id: string | null
          id: string
          method: Database["public"]["Enums"]["pay_method"]
          ref_id: string | null
          ref_table: string | null
          reference: string | null
          tenant_id: string
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          customer_id?: string | null
          id?: string
          method?: Database["public"]["Enums"]["pay_method"]
          ref_id?: string | null
          ref_table?: string | null
          reference?: string | null
          tenant_id?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          customer_id?: string | null
          id?: string
          method?: Database["public"]["Enums"]["pay_method"]
          ref_id?: string | null
          ref_table?: string | null
          reference?: string | null
          tenant_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_balances"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "payments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      ph_payment_refs: {
        Row: {
          client_ref: string
          created_at: string
          payment_id: string
          tenant_id: string
        }
        Insert: {
          client_ref: string
          created_at?: string
          payment_id: string
          tenant_id?: string
        }
        Update: {
          client_ref?: string
          created_at?: string
          payment_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ph_payment_refs_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ph_payment_refs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      ph_purchase_lines: {
        Row: {
          batch_id: string | null
          batch_no: string | null
          created_at: string
          expiry_date: string | null
          id: string
          item_id: string
          po_id: string
          qty: number
          received_qty: number
          tenant_id: string
          unit_cost: number
        }
        Insert: {
          batch_id?: string | null
          batch_no?: string | null
          created_at?: string
          expiry_date?: string | null
          id?: string
          item_id: string
          po_id: string
          qty: number
          received_qty?: number
          tenant_id?: string
          unit_cost: number
        }
        Update: {
          batch_id?: string | null
          batch_no?: string | null
          created_at?: string
          expiry_date?: string | null
          id?: string
          item_id?: string
          po_id?: string
          qty?: number
          received_qty?: number
          tenant_id?: string
          unit_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: "ph_purchase_lines_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "stock_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ph_purchase_lines_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "item_stock"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "ph_purchase_lines_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ph_purchase_lines_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "ph_item_expiry"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "ph_purchase_lines_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ph_purchase_lines_tenant_id_po_id_fkey"
            columns: ["tenant_id", "po_id"]
            isOneToOne: false
            referencedRelation: "ph_purchase_orders"
            referencedColumns: ["tenant_id", "id"]
          },
        ]
      }
      ph_purchase_orders: {
        Row: {
          client_ref: string | null
          created_at: string
          created_by: string | null
          expected_date: string | null
          id: string
          notes: string | null
          received_at: string | null
          status: string
          supplier_id: string
          tenant_id: string
        }
        Insert: {
          client_ref?: string | null
          created_at?: string
          created_by?: string | null
          expected_date?: string | null
          id?: string
          notes?: string | null
          received_at?: string | null
          status?: string
          supplier_id: string
          tenant_id?: string
        }
        Update: {
          client_ref?: string | null
          created_at?: string
          created_by?: string | null
          expected_date?: string | null
          id?: string
          notes?: string | null
          received_at?: string | null
          status?: string
          supplier_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ph_purchase_orders_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ph_purchase_orders_tenant_id_supplier_id_fkey"
            columns: ["tenant_id", "supplier_id"]
            isOneToOne: false
            referencedRelation: "ph_suppliers"
            referencedColumns: ["tenant_id", "id"]
          },
        ]
      }
      ph_suppliers: {
        Row: {
          active: boolean
          created_at: string
          id: string
          name: string
          notes: string | null
          phone: string | null
          tenant_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          tenant_id?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ph_suppliers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          active: boolean
          created_at: string
          full_name: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          tenant_id: string
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          full_name: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          tenant_id: string
          user_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          full_name?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      rn_client_requests: {
        Row: {
          area: string | null
          client_name: string
          client_phone: string | null
          created_at: string
          deal: string
          id: string
          kind: string | null
          max_price: number
          min_bedrooms: number | null
          status: string
          tenant_id: string
        }
        Insert: {
          area?: string | null
          client_name: string
          client_phone?: string | null
          created_at?: string
          deal?: string
          id?: string
          kind?: string | null
          max_price: number
          min_bedrooms?: number | null
          status?: string
          tenant_id?: string
        }
        Update: {
          area?: string | null
          client_name?: string
          client_phone?: string | null
          created_at?: string
          deal?: string
          id?: string
          kind?: string | null
          max_price?: number
          min_bedrooms?: number | null
          status?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rn_client_requests_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      rn_leases: {
        Row: {
          advance: number
          client_ref: string | null
          created_at: string
          created_by: string | null
          customer_id: string
          deposit: number
          due_day: number
          end_on: string | null
          id: string
          monthly_rent: number
          start_on: string
          status: string
          tenant_id: string
          unit_id: string
        }
        Insert: {
          advance?: number
          client_ref?: string | null
          created_at?: string
          created_by?: string | null
          customer_id: string
          deposit?: number
          due_day: number
          end_on?: string | null
          id?: string
          monthly_rent: number
          start_on: string
          status?: string
          tenant_id?: string
          unit_id: string
        }
        Update: {
          advance?: number
          client_ref?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string
          deposit?: number
          due_day?: number
          end_on?: string | null
          id?: string
          monthly_rent?: number
          start_on?: string
          status?: string
          tenant_id?: string
          unit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rn_leases_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_balances"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "rn_leases_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rn_leases_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rn_leases_tenant_id_unit_id_fkey"
            columns: ["tenant_id", "unit_id"]
            isOneToOne: false
            referencedRelation: "rn_unit_board"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "rn_leases_tenant_id_unit_id_fkey"
            columns: ["tenant_id", "unit_id"]
            isOneToOne: false
            referencedRelation: "rn_units"
            referencedColumns: ["tenant_id", "id"]
          },
        ]
      }
      rn_listings: {
        Row: {
          area: string | null
          bedrooms: number | null
          created_at: string
          deal: string
          id: string
          kind: string
          owner_name: string | null
          owner_phone: string | null
          price: number
          status: string
          tenant_id: string
          title: string
        }
        Insert: {
          area?: string | null
          bedrooms?: number | null
          created_at?: string
          deal?: string
          id?: string
          kind?: string
          owner_name?: string | null
          owner_phone?: string | null
          price: number
          status?: string
          tenant_id?: string
          title: string
        }
        Update: {
          area?: string | null
          bedrooms?: number | null
          created_at?: string
          deal?: string
          id?: string
          kind?: string
          owner_name?: string | null
          owner_phone?: string | null
          price?: number
          status?: string
          tenant_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "rn_listings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      rn_payments: {
        Row: {
          amount: number
          client_ref: string | null
          created_at: string
          created_by: string | null
          id: string
          lease_id: string
          method: Database["public"]["Enums"]["pay_method"]
          payment_id: string
          reference: string | null
          tenant_id: string
        }
        Insert: {
          amount: number
          client_ref?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          lease_id: string
          method: Database["public"]["Enums"]["pay_method"]
          payment_id: string
          reference?: string | null
          tenant_id?: string
        }
        Update: {
          amount?: number
          client_ref?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          lease_id?: string
          method?: Database["public"]["Enums"]["pay_method"]
          payment_id?: string
          reference?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rn_payments_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rn_payments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rn_payments_tenant_id_lease_id_fkey"
            columns: ["tenant_id", "lease_id"]
            isOneToOne: false
            referencedRelation: "rn_lease_board"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "rn_payments_tenant_id_lease_id_fkey"
            columns: ["tenant_id", "lease_id"]
            isOneToOne: false
            referencedRelation: "rn_leases"
            referencedColumns: ["tenant_id", "id"]
          },
        ]
      }
      rn_properties: {
        Row: {
          active: boolean
          address: string | null
          created_at: string
          id: string
          name: string
          tenant_id: string
        }
        Insert: {
          active?: boolean
          address?: string | null
          created_at?: string
          id?: string
          name: string
          tenant_id?: string
        }
        Update: {
          active?: boolean
          address?: string | null
          created_at?: string
          id?: string
          name?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rn_properties_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      rn_rent_invoices: {
        Row: {
          amount: number
          balance: number | null
          created_at: string
          due_on: string
          eth_month: number
          eth_year: number
          id: string
          lease_id: string
          paid: number
          tenant_id: string
          voided: boolean
        }
        Insert: {
          amount: number
          balance?: number | null
          created_at?: string
          due_on: string
          eth_month: number
          eth_year: number
          id?: string
          lease_id: string
          paid?: number
          tenant_id?: string
          voided?: boolean
        }
        Update: {
          amount?: number
          balance?: number | null
          created_at?: string
          due_on?: string
          eth_month?: number
          eth_year?: number
          id?: string
          lease_id?: string
          paid?: number
          tenant_id?: string
          voided?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "rn_rent_invoices_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rn_rent_invoices_tenant_id_lease_id_fkey"
            columns: ["tenant_id", "lease_id"]
            isOneToOne: false
            referencedRelation: "rn_lease_board"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "rn_rent_invoices_tenant_id_lease_id_fkey"
            columns: ["tenant_id", "lease_id"]
            isOneToOne: false
            referencedRelation: "rn_leases"
            referencedColumns: ["tenant_id", "id"]
          },
        ]
      }
      rn_units: {
        Row: {
          active: boolean
          created_at: string
          id: string
          kind: string
          label: string
          monthly_rent: number
          property_id: string
          tenant_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          kind?: string
          label: string
          monthly_rent: number
          property_id: string
          tenant_id?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          kind?: string
          label?: string
          monthly_rent?: number
          property_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rn_units_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rn_units_tenant_id_property_id_fkey"
            columns: ["tenant_id", "property_id"]
            isOneToOne: false
            referencedRelation: "rn_properties"
            referencedColumns: ["tenant_id", "id"]
          },
        ]
      }
      sale_lines: {
        Row: {
          id: string
          item_id: string
          price: number
          qty: number
          sale_id: string
          tenant_id: string
        }
        Insert: {
          id?: string
          item_id: string
          price: number
          qty: number
          sale_id: string
          tenant_id?: string
        }
        Update: {
          id?: string
          item_id?: string
          price?: number
          qty?: number
          sale_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sale_lines_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "item_stock"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "sale_lines_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_lines_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "ph_item_expiry"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "sale_lines_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_lines_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      sales: {
        Row: {
          client_ref: string | null
          created_at: string
          customer_id: string | null
          id: string
          method: Database["public"]["Enums"]["pay_method"] | null
          paid: number
          staff_id: string | null
          tenant_id: string
          total: number
        }
        Insert: {
          client_ref?: string | null
          created_at?: string
          customer_id?: string | null
          id?: string
          method?: Database["public"]["Enums"]["pay_method"] | null
          paid?: number
          staff_id?: string | null
          tenant_id?: string
          total?: number
        }
        Update: {
          client_ref?: string | null
          created_at?: string
          customer_id?: string | null
          id?: string
          method?: Database["public"]["Enums"]["pay_method"] | null
          paid?: number
          staff_id?: string | null
          tenant_id?: string
          total?: number
        }
        Relationships: [
          {
            foreignKeyName: "sales_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_balances"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "sales_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      sc_attendance: {
        Row: {
          created_at: string
          day: string
          enrollment_id: string
          id: string
          status: string
          tenant_id: string
        }
        Insert: {
          created_at?: string
          day: string
          enrollment_id: string
          id?: string
          status: string
          tenant_id?: string
        }
        Update: {
          created_at?: string
          day?: string
          enrollment_id?: string
          id?: string
          status?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sc_attendance_tenant_id_enrollment_id_fkey"
            columns: ["tenant_id", "enrollment_id"]
            isOneToOne: false
            referencedRelation: "sc_enrollments"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "sc_attendance_tenant_id_enrollment_id_fkey"
            columns: ["tenant_id", "enrollment_id"]
            isOneToOne: false
            referencedRelation: "sc_student_register"
            referencedColumns: ["tenant_id", "enrollment_id"]
          },
          {
            foreignKeyName: "sc_attendance_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      sc_classes: {
        Row: {
          active: boolean
          created_at: string
          grade: string
          id: string
          section: string
          sort_order: number
          tenant_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          grade: string
          id?: string
          section?: string
          sort_order?: number
          tenant_id?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          grade?: string
          id?: string
          section?: string
          sort_order?: number
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sc_classes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      sc_enrollments: {
        Row: {
          academic_year: number
          class_id: string
          created_at: string
          id: string
          roll_no: number | null
          student_id: string
          tenant_id: string
        }
        Insert: {
          academic_year: number
          class_id: string
          created_at?: string
          id?: string
          roll_no?: number | null
          student_id: string
          tenant_id?: string
        }
        Update: {
          academic_year?: number
          class_id?: string
          created_at?: string
          id?: string
          roll_no?: number | null
          student_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sc_enrollments_tenant_id_class_id_fkey"
            columns: ["tenant_id", "class_id"]
            isOneToOne: false
            referencedRelation: "sc_classes"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "sc_enrollments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sc_enrollments_tenant_id_student_id_fkey"
            columns: ["tenant_id", "student_id"]
            isOneToOne: false
            referencedRelation: "sc_students"
            referencedColumns: ["tenant_id", "id"]
          },
        ]
      }
      sc_fee_invoices: {
        Row: {
          amount: number
          created_at: string
          description: string
          due_date: string | null
          enrollment_id: string
          fee_plan_id: string
          id: string
          paid: number
          period_key: string
          status: string | null
          tenant_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description: string
          due_date?: string | null
          enrollment_id: string
          fee_plan_id: string
          id?: string
          paid?: number
          period_key: string
          status?: string | null
          tenant_id?: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string
          due_date?: string | null
          enrollment_id?: string
          fee_plan_id?: string
          id?: string
          paid?: number
          period_key?: string
          status?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sc_fee_invoices_tenant_id_enrollment_id_fkey"
            columns: ["tenant_id", "enrollment_id"]
            isOneToOne: false
            referencedRelation: "sc_enrollments"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "sc_fee_invoices_tenant_id_enrollment_id_fkey"
            columns: ["tenant_id", "enrollment_id"]
            isOneToOne: false
            referencedRelation: "sc_student_register"
            referencedColumns: ["tenant_id", "enrollment_id"]
          },
          {
            foreignKeyName: "sc_fee_invoices_tenant_id_fee_plan_id_fkey"
            columns: ["tenant_id", "fee_plan_id"]
            isOneToOne: false
            referencedRelation: "sc_fee_plans"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "sc_fee_invoices_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      sc_fee_plans: {
        Row: {
          active: boolean
          amount: number
          created_at: string
          grade: string | null
          id: string
          name: string
          period: string
          tenant_id: string
        }
        Insert: {
          active?: boolean
          amount: number
          created_at?: string
          grade?: string | null
          id?: string
          name: string
          period?: string
          tenant_id?: string
        }
        Update: {
          active?: boolean
          amount?: number
          created_at?: string
          grade?: string | null
          id?: string
          name?: string
          period?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sc_fee_plans_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      sc_fee_receipts: {
        Row: {
          amount: number
          client_ref: string | null
          created_at: string
          id: string
          invoice_id: string
          method: Database["public"]["Enums"]["pay_method"]
          payment_id: string
          receipt_no: number
          received_by: string | null
          tenant_id: string
        }
        Insert: {
          amount: number
          client_ref?: string | null
          created_at?: string
          id?: string
          invoice_id: string
          method: Database["public"]["Enums"]["pay_method"]
          payment_id: string
          receipt_no: number
          received_by?: string | null
          tenant_id?: string
        }
        Update: {
          amount?: number
          client_ref?: string | null
          created_at?: string
          id?: string
          invoice_id?: string
          method?: Database["public"]["Enums"]["pay_method"]
          payment_id?: string
          receipt_no?: number
          received_by?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sc_fee_receipts_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sc_fee_receipts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sc_fee_receipts_tenant_id_invoice_id_fkey"
            columns: ["tenant_id", "invoice_id"]
            isOneToOne: false
            referencedRelation: "sc_fee_invoices"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "sc_fee_receipts_tenant_id_invoice_id_fkey"
            columns: ["tenant_id", "invoice_id"]
            isOneToOne: false
            referencedRelation: "sc_invoice_register"
            referencedColumns: ["tenant_id", "invoice_id"]
          },
        ]
      }
      sc_grades: {
        Row: {
          enrollment_id: string
          id: string
          mark: number
          subject_id: string
          tenant_id: string
          term: number
          updated_at: string
        }
        Insert: {
          enrollment_id: string
          id?: string
          mark: number
          subject_id: string
          tenant_id?: string
          term: number
          updated_at?: string
        }
        Update: {
          enrollment_id?: string
          id?: string
          mark?: number
          subject_id?: string
          tenant_id?: string
          term?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sc_grades_tenant_id_enrollment_id_fkey"
            columns: ["tenant_id", "enrollment_id"]
            isOneToOne: false
            referencedRelation: "sc_enrollments"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "sc_grades_tenant_id_enrollment_id_fkey"
            columns: ["tenant_id", "enrollment_id"]
            isOneToOne: false
            referencedRelation: "sc_student_register"
            referencedColumns: ["tenant_id", "enrollment_id"]
          },
          {
            foreignKeyName: "sc_grades_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sc_grades_tenant_id_subject_id_fkey"
            columns: ["tenant_id", "subject_id"]
            isOneToOne: false
            referencedRelation: "sc_subjects"
            referencedColumns: ["tenant_id", "id"]
          },
        ]
      }
      sc_guardians: {
        Row: {
          created_at: string
          full_name: string
          id: string
          phone: string
          relation: string
          telegram_chat_id: string | null
          tenant_id: string
        }
        Insert: {
          created_at?: string
          full_name: string
          id?: string
          phone: string
          relation?: string
          telegram_chat_id?: string | null
          tenant_id?: string
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          phone?: string
          relation?: string
          telegram_chat_id?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sc_guardians_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      sc_students: {
        Row: {
          created_at: string
          date_of_birth: string | null
          full_name: string
          gender: string | null
          guardian_id: string | null
          id: string
          status: string
          student_no: string | null
          tenant_id: string
        }
        Insert: {
          created_at?: string
          date_of_birth?: string | null
          full_name: string
          gender?: string | null
          guardian_id?: string | null
          id?: string
          status?: string
          student_no?: string | null
          tenant_id?: string
        }
        Update: {
          created_at?: string
          date_of_birth?: string | null
          full_name?: string
          gender?: string | null
          guardian_id?: string | null
          id?: string
          status?: string
          student_no?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sc_students_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sc_students_tenant_id_guardian_id_fkey"
            columns: ["tenant_id", "guardian_id"]
            isOneToOne: false
            referencedRelation: "sc_guardians"
            referencedColumns: ["tenant_id", "id"]
          },
        ]
      }
      sc_subjects: {
        Row: {
          created_at: string
          grade: string | null
          id: string
          max_mark: number
          name: string
          sort_order: number
          tenant_id: string
        }
        Insert: {
          created_at?: string
          grade?: string | null
          id?: string
          max_mark?: number
          name: string
          sort_order?: number
          tenant_id?: string
        }
        Update: {
          created_at?: string
          grade?: string | null
          id?: string
          max_mark?: number
          name?: string
          sort_order?: number
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sc_subjects_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_batches: {
        Row: {
          batch_no: string | null
          cost: number
          expiry_date: string | null
          id: string
          item_id: string
          qty: number
          received_at: string
          tenant_id: string
        }
        Insert: {
          batch_no?: string | null
          cost?: number
          expiry_date?: string | null
          id?: string
          item_id: string
          qty?: number
          received_at?: string
          tenant_id?: string
        }
        Update: {
          batch_no?: string | null
          cost?: number
          expiry_date?: string | null
          id?: string
          item_id?: string
          qty?: number
          received_at?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_batches_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "item_stock"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "stock_batches_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_batches_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "ph_item_expiry"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "stock_batches_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_movements: {
        Row: {
          batch_id: string | null
          created_at: string
          id: string
          item_id: string
          qty: number
          reason: string | null
          ref_id: string | null
          ref_table: string | null
          tenant_id: string
          type: string
          user_id: string | null
        }
        Insert: {
          batch_id?: string | null
          created_at?: string
          id?: string
          item_id: string
          qty: number
          reason?: string | null
          ref_id?: string | null
          ref_table?: string | null
          tenant_id?: string
          type: string
          user_id?: string | null
        }
        Update: {
          batch_id?: string | null
          created_at?: string
          id?: string
          item_id?: string
          qty?: number
          reason?: string | null
          ref_id?: string | null
          ref_table?: string | null
          tenant_id?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "stock_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "item_stock"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "stock_movements_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "ph_item_expiry"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "stock_movements_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          monthly_fee: number | null
          paid_until: string | null
          plan: string
          setup_fee: number | null
          tenant_id: string
        }
        Insert: {
          monthly_fee?: number | null
          paid_until?: string | null
          plan?: string
          setup_fee?: number | null
          tenant_id: string
        }
        Update: {
          monthly_fee?: number | null
          paid_until?: string | null
          plan?: string
          setup_fee?: number | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          address: string | null
          created_at: string
          default_lang: string
          id: string
          logo_url: string | null
          name: string
          phone: string | null
          status: string
          vertical: Database["public"]["Enums"]["vertical"]
        }
        Insert: {
          address?: string | null
          created_at?: string
          default_lang?: string
          id?: string
          logo_url?: string | null
          name: string
          phone?: string | null
          status?: string
          vertical: Database["public"]["Enums"]["vertical"]
        }
        Update: {
          address?: string | null
          created_at?: string
          default_lang?: string
          id?: string
          logo_url?: string | null
          name?: string
          phone?: string | null
          status?: string
          vertical?: Database["public"]["Enums"]["vertical"]
        }
        Relationships: []
      }
      tr_cash_handovers: {
        Row: {
          amount: number
          client_ref: string | null
          created_at: string
          day: string
          expected: number
          id: string
          kind: string
          note: string | null
          received_by: string
          reversed_at: string | null
          reversed_by: string | null
          seller_id: string | null
          tenant_id: string
          vehicle_id: string | null
        }
        Insert: {
          amount: number
          client_ref?: string | null
          created_at?: string
          day: string
          expected: number
          id?: string
          kind: string
          note?: string | null
          received_by?: string
          reversed_at?: string | null
          reversed_by?: string | null
          seller_id?: string | null
          tenant_id?: string
          vehicle_id?: string | null
        }
        Update: {
          amount?: number
          client_ref?: string | null
          created_at?: string
          day?: string
          expected?: number
          id?: string
          kind?: string
          note?: string | null
          received_by?: string
          reversed_at?: string | null
          reversed_by?: string | null
          seller_id?: string | null
          tenant_id?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tr_cash_handovers_received_by_fkey"
            columns: ["received_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "tr_cash_handovers_reversed_by_fkey"
            columns: ["reversed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "tr_cash_handovers_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "tr_cash_handovers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tr_cash_handovers_tenant_id_vehicle_id_fkey"
            columns: ["tenant_id", "vehicle_id"]
            isOneToOne: false
            referencedRelation: "tr_vehicles"
            referencedColumns: ["tenant_id", "id"]
          },
        ]
      }
      tr_departures: {
        Row: {
          arrived_at: string | null
          created_at: string
          created_by: string | null
          departed_at: string | null
          departs_at: string
          departs_day: string | null
          driver_id: string | null
          fare: number
          id: string
          route_id: string
          seats: number
          status: string
          tenant_id: string
          vehicle_id: string
        }
        Insert: {
          arrived_at?: string | null
          created_at?: string
          created_by?: string | null
          departed_at?: string | null
          departs_at: string
          departs_day?: string | null
          driver_id?: string | null
          fare: number
          id?: string
          route_id: string
          seats: number
          status?: string
          tenant_id?: string
          vehicle_id: string
        }
        Update: {
          arrived_at?: string | null
          created_at?: string
          created_by?: string | null
          departed_at?: string | null
          departs_at?: string
          departs_day?: string | null
          driver_id?: string | null
          fare?: number
          id?: string
          route_id?: string
          seats?: number
          status?: string
          tenant_id?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tr_departures_tenant_id_driver_id_fkey"
            columns: ["tenant_id", "driver_id"]
            isOneToOne: false
            referencedRelation: "tr_drivers"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "tr_departures_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tr_departures_tenant_id_route_id_fkey"
            columns: ["tenant_id", "route_id"]
            isOneToOne: false
            referencedRelation: "tr_routes"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "tr_departures_tenant_id_vehicle_id_fkey"
            columns: ["tenant_id", "vehicle_id"]
            isOneToOne: false
            referencedRelation: "tr_vehicles"
            referencedColumns: ["tenant_id", "id"]
          },
        ]
      }
      tr_drivers: {
        Row: {
          active: boolean
          created_at: string
          id: string
          name: string
          phone: string | null
          tenant_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          name: string
          phone?: string | null
          tenant_id?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          name?: string
          phone?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tr_drivers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tr_parcels: {
        Row: {
          arrived_at: string | null
          cancelled_at: string | null
          client_ref: string | null
          collected_at: string | null
          departure_id: string | null
          description: string
          fee: number
          id: string
          loaded_at: string | null
          method: Database["public"]["Enums"]["pay_method"]
          received_by: string
          receiver_name: string
          receiver_phone: string
          route_id: string
          sender_name: string
          sender_phone: string | null
          sold_at: string
          sold_day: string | null
          status: string
          tenant_id: string
          waybill_no: number
          weight_kg: number | null
        }
        Insert: {
          arrived_at?: string | null
          cancelled_at?: string | null
          client_ref?: string | null
          collected_at?: string | null
          departure_id?: string | null
          description: string
          fee: number
          id?: string
          loaded_at?: string | null
          method?: Database["public"]["Enums"]["pay_method"]
          received_by?: string
          receiver_name: string
          receiver_phone: string
          route_id: string
          sender_name: string
          sender_phone?: string | null
          sold_at?: string
          sold_day?: string | null
          status?: string
          tenant_id?: string
          waybill_no: number
          weight_kg?: number | null
        }
        Update: {
          arrived_at?: string | null
          cancelled_at?: string | null
          client_ref?: string | null
          collected_at?: string | null
          departure_id?: string | null
          description?: string
          fee?: number
          id?: string
          loaded_at?: string | null
          method?: Database["public"]["Enums"]["pay_method"]
          received_by?: string
          receiver_name?: string
          receiver_phone?: string
          route_id?: string
          sender_name?: string
          sender_phone?: string | null
          sold_at?: string
          sold_day?: string | null
          status?: string
          tenant_id?: string
          waybill_no?: number
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tr_parcels_received_by_fkey"
            columns: ["received_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "tr_parcels_tenant_id_departure_id_fkey"
            columns: ["tenant_id", "departure_id"]
            isOneToOne: false
            referencedRelation: "tr_departures"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "tr_parcels_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tr_parcels_tenant_id_route_id_fkey"
            columns: ["tenant_id", "route_id"]
            isOneToOne: false
            referencedRelation: "tr_routes"
            referencedColumns: ["tenant_id", "id"]
          },
        ]
      }
      tr_routes: {
        Row: {
          active: boolean
          created_at: string
          destination: string
          fare: number
          id: string
          origin: string
          tenant_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          destination: string
          fare: number
          id?: string
          origin: string
          tenant_id?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          destination?: string
          fare?: number
          id?: string
          origin?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tr_routes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tr_tickets: {
        Row: {
          channel: string
          client_ref: string | null
          departure_id: string
          fare: number
          id: string
          method: Database["public"]["Enums"]["pay_method"]
          passenger_name: string | null
          passenger_phone: string | null
          seat: number
          sold_at: string
          sold_by: string
          sold_day: string | null
          tenant_id: string
          void_reason: string | null
          voided_at: string | null
          voided_by: string | null
        }
        Insert: {
          channel?: string
          client_ref?: string | null
          departure_id: string
          fare: number
          id?: string
          method?: Database["public"]["Enums"]["pay_method"]
          passenger_name?: string | null
          passenger_phone?: string | null
          seat: number
          sold_at?: string
          sold_by?: string
          sold_day?: string | null
          tenant_id?: string
          void_reason?: string | null
          voided_at?: string | null
          voided_by?: string | null
        }
        Update: {
          channel?: string
          client_ref?: string | null
          departure_id?: string
          fare?: number
          id?: string
          method?: Database["public"]["Enums"]["pay_method"]
          passenger_name?: string | null
          passenger_phone?: string | null
          seat?: number
          sold_at?: string
          sold_by?: string
          sold_day?: string | null
          tenant_id?: string
          void_reason?: string | null
          voided_at?: string | null
          voided_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tr_tickets_sold_by_fkey"
            columns: ["sold_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "tr_tickets_tenant_id_departure_id_fkey"
            columns: ["tenant_id", "departure_id"]
            isOneToOne: false
            referencedRelation: "tr_departures"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "tr_tickets_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tr_tickets_voided_by_fkey"
            columns: ["voided_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      tr_vehicles: {
        Row: {
          active: boolean
          created_at: string
          id: string
          name: string | null
          plate: string
          seats: number
          tenant_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          name?: string | null
          plate: string
          seats: number
          tenant_id?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          name?: string | null
          plate?: string
          seats?: number
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tr_vehicles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      cf_farmer_balances: {
        Row: {
          advanced: number | null
          bought: number | null
          due: number | null
          farmer_id: string | null
          kg: number | null
          paid: number | null
          tenant_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cf_farmers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      cf_lot_totals: {
        Row: {
          amount: number | null
          closed_at: string | null
          code: string | null
          dispatched_at: string | null
          dispatched_to: string | null
          grade_code: string | null
          grade_id: string | null
          grade_name: string | null
          kg: number | null
          lot_id: string | null
          opened_on: string | null
          purchases: number | null
          status: string | null
          tenant_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cf_lots_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cf_lots_tenant_id_grade_id_fkey"
            columns: ["tenant_id", "grade_id"]
            isOneToOne: false
            referencedRelation: "cf_grades"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "cf_lots_tenant_id_grade_id_fkey"
            columns: ["tenant_id", "grade_id"]
            isOneToOne: false
            referencedRelation: "cf_stock_by_grade"
            referencedColumns: ["tenant_id", "grade_id"]
          },
        ]
      }
      cf_stock_by_grade: {
        Row: {
          active: boolean | null
          code: string | null
          cost_on_hand: number | null
          grade_id: string | null
          kg_dispatched: number | null
          kg_on_hand: number | null
          name: string | null
          tenant_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cf_grades_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_balances: {
        Row: {
          balance: number | null
          credit_limit: number | null
          customer_id: string | null
          name: string | null
          oldest_debt_at: string | null
          phone: string | null
          tenant_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      dr_lesson_board: {
        Row: {
          ends_at: string | null
          enrollment_id: string | null
          id: string | null
          instructor_id: string | null
          instructor_name: string | null
          starts_at: string | null
          status: string | null
          student_name: string | null
          tenant_id: string | null
          vehicle_id: string | null
          vehicle_plate: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dr_lessons_tenant_id_enrollment_id_fkey"
            columns: ["tenant_id", "enrollment_id"]
            isOneToOne: false
            referencedRelation: "dr_enrollments"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "dr_lessons_tenant_id_enrollment_id_fkey"
            columns: ["tenant_id", "enrollment_id"]
            isOneToOne: false
            referencedRelation: "dr_student_board"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "dr_lessons_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dr_lessons_tenant_id_instructor_id_fkey"
            columns: ["tenant_id", "instructor_id"]
            isOneToOne: false
            referencedRelation: "dr_instructors"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "dr_lessons_tenant_id_vehicle_id_fkey"
            columns: ["tenant_id", "vehicle_id"]
            isOneToOne: false
            referencedRelation: "dr_vehicles"
            referencedColumns: ["tenant_id", "id"]
          },
        ]
      }
      dr_student_board: {
        Row: {
          balance: number | null
          course_name: string | null
          customer_id: string | null
          fee: number | null
          id: string | null
          lessons_attended: number | null
          lessons_booked: number | null
          lessons_total: number | null
          next_due_on: string | null
          next_exam_kind: string | null
          next_exam_on: string | null
          next_lesson_at: string | null
          overdue: number | null
          paid_total: number | null
          start_on: string | null
          status: string | null
          student_name: string | null
          student_phone: string | null
          tenant_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dr_enrollments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_balances"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "dr_enrollments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dr_enrollments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      item_stock: {
        Row: {
          item_id: string | null
          name_am: string | null
          name_en: string | null
          name_om: string | null
          next_expiry: string | null
          qty_on_hand: number | null
          reorder_level: number | null
          tenant_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "items_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      ph_item_expiry: {
        Row: {
          batch_count: number | null
          category: string | null
          days_left: number | null
          item_id: string | null
          name_am: string | null
          name_en: string | null
          name_om: string | null
          next_expiry: string | null
          price: number | null
          qty_on_hand: number | null
          reorder_level: number | null
          sku: string | null
          stock_value: number | null
          tenant_id: string | null
          tracks_expiry: boolean | null
          unit: string | null
          value_30: number | null
          value_60: number | null
          value_90: number | null
          value_expired: number | null
        }
        Relationships: [
          {
            foreignKeyName: "items_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      rn_invoice_board: {
        Row: {
          amount: number | null
          balance: number | null
          due_on: string | null
          eth_month: number | null
          eth_year: number | null
          id: string | null
          lease_id: string | null
          paid: number | null
          property_name: string | null
          tenant_id: string | null
          tenant_name: string | null
          unit_label: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rn_rent_invoices_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rn_rent_invoices_tenant_id_lease_id_fkey"
            columns: ["tenant_id", "lease_id"]
            isOneToOne: false
            referencedRelation: "rn_lease_board"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "rn_rent_invoices_tenant_id_lease_id_fkey"
            columns: ["tenant_id", "lease_id"]
            isOneToOne: false
            referencedRelation: "rn_leases"
            referencedColumns: ["tenant_id", "id"]
          },
        ]
      }
      rn_lease_board: {
        Row: {
          advance: number | null
          customer_id: string | null
          deposit: number | null
          due_day: number | null
          end_on: string | null
          id: string | null
          monthly_rent: number | null
          next_due_on: string | null
          oldest_overdue_on: string | null
          open_balance: number | null
          overdue: number | null
          overdue_count: number | null
          property_id: string | null
          property_name: string | null
          start_on: string | null
          status: string | null
          tenant_id: string | null
          tenant_name: string | null
          tenant_phone: string | null
          unit_id: string | null
          unit_kind: string | null
          unit_label: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rn_leases_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_balances"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "rn_leases_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rn_leases_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rn_leases_tenant_id_unit_id_fkey"
            columns: ["tenant_id", "unit_id"]
            isOneToOne: false
            referencedRelation: "rn_unit_board"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "rn_leases_tenant_id_unit_id_fkey"
            columns: ["tenant_id", "unit_id"]
            isOneToOne: false
            referencedRelation: "rn_units"
            referencedColumns: ["tenant_id", "id"]
          },
        ]
      }
      rn_listing_matches: {
        Row: {
          area: string | null
          bedrooms: number | null
          deal: string | null
          kind: string | null
          listing_id: string | null
          owner_name: string | null
          owner_phone: string | null
          price: number | null
          request_id: string | null
          tenant_id: string | null
          title: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rn_client_requests_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      rn_unit_board: {
        Row: {
          active: boolean | null
          id: string | null
          kind: string | null
          label: string | null
          lease_id: string | null
          monthly_rent: number | null
          next_due_on: string | null
          oldest_overdue_on: string | null
          overdue: number | null
          property_id: string | null
          property_name: string | null
          tenant_id: string | null
          tenant_name: string | null
          tenant_phone: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rn_units_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rn_units_tenant_id_property_id_fkey"
            columns: ["tenant_id", "property_id"]
            isOneToOne: false
            referencedRelation: "rn_properties"
            referencedColumns: ["tenant_id", "id"]
          },
        ]
      }
      sc_class_term_ranks: {
        Row: {
          academic_year: number | null
          average: number | null
          class_id: string | null
          class_rank: number | null
          class_size: number | null
          enrollment_id: string | null
          tenant_id: string | null
          term: number | null
          total: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sc_grades_tenant_id_enrollment_id_fkey"
            columns: ["tenant_id", "enrollment_id"]
            isOneToOne: false
            referencedRelation: "sc_enrollments"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "sc_grades_tenant_id_enrollment_id_fkey"
            columns: ["tenant_id", "enrollment_id"]
            isOneToOne: false
            referencedRelation: "sc_student_register"
            referencedColumns: ["tenant_id", "enrollment_id"]
          },
          {
            foreignKeyName: "sc_grades_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      sc_invoice_register: {
        Row: {
          academic_year: number | null
          amount: number | null
          class_id: string | null
          description: string | null
          due_date: string | null
          enrollment_id: string | null
          full_name: string | null
          grade: string | null
          guardian_name: string | null
          guardian_phone: string | null
          invoice_id: string | null
          paid: number | null
          period_key: string | null
          remaining: number | null
          roll_no: number | null
          section: string | null
          status: string | null
          student_id: string | null
          tenant_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sc_fee_invoices_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      sc_receipt_details: {
        Row: {
          amount: number | null
          created_at: string | null
          description: string | null
          full_name: string | null
          grade: string | null
          guardian_name: string | null
          invoice_amount: number | null
          invoice_id: string | null
          method: Database["public"]["Enums"]["pay_method"] | null
          period_key: string | null
          receipt_id: string | null
          receipt_no: number | null
          remaining: number | null
          section: string | null
          tenant_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sc_fee_receipts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      sc_student_register: {
        Row: {
          academic_year: number | null
          class_id: string | null
          enrollment_id: string | null
          full_name: string | null
          gender: string | null
          grade: string | null
          guardian_id: string | null
          guardian_name: string | null
          guardian_phone: string | null
          roll_no: number | null
          section: string | null
          sort_order: number | null
          status: string | null
          student_id: string | null
          student_no: string | null
          tenant_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sc_enrollments_tenant_id_class_id_fkey"
            columns: ["tenant_id", "class_id"]
            isOneToOne: false
            referencedRelation: "sc_classes"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "sc_enrollments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      sc_unpaid_by_class: {
        Row: {
          class_id: string | null
          grade: string | null
          owed: number | null
          period_key: string | null
          section: string | null
          sort_order: number | null
          students: number | null
          tenant_id: string | null
          unpaid_students: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sc_enrollments_tenant_id_class_id_fkey"
            columns: ["tenant_id", "class_id"]
            isOneToOne: false
            referencedRelation: "sc_classes"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "sc_enrollments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      wh_customer_ageing: {
        Row: {
          customer_id: string | null
          days_0_30: number | null
          days_31_60: number | null
          days_over_60: number | null
          name: string | null
          oldest_days: number | null
          phone: string | null
          tenant_id: string | null
          total: number | null
        }
        Relationships: [
          {
            foreignKeyName: "credit_ledger_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_balances"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "credit_ledger_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_ledger_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      wh_customer_statement: {
        Row: {
          amount: number | null
          balance_after: number | null
          created_at: string | null
          customer_id: string | null
          due_date: string | null
          id: string | null
          note: string | null
          tenant_id: string | null
          type: string | null
        }
        Relationships: [
          {
            foreignKeyName: "credit_ledger_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_balances"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "credit_ledger_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_ledger_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      adjust_stock: {
        Args: { p_batch: string; p_new_qty: number; p_reason: string }
        Returns: undefined
      }
      cf_add_farmer: {
        Args: { p_kebele: string; p_name: string; p_phone?: string }
        Returns: string
      }
      cf_close_lot: { Args: { p_lot: string }; Returns: undefined }
      cf_daily_by_grade: {
        Args: { p_day: string }
        Returns: {
          amount: number
          avg_price: number
          code: string
          farmers: number
          grade_id: string
          kg: number
          name: string
          purchases: number
        }[]
      }
      cf_dispatch_lot: {
        Args: { p_lot: string; p_to: string }
        Returns: undefined
      }
      cf_farmer_statement: {
        Args: { p_farmer: string }
        Returns: {
          balance: number
          credit: number
          day: string
          debit: number
          entry: string
          id: string
          kg: number
          label: string
          method: Database["public"]["Enums"]["pay_method"]
          moisture: string
          price: number
          void_reason: string
          voided: boolean
        }[]
      }
      cf_period_by_grade: {
        Args: { p_from: string; p_to: string }
        Returns: {
          amount: number
          avg_price: number
          code: string
          farmers: number
          grade_id: string
          kg: number
          name: string
          purchases: number
        }[]
      }
      cf_period_money: {
        Args: { p_from: string; p_to: string }
        Returns: {
          advanced: number
          paid: number
        }[]
      }
      cf_record_advance: {
        Args: {
          p_amount: number
          p_client_ref?: string
          p_day?: string
          p_farmer: string
          p_kind: string
          p_method?: Database["public"]["Enums"]["pay_method"]
          p_note?: string
        }
        Returns: string
      }
      cf_record_purchase: {
        Args: {
          p_client_ref?: string
          p_day?: string
          p_farmer: string
          p_grade: string
          p_kg: number
          p_moisture?: string
          p_price: number
        }
        Returns: string
      }
      cf_update_farmer: {
        Args: {
          p_active?: boolean
          p_farmer: string
          p_kebele: string
          p_name: string
          p_phone?: string
        }
        Returns: undefined
      }
      cf_void_advance: {
        Args: { p_advance: string; p_reason: string }
        Returns: undefined
      }
      cf_void_purchase: {
        Args: { p_purchase: string; p_reason: string }
        Returns: undefined
      }
      create_tenant: {
        Args: {
          p_full_name: string
          p_lang?: string
          p_name: string
          p_phone: string
          p_vertical: Database["public"]["Enums"]["vertical"]
        }
        Returns: string
      }
      dr_add_exam: {
        Args: {
          p_client_ref?: string
          p_enrollment: string
          p_exam_on: string
          p_kind: string
          p_place?: string
        }
        Returns: string
      }
      dr_book_lesson: {
        Args: {
          p_client_ref?: string
          p_enrollment: string
          p_instructor: string
          p_starts_at: string
          p_vehicle: string
        }
        Returns: string
      }
      dr_enroll: {
        Args: {
          p_client_ref?: string
          p_course: string
          p_documents?: string[]
          p_down?: number
          p_first_due?: string
          p_installments?: number
          p_method?: Database["public"]["Enums"]["pay_method"]
          p_name: string
          p_national_id?: string
          p_phone: string
          p_start: string
        }
        Returns: string
      }
      dr_exam_result: {
        Args: { p_exam: string; p_result: string }
        Returns: undefined
      }
      dr_load_demo: { Args: never; Returns: undefined }
      dr_mark_lesson: {
        Args: { p_lesson: string; p_status: string }
        Returns: undefined
      }
      dr_pay: {
        Args: {
          p_amount: number
          p_client_ref?: string
          p_enrollment: string
          p_method?: Database["public"]["Enums"]["pay_method"]
          p_reference?: string
        }
        Returns: string
      }
      gr_add_labour: {
        Args: {
          p_amount: number
          p_client_ref?: string
          p_description: string
          p_job: string
          p_mechanic?: string
        }
        Returns: string
      }
      gr_add_part: {
        Args: {
          p_client_ref?: string
          p_item: string
          p_job: string
          p_qty: number
          p_unit_price?: number
        }
        Returns: string
      }
      gr_load_demo_data: { Args: never; Returns: number }
      gr_open_job: {
        Args: {
          p_client_ref?: string
          p_complaint: string
          p_customer?: string
          p_customer_name?: string
          p_customer_phone?: string
          p_make?: string
          p_mechanic?: string
          p_model?: string
          p_odometer?: number
          p_plate: string
        }
        Returns: string
      }
      gr_pay_job: {
        Args: {
          p_amount: number
          p_client_ref?: string
          p_job: string
          p_method?: Database["public"]["Enums"]["pay_method"]
          p_reference?: string
        }
        Returns: string
      }
      gr_reverse_labour: { Args: { p_labour: string }; Returns: undefined }
      gr_reverse_part: { Args: { p_part: string }; Returns: undefined }
      gr_set_status: {
        Args: { p_due?: string; p_job: string; p_status: string }
        Returns: undefined
      }
      gr_update_job: {
        Args: {
          p_job: string
          p_mechanic?: string
          p_odometer?: number
          p_work_done?: string
        }
        Returns: undefined
      }
      ht_add_charge: {
        Args: {
          p_amount: number
          p_client_ref?: string
          p_description?: string
          p_kind: string
          p_stay: string
        }
        Returns: string
      }
      ht_cancel_stay: {
        Args: { p_no_show?: boolean; p_stay: string }
        Returns: undefined
      }
      ht_check_in: {
        Args: {
          p_id_number?: string
          p_id_type?: string
          p_nationality?: string
          p_stay: string
        }
        Returns: undefined
      }
      ht_check_out: {
        Args: {
          p_amount?: number
          p_leave_balance?: boolean
          p_method?: Database["public"]["Enums"]["pay_method"]
          p_reference?: string
          p_stay: string
        }
        Returns: Json
      }
      ht_create_stay: {
        Args: {
          p_adults?: number
          p_check_in: string
          p_check_in_now?: boolean
          p_check_out: string
          p_children?: number
          p_client_ref?: string
          p_customer?: string
          p_guest_name?: string
          p_guest_phone?: string
          p_id_number?: string
          p_id_type?: string
          p_nationality?: string
          p_nightly_rate?: number
          p_notes?: string
          p_rate_plan?: string
          p_request?: string
          p_room: string
          p_source?: string
        }
        Returns: string
      }
      ht_daily_report: {
        Args: { p_from: string; p_to: string }
        Returns: {
          arrivals: number
          day: string
          departures: number
          income: number
          occupied: number
          rooms: number
        }[]
      }
      ht_decline_request: { Args: { p_request: string }; Returns: undefined }
      ht_load_demo_data: { Args: never; Returns: number }
      ht_pay_stay: {
        Args: {
          p_amount: number
          p_client_ref?: string
          p_method?: Database["public"]["Enums"]["pay_method"]
          p_reference?: string
          p_stay: string
        }
        Returns: string
      }
      ht_reverse_charge: { Args: { p_charge: string }; Returns: string }
      ht_set_housekeeping: {
        Args: { p_room: string; p_state: string }
        Returns: undefined
      }
      ht_stay_totals: {
        Args: { p_stay: string }
        Returns: {
          balance: number
          charges_total: number
          nights: number
          paid_total: number
          room_total: number
        }[]
      }
      ph_create_purchase_order: {
        Args: {
          p_client_ref?: string
          p_expected?: string
          p_lines: Json
          p_notes?: string
          p_supplier: string
        }
        Returns: string
      }
      ph_credit_totals: {
        Args: never
        Returns: {
          customers_owing: number
          total_owed: number
        }[]
      }
      ph_customer_list: {
        Args: { p_limit?: number; p_owing?: boolean; p_q?: string }
        Returns: {
          balance: number | null
          credit_limit: number | null
          customer_id: string | null
          name: string | null
          oldest_debt_at: string | null
          phone: string | null
          tenant_id: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "customer_balances"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      ph_customer_statement: {
        Args: { p_customer: string; p_limit?: number }
        Returns: {
          amount: number
          balance_after: number
          created_at: string
          due_date: string
          id: string
          type: string
        }[]
      }
      ph_expiry_totals: {
        Args: never
        Returns: {
          items_30: number
          items_90: number
          items_expired: number
          items_low: number
          value_30: number
          value_60: number
          value_90: number
          value_expired: number
        }[]
      }
      ph_load_demo_data: { Args: never; Returns: number }
      ph_receive_delivery: {
        Args: { p_client_ref: string; p_lines: Json; p_supplier: string }
        Returns: string
      }
      ph_receive_purchase_order: {
        Args: { p_lines?: Json; p_po: string }
        Returns: number
      }
      ph_record_repayment: {
        Args: {
          p_amount: number
          p_client_ref: string
          p_customer: string
          p_method: Database["public"]["Enums"]["pay_method"]
          p_reference: string
        }
        Returns: string
      }
      ph_stock_list: {
        Args: { p_filter?: string; p_limit?: number; p_q?: string }
        Returns: {
          batch_count: number | null
          category: string | null
          days_left: number | null
          item_id: string | null
          name_am: string | null
          name_en: string | null
          name_om: string | null
          next_expiry: string | null
          price: number | null
          qty_on_hand: number | null
          reorder_level: number | null
          sku: string | null
          stock_value: number | null
          tenant_id: string | null
          tracks_expiry: boolean | null
          unit: string | null
          value_30: number | null
          value_60: number | null
          value_90: number | null
          value_expired: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "ph_item_expiry"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      receive_stock: {
        Args: {
          p_batch?: string
          p_cost: number
          p_expiry?: string
          p_item: string
          p_qty: number
        }
        Returns: string
      }
      record_repayment: {
        Args: {
          p_amount: number
          p_customer: string
          p_method?: Database["public"]["Enums"]["pay_method"]
          p_reference?: string
        }
        Returns: string
      }
      record_sale: {
        Args: {
          p_client_ref?: string
          p_customer?: string
          p_due?: string
          p_lines: Json
          p_method?: Database["public"]["Enums"]["pay_method"]
          p_paid?: number
        }
        Returns: string
      }
      rn_end_lease: {
        Args: { p_end: string; p_lease: string }
        Returns: undefined
      }
      rn_generate_invoices: { Args: never; Returns: number }
      rn_load_demo: { Args: never; Returns: undefined }
      rn_record_payment: {
        Args: {
          p_amount: number
          p_client_ref?: string
          p_lease: string
          p_method?: Database["public"]["Enums"]["pay_method"]
          p_reference?: string
        }
        Returns: string
      }
      rn_start_lease: {
        Args: {
          p_client_ref?: string
          p_deposit?: number
          p_due_day: number
          p_name: string
          p_phone: string
          p_rent: number
          p_start: string
          p_unit: string
        }
        Returns: string
      }
      sc_add_student: {
        Args: {
          p_class: string
          p_full_name: string
          p_gender: string
          p_guardian_name: string
          p_guardian_phone: string
          p_relation?: string
          p_student_no: string
          p_year: number
        }
        Returns: string
      }
      sc_generate_invoices: {
        Args: {
          p_academic_year: number
          p_due?: string
          p_period: string
          p_period_key: string
        }
        Returns: number
      }
      sc_record_fee_payment: {
        Args: {
          p_amount: number
          p_client_ref?: string
          p_invoice: string
          p_method?: Database["public"]["Enums"]["pay_method"]
          p_reference?: string
        }
        Returns: Json
      }
      tr_reconcile: {
        Args: { p_day: string }
        Returns: {
          expected: number
          handed: number
          kind: string
          label: string
          parcels: number
          seller_id: string
          short: number
          sold: number
          tickets: number
          vehicle_id: string
        }[]
      }
      tr_record_handover: {
        Args: {
          p_amount: number
          p_client_ref?: string
          p_day: string
          p_kind: string
          p_note?: string
          p_seller?: string
          p_vehicle?: string
        }
        Returns: string
      }
      tr_register_parcel: {
        Args: {
          p_client_ref?: string
          p_description: string
          p_fee: number
          p_method?: Database["public"]["Enums"]["pay_method"]
          p_receiver_name: string
          p_receiver_phone: string
          p_route: string
          p_sender_name: string
          p_sender_phone?: string
          p_weight?: number
        }
        Returns: string
      }
      tr_reverse_handover: { Args: { p_handover: string }; Returns: undefined }
      tr_route_report: {
        Args: { p_day: string }
        Returns: {
          departures: number
          destination: string
          origin: string
          parcel_total: number
          parcels: number
          route_id: string
          seats: number
          ticket_total: number
          tickets: number
        }[]
      }
      tr_schedule_departure: {
        Args: {
          p_departs_at: string
          p_driver?: string
          p_fare?: number
          p_route: string
          p_vehicle: string
        }
        Returns: string
      }
      tr_sell_ticket: {
        Args: {
          p_channel?: string
          p_client_ref?: string
          p_departure: string
          p_method?: Database["public"]["Enums"]["pay_method"]
          p_name?: string
          p_phone?: string
          p_seat: number
        }
        Returns: string
      }
      tr_set_departure_status: {
        Args: { p_departure: string; p_status: string }
        Returns: undefined
      }
      tr_set_parcel_status: {
        Args: { p_departure?: string; p_parcel: string; p_status: string }
        Returns: undefined
      }
      tr_void_ticket: {
        Args: { p_reason: string; p_ticket: string }
        Returns: undefined
      }
      wh_ageing_totals: {
        Args: never
        Returns: {
          days_0_30: number
          days_31_60: number
          days_over_60: number
        }[]
      }
      wh_owed_summary: {
        Args: never
        Returns: {
          debtors: number
          total_owed: number
        }[]
      }
    }
    Enums: {
      pay_method: "cash" | "telebirr" | "cbe_birr" | "chapa" | "bank" | "other"
      user_role: "owner" | "manager" | "staff"
      vertical:
        | "clinic"
        | "pharmacy"
        | "school"
        | "hotel"
        | "garage"
        | "wholesale"
        | "transport"
        | "coffee"
        | "driving"
        | "rentals"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      pay_method: ["cash", "telebirr", "cbe_birr", "chapa", "bank", "other"],
      user_role: ["owner", "manager", "staff"],
      vertical: [
        "clinic",
        "pharmacy",
        "school",
        "hotel",
        "garage",
        "wholesale",
        "transport",
        "coffee",
        "driving",
        "rentals",
      ],
    },
  },
} as const
