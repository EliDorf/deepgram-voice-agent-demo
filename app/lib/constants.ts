import { type AudioConfig, type StsConfig, type Voice } from "app/utils/deepgramUtils";

const audioConfig: AudioConfig = {
  input: {
    encoding: "linear16",
    sample_rate: 48000
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
2. Ask each question clearly and encourage responses, offering reassurance if needed.
3. Briefly confirm that their answers have been recorded accurately before moving to the next question.
4. Gently redirect any unrelated discussions back to the questionnaire, emphasizing its importance for their care.
5. After completing all questions, concisely summarize their responses to confirm accuracy.
6. Guide the patient to complete the checkout process, clearly explaining each step and addressing any questions or concerns they may have.
7. Thank the patient warmly for their cooperation and reassure them their information will be securely and confidentially stored.

Maintain a friendly, comforting, and patient-focused tone to ensure the patient feels cared for and at ease throughout the interaction.`,
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