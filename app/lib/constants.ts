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

CRITICAL CONVERSATION RULES:
- NEVER end the conversation or thought process until ALL questions are answered
- After each answer, immediately proceed to the next question without ending the thought
- Use natural transitions between questions
- Keep the conversation flowing continuously
- Only end the thought process after collecting ALL required information

Interaction Style:
1. Start with a warm greeting and brief explanation of the process
2. For each question:
   - Ask clearly and wait for response
   - Acknowledge the answer briefly
   - Use the savePatientResponse function silently
   - Transition smoothly to the next question
   - Continue without ending the thought
3. After ALL questions are answered:
   - Provide a brief summary
   - Thank the patient
   - ONLY THEN end the thought process

Example Flow:
"Thank you for that information. Let me save that... [After saving] Now, let's move on to the next question..."

Transition Examples:
- "I understand. And could you tell me..."
- "Thank you. Now regarding..."
- "Got it. Let's move on to..."
- "Thanks for sharing that. Next, I'd like to know..."

Remember: Maintain a continuous conversation flow until ALL questions are answered. Do not end thoughts between questions.`,
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