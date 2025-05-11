"use client";

import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Transcript from "./Transcript";
import { useDeepgram } from "../context/DeepgramContextProvider";
import { useMicrophone } from "../context/MicrophoneContextProvider";
import { EventType, useVoiceBot, VoiceBotStatus } from "../context/VoiceBotContextProvider";
import { createAudioBuffer, playAudioBuffer } from "../utils/audioUtils";
import { sendSocketMessage, sendMicToSocket } from "app/utils/deepgramUtils";
import { isMobile } from "react-device-detect";
import { usePrevious } from "@uidotdev/usehooks";
import { useStsQueryParams } from "app/hooks/UseStsQueryParams";
import RateLimited from "./RateLimited";
import AnimationManager from "./AnimationManager";

export const App = ({
  defaultStsConfig,
  onMessageEvent = () => {},
  requiresUserActionToInitialize = false,
  className = "",
}) => {
  const {
    status,
    messages,
    addVoicebotMessage,
    addBehindTheScenesEvent,
    isWaitingForUserVoiceAfterSleep,
    toggleSleep,
    startListening,
    startSpeaking,
  } = useVoiceBot();
  const {
    setupMicrophone,
    microphone,
    microphoneState,
    processor,
    microphoneAudioContext,
    startMicrophone,
  } = useMicrophone();
  const { socket, connectToDeepgram, socketState, rateLimited } = useDeepgram();
  const { voice, instructions, applyParamsToConfig } = useStsQueryParams();
  const audioContext = useRef(null);
  const agentVoiceAnalyser = useRef(null);
  const userVoiceAnalyser = useRef(null);
  const startTimeRef = useRef(-1);
  const [data, setData] = useState();
  const [isInitialized, setIsInitialized] = useState(requiresUserActionToInitialize ? false : null);
  const previousVoice = usePrevious(voice);
  const previousInstructions = usePrevious(instructions);
  const scheduledAudioSources = useRef([]);
  const pathname = usePathname();

  useEffect(() => {
    if (!audioContext.current) {
      audioContext.current = new (window.AudioContext || window.webkitAudioContext)({
        latencyHint: "interactive",
        sampleRate: 24000,
      });
      agentVoiceAnalyser.current = audioContext.current.createAnalyser();
      agentVoiceAnalyser.current.fftSize = 2048;
      agentVoiceAnalyser.current.smoothingTimeConstant = 0.96;
    }
  }, []);

  const bufferAudio = useCallback((data) => {
    const audioBuffer = createAudioBuffer(audioContext.current, data);
    if (!audioBuffer) return;
    scheduledAudioSources.current.push(
      playAudioBuffer(audioContext.current, audioBuffer, startTimeRef, agentVoiceAnalyser.current),
    );
  }, []);

  const clearAudioBuffer = () => {
    scheduledAudioSources.current.forEach((source) => source.stop());
    scheduledAudioSources.current = [];
  };

  useEffect(() => {
    setupMicrophone();
  }, [setupMicrophone]);

  useEffect(() => {
    let wakeLock;
    const requestWakeLock = async () => {
      try {
        if ("wakeLock" in navigator) {
          wakeLock = await navigator.wakeLock.request("screen");
        }
      } catch (err) {
        console.error(err);
      }
    };

    if (isInitialized) {
      requestWakeLock();
    }

    return () => {
      if (wakeLock) {
        wakeLock.release();
      }
    };
  }, [isInitialized]);

  useEffect(() => {
    if (microphoneState === 1 && socket && defaultStsConfig) {
      const onOpen = () => {
        const combinedStsConfig = applyParamsToConfig(defaultStsConfig);
        sendSocketMessage(socket, combinedStsConfig);
        startMicrophone();
        startListening(true);
      };

      socket.addEventListener("open", onOpen);

      return () => {
        socket.removeEventListener("open", onOpen);
        microphone.ondataavailable = null;
      };
    }
  }, [microphone, socket, microphoneState, defaultStsConfig, applyParamsToConfig, startMicrophone, startListening]);

  useEffect(() => {
    if (!microphone) return;
    if (!socket) return;
    if (microphoneState !== 2) return;
    if (socketState !== 1) return;
    processor.onaudioprocess = sendMicToSocket(socket);
  }, [microphone, socket, microphoneState, socketState, processor]);

  useEffect(() => {
    if (!processor || socket?.readyState !== 1) return;
    if (status === VoiceBotStatus.SLEEPING) {
      processor.onaudioprocess = null;
    } else {
      processor.onaudioprocess = sendMicToSocket(socket);
    }
  }, [status, processor, socket]);

  useEffect(() => {
    if (microphoneAudioContext) {
      userVoiceAnalyser.current = microphoneAudioContext.createAnalyser();
      userVoiceAnalyser.current.fftSize = 2048;
      userVoiceAnalyser.current.smoothingTimeConstant = 0.96;
      microphone.connect(userVoiceAnalyser.current);
    }
  }, [microphoneAudioContext, microphone]);

  const onMessage = useCallback(
    async (event) => {
      if (event.data instanceof ArrayBuffer) {
        if (status !== VoiceBotStatus.SLEEPING && !isWaitingForUserVoiceAfterSleep.current) {
          bufferAudio(event.data);
        }
      } else {
        setData(event.data);
        onMessageEvent(event.data);
      }
    },
    [bufferAudio, status, isWaitingForUserVoiceAfterSleep, onMessageEvent],
  );

  useEffect(() => {
    if (
      microphoneState === 1 &&
      socketState === -1 &&
      (!requiresUserActionToInitialize || (requiresUserActionToInitialize && isInitialized))
    ) {
      connectToDeepgram();
    }
  }, [
    microphone,
    socket,
    microphoneState,
    socketState,
    isInitialized,
    requiresUserActionToInitialize,
    connectToDeepgram,
  ]);

  useEffect(() => {
    if (socket) {
      socket.addEventListener("message", onMessage);
      return () => socket.removeEventListener("message", onMessage);
    }
  }, [socket, onMessage]);

  useEffect(() => {
    if (previousVoice && previousVoice !== voice && socket && socketState === 1) {
      sendSocketMessage(socket, {
        type: "UpdateSpeak",
        model: voice,
      });
    }
  }, [voice, socket, socketState, previousVoice]);

  useEffect(() => {
    if (previousInstructions !== instructions && socket && socketState === 1) {
      sendSocketMessage(socket, {
        type: "UpdateInstructions",
        instructions: `${defaultStsConfig.agent.think.instructions}\n${instructions}`,
      });
    }
  }, [defaultStsConfig, previousInstructions, instructions, socket, socketState]);

  useEffect(() => {
    if (typeof data === "string") {
      const userRole = (data) => {
        const userTranscript = data.content;
        if (status !== VoiceBotStatus.SLEEPING) {
          addVoicebotMessage({ user: userTranscript });
        }
      };

      const assistantRole = (data) => {
        if (status !== VoiceBotStatus.SLEEPING && !isWaitingForUserVoiceAfterSleep.current) {
          startSpeaking();
          const assistantTranscript = data.content;
          addVoicebotMessage({ assistant: assistantTranscript });
        }
      };

      try {
        const parsedData = JSON.parse(data);

        if (!parsedData) {
          throw new Error("No data returned in JSON.");
        }

        maybeRecordBehindTheScenesEvent(parsedData);

        if (parsedData.role === "user") {
          startListening();
          userRole(parsedData);
        }

        if (parsedData.role === "assistant") {
          if (status !== VoiceBotStatus.SLEEPING) {
            startSpeaking();
          }
          assistantRole(parsedData);
        }

        if (parsedData.type === EventType.AGENT_AUDIO_DONE) {
          startListening();
        }
        if (parsedData.type === EventType.USER_STARTED_SPEAKING) {
          isWaitingForUserVoiceAfterSleep.current = false;
          startListening();
          clearAudioBuffer();
        }
        if (parsedData.type === EventType.AGENT_STARTED_SPEAKING) {
          const { tts_latency, ttt_latency, total_latency } = parsedData;
          if (!tts_latency || !ttt_latency) return;
          const latencyMessage = { tts_latency, ttt_latency, total_latency };
          addVoicebotMessage(latencyMessage);
        }
      } catch (error) {
        console.error(data, error);
      }
    }
  }, [data, socket, status, startListening, startSpeaking, addVoicebotMessage]);

  const handleVoiceBotAction = () => {
    if (requiresUserActionToInitialize && !isInitialized) {
      setIsInitialized(true);
    }

    if (status !== VoiceBotStatus.NONE) {
      toggleSleep();
    }
  };

  const maybeRecordBehindTheScenesEvent = (serverMsg) => {
    switch (serverMsg.type) {
      case EventType.SETTINGS_APPLIED:
        addBehindTheScenesEvent({
          type: EventType.SETTINGS_APPLIED,
        });
        break;
      case EventType.USER_STARTED_SPEAKING:
        if (status === VoiceBotStatus.SPEAKING) {
          addBehindTheScenesEvent({
            type: "Interruption",
          });
        }
        addBehindTheScenesEvent({
          type: EventType.USER_STARTED_SPEAKING,
        });
        break;
      case EventType.AGENT_STARTED_SPEAKING:
        addBehindTheScenesEvent({
          type: EventType.AGENT_STARTED_SPEAKING,
        });
        break;
      case EventType.CONVERSATION_TEXT: {
        const role = serverMsg.role;
        const content = serverMsg.content;
        addBehindTheScenesEvent({
          type: EventType.CONVERSATION_TEXT,
          role: role,
          content: content,
        });
        break;
      }
      case EventType.END_OF_THOUGHT:
        addBehindTheScenesEvent({
          type: EventType.END_OF_THOUGHT,
        });
        break;
    }
  };

  if (rateLimited) {
    return <RateLimited />;
  }

  return (
    <div className={className}>
      <AnimationManager
        agentVoiceAnalyser={agentVoiceAnalyser.current}
        userVoiceAnalyser={userVoiceAnalyser.current}
        onOrbClick={handleVoiceBotAction}
      />
      {!microphone ? (
        <div className="text-base text-gray-25 text-center w-full">Loading microphone...</div>
      ) : (
        <Fragment>
          {socketState === -1 && requiresUserActionToInitialize && (
            <button className="text-center w-full" onClick={handleVoiceBotAction}>
              <span className="text-xl">Tap to start!</span>
            </button>
          )}
          {socketState === 0 && (
            <div className="text-base text-gray-25 text-center w-full">Loading Deepgram...</div>
          )}
          {socketState > 0 && status === VoiceBotStatus.SLEEPING && (
            <div className="text-xl flex flex-col items-center justify-center mt-4 mb-10 md:mt-4 md:mb-10">
              <div className="text-gray-450 text-sm">
                I've stopped listening. {isMobile ? "Tap" : "Click"} the orb to resume.
              </div>
            </div>
          )}
          <div className="h-20 md:h-12 text-sm md:text-base mt-2 flex flex-col items-center text-gray-200 overflow-y-auto">
            {messages.length > 0 ? <Transcript /> : null}
          </div>
        </Fragment>
      )}
    </div>
  );
};