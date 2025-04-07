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
      posts: {
        Row: {
          id: string
          user_id: string
          content: string
          date: string
          likes: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          content: string
          date?: string
          likes?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          content?: string
          date?: string
          likes?: number
          created_at?: string
        }
      }
      runs: {
        Row: {
          id: string
          user_id: string
          date: string
          distance: number
          note: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          distance: number
          note?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          distance?: number
          note?: string | null
          created_at?: string
        }
      }
      users: {
        Row: {
          id: string
          name: string
          email: string
          image: string | null
          total_miles: number
          monthly_miles: number
          pace_status: number
          streak: number
          created_at: string
        }
        Insert: {
          id: string
          name: string
          email: string
          image?: string | null
          total_miles?: number
          monthly_miles?: number
          pace_status?: number
          streak?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          image?: string | null
          total_miles?: number
          monthly_miles?: number
          pace_status?: number
          streak?: number
          created_at?: string
        }
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
  }
} 