export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string
          role: 'parent' | 'caregiver' | 'clinician' | 'teacher' | 'other' | 'admin'
          status: 'active' | 'invited' | 'suspended'
          avatar_url: string | null
          consent_version: string | null
          consent_accepted_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          role?: 'parent' | 'caregiver' | 'clinician' | 'teacher' | 'other' | 'admin'
          status?: 'active' | 'invited' | 'suspended'
          avatar_url?: string | null
          consent_version?: string | null
          consent_accepted_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          role?: 'parent' | 'caregiver' | 'clinician' | 'teacher' | 'other' | 'admin'
          status?: 'active' | 'invited' | 'suspended'
          avatar_url?: string | null
          consent_version?: string | null
          consent_accepted_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      children: {
        Row: {
          id: string
          user_id: string
          name: string
          date_of_birth: string | null
          avatar_color: 'sage' | 'dblue' | 'sand'
          context_labels: string[]
          support_needs: string[]
          strengths: string[]
          interests: string[]
          routines: string[]
          goals: string[]
          notes: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          date_of_birth?: string | null
          avatar_color?: 'sage' | 'dblue' | 'sand'
          context_labels?: string[]
          support_needs?: string[]
          strengths?: string[]
          interests?: string[]
          routines?: string[]
          goals?: string[]
          notes?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          date_of_birth?: string | null
          avatar_color?: 'sage' | 'dblue' | 'sand'
          context_labels?: string[]
          support_needs?: string[]
          strengths?: string[]
          interests?: string[]
          routines?: string[]
          goals?: string[]
          notes?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'children_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      conversations: {
        Row: {
          id: string
          user_id: string
          child_id: string | null
          title: string
          preview: string
          is_pinned: boolean
          tags: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          child_id?: string | null
          title?: string
          preview?: string
          is_pinned?: boolean
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          child_id?: string | null
          title?: string
          preview?: string
          is_pinned?: boolean
          tags?: string[]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'conversations_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'conversations_child_id_fkey'
            columns: ['child_id']
            isOneToOne: false
            referencedRelation: 'children'
            referencedColumns: ['id']
          }
        ]
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          role: 'user' | 'assistant'
          content: string
          sources: Json | null
          not_found_note: string | null
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          role: 'user' | 'assistant'
          content: string
          sources?: Json | null
          not_found_note?: string | null
          created_at?: string
        }
        Update: {
          content?: string
          sources?: Json | null
          not_found_note?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'messages_conversation_id_fkey'
            columns: ['conversation_id']
            isOneToOne: false
            referencedRelation: 'conversations'
            referencedColumns: ['id']
          }
        ]
      }
      documents: {
        Row: {
          id: string
          title: string
          original_filename: string
          file_type: 'pdf' | 'docx' | 'txt'
          storage_path: string
          uploaded_by: string | null
          status: 'uploaded' | 'parsing' | 'chunking' | 'embedding' | 'ready' | 'failed'
          error_message: string | null
          tags: string[]
          chunk_count: number
          uploaded_at: string
          processed_at: string | null
          file_size_bytes: number | null
        }
        Insert: {
          id?: string
          title: string
          original_filename: string
          file_type: 'pdf' | 'docx' | 'txt'
          storage_path: string
          uploaded_by?: string | null
          status?: 'uploaded' | 'parsing' | 'chunking' | 'embedding' | 'ready' | 'failed'
          error_message?: string | null
          tags?: string[]
          chunk_count?: number
          uploaded_at?: string
          processed_at?: string | null
          file_size_bytes?: number | null
        }
        Update: {
          title?: string
          status?: 'uploaded' | 'parsing' | 'chunking' | 'embedding' | 'ready' | 'failed'
          error_message?: string | null
          tags?: string[]
          chunk_count?: number
          processed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'documents_uploaded_by_fkey'
            columns: ['uploaded_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      document_chunks: {
        Row: {
          id: string
          document_id: string
          chunk_index: number
          content: string
          embedding: string | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          document_id: string
          chunk_index: number
          content: string
          embedding?: string | null
          metadata?: Json
          created_at?: string
        }
        Update: {
          embedding?: string | null
          metadata?: Json
        }
        Relationships: [
          {
            foreignKeyName: 'document_chunks_document_id_fkey'
            columns: ['document_id']
            isOneToOne: false
            referencedRelation: 'documents'
            referencedColumns: ['id']
          }
        ]
      }
      privacy_audit_log: {
        Row: {
          id: string
          user_id: string | null
          event_type: 'consent_accepted' | 'consent_version_bump' | 'data_export_requested' | 'data_deletion_requested' | 'account_deleted'
          event_data: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          event_type: 'consent_accepted' | 'consent_version_bump' | 'data_export_requested' | 'data_deletion_requested' | 'account_deleted'
          event_data?: Json
          created_at?: string
        }
        Update: {
          event_data?: Json
        }
        Relationships: [
          {
            foreignKeyName: 'privacy_audit_log_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          stripe_price_id: string | null
          plan_id: 'free' | 'starter' | 'pro' | 'clinician' | 'petits_genies'
          status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete' | 'paused'
          current_period_start: string | null
          current_period_end: string | null
          cancel_at_period_end: boolean
          canceled_at: string | null
          plan_granted_by: string | null
          plan_granted_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          stripe_price_id?: string | null
          plan_id?: 'free' | 'starter' | 'pro' | 'clinician' | 'petits_genies'
          status?: 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete' | 'paused'
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          canceled_at?: string | null
          plan_granted_by?: string | null
          plan_granted_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          stripe_price_id?: string | null
          plan_id?: 'free' | 'starter' | 'pro' | 'clinician' | 'petits_genies'
          status?: 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete' | 'paused'
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          canceled_at?: string | null
          plan_granted_by?: string | null
          plan_granted_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'subscriptions_user_id_fkey'
            columns: ['user_id']
            isOneToOne: true
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      daily_usage_log: {
        Row: {
          id: string
          user_id: string
          usage_date: string
          question_count: number
        }
        Insert: {
          id?: string
          user_id: string
          usage_date?: string
          question_count?: number
        }
        Update: {
          question_count?: number
        }
        Relationships: [
          {
            foreignKeyName: 'daily_usage_log_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      incident_log: {
        Row: {
          id: string
          reported_by: string | null
          severity: 'low' | 'medium' | 'high' | 'critical'
          title: string
          description: string
          affected_users_count: number | null
          data_types_affected: string[]
          status: 'open' | 'investigating' | 'resolved' | 'reported_to_opc' | 'reported_to_ipc'
          resolution: string | null
          reported_to_authority_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          reported_by?: string | null
          severity: 'low' | 'medium' | 'high' | 'critical'
          title: string
          description: string
          affected_users_count?: number | null
          data_types_affected?: string[]
          status?: 'open' | 'investigating' | 'resolved' | 'reported_to_opc' | 'reported_to_ipc'
          resolution?: string | null
          reported_to_authority_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          severity?: 'low' | 'medium' | 'high' | 'critical'
          title?: string
          description?: string
          affected_users_count?: number | null
          data_types_affected?: string[]
          status?: 'open' | 'investigating' | 'resolved' | 'reported_to_opc' | 'reported_to_ipc'
          resolution?: string | null
          reported_to_authority_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'incident_log_reported_by_fkey'
            columns: ['reported_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: Record<string, never>
    Functions: {
      match_chunks: {
        Args: {
          query_embedding: string
          match_threshold?: number
          match_count?: number
          filter_tags?: string[] | null
        }
        Returns: {
          id: string
          document_id: string
          chunk_index: number
          content: string
          metadata: Json
          similarity: number
          document_title: string
          original_filename: string
        }[]
      }
      get_daily_usage: {
        Args: { p_user_id: string }
        Returns: number
      }
      increment_daily_usage: {
        Args: { p_user_id: string }
        Returns: number
      }
      get_user_role: {
        Args: Record<string, never>
        Returns: string
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
