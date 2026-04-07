export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string
          role: 'parent' | 'caregiver' | 'clinician' | 'teacher' | 'admin'
          status: 'active' | 'invited' | 'suspended'
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          role?: 'parent' | 'caregiver' | 'clinician' | 'teacher' | 'admin'
          status?: 'active' | 'invited' | 'suspended'
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          role?: 'parent' | 'caregiver' | 'clinician' | 'teacher' | 'admin'
          status?: 'active' | 'invited' | 'suspended'
          avatar_url?: string | null
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
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
