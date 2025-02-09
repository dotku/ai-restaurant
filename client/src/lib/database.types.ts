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
      restaurants: {
        Row: {
          id: string
          name: string
          cuisine: string
          image_url: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          cuisine: string
          image_url: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          cuisine?: string
          image_url?: string
          created_at?: string
        }
      }
      menu_items: {
        Row: {
          id: string
          restaurant_id: string
          name: string
          description: string
          price: number
          category: string
          popular: boolean
          image_url: string
          created_at: string
        }
        Insert: {
          id?: string
          restaurant_id: string
          name: string
          description: string
          price: number
          category: string
          popular?: boolean
          image_url: string
          created_at?: string
        }
        Update: {
          id?: string
          restaurant_id?: string
          name?: string
          description?: string
          price?: number
          category?: string
          popular?: boolean
          image_url?: string
          created_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          user_name: string
          phone: string
          pickup_time: string
          total_amount: number
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          user_name: string
          phone: string
          pickup_time: string
          total_amount: number
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_name?: string
          phone?: string
          pickup_time?: string
          total_amount?: number
          status?: string
          created_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          menu_item_id: string
          quantity: number
          price: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          menu_item_id: string
          quantity: number
          price: number
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          menu_item_id?: string
          quantity?: number
          price?: number
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