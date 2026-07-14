import { supabase } from './supabase';
import { Database } from './database.types';

type Progress = Database['public']['Tables']['progress']['Row'];

export const submitOnboardingAnswers = async (userId: string, answers: any) => {
  // 1. Get or create progress
  let progressResponse = await supabase
    .from('progress')
    .select('id')
    .eq('user_id', userId)
    .single();

  let progressId = progressResponse.data?.id;

  if (!progressId) {
    const { data, error } = await supabase
      .from('progress')
      .insert({
        user_id: userId,
        streak: 0,
        xp: 0,
        rank: 'bronze',
      })
      .select('id')
      .single();

    if (error) throw error;
    progressId = data.id;
  }

  // Clean up any existing records for this progressId just in case
  await Promise.all([
    supabase.from('social_security').delete().eq('progress_id', progressId),
    supabase.from('bank_account').delete().eq('progress_id', progressId),
    supabase.from('driver_licence').delete().eq('progress_id', progressId),
    supabase.from('tax_return').delete().eq('progress_id', progressId),
    supabase.from('housing').delete().eq('progress_id', progressId),
  ]);

  // 2. Insert démarches
  const demarcheQueries = [
    supabase.from('social_security').insert({
      progress_id: progressId,
      status: 'in_progress', // Default status
      ameli_account_created: answers.social_security.ameli_account_created,
      vitale_card_requested: answers.social_security.vitale_card_requested,
      has_mutuelle: answers.social_security.has_mutuelle,
      is_foreign_student: false, // Default
    }),
    supabase.from('bank_account').insert({
      progress_id: progressId,
      status: 'in_progress',
      has_identity_doc: answers.bank_account.has_identity_doc,
      has_proof_of_address: answers.bank_account.has_proof_of_address,
      has_proof_of_income: answers.bank_account.has_proof_of_income,
    }),
    supabase.from('driver_licence').insert({
      progress_id: progressId,
      status: 'in_progress',
      ants_account_created: answers.driver_licence.ants_account_created,
      code_passed: answers.driver_licence.code_passed,
      practical_exam_passed: answers.driver_licence.practical_exam_passed,
      driving_hours: 0,
    }),
    supabase.from('tax_return').insert({
      progress_id: progressId,
      status: 'in_progress',
      must_declare: answers.tax_return.must_declare,
      impots_account_created: answers.tax_return.impots_account_created,
      income_collected: answers.tax_return.income_collected,
      declaration_validated: false,
    }),
    supabase.from('housing').insert({
      progress_id: progressId,
      status: 'in_progress',
      has_tenant_file: answers.housing.has_tenant_file,
      has_guarantor: answers.housing.has_guarantor,
      uses_visale: answers.housing.uses_visale,
      lease_signed: false,
      inventory_done: false,
    })
  ];

  await Promise.all(demarcheQueries);

  // 3. Update user profile to complete onboarding
  const { error: userError } = await supabase
    .from('users')
    .update({ is_onboarding_completed: true })
    .eq('id', userId);

  if (userError) throw userError;
};
