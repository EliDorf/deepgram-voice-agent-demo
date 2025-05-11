import { useState, useEffect } from 'react';
import { patientIntakeQuestions, type Question } from '../lib/questions';
import { useVoiceBot, VoiceBotStatus } from '../context/VoiceBotContextProvider';

export default function QuestionnaireManager() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const { status, messages } = useVoiceBot();
  const currentQuestion = patientIntakeQuestions[currentQuestionIndex];

  // Listen for user responses and advance questions
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.assistant?.includes("Great") || lastMessage?.assistant?.includes("Thank you")) {
      // Wait briefly before advancing to next question
      const timer = setTimeout(() => {
        setCurrentQuestionIndex(prev => Math.min(patientIntakeQuestions.length - 1, prev + 1));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [messages]);

  const getStatusText = () => {
    switch (status) {
      case VoiceBotStatus.LISTENING:
        return "Listening for your answer...";
      case VoiceBotStatus.THINKING:
        return "Processing your response...";
      case VoiceBotStatus.SPEAKING:
        return "Speaking...";
      case VoiceBotStatus.SLEEPING:
        return "Click the orb to start";
      default:
        return "Ready to begin";
    }
  };

  const renderQuestion = (question: Question) => {
    return (
      <div className="w-full max-w-2xl mx-auto p-6 bg-gray-850 rounded-lg border border-gray-700">
        <h3 className="text-xl text-gray-25 mb-4">{question.text}</h3>
        {question.type === 'multiple_choice' && question.options && (
          <div className="space-y-2">
            {question.options.map((option, index) => (
              <div key={index} className="text-gray-200">
                • {option}
              </div>
            ))}
          </div>
        )}
        <div className="mt-4 text-sm text-gray-450">
          {question.type === 'multiple_choice' ? 'Please choose one of the options above' : 'Please provide your answer'}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center space-y-8 w-full max-w-4xl mx-auto px-4">
      <div className="text-center">
        <h2 className="text-2xl text-gray-25 mb-2">Patient Intake Questionnaire</h2>
        <p className="text-gray-450">Question {currentQuestionIndex + 1} of {patientIntakeQuestions.length}</p>
      </div>
      
      {renderQuestion(currentQuestion)}
      
      <div className="text-center">
        <p className="text-gray-450">{getStatusText()}</p>
        {status === VoiceBotStatus.SLEEPING && (
          <p className="text-sm text-gray-450 mt-2">The assistant will guide you through each question</p>
        )}
      </div>

      <div className="flex justify-between w-full max-w-2xl">
        <button
          onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
          disabled={currentQuestionIndex === 0}
          className="px-4 py-2 bg-gray-800 text-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          onClick={() => setCurrentQuestionIndex(Math.min(patientIntakeQuestions.length - 1, currentQuestionIndex + 1))}
          disabled={currentQuestionIndex === patientIntakeQuestions.length - 1}
          className="px-4 py-2 bg-gray-800 text-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
}