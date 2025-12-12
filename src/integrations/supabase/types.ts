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
      articles: {
        Row: {
          author_name: string | null
          category: string | null
          content: string
          cover_image_url: string | null
          created_at: string
          created_by: string | null
          id: string
          is_published: boolean | null
          published_at: string | null
          summary: string | null
          tags: string[] | null
          title: string
          updated_at: string
          views_count: number | null
        }
        Insert: {
          author_name?: string | null
          category?: string | null
          content: string
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_published?: boolean | null
          published_at?: string | null
          summary?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
          views_count?: number | null
        }
        Update: {
          author_name?: string | null
          category?: string | null
          content?: string
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_published?: boolean | null
          published_at?: string | null
          summary?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          views_count?: number | null
        }
        Relationships: []
      }
      company_profiles: {
        Row: {
          address: string | null
          company_name: string
          company_size: string | null
          contact_email: string
          contact_phone: string | null
          created_at: string
          description: string | null
          founded_year: number | null
          id: string
          industry: string | null
          is_verified: boolean | null
          license_number: string | null
          location: string | null
          logo_url: string | null
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          address?: string | null
          company_name: string
          company_size?: string | null
          contact_email: string
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          founded_year?: number | null
          id?: string
          industry?: string | null
          is_verified?: boolean | null
          license_number?: string | null
          location?: string | null
          logo_url?: string | null
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          address?: string | null
          company_name?: string
          company_size?: string | null
          contact_email?: string
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          founded_year?: number | null
          id?: string
          industry?: string | null
          is_verified?: boolean | null
          license_number?: string | null
          location?: string | null
          logo_url?: string | null
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      interview_rounds: {
        Row: {
          application_id: string
          created_at: string
          id: string
          interview_date: string
          interview_format: string
          interviewer: string
          notes: string | null
          round: number
          score: number | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          application_id: string
          created_at?: string
          id?: string
          interview_date: string
          interview_format?: string
          interviewer: string
          notes?: string | null
          round?: number
          score?: number | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          application_id?: string
          created_at?: string
          id?: string
          interview_date?: string
          interview_format?: string
          interviewer?: string
          notes?: string | null
          round?: number
          score?: number | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "interview_rounds_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "job_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      job_applications: {
        Row: {
          applied_at: string
          cover_letter: string | null
          id: string
          job_id: string
          jobseeker_id: string
          resume_url: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          applied_at?: string
          cover_letter?: string | null
          id?: string
          job_id: string
          jobseeker_id: string
          resume_url?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          applied_at?: string
          cover_letter?: string | null
          id?: string
          job_id?: string
          jobseeker_id?: string
          resume_url?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_applications_jobseeker_id_fkey"
            columns: ["jobseeker_id"]
            isOneToOne: false
            referencedRelation: "jobseeker_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      job_bookmarks: {
        Row: {
          created_at: string
          id: string
          job_id: string
          jobseeker_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          job_id: string
          jobseeker_id: string
        }
        Update: {
          created_at?: string
          id?: string
          job_id?: string
          jobseeker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_bookmarks_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_bookmarks_jobseeker_id_fkey"
            columns: ["jobseeker_id"]
            isOneToOne: false
            referencedRelation: "jobseeker_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      job_fairs: {
        Row: {
          address: string | null
          banner_url: string | null
          created_at: string
          created_by: string | null
          description: string | null
          end_time: string
          id: string
          location: string
          organizer: string | null
          registration_url: string | null
          start_time: string
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          banner_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_time: string
          id?: string
          location: string
          organizer?: string | null
          registration_url?: string | null
          start_time: string
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          banner_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_time?: string
          id?: string
          location?: string
          organizer?: string | null
          registration_url?: string | null
          start_time?: string
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      job_invitations: {
        Row: {
          company_id: string
          created_at: string
          id: string
          job_id: string | null
          jobseeker_id: string
          message: string | null
          responded_at: string | null
          status: string | null
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          job_id?: string | null
          jobseeker_id: string
          message?: string | null
          responded_at?: string | null
          status?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          job_id?: string | null
          jobseeker_id?: string
          message?: string | null
          responded_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_invitations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_invitations_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_invitations_jobseeker_id_fkey"
            columns: ["jobseeker_id"]
            isOneToOne: false
            referencedRelation: "jobseeker_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          application_deadline: string | null
          benefits: string | null
          company_id: string
          created_at: string
          description: string
          education_required: string | null
          experience_required: string | null
          id: string
          is_remote: boolean | null
          job_type: string | null
          location: string
          positions_available: number | null
          requirements: string | null
          salary_max: number | null
          salary_min: number | null
          salary_negotiable: boolean | null
          skills_required: string[] | null
          status: string | null
          title: string
          updated_at: string
          views_count: number | null
        }
        Insert: {
          application_deadline?: string | null
          benefits?: string | null
          company_id: string
          created_at?: string
          description: string
          education_required?: string | null
          experience_required?: string | null
          id?: string
          is_remote?: boolean | null
          job_type?: string | null
          location: string
          positions_available?: number | null
          requirements?: string | null
          salary_max?: number | null
          salary_min?: number | null
          salary_negotiable?: boolean | null
          skills_required?: string[] | null
          status?: string | null
          title: string
          updated_at?: string
          views_count?: number | null
        }
        Update: {
          application_deadline?: string | null
          benefits?: string | null
          company_id?: string
          created_at?: string
          description?: string
          education_required?: string | null
          experience_required?: string | null
          id?: string
          is_remote?: boolean | null
          job_type?: string | null
          location?: string
          positions_available?: number | null
          requirements?: string | null
          salary_max?: number | null
          salary_min?: number | null
          salary_negotiable?: boolean | null
          skills_required?: string[] | null
          status?: string | null
          title?: string
          updated_at?: string
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "jobs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      jobseeker_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          birth_date: string | null
          created_at: string
          current_status: string | null
          education_level: string | null
          email: string
          expected_salary_max: number | null
          expected_salary_min: number | null
          full_name: string
          gender: string | null
          id: string
          is_public: boolean | null
          is_verified: boolean | null
          location: string | null
          phone: string | null
          resume_url: string | null
          skills: string[] | null
          updated_at: string
          user_id: string
          work_experience_years: number | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          birth_date?: string | null
          created_at?: string
          current_status?: string | null
          education_level?: string | null
          email: string
          expected_salary_max?: number | null
          expected_salary_min?: number | null
          full_name: string
          gender?: string | null
          id?: string
          is_public?: boolean | null
          is_verified?: boolean | null
          location?: string | null
          phone?: string | null
          resume_url?: string | null
          skills?: string[] | null
          updated_at?: string
          user_id: string
          work_experience_years?: number | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          birth_date?: string | null
          created_at?: string
          current_status?: string | null
          education_level?: string | null
          email?: string
          expected_salary_max?: number | null
          expected_salary_min?: number | null
          full_name?: string
          gender?: string | null
          id?: string
          is_public?: boolean | null
          is_verified?: boolean | null
          location?: string | null
          phone?: string | null
          resume_url?: string | null
          skills?: string[] | null
          updated_at?: string
          user_id?: string
          work_experience_years?: number | null
        }
        Relationships: []
      }
      part_time_jobs: {
        Row: {
          company_id: string | null
          contact_info: string | null
          created_at: string
          created_by: string | null
          description: string
          hourly_rate_max: number | null
          hourly_rate_min: number | null
          id: string
          location: string
          requirements: string | null
          status: string | null
          title: string
          updated_at: string
          work_hours: string | null
        }
        Insert: {
          company_id?: string | null
          contact_info?: string | null
          created_at?: string
          created_by?: string | null
          description: string
          hourly_rate_max?: number | null
          hourly_rate_min?: number | null
          id?: string
          location: string
          requirements?: string | null
          status?: string | null
          title: string
          updated_at?: string
          work_hours?: string | null
        }
        Update: {
          company_id?: string | null
          contact_info?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          hourly_rate_max?: number | null
          hourly_rate_min?: number | null
          id?: string
          location?: string
          requirements?: string | null
          status?: string | null
          title?: string
          updated_at?: string
          work_hours?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "part_time_jobs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      resumes: {
        Row: {
          created_at: string
          file_size: number | null
          file_url: string
          id: string
          is_default: boolean
          jobseeker_id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          file_size?: number | null
          file_url: string
          id?: string
          is_default?: boolean
          jobseeker_id: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          file_size?: number | null
          file_url?: string
          id?: string
          is_default?: boolean
          jobseeker_id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "resumes_jobseeker_id_fkey"
            columns: ["jobseeker_id"]
            isOneToOne: false
            referencedRelation: "jobseeker_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      talent_bookmarks: {
        Row: {
          company_id: string
          created_at: string
          id: string
          jobseeker_id: string
          notes: string | null
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          jobseeker_id: string
          notes?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          jobseeker_id?: string
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "talent_bookmarks_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "talent_bookmarks_jobseeker_id_fkey"
            columns: ["jobseeker_id"]
            isOneToOne: false
            referencedRelation: "jobseeker_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_company_profile_id: { Args: { _user_id: string }; Returns: string }
      get_jobseeker_profile_id: { Args: { _user_id: string }; Returns: string }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["user_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      user_role: "jobseeker" | "company" | "admin"
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
      user_role: ["jobseeker", "company", "admin"],
    },
  },
} as const
