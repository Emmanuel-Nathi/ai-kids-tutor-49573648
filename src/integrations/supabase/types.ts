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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          created_at: string
          created_by: string | null
          curriculum: string
          difficulty: number
          grade: string
          id: string
          is_active: boolean
          objectives: Json
          sort_order: number
          subject: string
          topic: string
          xp_reward: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          curriculum?: string
          difficulty?: number
          grade: string
          id?: string
          is_active?: boolean
          objectives?: Json
          sort_order?: number
          subject?: string
          topic: string
          xp_reward?: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          curriculum?: string
          difficulty?: number
          grade?: string
          id?: string
          is_active?: boolean
          objectives?: Json
          sort_order?: number
          subject?: string
          topic?: string
          xp_reward?: number
        }
        Relationships: []
      }
      badges: {
        Row: {
          created_at: string
          criteria_type: string | null
          criteria_value: number | null
          description: string | null
          icon_emoji: string | null
          id: string
          is_active: boolean
          title: string
          xp_award: number
        }
        Insert: {
          created_at?: string
          criteria_type?: string | null
          criteria_value?: number | null
          description?: string | null
          icon_emoji?: string | null
          id?: string
          is_active?: boolean
          title: string
          xp_award?: number
        }
        Update: {
          created_at?: string
          criteria_type?: string | null
          criteria_value?: number | null
          description?: string | null
          icon_emoji?: string | null
          id?: string
          is_active?: boolean
          title?: string
          xp_award?: number
        }
        Relationships: []
      }
      child_activity_progress: {
        Row: {
          activity_id: string
          child_id: string
          completed_at: string | null
          created_at: string
          id: string
          session_id: string | null
          status: string
        }
        Insert: {
          activity_id: string
          child_id: string
          completed_at?: string | null
          created_at?: string
          id?: string
          session_id?: string | null
          status?: string
        }
        Update: {
          activity_id?: string
          child_id?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          session_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "child_activity_progress_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
        ]
      }
      child_badges: {
        Row: {
          badge_id: string
          child_id: string
          earned_at: string
          id: string
        }
        Insert: {
          badge_id: string
          child_id: string
          earned_at?: string
          id?: string
        }
        Update: {
          badge_id?: string
          child_id?: string
          earned_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "child_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
      child_inventory: {
        Row: {
          child_id: string
          id: string
          is_equipped: boolean
          item_id: string
          purchased_at: string
        }
        Insert: {
          child_id: string
          id?: string
          is_equipped?: boolean
          item_id: string
          purchased_at?: string
        }
        Update: {
          child_id?: string
          id?: string
          is_equipped?: boolean
          item_id?: string
          purchased_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "child_inventory_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
        ]
      }
      children: {
        Row: {
          access_pin: string | null
          avatar_url: string | null
          created_at: string
          curriculum_level: string
          grade: string
          id: string
          name: string
          parent_id: string
          preferred_language: string | null
          selected_curriculum: string
          updated_at: string
        }
        Insert: {
          access_pin?: string | null
          avatar_url?: string | null
          created_at?: string
          curriculum_level?: string
          grade: string
          id?: string
          name: string
          parent_id: string
          preferred_language?: string | null
          selected_curriculum?: string
          updated_at?: string
        }
        Update: {
          access_pin?: string | null
          avatar_url?: string | null
          created_at?: string
          curriculum_level?: string
          grade?: string
          id?: string
          name?: string
          parent_id?: string
          preferred_language?: string | null
          selected_curriculum?: string
          updated_at?: string
        }
        Relationships: []
      }
      co_parents: {
        Row: {
          created_at: string
          id: string
          invited_email: string
          invited_user_id: string | null
          primary_parent_id: string
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          invited_email: string
          invited_user_id?: string | null
          primary_parent_id: string
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          invited_email?: string
          invited_user_id?: string | null
          primary_parent_id?: string
          status?: string
        }
        Relationships: []
      }
      daily_logins: {
        Row: {
          child_id: string
          created_at: string
          id: string
          login_date: string
        }
        Insert: {
          child_id: string
          created_at?: string
          id?: string
          login_date?: string
        }
        Update: {
          child_id?: string
          created_at?: string
          id?: string
          login_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_logins_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_logins_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      feedback: {
        Row: {
          category: string
          child_id: string | null
          created_at: string
          id: string
          message: string
          page_url: string | null
          parent_id: string | null
          rating: number | null
          user_agent: string | null
        }
        Insert: {
          category?: string
          child_id?: string | null
          created_at?: string
          id?: string
          message: string
          page_url?: string | null
          parent_id?: string | null
          rating?: number | null
          user_agent?: string | null
        }
        Update: {
          category?: string
          child_id?: string | null
          created_at?: string
          id?: string
          message?: string
          page_url?: string | null
          parent_id?: string | null
          rating?: number | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feedback_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      homework: {
        Row: {
          child_id: string
          created_at: string
          id: string
          image_url: string
          parsed_content: Json | null
          status: string
          subject: string | null
          updated_at: string
        }
        Insert: {
          child_id: string
          created_at?: string
          id?: string
          image_url: string
          parsed_content?: Json | null
          status?: string
          subject?: string | null
          updated_at?: string
        }
        Update: {
          child_id?: string
          created_at?: string
          id?: string
          image_url?: string
          parsed_content?: Json | null
          status?: string
          subject?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "homework_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "homework_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_items: {
        Row: {
          created_at: string
          icon_emoji: string | null
          id: string
          is_active: boolean
          item_type: string
          material_effect: string | null
          name: string
          xp_cost: number
        }
        Insert: {
          created_at?: string
          icon_emoji?: string | null
          id?: string
          is_active?: boolean
          item_type: string
          material_effect?: string | null
          name: string
          xp_cost?: number
        }
        Update: {
          created_at?: string
          icon_emoji?: string | null
          id?: string
          is_active?: boolean
          item_type?: string
          material_effect?: string | null
          name?: string
          xp_cost?: number
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          session_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          session_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      points: {
        Row: {
          amount: number
          child_id: string
          created_at: string
          id: string
          reason: string
        }
        Insert: {
          amount: number
          child_id: string
          created_at?: string
          id?: string
          reason: string
        }
        Update: {
          amount?: number
          child_id?: string
          created_at?: string
          id?: string
          reason?: string
        }
        Relationships: [
          {
            foreignKeyName: "points_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "points_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          parent_pin: string | null
          referral_code: string
          referred_by: string | null
          subscription_status: string
          updated_at: string
          user_id: string
          welcome_email_sent: boolean
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          parent_pin?: string | null
          referral_code?: string
          referred_by?: string | null
          subscription_status?: string
          updated_at?: string
          user_id: string
          welcome_email_sent?: boolean
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          parent_pin?: string | null
          referral_code?: string
          referred_by?: string | null
          subscription_status?: string
          updated_at?: string
          user_id?: string
          welcome_email_sent?: boolean
        }
        Relationships: []
      }
      reward_claims: {
        Row: {
          child_id: string
          created_at: string
          id: string
          reviewed_at: string | null
          reward_id: string
          status: string
        }
        Insert: {
          child_id: string
          created_at?: string
          id?: string
          reviewed_at?: string | null
          reward_id: string
          status?: string
        }
        Update: {
          child_id?: string
          created_at?: string
          id?: string
          reviewed_at?: string | null
          reward_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "reward_claims_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_claims_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_claims_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "rewards"
            referencedColumns: ["id"]
          },
        ]
      }
      rewards: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          parent_id: string
          point_cost: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          parent_id: string
          point_cost: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          parent_id?: string
          point_cost?: number
        }
        Relationships: []
      }
      sessions: {
        Row: {
          active_time_seconds: number
          child_id: string
          created_at: string
          curriculum_alignment_score: number | null
          ended_at: string | null
          id: string
          idle_time_seconds: number
          interaction_summary: string | null
          started_at: string
          status: string
          subject: string | null
        }
        Insert: {
          active_time_seconds?: number
          child_id: string
          created_at?: string
          curriculum_alignment_score?: number | null
          ended_at?: string | null
          id?: string
          idle_time_seconds?: number
          interaction_summary?: string | null
          started_at?: string
          status?: string
          subject?: string | null
        }
        Update: {
          active_time_seconds?: number
          child_id?: string
          created_at?: string
          curriculum_alignment_score?: number | null
          ended_at?: string | null
          id?: string
          idle_time_seconds?: number
          interaction_summary?: string | null
          started_at?: string
          status?: string
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sessions_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      children_safe: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          curriculum_level: string | null
          grade: string | null
          id: string | null
          name: string | null
          parent_id: string | null
          preferred_language: string | null
          selected_curriculum: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          curriculum_level?: string | null
          grade?: string | null
          id?: string | null
          name?: string | null
          parent_id?: string | null
          preferred_language?: string | null
          selected_curriculum?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          curriculum_level?: string | null
          grade?: string | null
          id?: string | null
          name?: string | null
          parent_id?: string | null
          preferred_language?: string | null
          selected_curriculum?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      has_parent_pin: { Args: never; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
      verify_child_pin: {
        Args: { p_name?: string; p_pin: string }
        Returns: {
          found_child_id: string
          found_child_name: string
        }[]
      }
      verify_parent_pin: { Args: { p_pin: string }; Returns: boolean }
    }
    Enums: {
      app_role: "parent" | "child" | "admin"
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
    Enums: {
      app_role: ["parent", "child", "admin"],
    },
  },
} as const
