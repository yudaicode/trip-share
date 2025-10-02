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
          updated_at: string | null
          username: string | null
          full_name: string | null
          avatar_url: string | null
          bio: string | null
          website: string | null
          created_at: string
        }
        Insert: {
          id: string
          updated_at?: string | null
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          website?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          updated_at?: string | null
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          website?: string | null
          created_at?: string
        }
      }
      trip_schedules: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string
          start_date: string
          end_date: string
          cover_image: string | null
          category: string
          traveler_count: number
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description: string
          start_date: string
          end_date: string
          cover_image?: string | null
          category: string
          traveler_count?: number
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string
          start_date?: string
          end_date?: string
          cover_image?: string | null
          category?: string
          traveler_count?: number
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      day_schedules: {
        Row: {
          id: string
          trip_schedule_id: string
          day_number: number
          date: string
          title: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          trip_schedule_id: string
          day_number: number
          date: string
          title: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          trip_schedule_id?: string
          day_number?: number
          date?: string
          title?: string
          created_at?: string
          updated_at?: string
        }
      }
      activities: {
        Row: {
          id: string
          day_schedule_id: string
          time: string
          title: string
          type: string
          location: string | null
          description: string | null
          duration: string | null
          images: Json
          cost: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          day_schedule_id: string
          time: string
          title: string
          type?: string
          location?: string | null
          description?: string | null
          duration?: string | null
          images?: Json
          cost?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          day_schedule_id?: string
          time?: string
          title?: string
          type?: string
          location?: string | null
          description?: string | null
          duration?: string | null
          images?: Json
          cost?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      trip_likes: {
        Row: {
          id: string
          user_id: string
          trip_schedule_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          trip_schedule_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          trip_schedule_id?: string
          created_at?: string
        }
      }
      trip_comments: {
        Row: {
          id: string
          user_id: string
          trip_schedule_id: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          trip_schedule_id: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          trip_schedule_id?: string
          content?: string
          created_at?: string
          updated_at?: string
        }
      }
      trip_bookmarks: {
        Row: {
          id: string
          user_id: string
          trip_schedule_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          trip_schedule_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          trip_schedule_id?: string
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