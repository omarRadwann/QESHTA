type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          created_at: string;
          email: string;
          full_name: string | null;
          id: string;
          marketing_opt_in: boolean;
          phone: string | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          email: string;
          full_name?: string | null;
          id: string;
          marketing_opt_in?: boolean;
          phone?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          email?: string;
          full_name?: string | null;
          id?: string;
          marketing_opt_in?: boolean;
          phone?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      carts: {
        Row: {
          created_at: string;
          id: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "carts_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      cart_items: {
        Row: {
          cart_id: string;
          created_at: string;
          id: string;
          image: string;
          key: string;
          name: string;
          price: number;
          product_id: string;
          quantity: number;
          size: string;
          updated_at: string;
          variant_id: string;
          variant_label: string;
        };
        Insert: {
          cart_id: string;
          created_at?: string;
          id?: string;
          image: string;
          key: string;
          name: string;
          price: number;
          product_id: string;
          quantity: number;
          size: string;
          updated_at?: string;
          variant_id: string;
          variant_label: string;
        };
        Update: {
          cart_id?: string;
          created_at?: string;
          id?: string;
          image?: string;
          key?: string;
          name?: string;
          price?: number;
          product_id?: string;
          quantity?: number;
          size?: string;
          updated_at?: string;
          variant_id?: string;
          variant_label?: string;
        };
        Relationships: [
          {
            foreignKeyName: "cart_items_cart_id_fkey";
            columns: ["cart_id"];
            referencedRelation: "carts";
            referencedColumns: ["id"];
          },
        ];
      };
      orders: {
        Row: {
          created_at: string;
          currency: string;
          customer_email: string;
          customer_name: string;
          id: string;
          notes: string | null;
          order_number: string;
          phone: string | null;
          shipping_address: Record<string, string>;
          status: "pending_review" | "paid" | "fulfilled" | "cancelled";
          subtotal: number;
          total: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          currency?: string;
          customer_email: string;
          customer_name: string;
          id?: string;
          notes?: string | null;
          order_number?: string;
          phone?: string | null;
          shipping_address: Record<string, string>;
          status?: "pending_review" | "paid" | "fulfilled" | "cancelled";
          subtotal: number;
          total: number;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          currency?: string;
          customer_email?: string;
          customer_name?: string;
          id?: string;
          notes?: string | null;
          order_number?: string;
          phone?: string | null;
          shipping_address?: Record<string, string>;
          status?: "pending_review" | "paid" | "fulfilled" | "cancelled";
          subtotal?: number;
          total?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      order_items: {
        Row: {
          created_at: string;
          id: string;
          image: string;
          name: string;
          order_id: string;
          price: number;
          product_id: string;
          quantity: number;
          size: string;
          variant_id: string;
          variant_label: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          image: string;
          name: string;
          order_id: string;
          price: number;
          product_id: string;
          quantity: number;
          size: string;
          variant_id: string;
          variant_label: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          image?: string;
          name?: string;
          order_id?: string;
          price?: number;
          product_id?: string;
          quantity?: number;
          size?: string;
          variant_id?: string;
          variant_label?: string;
        };
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      create_customer_order: {
        Args: {
          p_customer_email: string;
          p_customer_name: string;
          p_items: Json;
          p_notes: string | null;
          p_phone: string | null;
          p_shipping_address: Json;
        };
        Returns: {
          id: string;
          order_number: string;
        }[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type CustomerProfile = Database["public"]["Tables"]["profiles"]["Row"];
export type CustomerProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];
export type CustomerProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];
export type RemoteCart = Database["public"]["Tables"]["carts"]["Row"];
export type RemoteCartItem = Database["public"]["Tables"]["cart_items"]["Row"];
export type RemoteCartItemInsert =
  Database["public"]["Tables"]["cart_items"]["Insert"];
export type Order = Database["public"]["Tables"]["orders"]["Row"];
export type OrderInsert = Database["public"]["Tables"]["orders"]["Insert"];
export type OrderItemInsert =
  Database["public"]["Tables"]["order_items"]["Insert"];
