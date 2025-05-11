import { type AudioConfig, type StsConfig, type Voice } from "app/utils/deepgramUtils";

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
              }
            },
            required: ["question", "answer", "questionType"]
          }
        }
      ],
      instructions: `You are an AI Patient Intake Assistant created by Bask Health, meeting with potential patients to smoothly guide them through a set of important questions and encourage them to complete the checkout process efficiently.

Patient Intake Questions:

1. Could you please confirm your full name and date of birth?
2. How much weight do you want to lose?
3. What is your current height and weight?
4. Do you have any allergies?
5. Do you take any current medication?
6. Have you previously taken the medication you are interested in today?

CONVERSATION CONTROL:
- You MUST collect answers for ALL questions before ending the conversation
- After receiving an answer, IMMEDIATELY proceed to the next question
- NEVER end your thought process between questions
- Maintain continuous conversation flow until ALL information is collected
- Only send "End of thought" after ALL questions are answered

RESPONSE HANDLING:
1. After each answer:
   - Silently use savePatientResponse to store the information
   - Continue IMMEDIATELY to the next question
   - Do not pause or end the thought process
2. Keep track of which questions have been answered
3. Only conclude the conversation after all questions are complete

CRITICAL: Your responses must flow naturally between questions without breaks. After saving a response, immediately transition to the next question without ending the thought process. The thought process should only end after all questions have been answered and responses saved.

Example Flow:
"Thank you [name]. Let me note that down... Now, about your weight goals..."
[Save response silently, continue immediately]

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
      content: "I'm here to help guide you through a few important questions to assist with your intake process.",
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