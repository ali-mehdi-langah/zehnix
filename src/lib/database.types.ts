// Auto-generated TypeScript types for the Zehnix Supabase schema.
// Regenerate with: npx supabase gen types typescript --local > src/lib/database.types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          role: "student" | "teacher";
          language: "en" | "ur" | "sd" | "ps";
          created_at: string;
        };
        Insert: {
          id: string;
          full_name?: string;
          role?: "student" | "teacher";
          language?: "en" | "ur" | "sd" | "ps";
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          role?: "student" | "teacher";
          language?: "en" | "ur" | "sd" | "ps";
          created_at?: string;
        };
      };
      classes: {
        Row: {
          id: string;
          teacher_id: string;
          name: string;
          join_code: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          teacher_id: string;
          name: string;
          join_code?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          teacher_id?: string;
          name?: string;
          join_code?: string;
          created_at?: string;
        };
      };
      enrollments: {
        Row: {
          id: string;
          class_id: string;
          student_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          class_id: string;
          student_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          class_id?: string;
          student_id?: string;
          created_at?: string;
        };
      };
      quizzes: {
        Row: {
          id: string;
          class_id: string;
          title: string;
          topic: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          class_id: string;
          title: string;
          topic: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          class_id?: string;
          title?: string;
          topic?: string;
          created_at?: string;
        };
      };
      questions: {
        Row: {
          id: string;
          quiz_id: string;
          topic: string;
          difficulty: 1 | 2 | 3;
          type: "mcq" | "short";
          prompt: string;
          options: Json | null;       // string[] for MCQ
          correct_answer: string | null;
          model_answer: string | null;
          rubric: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          quiz_id: string;
          topic: string;
          difficulty?: 1 | 2 | 3;
          type: "mcq" | "short";
          prompt: string;
          options?: Json | null;
          correct_answer?: string | null;
          model_answer?: string | null;
          rubric?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          quiz_id?: string;
          topic?: string;
          difficulty?: 1 | 2 | 3;
          type?: "mcq" | "short";
          prompt?: string;
          options?: Json | null;
          correct_answer?: string | null;
          model_answer?: string | null;
          rubric?: string | null;
          created_at?: string;
        };
      };
      attempts: {
        Row: {
          id: string;
          quiz_id: string;
          student_id: string;
          score: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          quiz_id: string;
          student_id: string;
          score?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          quiz_id?: string;
          student_id?: string;
          score?: number | null;
          created_at?: string;
        };
      };
      answers: {
        Row: {
          id: string;
          attempt_id: string;
          question_id: string;
          response: string | null;
          score: number | null;
          feedback: string | null;
          missing_points: Json;       // string[]
          pending_review: boolean;
          teacher_override: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          attempt_id: string;
          question_id: string;
          response?: string | null;
          score?: number | null;
          feedback?: string | null;
          missing_points?: Json;
          pending_review?: boolean;
          teacher_override?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          attempt_id?: string;
          question_id?: string;
          response?: string | null;
          score?: number | null;
          feedback?: string | null;
          missing_points?: Json;
          pending_review?: boolean;
          teacher_override?: boolean;
          created_at?: string;
        };
      };
      mastery: {
        Row: {
          student_id: string;
          topic: string;
          score: number;
          updated_at: string;
        };
        Insert: {
          student_id: string;
          topic: string;
          score?: number;
          updated_at?: string;
        };
        Update: {
          student_id?: string;
          topic?: string;
          score?: number;
          updated_at?: string;
        };
      };
      risk_scores: {
        Row: {
          student_id: string;
          class_id: string;
          score: number;
          level: "low" | "medium" | "high";
          reasons: Json;              // string[]
          updated_at: string;
        };
        Insert: {
          student_id: string;
          class_id: string;
          score?: number;
          level?: "low" | "medium" | "high";
          reasons?: Json;
          updated_at?: string;
        };
        Update: {
          student_id?: string;
          class_id?: string;
          score?: number;
          level?: "low" | "medium" | "high";
          reasons?: Json;
          updated_at?: string;
        };
      };
      tutor_messages: {
        Row: {
          id: string;
          student_id: string;
          role: "user" | "assistant";
          content: string;
          language: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          role: "user" | "assistant";
          content: string;
          language?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          role?: "user" | "assistant";
          content?: string;
          language?: string;
          created_at?: string;
        };
      };
      nudges: {
        Row: {
          id: string;
          student_id: string;
          teacher_id: string;
          message: string;
          dismissed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          teacher_id: string;
          message: string;
          dismissed?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          teacher_id?: string;
          message?: string;
          dismissed?: boolean;
          created_at?: string;
        };
      };
    };
    Functions: {
      gen_join_code: {
        Args: Record<string, never>;
        Returns: string;
      };
      is_teacher_of_class: {
        Args: { cid: string };
        Returns: boolean;
      };
      is_enrolled_in_class: {
        Args: { cid: string };
        Returns: boolean;
      };
      teacher_has_student: {
        Args: { sid: string };
        Returns: boolean;
      };
      quiz_class_id: {
        Args: { qid: string };
        Returns: string;
      };
      attempt_owner: {
        Args: { aid: string };
        Returns: string;
      };
      attempt_class_id: {
        Args: { aid: string };
        Returns: string;
      };
      join_class: {
        Args: { code: string };
        Returns: string;
      };
    };
    Enums: {
      user_role: "student" | "teacher";
      language_code: "en" | "ur" | "sd" | "ps";
      question_type: "mcq" | "short";
      risk_level: "low" | "medium" | "high";
      message_role: "user" | "assistant";
    };
  };
};

// ─── Convenience row types ────────────────────────────────────────────────────
export type Profile       = Database["public"]["Tables"]["profiles"]["Row"];
export type Class         = Database["public"]["Tables"]["classes"]["Row"];
export type Enrollment    = Database["public"]["Tables"]["enrollments"]["Row"];
export type Quiz          = Database["public"]["Tables"]["quizzes"]["Row"];
export type Question      = Database["public"]["Tables"]["questions"]["Row"];
export type Attempt       = Database["public"]["Tables"]["attempts"]["Row"];
export type Answer        = Database["public"]["Tables"]["answers"]["Row"];
export type Mastery       = Database["public"]["Tables"]["mastery"]["Row"];
export type RiskScore     = Database["public"]["Tables"]["risk_scores"]["Row"];
export type TutorMessage  = Database["public"]["Tables"]["tutor_messages"]["Row"];
export type Nudge         = Database["public"]["Tables"]["nudges"]["Row"];

// ─── Insert types ─────────────────────────────────────────────────────────────
export type InsertProfile      = Database["public"]["Tables"]["profiles"]["Insert"];
export type InsertClass        = Database["public"]["Tables"]["classes"]["Insert"];
export type InsertQuiz         = Database["public"]["Tables"]["quizzes"]["Insert"];
export type InsertQuestion     = Database["public"]["Tables"]["questions"]["Insert"];
export type InsertAttempt      = Database["public"]["Tables"]["attempts"]["Insert"];
export type InsertAnswer       = Database["public"]["Tables"]["answers"]["Insert"];
export type InsertTutorMessage = Database["public"]["Tables"]["tutor_messages"]["Insert"];
export type InsertNudge        = Database["public"]["Tables"]["nudges"]["Insert"];

// ─── Domain helpers ───────────────────────────────────────────────────────────
export type UserRole     = Profile["role"];
export type LanguageCode = Profile["language"];
export type QuestionType = Question["type"];
export type RiskLevel    = RiskScore["level"];
