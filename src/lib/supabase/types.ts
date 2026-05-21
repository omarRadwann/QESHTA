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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      cart_items: {
        Row: {
          cart_id: string
          created_at: string
          id: string
          image: string
          key: string
          name: string
          price: number
          product_id: string
          quantity: number
          size: string
          updated_at: string
          variant_id: string
          variant_label: string
        }
        Insert: {
          cart_id: string
          created_at?: string
          id?: string
          image: string
          key: string
          name: string
          price: number
          product_id: string
          quantity: number
          size: string
          updated_at?: string
          variant_id: string
          variant_label: string
        }
        Update: {
          cart_id?: string
          created_at?: string
          id?: string
          image?: string
          key?: string
          name?: string
          price?: number
          product_id?: string
          quantity?: number
          size?: string
          updated_at?: string
          variant_id?: string
          variant_label?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "carts"
            referencedColumns: ["id"]
          },
        ]
      }
      carts: {
        Row: {
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      catalog_products: {
        Row: {
          allow_backorder: boolean
          alt: string | null
          category: string
          collection: string
          color: string | null
          created_at: string
          description: string | null
          detail_hero_alt: string | null
          detail_hero_image: string | null
          detail_tabs: Json | null
          featured: boolean
          image: string
          inventory_quantity: number
          is_new: boolean
          low_stock_threshold: number
          material: string | null
          name: string
          price: number
          product_id: string
          status: string
          tags: string[]
          updated_at: string
          variants: Json | null
        }
        Insert: {
          allow_backorder?: boolean
          alt?: string | null
          category: string
          collection?: string
          color?: string | null
          created_at?: string
          description?: string | null
          detail_hero_alt?: string | null
          detail_hero_image?: string | null
          detail_tabs?: Json | null
          featured?: boolean
          image: string
          inventory_quantity?: number
          is_new?: boolean
          low_stock_threshold?: number
          material?: string | null
          name: string
          price: number
          product_id: string
          status?: string
          tags?: string[]
          updated_at?: string
          variants?: Json | null
        }
        Update: {
          allow_backorder?: boolean
          alt?: string | null
          category?: string
          collection?: string
          color?: string | null
          created_at?: string
          description?: string | null
          detail_hero_alt?: string | null
          detail_hero_image?: string | null
          detail_tabs?: Json | null
          featured?: boolean
          image?: string
          inventory_quantity?: number
          is_new?: boolean
          low_stock_threshold?: number
          material?: string | null
          name?: string
          price?: number
          product_id?: string
          status?: string
          tags?: string[]
          updated_at?: string
          variants?: Json | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          image: string
          name: string
          order_id: string
          price: number
          product_id: string
          quantity: number
          size: string
          variant_id: string
          variant_label: string
        }
        Insert: {
          created_at?: string
          id?: string
          image: string
          name: string
          order_id: string
          price: number
          product_id: string
          quantity: number
          size: string
          variant_id: string
          variant_label: string
        }
        Update: {
          created_at?: string
          id?: string
          image?: string
          name?: string
          order_id?: string
          price?: number
          product_id?: string
          quantity?: number
          size?: string
          variant_id?: string
          variant_label?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          currency: string
          customer_email: string
          customer_name: string
          id: string
          notes: string | null
          order_number: string
          phone: string | null
          shipping_address: Json
          status: string
          subtotal: number
          total: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          currency?: string
          customer_email: string
          customer_name: string
          id?: string
          notes?: string | null
          order_number?: string
          phone?: string | null
          shipping_address: Json
          status?: string
          subtotal: number
          total: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          currency?: string
          customer_email?: string
          customer_name?: string
          id?: string
          notes?: string | null
          order_number?: string
          phone?: string | null
          shipping_address?: Json
          status?: string
          subtotal?: number
          total?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          marketing_opt_in: boolean
          phone: string | null
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          marketing_opt_in?: boolean
          phone?: string | null
          role?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          marketing_opt_in?: boolean
          phone?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      wishlist_items: {
        Row: {
          created_at: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_customer_order: {
        Args: {
          p_customer_email: string
          p_customer_name: string
          p_items: Json
          p_notes: string
          p_phone: string
          p_shipping_address: Json
        }
        Returns: {
          id: string
          order_number: string
        }[]
      }
      is_admin: { Args: never; Returns: boolean }
      set_customer_role: {
        Args: { p_profile_id: string; p_role: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const

export type CustomerProfile = Tables<"profiles">
export type CustomerProfileInsert = TablesInsert<"profiles">
export type CustomerProfileUpdate = TablesUpdate<"profiles">
export type RemoteCart = Tables<"carts">
export type RemoteCartItem = Tables<"cart_items">
export type RemoteCartItemInsert = TablesInsert<"cart_items">
export type CatalogProduct = Tables<"catalog_products">
export type CatalogProductInsert = TablesInsert<"catalog_products">
export type CatalogProductUpdate = TablesUpdate<"catalog_products">
export type RemoteWishlistItem = Tables<"wishlist_items">
export type WishlistItemInsert = TablesInsert<"wishlist_items">
export type Order = Tables<"orders">
export type OrderUpdate = TablesUpdate<"orders">
export type OrderItem = Tables<"order_items">
export type OrderInsert = TablesInsert<"orders">
export type OrderItemInsert = TablesInsert<"order_items">
export type AccountRole = "customer" | "admin"
export type OrderStatus = "pending_review" | "paid" | "fulfilled" | "cancelled"
export type CatalogProductStatus = "active" | "draft" | "archived"
