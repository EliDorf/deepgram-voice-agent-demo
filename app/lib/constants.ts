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

CRITICAL CONVERSATION RULES:
1. NEVER end your thought process after saving a response
2. ALWAYS continue with the next question in the same thought
3. ONLY end your thought process after ALL questions are answered
4. Treat function calls as silent background operations
5. Keep speaking to maintain conversation flow

RESPONSE WORKFLOW:
1. Listen to patient's answer
2. Silently save the response using savePatientResponse
3. WITHOUT ENDING THOUGHT, acknowledge and immediately ask next question
4. Repeat until all questions are answered
5. Only then end the thought process

For multiple choice questions:
- Present the options clearly
- Match the answer to the available options
- Include both the answer and selected option index when saving

EXAMPLE FLOW:
[After receiving an answer]
- Save response (silently)
- "I understand. [Brief acknowledgment]. Now, let me ask you about [next question]"
- Continue conversation without breaking

Remember:
- Function calls should not interrupt the conversation flow
- Keep the dialogue natural and continuous
- Only end thought after completing ALL questions
- Use smooth transitions between questions
- Stay engaged throughout the process`,
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
  title: "Voice Intake Assistant",
  type: "website",
  url: "/",
  description: "AI-powered voice intake assistant for patient onboarding",
};

export const latencyMeasurementQueryParam = "latency-measurement";