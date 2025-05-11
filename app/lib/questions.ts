export interface Question {
  id: string;
  text: string;
  type: 'multiple_choice' | 'open_ended';
  options?: string[];
}

export const patientIntakeQuestions: Question[] = [
  {
    id: 'symptoms',
    text: 'What symptoms are you experiencing?',
    type: 'open_ended'
  },
  {
    id: 'duration',
    text: 'How long have you had these symptoms?',
    type: 'multiple_choice',
    options: ['Less than a week', '1-2 weeks', '2-4 weeks', 'More than a month']
  },
  {
    id: 'severity',
    text: 'On a scale of 1-5, how severe are your symptoms?',
    type: 'multiple_choice',
    options: ['1 - Mild', '2 - Moderate', '3 - Uncomfortable', '4 - Severe', '5 - Extreme']
  },
  {
    id: 'medications',
    text: 'Are you currently taking any medications?',
    type: 'open_ended'
  },
  {
    id: 'allergies',
    text: 'Do you have any allergies to medications?',
    type: 'multiple_choice',
    options: ['Yes', 'No', 'Not sure']
  },
  {
    id: 'medical_history',
    text: 'Do you have any significant medical conditions?',
    type: 'open_ended'
  },
  {
    id: 'family_history',
    text: 'Is there any relevant family medical history we should know about?',
    type: 'open_ended'
  },
  {
    id: 'lifestyle',
    text: 'How would you describe your lifestyle in terms of exercise and diet?',
    type: 'open_ended'
  },
  {
    id: 'sleep',
    text: 'How many hours of sleep do you typically get per night?',
    type: 'multiple_choice',
    options: ['Less than 6 hours', '6-7 hours', '7-8 hours', '8+ hours']
  },
  {
    id: 'stress',
    text: 'How would you rate your current stress level?',
    type: 'multiple_choice',
    options: ['Low', 'Moderate', 'High', 'Very High']
  }
];