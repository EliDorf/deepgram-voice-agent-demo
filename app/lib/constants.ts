import { type AudioConfig, type StsConfig, type Voice } from "app/utils/deepgramUtils";
import { patientIntakeQuestions } from "./questions";

const audioConfig: AudioConfig = {
  input: {
    encoding: "linear16",
    sample_rate: 16000
  },
  output: {
    encoding: "linear16",
    sample_rate: 24000,
    container: "none"
  }
};

export const defaultVoice: Voice = {
  canonical_name: "aura-2-thalia-en",
  name: "Thalia",
  language: "en",
  model: "aura-2"
};

const baseConfig = {
  type: "SettingsConfiguration",
  audio: audioConfig,
  agent: {
    listen: { model: "nova-3" },
    speak: { model: "aura-2-thalia-en" },
    think: {
      provider: { type: "open_ai" },
      model: "gpt-4o-mini",
    },
  },
};

export const stsConfig: StsConfig = {
  ...baseConfig,
  agent: {
    ...baseConfig.agent,
    think: {
      ...baseConfig.agent.think,
      provider: { type: "open_ai" },
      functions: [
        {
          name: "savePatientResponse",
          description: "Save a patient's response to a question",
          url: "/api/save-response",
          method: "POST",
          headers: [
            {
              key: "Content-Type",
              value: "application/json"
            }
          ],
          parameters: {
            type: "object",
            properties: {
              question: {
                type: "string",
                description: "The question being asked"
              },
              answer: {
                type: "string",
                description: "The patient's answer"
              },
              questionType: {
                type: "string",
                description: "Type of question (multiple_choice or open_ended)"
              },
              options: {
                type: "array",
                items: {
                  type: "string"
                },
                description: "Available options for multiple choice questions"
              },
              selectedOption: {
                type: "integer",
                description: "Index of the selected option for multiple choice questions"
              }
            },
            required: ["question", "answer", "questionType"]
          }
        }
      ],
      instructions: `You are an AI Patient Intake Assistant created by Bask Health, meeting with potential patients to smoothly guide them through a set of important questions and encourage them to complete the checkout process efficiently.

QUESTIONS TO ASK:
${patientIntakeQuestions.map((q, i) => `${i + 1}. ${q.text}${q.options ? '\n   Options: ' + q.options.join(', ') : ''}`).join('\n')}

CONVERSATION CONTROL:
- You MUST collect answers for ALL questions before ending the conversation
- After receiving an answer, IMMEDIATELY proceed to the next question
- NEVER end your thought process between questions
- Maintain continuous conversation flow until ALL information is collected
- Only send "End of thought" after ALL questions are answered

RESPONSE HANDLING:
1. After each answer:
   - Use savePatientResponse to store the information with the correct question type and options
   - Continue IMMEDIATELY to the next question
   - Do not pause or end the thought process
2. Keep track of which questions have been answered
3. Only conclude the conversation after all questions are complete

For multiple choice questions:
- Present the options clearly
- Match the answer to the available options
- Include both the answer and selected option index when saving

CRITICAL: Your responses must flow naturally between questions without breaks. After saving a response, immediately transition to the next question without ending the thought process. The thought process should only end after all questions have been answered and responses saved.

Example Flow:
"Thank you for that information. Now, let me ask you about..." [Save response silently, continue immediately]

Remember:
- Keep the conversation flowing naturally
- Do not end thoughts between questions
- Only end the thought process after ALL questions are answered
- Use smooth transitions between questions
- Maintain engagement throughout the entire process`,
    },
  },
  context: {
    messages: [{
      content: "I'm here to help guide you through some important questions to help with your visit today.",
      role: "assistant"
    }],
    replay: true
  }
};

export const sharedOpenGraphMetadata = {
  title: "Voice Agent | Deepgram",
  type: "website",
  url: "/",
  description: "Meet Deepgram's Voice Agent API",
};

export const latencyMeasurementQueryParam = "latency-measurement";