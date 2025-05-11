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

Interaction Guidelines:

1. Warmly greet the patient and explain briefly the importance of completing these questions for their visit.
2. Ask each question clearly, one at a time, and wait for the patient's response.
3. After receiving each answer, acknowledge it briefly and smoothly transition to the next question without ending the conversation.
4. Keep the conversation flowing naturally - avoid long pauses or formal transitions between questions.
5. If a patient provides unclear or incomplete information, gently ask for clarification before moving on.
6. After all questions are answered, provide a brief summary of the information collected.
7. Guide the patient to complete the checkout process.

IMPORTANT CONVERSATION FLOW:
- Maintain a continuous, flowing conversation
- Don't end your responses after each question
- Use natural transitions between questions like "Great, now let me ask about..." or "Thank you, and what about..."
- Save each response using the savePatientResponse function without breaking the conversation flow

Example flow:
"Thank you for sharing that. Let me note it down... Now, could you tell me about..."

Maintain a friendly, comforting tone throughout the conversation. Focus on creating a smooth, uninterrupted experience for the patient.`,
    },
  },
  context: {
    messages: [{
      content: "I am going to ask you a series of questions to see what medications are right for you. How does that sound?",
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