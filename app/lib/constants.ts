import { type AudioConfig, type StsConfig } from "app/utils/deepgramUtils";
import { type Question } from "./questions";

export const defaultVoice = {
  canonical_name: "aura-asteria-en"
};

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
    listen: { model: "nova-2" },
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
        8. For multiple choice questions, clearly state all options before waiting for response
        9. After confirming an answer, say "Great! Let's move on to the next question."
        10. If the user asks to go back, allow them to revise previous answers

        IMPORTANT: Always speak your responses out loud - never stay silent.
        When starting, immediately greet the user and ask if they're ready to begin.
      `,
      functions: [],
    },
  },
};

export const sharedOpenGraphMetadata = {
  title: "Patient Intake Assistant | Bask Health",
  type: "website",
  url: "/",
  description: "AI-powered patient intake assistant for a seamless healthcare experience",
};

export const latencyMeasurementQueryParam = "latency-measurement";