import { supabase } from './supabaseClient';
import type { Question } from '../lib/questions';

export async function recordResponse(
  sessionId: string,
  question: Question,
  answer: string,
  selectedOption?: number
) {
  try {
    const { error } = await supabase
      .from('patient_responses')
      .insert({
        session_id: sessionId,
        question: question.text,
        answer,
        question_type: question.type,
        options: question.options,
        selected_option: selectedOption
      });

    if (error) {
      console.error('Error recording response:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error recording response:', error);
    throw error;
  }
}