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
  }
];