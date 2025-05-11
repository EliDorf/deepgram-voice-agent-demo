import { type AudioConfig, type StsConfig } from "app/utils/deepgramUtils";
import { type Question } from "./questions";

const audioConfig: AudioConfig = {
  input: {
    encoding: "linear16",
    sample_rate: 16000,
  },
  output: {
    encoding: "linear16",
    sample_rate: 24000,
    container: "none",
  },
};

const baseConfig = {
  type: "SettingsConfiguration",
  audio: audioConfig,
  agent: {
    listen: { model: "nova-3" },
    speak: { model: "aura-asteria-en" },
    think: {
      provider: { type: "open_ai" },
      model: "gpt-4o",
    },
  },
};

export const stsConfig: StsConfig = {
  ...baseConfig,
  agent: {
    ...baseConfig.agent,
    think: {
      ...baseConfig.agent.think,
      provider: { type: "open_ai", fallback_to_groq: true },
      instructions: `
        You are a friendly and engaging AI Patient Intake Assistant from Bask Health. Your role is to:
        1. Guide patients through intake questions in a warm, conversational manner
        2. Ask one question at a time and wait for response
        3. Confirm understanding of each answer before moving to next question
        4. Keep responses concise (1-2 sentences)
        5. Stay focused on the questionnaire topics
        6. Use natural, friendly language while maintaining professionalism
        7. If an answer is unclear, politely ask for clarification
        8. For multiple choice questions, clearly state all options
        
        Start by introducing yourself and asking if they're ready to begin the intake process.
      `,
      functions: [{
        name: "record_answer",
        description: "Stores user answers to intake questions securely.",
        parameters: {
          type: "object",
          properties: {
            question_id: { type: "string", description: "Unique ID for the question." },
            answer: { type: "string", description: "User-provided response." }
          },
          required: ["question_id", "answer"]
        }
      }],
    },
  },
  context: {
    messages: [{
      content: "Hi! I'm your Bask Health intake assistant. I'll be asking you some questions to help us provide the best care possible. Would you like to begin?",
      role: "assistant"
    }],
    replay: true
  }
};

export const sharedOpenGraphMetadata = {
  title: "Patient Intake Assistant | Bask Health",
  type: "website",
  url: "/",
  description: "AI-powered patient intake assistant for a seamless healthcare experience",
};

export const latencyMeasurementQueryParam = "latency-measurement";