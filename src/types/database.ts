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
          email: string
          full_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          user_id: string
          name: string
          sku: string | null
          category: string | null
          current_quantity: number
          reorder_point: number
          supplier_name: string | null
          supplier_email: string | null
          supplier_phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          sku?: string | null
          category?: string | null
          current_quantity?: number
          reorder_point?: number
          supplier_name?: string | null
          supplier_email?: string | null
          supplier_phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          sku?: string | null
          category?: string | null
          current_quantity?: number
          reorder_point?: number
          supplier_name?: string | null
          supplier_email?: string | null
          supplier_phone?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      stock_history: {
        Row: {
          id: string
          product_id: string
          previous_quantity: number
          quantity_change: number
          new_quantity: number
          change_type: 'add' | 'remove' | 'restock'
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          previous_quantity: number
          quantity_change: number
          new_quantity: number
          change_type: 'add' | 'remove' | 'restock'
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          previous_quantity?: number
          quantity_change?: number
          new_quantity?: number
          change_type?: 'add' | 'remove' | 'restock'
          notes?: string | null
          created_at?: string
        }
      }
      alerts: {
        Row: {
          id: string
          user_id: string
          product_id: string
          alert_type: 'low_stock' | 'out_of_stock'
          message: string
          is_read: boolean
          is_sent: boolean
          sent_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          alert_type: 'low_stock' | 'out_of_stock'
          message: string
          is_read?: boolean
          is_sent?: boolean
          sent_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          alert_type?: 'low_stock' | 'out_of_stock'
          message?: string
          is_read?: boolean
          is_sent?: boolean
          sent_at?: string | null
          created_at?: string
        }
      }
    }
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Product = Database['public']['Tables']['products']['Row']
export type StockHistory = Database['public']['Tables']['stock_history']['Row']
export type Alert = Database['public']['Tables']['alerts']['Row']
