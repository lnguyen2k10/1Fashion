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
    PostgrestVersion: "14.15"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      admin_audit_logs: {
        Row: {
          action: string
          admin_id: string | null
          created_at: string | null
          details: Json | null
          id: string
          target_id: string | null
          target_type: string | null
        }
        Insert: {
          action: string
          admin_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          target_id?: string | null
          target_type?: string | null
        }
        Update: {
          action?: string
          admin_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          target_id?: string | null
          target_type?: string | null
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          business_id: string | null
          created_at: string | null
          event_type: string | null
          id: string
          page_slug: string | null
          referrer: string | null
        }
        Insert: {
          business_id?: string | null
          created_at?: string | null
          event_type?: string | null
          id?: string
          page_slug?: string | null
          referrer?: string | null
        }
        Update: {
          business_id?: string | null
          created_at?: string | null
          event_type?: string | null
          id?: string
          page_slug?: string | null
          referrer?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      blogs: {
        Row: {
          business_id: string | null
          category: string | null
          content: string
          created_at: string | null
          id: string
          slug: string
          image_url: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          business_id?: string | null
          category?: string | null
          content: string
          created_at?: string | null
          id?: string
          slug?: string
          image_url?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          business_id?: string | null
          category?: string | null
          content?: string
          created_at?: string | null
          id?: string
          slug?: string
          image_url?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blogs_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          business_id: string
          created_at: string | null
          customer_id: string | null
          customer_info: Json
          id: string
          source_url: string | null
          status: string
        }
        Insert: {
          business_id: string
          created_at?: string | null
          customer_id?: string | null
          customer_info: Json
          id?: string
          source_url?: string | null
          status?: string
        }
        Update: {
          business_id?: string
          created_at?: string | null
          customer_id?: string | null
          customer_info?: Json
          id?: string
          source_url?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      business_locations: {
        Row: {
          address_full: string
          business_id: string
          city: string
          district: string
          id: string
          lat: number | null
          lng: number | null
        }
        Insert: {
          address_full: string
          business_id: string
          city: string
          district: string
          id?: string
          lat?: number | null
          lng?: number | null
        }
        Update: {
          address_full?: string
          business_id?: string
          city?: string
          district?: string
          id?: string
          lat?: number | null
          lng?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "business_locations_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      business_offers: {
        Row: {
          business_id: string
          created_at: string | null
          description: string | null
          discount_code: string | null
          id: string
          image_url: string | null
          status: string | null
          title: string
          updated_at: string | null
          valid_until: string | null
        }
        Insert: {
          business_id: string
          created_at?: string | null
          description?: string | null
          discount_code?: string | null
          id?: string
          image_url?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          valid_until?: string | null
        }
        Update: {
          business_id?: string
          created_at?: string | null
          description?: string | null
          discount_code?: string | null
          id?: string
          image_url?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_offers_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      business_profiles: {
        Row: {
          account_id: string
          address_full: string | null
          business_name: string
          categories: string[]
          category: string | null
          created_at: string | null
          email_contact: string | null
          hotline: string | null
          id: string
          is_verified: boolean
          location_city: string | null
          location_district: string | null
          location_ward: string | null
          logo_url: string | null
          operating_hours_text: string | null
          rating_score: number | null
          slug: string
          social_links: Json | null
          theme_color: string | null
          zalo_phone: string | null
        }
        Insert: {
          account_id: string
          address_full?: string | null
          business_name: string
          categories?: string[]
          category?: string | null
          created_at?: string | null
          email_contact?: string | null
          hotline?: string | null
          id?: string
          is_verified?: boolean
          location_city?: string | null
          location_district?: string | null
          location_ward?: string | null
          logo_url?: string | null
          operating_hours_text?: string | null
          rating_score?: number | null
          slug: string
          social_links?: Json | null
          theme_color?: string | null
          zalo_phone?: string | null
        }
        Update: {
          account_id?: string
          address_full?: string | null
          business_name?: string
          categories?: string[]
          category?: string | null
          created_at?: string | null
          email_contact?: string | null
          hotline?: string | null
          id?: string
          is_verified?: boolean
          location_city?: string | null
          location_district?: string | null
          location_ward?: string | null
          logo_url?: string | null
          operating_hours_text?: string | null
          rating_score?: number | null
          slug?: string
          social_links?: Json | null
          theme_color?: string | null
          zalo_phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_profiles_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      email_outbox: {
        Row: {
          attempt_count: number
          body_text: string
          created_at: string
          dedupe_key: string
          error_message: string | null
          id: string
          last_attempt_at: string | null
          profile_id: string
          provider_message_id: string | null
          recipient_email: string
          sent_at: string | null
          status: string
          subject: string
          template_key: string
        }
        Insert: {
          attempt_count?: number
          body_text: string
          created_at?: string
          dedupe_key: string
          error_message?: string | null
          id?: string
          last_attempt_at?: string | null
          profile_id: string
          provider_message_id?: string | null
          recipient_email: string
          sent_at?: string | null
          status?: string
          subject: string
          template_key: string
        }
        Update: {
          attempt_count?: number
          body_text?: string
          created_at?: string
          dedupe_key?: string
          error_message?: string | null
          id?: string
          last_attempt_at?: string | null
          profile_id?: string
          provider_message_id?: string | null
          recipient_email?: string
          sent_at?: string | null
          status?: string
          subject?: string
          template_key?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_outbox_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      homepage_feature_activations: {
        Row: {
          business_id: string
          created_at: string
          expires_at: string
          feature_type: string
          id: string
          product_id: string | null
          starts_at: string
          subscription_id: string
        }
        Insert: {
          business_id: string
          created_at?: string
          expires_at: string
          feature_type: string
          id?: string
          product_id?: string | null
          starts_at?: string
          subscription_id: string
        }
        Update: {
          business_id?: string
          created_at?: string
          expires_at?: string
          feature_type?: string
          id?: string
          product_id?: string | null
          starts_at?: string
          subscription_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "homepage_feature_activations_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "homepage_feature_activations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "active_homepage_product_features"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "homepage_feature_activations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "shop_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "homepage_feature_activations_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      landing_pages: {
        Row: {
          business_id: string
          content_json: Json
          draft_json: Json | null
          id: string
          is_published: boolean
          status: Database["public"]["Enums"]["page_status"] | null
          template_id: string
          updated_at: string | null
        }
        Insert: {
          business_id: string
          content_json?: Json
          draft_json?: Json | null
          id?: string
          is_published?: boolean
          status?: Database["public"]["Enums"]["page_status"] | null
          template_id: string
          updated_at?: string | null
        }
        Update: {
          business_id?: string
          content_json?: Json
          draft_json?: Json | null
          id?: string
          is_published?: boolean
          status?: Database["public"]["Enums"]["page_status"] | null
          template_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "landing_pages_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      membership_benefit_requests: {
        Row: {
          admin_note: string | null
          benefit_type: string
          business_id: string
          details: string
          id: string
          requested_at: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          subscription_id: string
        }
        Insert: {
          admin_note?: string | null
          benefit_type: string
          business_id: string
          details?: string
          id?: string
          requested_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          subscription_id: string
        }
        Update: {
          admin_note?: string | null
          benefit_type?: string
          business_id?: string
          details?: string
          id?: string
          requested_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          subscription_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "membership_benefit_requests_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "membership_benefit_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "membership_benefit_requests_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          link: string | null
          message: string | null
          profile_id: string | null
          sender_id: string | null
          title: string | null
          type: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string | null
          profile_id?: string | null
          sender_id?: string | null
          title?: string | null
          type?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string | null
          profile_id?: string | null
          sender_id?: string | null
          title?: string | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      operating_hours: {
        Row: {
          business_id: string
          close_time: string | null
          day_of_week: number
          id: string
          is_closed: boolean | null
          open_time: string | null
        }
        Insert: {
          business_id: string
          close_time?: string | null
          day_of_week: number
          id?: string
          is_closed?: boolean | null
          open_time?: string | null
        }
        Update: {
          business_id?: string
          close_time?: string | null
          day_of_week?: number
          id?: string
          is_closed?: boolean | null
          open_time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "operating_hours_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      packages: {
        Row: {
          created_at: string | null
          duration_days: number | null
          features: Json | null
          id: string
          is_available: boolean
          limits: Json | null
          name: string
          price: number
          trial_days: number | null
        }
        Insert: {
          created_at?: string | null
          duration_days?: number | null
          features?: Json | null
          id?: string
          is_available?: boolean
          limits?: Json | null
          name: string
          price: number
          trial_days?: number | null
        }
        Update: {
          created_at?: string | null
          duration_days?: number | null
          features?: Json | null
          id?: string
          is_available?: boolean
          limits?: Json | null
          name?: string
          price?: number
          trial_days?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          expiry_date: string | null
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          subscription_status: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          expiry_date?: string | null
          full_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["user_role"]
          subscription_status?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          expiry_date?: string | null
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          subscription_status?: string | null
        }
        Relationships: []
      }
      refund_requests: {
        Row: {
          admin_note: string | null
          business_id: string
          id: string
          reason: string | null
          requested_at: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          subscription_id: string
        }
        Insert: {
          admin_note?: string | null
          business_id: string
          id?: string
          reason?: string | null
          requested_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          subscription_id: string
        }
        Update: {
          admin_note?: string | null
          business_id?: string
          id?: string
          reason?: string | null
          requested_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          subscription_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "refund_requests_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refund_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refund_requests_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: true
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          author_name: string
          business_id: string
          comment: string | null
          created_at: string | null
          id: string
          rating: number
        }
        Insert: {
          author_name: string
          business_id: string
          comment?: string | null
          created_at?: string | null
          id?: string
          rating: number
        }
        Update: {
          author_name?: string
          business_id?: string
          comment?: string | null
          created_at?: string | null
          id?: string
          rating?: number
        }
        Relationships: [
          {
            foreignKeyName: "reviews_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      shop_daily_metrics: {
        Row: {
          business_id: string
          clicks: number | null
          created_at: string | null
          id: string
          metric_date: string
          real_views: number | null
          updated_at: string | null
        }
        Insert: {
          business_id: string
          clicks?: number | null
          created_at?: string | null
          id?: string
          metric_date: string
          real_views?: number | null
          updated_at?: string | null
        }
        Update: {
          business_id?: string
          clicks?: number | null
          created_at?: string | null
          id?: string
          metric_date?: string
          real_views?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shop_daily_metrics_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      shop_messages: {
        Row: {
          business_id: string
          content: string
          created_at: string | null
          customer_name: string
          customer_phone: string
          id: string
          is_read: boolean | null
        }
        Insert: {
          business_id: string
          content: string
          created_at?: string | null
          customer_name: string
          customer_phone: string
          id?: string
          is_read?: boolean | null
        }
        Update: {
          business_id?: string
          content?: string
          created_at?: string | null
          customer_name?: string
          customer_phone?: string
          id?: string
          is_read?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "shop_messages_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      shop_products: {
        Row: {
          business_id: string
          category: string | null
          created_at: string | null
          description: string | null
          gallery_images: Json | null
          id: string
          image_gallery: Json | null
          image_url: string | null
          is_featured: boolean | null
          name: string
          price: string | null
          price_original: string | null
          sort_order: number | null
          status: string | null
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          business_id: string
          category?: string | null
          created_at?: string | null
          description?: string | null
          gallery_images?: Json | null
          id?: string
          image_gallery?: Json | null
          image_url?: string | null
          is_featured?: boolean | null
          name: string
          price?: string | null
          price_original?: string | null
          sort_order?: number | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          business_id?: string
          category?: string | null
          created_at?: string | null
          description?: string | null
          gallery_images?: Json | null
          id?: string
          image_gallery?: Json | null
          image_url?: string | null
          is_featured?: boolean | null
          name?: string
          price?: string | null
          price_original?: string | null
          sort_order?: number | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shop_products_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      product_categories: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          slug: string
          sort_order: number | null
          color: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
          sort_order?: number | null
          color?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string
          sort_order?: number | null
          color?: string | null
        }
        Relationships: []
      }
      system_locations: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          name: string
          slug: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      site_categories: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          slug: string
          sort_order: number | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
          sort_order?: number | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          accent_color: string | null
          app_name: string | null
          hero_content: Json
          id: string
          logo_url: string | null
          manual_payment_instructions: string
          privacy_content: string | null
          social_links: Json
          tagline: string | null
          terms_content: string | null
          updated_at: string | null
        }
        Insert: {
          accent_color?: string | null
          app_name?: string | null
          hero_content?: Json
          id?: string
          logo_url?: string | null
          manual_payment_instructions?: string
          privacy_content?: string | null
          social_links?: Json
          tagline?: string | null
          terms_content?: string | null
          updated_at?: string | null
        }
        Update: {
          accent_color?: string | null
          app_name?: string | null
          hero_content?: Json
          id?: string
          logo_url?: string | null
          manual_payment_instructions?: string
          privacy_content?: string | null
          social_links?: Json
          tagline?: string | null
          terms_content?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          benefits_snapshot: Json | null
          business_id: string
          created_at: string | null
          end_date: string | null
          id: string
          package_id: string
          proof_image_url: string | null
          start_date: string | null
          status: string | null
          updated_at: string | null
          verified: boolean | null
        }
        Insert: {
          benefits_snapshot?: Json | null
          business_id: string
          created_at?: string | null
          end_date?: string | null
          id?: string
          package_id: string
          proof_image_url?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
          verified?: boolean | null
        }
        Update: {
          benefits_snapshot?: Json | null
          business_id?: string
          created_at?: string | null
          end_date?: string | null
          id?: string
          package_id?: string
          proof_image_url?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          description: string | null
          key: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          description?: string | null
          key: string
          updated_at?: string | null
          value: Json
        }
        Update: {
          description?: string | null
          key?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
      user_favorites: {
        Row: {
          business_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          business_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          business_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_favorites_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_subscriptions: {
        Row: {
          business_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          business_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          business_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      active_homepage_product_features: {
        Row: {
          business_id: string | null
          business_name: string | null
          business_slug: string | null
          category: string | null
          description: string | null
          expires_at: string | null
          id: string | null
          image_url: string | null
          logo_url: string | null
          name: string | null
          price: string | null
          price_original: string | null
          product_id: string | null
          starts_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shop_products_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      active_homepage_shop_features: {
        Row: {
          business_id: string | null
          business_name: string | null
          business_slug: string | null
          category: string | null
          content_json: Json | null
          expires_at: string | null
          id: string | null
          is_verified: boolean | null
          location_city: string | null
          location_district: string | null
          logo_url: string | null
          starts_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "landing_pages_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      active_landing_pages: {
        Row: {
          address_full: string | null
          business_id: string | null
          business_name: string | null
          business_slug: string | null
          categories: string[] | null
          category: string | null
          content_json: Json | null
          hotline: string | null
          id: string | null
          is_published: boolean | null
          is_verified: boolean | null
          landing_page_id: string | null
          lat: number | null
          lng: number | null
          location_city: string | null
          location_district: string | null
          location_ward: string | null
          logo_url: string | null
          page_status: Database["public"]["Enums"]["page_status"] | null
          rating_score: number | null
          social_links: Json | null
          template_id: string | null
          theme_color: string | null
          updated_at: string | null
          zalo_phone: string | null
        }
        Relationships: [
          {
            foreignKeyName: "landing_pages_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      directory_shops: {
        Row: {
          business_name: string | null
          business_slug: string | null
          categories: string[] | null
          category: string | null
          cover_image: string | null
          is_verified: boolean | null
          location_city: string | null
          location_district: string | null
          location_ward: string | null
          logo_url: string | null
          rating_score: number | null
          updated_at: string | null
        }
        Relationships: []
      }
      shop_landing_page: {
        Row: {
          account_id: string | null
          address_full: string | null
          business_id: string | null
          business_name: string | null
          business_slug: string | null
          category: string | null
          content_json: Json | null
          draft_json: Json | null
          email_owner: string | null
          expiry_date: string | null
          hotline: string | null
          id: string | null
          is_published: boolean | null
          is_verified: boolean | null
          landing_page_id: string | null
          lat: number | null
          lng: number | null
          location_city: string | null
          location_district: string | null
          logo_url: string | null
          page_status: Database["public"]["Enums"]["page_status"] | null
          rating_score: number | null
          social_links: Json | null
          subscription_status: string | null
          template_id: string | null
          theme_color: string | null
          updated_at: string | null
          zalo_phone: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_profiles_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "landing_pages_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      consume_api_rate_limit: {
        Args: {
          input_identifier_hash: string
          input_limit: number
          input_namespace: string
          input_window_seconds: number
        }
        Returns: {
          allowed: boolean
          retry_after_seconds: number
        }[]
      }
      get_active_categories: {
        Args: never
        Returns: {
          color: string
          description: string
          icon: string
          name: string
          slug: string
        }[]
      }
      get_shop_analytics_with_bonus: {
        Args: { p_business_id: string; p_days?: number }
        Returns: {
          bonus_views: number
          clicks: number
          metric_date: string
          real_views: number
          total_views: number
        }[]
      }
      review_subscription: {
        Args: { approve: boolean; subscription_id: string }
        Returns: undefined
      }
    }
    Enums: {
      booking_status: "Pending" | "Confirmed" | "Completed" | "Cancelled"
      business_category: "Spa" | "Dental" | "Clinic" | "Beauty"
      page_status: "Draft" | "Published"
      user_role: "super_admin" | "shop" | "User"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      booking_status: ["Pending", "Confirmed", "Completed", "Cancelled"],
      business_category: ["Spa", "Dental", "Clinic", "Beauty"],
      page_status: ["Draft", "Published"],
      user_role: ["super_admin", "shop", "User"],
    },
  },
} as const
