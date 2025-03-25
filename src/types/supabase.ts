import { Product } from './product';

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
      products: {
        Row: Product
        Insert: Omit<Product, 'id'> & { id?: string }
        Update: Partial<Product>
      }
      banners: {
        Row: {
          id: string
          title: string
          subtitle: string
          image: string
          buttonText: string
          buttonLink: string
          color: string
          active?: boolean
        }
        Insert: {
          id?: string
          title: string
          subtitle: string
          image: string
          buttonText: string
          buttonLink: string
          color: string
          active?: boolean
        }
        Update: Partial<{
          id: string
          title: string
          subtitle: string
          image: string
          buttonText: string
          buttonLink: string
          color: string
          active?: boolean
        }>
      }
      cart_items: {
        Row: {
          id: string
          user_id: string
          product_id: string
          quantity: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          quantity: number
          created_at?: string
          updated_at?: string
        }
        Update: Partial<{
          id: string
          user_id: string
          product_id: string
          quantity: number
          created_at: string
          updated_at: string
        }>
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