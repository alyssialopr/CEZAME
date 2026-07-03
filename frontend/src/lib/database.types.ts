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
      users: {
        Row: {
          id: string
          username: string | null
          is_onboarding_completed: boolean
          created_at: string
        }
        Insert: {
          id: string
          username?: string | null
          is_onboarding_completed?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          is_onboarding_completed?: boolean
          created_at?: string
        }
      }
      progress: {
        Row: {
          id: string
          streak: number
          xp: number
          rank: Database['public']['Enums']['level_rank']
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          streak?: number
          xp?: number
          rank?: Database['public']['Enums']['level_rank']
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          streak?: number
          xp?: number
          rank?: Database['public']['Enums']['level_rank']
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      step_progress: {
        Row: {
          id: string
          progress_id: string
          demarche: Database['public']['Enums']['demarche_kind']
          step_number: number
          completed_at: string
        }
        Insert: {
          id?: string
          progress_id: string
          demarche: Database['public']['Enums']['demarche_kind']
          step_number: number
          completed_at?: string
        }
        Update: {
          id?: string
          progress_id?: string
          demarche?: Database['public']['Enums']['demarche_kind']
          step_number?: number
          completed_at?: string
        }
      }
      bank_account: {
        Row: {
          id: string
          progress_id: string
          status: Database['public']['Enums']['demarche_status']
          chosen_bank_type: Database['public']['Enums']['bank_type'] | null
          opening_method: Database['public']['Enums']['opening_method'] | null
          has_identity_doc: boolean
          has_proof_of_address: boolean
          has_proof_of_income: boolean
          iban: string | null
          started_at: string | null
          completed_at: string | null
        }
        Insert: {
          id?: string
          progress_id: string
          status?: Database['public']['Enums']['demarche_status']
          chosen_bank_type?: Database['public']['Enums']['bank_type'] | null
          opening_method?: Database['public']['Enums']['opening_method'] | null
          has_identity_doc?: boolean
          has_proof_of_address?: boolean
          has_proof_of_income?: boolean
          iban?: string | null
          started_at?: string | null
          completed_at?: string | null
        }
        Update: {
          id?: string
          progress_id?: string
          status?: Database['public']['Enums']['demarche_status']
          chosen_bank_type?: Database['public']['Enums']['bank_type'] | null
          opening_method?: Database['public']['Enums']['opening_method'] | null
          has_identity_doc?: boolean
          has_proof_of_address?: boolean
          has_proof_of_income?: boolean
          iban?: string | null
          started_at?: string | null
          completed_at?: string | null
        }
      }
      social_security: {
        Row: {
          id: string
          progress_id: string
          status: Database['public']['Enums']['demarche_status']
          is_foreign_student: boolean
          ssn: string | null
          ameli_account_created: boolean
          has_provisional_attestation: boolean
          vitale_card_requested: boolean
          has_mutuelle: boolean
          started_at: string | null
          completed_at: string | null
        }
        Insert: {
          id?: string
          progress_id: string
          status?: Database['public']['Enums']['demarche_status']
          is_foreign_student?: boolean
          ssn?: string | null
          ameli_account_created?: boolean
          has_provisional_attestation?: boolean
          vitale_card_requested?: boolean
          has_mutuelle?: boolean
          started_at?: string | null
          completed_at?: string | null
        }
        Update: {
          id?: string
          progress_id?: string
          status?: Database['public']['Enums']['demarche_status']
          is_foreign_student?: boolean
          ssn?: string | null
          ameli_account_created?: boolean
          has_provisional_attestation?: boolean
          vitale_card_requested?: boolean
          has_mutuelle?: boolean
          started_at?: string | null
          completed_at?: string | null
        }
      }
      driver_licence: {
        Row: {
          id: string
          progress_id: string
          status: Database['public']['Enums']['demarche_status']
          track: Database['public']['Enums']['licence_track'] | null
          ants_account_created: boolean
          neph: string | null
          code_passed: boolean
          driving_hours: number
          practical_exam_passed: boolean
          started_at: string | null
          completed_at: string | null
        }
        Insert: {
          id?: string
          progress_id: string
          status?: Database['public']['Enums']['demarche_status']
          track?: Database['public']['Enums']['licence_track'] | null
          ants_account_created?: boolean
          neph?: string | null
          code_passed?: boolean
          driving_hours?: number
          practical_exam_passed?: boolean
          started_at?: string | null
          completed_at?: string | null
        }
        Update: {
          id?: string
          progress_id?: string
          status?: Database['public']['Enums']['demarche_status']
          track?: Database['public']['Enums']['licence_track'] | null
          ants_account_created?: boolean
          neph?: string | null
          code_passed?: boolean
          driving_hours?: number
          practical_exam_passed?: boolean
          started_at?: string | null
          completed_at?: string | null
        }
      }
      housing: {
        Row: {
          id: string
          progress_id: string
          status: Database['public']['Enums']['demarche_status']
          monthly_budget: number | null
          has_tenant_file: boolean
          has_guarantor: boolean
          uses_visale: boolean
          lease_signed: boolean
          inventory_done: boolean
          started_at: string | null
          completed_at: string | null
        }
        Insert: {
          id?: string
          progress_id: string
          status?: Database['public']['Enums']['demarche_status']
          monthly_budget?: number | null
          has_tenant_file?: boolean
          has_guarantor?: boolean
          uses_visale?: boolean
          lease_signed?: boolean
          inventory_done?: boolean
          started_at?: string | null
          completed_at?: string | null
        }
        Update: {
          id?: string
          progress_id?: string
          status?: Database['public']['Enums']['demarche_status']
          monthly_budget?: number | null
          has_tenant_file?: boolean
          has_guarantor?: boolean
          uses_visale?: boolean
          lease_signed?: boolean
          inventory_done?: boolean
          started_at?: string | null
          completed_at?: string | null
        }
      }
      tax_return: {
        Row: {
          id: string
          progress_id: string
          status: Database['public']['Enums']['demarche_status']
          must_declare: boolean | null
          fiscal_number: string | null
          impots_account_created: boolean
          income_collected: boolean
          declaration_validated: boolean
          started_at: string | null
          completed_at: string | null
        }
        Insert: {
          id?: string
          progress_id: string
          status?: Database['public']['Enums']['demarche_status']
          must_declare?: boolean | null
          fiscal_number?: string | null
          impots_account_created?: boolean
          income_collected?: boolean
          declaration_validated?: boolean
          started_at?: string | null
          completed_at?: string | null
        }
        Update: {
          id?: string
          progress_id?: string
          status?: Database['public']['Enums']['demarche_status']
          must_declare?: boolean | null
          fiscal_number?: string | null
          impots_account_created?: boolean
          income_collected?: boolean
          declaration_validated?: boolean
          started_at?: string | null
          completed_at?: string | null
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
      demarche_kind:
        | 'bank_account'
        | 'social_security'
        | 'driver_licence'
        | 'housing'
        | 'tax_return'
      demarche_status: 'not_started' | 'in_progress' | 'completed'
      bank_type: 'agence' | 'en_ligne' | 'neobanque'
      opening_method: 'agence' | 'en_ligne'
      licence_track:
        | 'auto_ecole'
        | 'en_ligne'
        | 'candidat_libre'
        | 'conduite_accompagnee'
      level_rank: 'bronze' | 'silver' | 'gold' | 'diamond' | 'rainbow'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
