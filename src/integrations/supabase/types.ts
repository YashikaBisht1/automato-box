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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      agent_decisions: {
        Row: {
          agent_type: string
          alternatives_considered: Json | null
          confidence_score: number | null
          created_at: string | null
          decision_context: string
          id: string
          reasoning_chain: Json
          sources_used: Json | null
          user_feedback: string | null
        }
        Insert: {
          agent_type: string
          alternatives_considered?: Json | null
          confidence_score?: number | null
          created_at?: string | null
          decision_context: string
          id?: string
          reasoning_chain: Json
          sources_used?: Json | null
          user_feedback?: string | null
        }
        Update: {
          agent_type?: string
          alternatives_considered?: Json | null
          confidence_score?: number | null
          created_at?: string | null
          decision_context?: string
          id?: string
          reasoning_chain?: Json
          sources_used?: Json | null
          user_feedback?: string | null
        }
        Relationships: []
      }
      conversations: {
        Row: {
          agent_type: string
          created_at: string
          id: string
          messages: Json
          metadata: Json | null
          title: string | null
          updated_at: string
        }
        Insert: {
          agent_type: string
          created_at?: string
          id?: string
          messages?: Json
          metadata?: Json | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          agent_type?: string
          created_at?: string
          id?: string
          messages?: Json
          metadata?: Json | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      knowledge_entries: {
        Row: {
          category: string | null
          confidence_score: number | null
          content: string
          created_at: string | null
          entity_name: string | null
          id: string
          is_outdated: boolean | null
          last_validated_at: string | null
          metadata: Json | null
          source_type: string
          source_url: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          confidence_score?: number | null
          content: string
          created_at?: string | null
          entity_name?: string | null
          id?: string
          is_outdated?: boolean | null
          last_validated_at?: string | null
          metadata?: Json | null
          source_type: string
          source_url?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          confidence_score?: number | null
          content?: string
          created_at?: string | null
          entity_name?: string | null
          id?: string
          is_outdated?: boolean | null
          last_validated_at?: string | null
          metadata?: Json | null
          source_type?: string
          source_url?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      knowledge_relationships: {
        Row: {
          created_at: string | null
          id: string
          relationship_type: string
          source_id: string | null
          strength: number | null
          target_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          relationship_type: string
          source_id?: string | null
          strength?: number | null
          target_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          relationship_type?: string
          source_id?: string | null
          strength?: number | null
          target_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_relationships_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "knowledge_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "knowledge_relationships_target_id_fkey"
            columns: ["target_id"]
            isOneToOne: false
            referencedRelation: "knowledge_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          confidence_score: number | null
          created_at: string | null
          examples: Json | null
          id: string
          preference_type: string
          preference_value: Json
          updated_at: string | null
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string | null
          examples?: Json | null
          id?: string
          preference_type: string
          preference_value: Json
          updated_at?: string | null
        }
        Update: {
          confidence_score?: number | null
          created_at?: string | null
          examples?: Json | null
          id?: string
          preference_type?: string
          preference_value?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      vector_embeddings: {
        Row: {
          agent_type: string
          category: string | null
          content: string
          created_at: string
          embedding: string | null
          entity_name: string | null
          id: string
          metadata: Json | null
        }
        Insert: {
          agent_type: string
          category?: string | null
          content: string
          created_at?: string
          embedding?: string | null
          entity_name?: string | null
          id?: string
          metadata?: Json | null
        }
        Update: {
          agent_type?: string
          category?: string | null
          content?: string
          created_at?: string
          embedding?: string | null
          entity_name?: string | null
          id?: string
          metadata?: Json | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: string
      }
      mark_outdated_knowledge: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      search_similar_embeddings: {
        Args: {
          filter_agent_type?: string
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          content: string
          id: string
          metadata: Json
          similarity: number
        }[]
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
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
