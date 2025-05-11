import { v4 as uuidv4 } from 'uuid';
import { supabase } from './supabaseClient';

export interface PatientResponse {
  sessionId: string;
  question: string;
  answer: string;
  questionType: 'multiple_choice' | 'open_ended';
  options?: string[];
  selectedOption?: number;
}

export class PatientResponseHandler {
  private sessionId: string;

  constructor() {
    this.sessionId = uuidv4();
  }

  async saveResponse(response: PatientResponse): Promise<void> {
    try {
      const { error } = await supabase
        .from('patient_responses')
        .insert({
          session_id: this.sessionId,
          question: response.question,
          answer: response.answer,
          question_type: response.questionType,
          options: response.options,
          selected_option: response.selectedOption
        });

      if (error) {
        console.error('Error saving response:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in saveResponse:', error);
      throw error;
    }
  }

  getSessionId(): string {
    return this.sessionId;
  }
}