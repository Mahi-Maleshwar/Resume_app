"use client";

import { api } from "@/convex/_generated/api";
import { useConvex, useMutation } from "convex/react";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState, useRef } from "react";
import VoiceRecorder from "./_components/VoiceRecorder";

// Types
type InterviewQuestions = { question: string; answer: string | null };
type Feedback = { relevance: string; grammar: string; feedback: string };
type VoiceFeedback = { 
  relevance: string; 
  grammar: string; 
  fluency: string;
  pronunciation: string;
  feedback: string; 
};
type InterviewData = {
  _id: string;
  _creationTime: number;
  resumeUrl?: string;
  jobTitle?: string | null;
  jobDescription?: string | null;
  interviewQuestions: InterviewQuestions[];
  userId?: string | null;
  status: string;
};

// Chat Message Component
const ChatMessage = ({ 
  message, 
  isUser, 
  feedback, 
  voiceFeedback,
  index 
}: { 
  message: { question: string; answer: string }; 
  isUser: boolean; 
  feedback?: Feedback;
  voiceFeedback?: VoiceFeedback;
  index: number;
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), index * 200);
    return () => clearTimeout(timer);
  }, [index]);


  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 animate-fadeIn`}>
      <div className={`max-w-[80%] ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} transition-all duration-500 ease-out`}>
        {/* Question (from interviewer) */}
        <div className="flex justify-start mb-2">
          <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-sm border border-gray-100 message-bubble animate-slideInLeft">
            <div className="flex items-center mb-1">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-2">
                <span className="text-white text-xs font-bold">AI</span>
              </div>
              <span className="text-xs text-gray-500">Interviewer</span>
            </div>
            <p className="text-gray-800 text-base leading-relaxed">{message.question}</p>
          </div>
        </div>

        {/* Answer (from user) */}
        <div className="flex justify-end">
          <div className="bg-green-500 rounded-2xl rounded-br-md px-4 py-3 shadow-sm message-bubble animate-slideInRight">
            <div className="flex items-center justify-end mb-1">
              <span className="text-xs text-green-100">You</span>
              <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center ml-2">
                <span className="text-white text-xs font-bold">U</span>
              </div>
            </div>
            <p className="text-white text-base leading-relaxed">{message.answer}</p>
          </div>
        </div>

        {/* Feedback */}
        {(feedback || voiceFeedback) && (
          <div className="mt-2 animate-slideUp">
            <div className="bg-blue-50 rounded-xl px-4 py-3 border-l-4 border-blue-400">
              <div className="flex items-center mb-2">
                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center mr-2">
                  <span className="text-white text-xs">📊</span>
                </div>
                <span className="text-xs font-semibold text-blue-700">
                  {voiceFeedback ? 'Voice AI Feedback' : 'AI Feedback'}
                </span>
              </div>
              
              <div className={`grid gap-2 mb-2 ${voiceFeedback ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-2'}`}>
                <div className="bg-white rounded-lg px-3 py-2">
                  <span className="text-sm text-gray-600">Relevance</span>
                  <div className={`text-base font-semibold ${
                    (feedback?.relevance || voiceFeedback?.relevance) === 'High' ? 'text-green-600' : 
                    (feedback?.relevance || voiceFeedback?.relevance) === 'Medium' ? 'text-yellow-600' : 
                    (feedback?.relevance || voiceFeedback?.relevance) === 'Low' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {feedback?.relevance || voiceFeedback?.relevance}
                  </div>
                </div>
                <div className="bg-white rounded-lg px-3 py-2">
                  <span className="text-sm text-gray-600">Grammar</span>
                  <div className={`text-base font-semibold ${
                    (feedback?.grammar || voiceFeedback?.grammar) === 'Correct' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {feedback?.grammar || voiceFeedback?.grammar}
                  </div>
                </div>
                
                {voiceFeedback && (
                  <>
                    <div className="bg-white rounded-lg px-3 py-2">
                      <span className="text-sm text-gray-600">Fluency</span>
                      <div className={`text-base font-semibold ${
                        voiceFeedback.fluency === 'Excellent' ? 'text-green-600' : 
                        voiceFeedback.fluency === 'Good' ? 'text-blue-600' : 
                        voiceFeedback.fluency === 'Fair' ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {voiceFeedback.fluency}
                      </div>
                    </div>
                    <div className="bg-white rounded-lg px-3 py-2">
                      <span className="text-sm text-gray-600">Pronunciation</span>
                      <div className={`text-base font-semibold ${
                        voiceFeedback.pronunciation === 'Clear' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {voiceFeedback.pronunciation}
                      </div>
                    </div>
                  </>
                )}
              </div>
              
              <div className="bg-white rounded-lg px-3 py-2">
                <span className="text-sm text-gray-600 mb-1 block">Detailed Feedback</span>
                <p className="text-base text-gray-700 leading-relaxed">
                  {feedback?.feedback || voiceFeedback?.feedback}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Current Question Component
const CurrentQuestion = ({ 
  question, 
  isVisible 
}: { 
  question: string; 
  isVisible: boolean; 
}) => (
  <div className={`flex justify-start mb-4 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} transition-all duration-500 ease-out`}>
    <div className="max-w-[80%]">
      <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-sm border border-gray-100 message-bubble animate-slideInLeft">
        <div className="flex items-center mb-1">
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-2">
            <span className="text-white text-xs font-bold">AI</span>
          </div>
          <span className="text-xs text-gray-500">Interviewer</span>
        </div>
        <p className="text-gray-800 text-base leading-relaxed">{question}</p>
      </div>
    </div>
  </div>
);

export default function StartInterview() {
  const { interviewid } = useParams();
  const convex = useConvex();
  const router = useRouter();

  const [interviewData, setInterviewData] = useState<InterviewData | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ question: string; answer: string }[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [voiceFeedbacks, setVoiceFeedbacks] = useState<VoiceFeedback[]>([]);
  const [inputAnswer, setInputAnswer] = useState("");
  const [listening, setListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [progressRestored, setProgressRestored] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Convex mutations
  const saveCompletedInterview = useMutation(api.Interview.SaveCompletedInterview);

  // Storage key for this interview
  const storageKey = `interview_${interviewid}`;

  const isFinished = interviewData
    ? currentQuestionIndex >= interviewData.interviewQuestions.length
    : false;

  // Save interview progress to localStorage
  const saveInterviewProgress = () => {
    if (typeof window !== 'undefined') {
      const progress = {
        currentQuestionIndex,
        answers,
        feedbacks,
        voiceFeedbacks,
        timestamp: Date.now()
      };
      localStorage.setItem(storageKey, JSON.stringify(progress));
    }
  };

  // Load interview progress from localStorage
  const loadInterviewProgress = () => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const progress = JSON.parse(saved);
          console.log('Loading saved progress:', progress);
          
          // Check if the saved data is recent (within 24 hours)
          const isRecent = Date.now() - progress.timestamp < 24 * 60 * 60 * 1000;
          console.log('Is recent:', isRecent, 'Answers:', progress.answers?.length);
          
          if (isRecent && progress.answers && progress.answers.length > 0) {
            console.log('Restoring interview progress...');
            setCurrentQuestionIndex(progress.currentQuestionIndex || 0);
            setAnswers(progress.answers || []);
            setFeedbacks(progress.feedbacks || []);
            setVoiceFeedbacks(progress.voiceFeedbacks || []);
            setProgressRestored(true);
            return true;
          } else {
            console.log('No valid progress to restore');
          }
        }
      } catch (error) {
        console.error('Error loading interview progress:', error);
      }
    }
    return false;
  };

  // Clear interview progress
  const clearInterviewProgress = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(storageKey);
    }
  };

  // Fetch interview questions and load saved progress
  useEffect(() => {
    if (!interviewid) return;
    
    const initializeInterview = async () => {
      setIsLoading(true);
      
      // First, try to load saved progress
      const hasSavedProgress = loadInterviewProgress();
      console.log('Has saved progress:', hasSavedProgress);
      
      // Then fetch interview data
      const result = await convex.query(api.Interview.GetInterviewQuestions, {
        //@ts-ignore
        interviewRecordId: interviewid,
      });

      if (!result) {
        setIsLoading(false);
        return;
      }

      const item = result;
      const formattedQuestions: InterviewQuestions[] = (item.interviewQuestions ?? []).map((q: any) => ({
        question: q.question ?? "No question",
        answer: q.answer ?? null,
      }));

      setInterviewData({
        _id: item._id.toString(),
        jobTitle: item.jobTitle ?? null,
        jobDescription: item.jobDescription ?? null,
        interviewQuestions: formattedQuestions,
        userId: item.userId?.toString() ?? null,
        status: item.status,
        resumeUrl: item.resumeUrl,
        _creationTime: item._creationTime,
      });
      
      console.log('Interview data loaded:', {
        questionsCount: formattedQuestions.length,
        hasSavedProgress,
        currentQuestionIndex: hasSavedProgress ? 'restored from localStorage' : 0
      });
      
      setIsLoading(false);
    };

    initializeInterview();
  }, [interviewid, convex]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [answers, currentQuestionIndex]);

  // Save progress whenever answers or feedbacks change
  useEffect(() => {
    if (answers.length > 0 || feedbacks.length > 0 || voiceFeedbacks.length > 0) {
      saveInterviewProgress();
    }
  }, [answers, feedbacks, voiceFeedbacks, currentQuestionIndex]);

  // Save progress when current question index changes
  useEffect(() => {
    if (currentQuestionIndex > 0) {
      saveInterviewProgress();
    }
  }, [currentQuestionIndex]);

  // Redirect after interview finishes
  useEffect(() => {
    if (isFinished && answers.length > 0) {
      // Check if we have feedback for all answers (either text or voice feedback)
      const validTextFeedbacks = feedbacks.filter(f => f && f.relevance).length;
      const validVoiceFeedbacks = voiceFeedbacks.filter(f => f && f.relevance).length;
      const hasAllFeedback = answers.length === (validTextFeedbacks + validVoiceFeedbacks);
      
      if (hasAllFeedback) {
        // Save completed interview to Convex
        const saveInterviewData = async () => {
          try {
            await saveCompletedInterview({
              interviewId: interviewid as any,
              answers,
              textFeedbacks: feedbacks,
              voiceFeedbacks,
            });
            console.log("Interview session saved successfully");
          } catch (error) {
            console.error("Failed to save interview session:", error);
          }
        };
        
        saveInterviewData();
        
        // Clear the saved progress since interview is completed
        clearInterviewProgress();
        
        const queryString = new URLSearchParams({
          answers: JSON.stringify(answers),
          feedbacks: JSON.stringify(feedbacks),
          voiceFeedbacks: JSON.stringify(voiceFeedbacks),
        }).toString();
        router.push(`/start-interview/feedback?${queryString}`);
      }
    }
  }, [isFinished, answers, feedbacks, voiceFeedbacks, router, interviewid, saveCompletedInterview]);

  // Handle sending text answer
  const handleSend = async () => {
    if (!inputAnswer.trim() || !interviewData) return;
    const question = interviewData.interviewQuestions[currentQuestionIndex];
    const currentAnswerIndex = currentQuestionIndex; // Store the current index before incrementing

    setAnswers(prev => [...prev, { question: question.question, answer: inputAnswer }]);
    setCurrentQuestionIndex(prev => prev + 1); // Move this before the API call
    setIsTyping(true);

    try {
      const res = await fetch("/api/evaluate-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: question.question, answer: inputAnswer }),
      });

      const data: Feedback = await res.json();
      console.log("Text feedback received:", data);
      setFeedbacks(prev => {
        const newFeedbacks = [...prev];
        newFeedbacks[currentAnswerIndex] = data; // Set feedback at the correct index
        return newFeedbacks;
      });
    } catch {
      setFeedbacks(prev => {
        const newFeedbacks = [...prev];
        newFeedbacks[currentAnswerIndex] = { relevance: "Error", grammar: "Error", feedback: "Failed to evaluate" };
        return newFeedbacks;
      });
    }

    setInputAnswer("");
    setIsTyping(false);
  };

  // Handle voice recording completion
  const handleVoiceRecordingComplete = async (audioBlob: Blob) => {
    if (!interviewData) return;
    const question = interviewData.interviewQuestions[currentQuestionIndex];
    const currentAnswerIndex = currentQuestionIndex; // Store the current index before incrementing

    // Convert audio blob to text for display (you could also show "Voice message" or similar)
    const answerText = `🎤 Voice Response (${Math.round(audioBlob.size / 1024)}KB)`;
    
    setAnswers(prev => [...prev, { question: question.question, answer: answerText }]);
    setCurrentQuestionIndex(prev => prev + 1); // Move this before the API call
    setIsTyping(true);

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'voice-response.webm');
      formData.append('question', question.question);

      const res = await fetch("/api/evaluate-voice", {
        method: "POST",
        body: formData,
      });

      const data: VoiceFeedback = await res.json();
      console.log("Voice feedback received:", data);
      setVoiceFeedbacks(prev => {
        const newFeedbacks = [...prev];
        newFeedbacks[currentAnswerIndex] = data; // Set feedback at the correct index
        console.log("Voice feedback set at index:", currentAnswerIndex, "Data:", data);
        return newFeedbacks;
      });
    } catch (error) {
      console.error('Voice evaluation error:', error);
      setVoiceFeedbacks(prev => {
        const newFeedbacks = [...prev];
        newFeedbacks[currentAnswerIndex] = { 
          relevance: "Error", 
          grammar: "Error", 
          fluency: "Error",
          pronunciation: "Error",
          feedback: "Failed to evaluate voice response" 
        };
        return newFeedbacks;
      });
    }

    setIsTyping(false);
  };

  // Handle voice recording start
  const handleVoiceRecordingStart = () => {
    setIsRecording(true);
  };

  // Handle voice recording stop
  const handleVoiceRecordingStop = () => {
    setIsRecording(false);
  };

  // Handle speech recognition
  const handleMic = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Speech Recognition not supported");
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.start();
    setListening(true);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputAnswer(transcript);
    };

    recognition.onend = () => setListening(false);
  };

  if (isLoading || !interviewData) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-green-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading interview...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center mr-3">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">{interviewData.jobTitle ?? "Interview"}</h2>
              <p className="text-sm text-gray-500">
                Question {currentQuestionIndex + 1} of {interviewData.interviewQuestions.length}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Progress</div>
            <div className="w-24 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestionIndex) / interviewData.interviewQuestions.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 chat-container">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Message */}
          <div className="text-center mb-6">
            <div className="bg-white rounded-2xl px-6 py-4 shadow-sm border border-gray-100 inline-block">
              <div className="flex items-center justify-center mb-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center mr-2">
                  <span className="text-white font-bold text-sm">AI</span>
                </div>
                <span className="text-sm font-semibold text-gray-700">Interview Assistant</span>
              </div>
              {progressRestored && answers.length > 0 ? (
                <div>
                  <p className="text-base text-gray-600 mb-2">Welcome back! Your progress has been restored.</p>
                  <p className="text-sm text-green-600 font-medium">Continuing from question {currentQuestionIndex + 1}</p>
                  <p className="text-xs text-blue-600 mt-1">✅ {answers.length} answers saved • {feedbacks.length + voiceFeedbacks.length} feedback items loaded</p>
                </div>
              ) : answers.length > 0 ? (
                <div>
                  <p className="text-base text-gray-600 mb-2">Interview in progress...</p>
                  <p className="text-sm text-blue-600 font-medium">Question {currentQuestionIndex + 1} of {interviewData?.interviewQuestions.length}</p>
                </div>
              ) : (
                <p className="text-base text-gray-600">Welcome! I'll be conducting your interview today. Let's begin!</p>
              )}
            </div>
          </div>

          {/* Chat Messages */}
          {answers.map((msg, idx) => {
            // Get the appropriate feedback for this answer
            const textFeedback = feedbacks[idx];
            const voiceFeedback = voiceFeedbacks[idx];
            
            return (
              <ChatMessage 
                key={idx} 
                message={msg} 
                isUser={true} 
                feedback={textFeedback} 
                voiceFeedback={voiceFeedback}
                index={idx}
              />
            );
          })}

          {/* Current Question */}
          {!isFinished && (
            <CurrentQuestion 
              question={interviewData.interviewQuestions[currentQuestionIndex].question}
              isVisible={true}
            />
          )}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start mb-4">
              <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-sm border border-gray-100">
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-2">
                    <span className="text-white text-xs font-bold">AI</span>
                  </div>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Completion Message */}
          {isFinished && (
            <div className="text-center mb-6">
              <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl px-6 py-4 shadow-lg text-white inline-block">
                <div className="flex items-center justify-center mb-2">
                  <span className="text-2xl mr-2">🎉</span>
                  <span className="text-lg font-semibold">Interview Completed!</span>
                </div>
                <p className="text-base opacity-90">Great job! Here's your overall performance analysis.</p>
              </div>
            </div>
          )}

          {/* Overall Feedback Section */}
          {isFinished && feedbacks.filter(f => f && f.relevance).length > 0 && (
            <div className="mb-6 animate-slideUp">
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-200 shadow-lg">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-bold text-lg">📊</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Overall Performance Analysis</h3>
                    <p className="text-sm text-gray-600">Comprehensive feedback on your interview</p>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="flex items-center mb-2">
                      <span className="text-2xl mr-2">🎯</span>
                      <span className="text-sm font-semibold text-gray-600">Average Relevance</span>
                    </div>
                    <div className={`text-2xl font-bold ${
                      feedbacks.filter(f => f && f.relevance === 'High').length > feedbacks.filter(f => f && f.relevance).length / 2 ? 'text-green-600' :
                      feedbacks.filter(f => f && f.relevance === 'Medium').length > feedbacks.filter(f => f && f.relevance).length / 2 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {(() => {
                        const validFeedbacks = feedbacks.filter(f => f && f.relevance);
                        const highCount = validFeedbacks.filter(f => f.relevance === 'High').length;
                        const mediumCount = validFeedbacks.filter(f => f.relevance === 'Medium').length;
                        const lowCount = validFeedbacks.filter(f => f.relevance === 'Low').length;
                        if (highCount >= mediumCount && highCount >= lowCount) return 'High';
                        if (mediumCount >= lowCount) return 'Medium';
                        return 'Low';
                      })()}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {feedbacks.filter(f => f && f.relevance === 'High').length}/{feedbacks.filter(f => f && f.relevance).length} answers highly relevant
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="flex items-center mb-2">
                      <span className="text-2xl mr-2">✍️</span>
                      <span className="text-sm font-semibold text-gray-600">Grammar Score</span>
                    </div>
                    <div className={`text-2xl font-bold ${
                      feedbacks.filter(f => f && f.grammar === 'Correct').length > feedbacks.filter(f => f && f.grammar).length / 2 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {(() => {
                        const validFeedbacks = feedbacks.filter(f => f && f.grammar);
                        return validFeedbacks.length > 0 ? Math.round((validFeedbacks.filter(f => f.grammar === 'Correct').length / validFeedbacks.length) * 100) : 0;
                      })()}%
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {feedbacks.filter(f => f && f.grammar === 'Correct').length}/{feedbacks.filter(f => f && f.grammar).length} answers grammatically correct
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="flex items-center mb-2">
                      <span className="text-2xl mr-2">💬</span>
                      <span className="text-sm font-semibold text-gray-600">Communication</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                      {(() => {
                        const validFeedbacks = feedbacks.filter(f => f && f.feedback);
                        if (validFeedbacks.length === 0) return 'Basic';
                        const avgLength = validFeedbacks.reduce((sum, f) => sum + f.feedback.length, 0) / validFeedbacks.length;
                        if (avgLength > 200) return 'Excellent';
                        if (avgLength > 100) return 'Good';
                        return 'Basic';
                      })()}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Detailed responses provided
                    </div>
                  </div>
                </div>

                {/* Areas for Improvement */}
                <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <span className="text-xl mr-2">🎯</span>
                    Areas to Focus On
                  </h4>
                  <div className="space-y-2">
                    {(() => {
                      const lowRelevanceCount = feedbacks.filter(f => f && f.relevance === 'Low').length;
                      const incorrectGrammarCount = feedbacks.filter(f => f && f.grammar === 'Incorrect').length;
                      const suggestions = [];
                      
                      if (lowRelevanceCount > 0) {
                        suggestions.push(
                          <div key="relevance" className="flex items-start">
                            <span className="text-red-500 mr-2">•</span>
                            <span className="text-base text-gray-700">
                              <strong>Answer Relevance:</strong> Focus on directly addressing the question asked. Provide specific examples and stay on topic.
                            </span>
                          </div>
                        );
                      }
                      
                      if (incorrectGrammarCount > 0) {
                        suggestions.push(
                          <div key="grammar" className="flex items-start">
                            <span className="text-red-500 mr-2">•</span>
                            <span className="text-base text-gray-700">
                              <strong>Grammar & Language:</strong> Practice proper sentence structure and use professional language. Consider grammar tools for improvement.
                            </span>
                          </div>
                        );
                      }
                      
                      suggestions.push(
                        <div key="communication" className="flex items-start">
                          <span className="text-blue-500 mr-2">•</span>
                          <span className="text-base text-gray-700">
                            <strong>Communication Skills:</strong> Practice the STAR method (Situation, Task, Action, Result) for behavioral questions.
                          </span>
                        </div>
                      );
                      
                      suggestions.push(
                        <div key="confidence" className="flex items-start">
                          <span className="text-green-500 mr-2">•</span>
                          <span className="text-base text-gray-700">
                            <strong>Confidence Building:</strong> Practice mock interviews to build confidence and reduce nervousness.
                          </span>
                        </div>
                      );
                      
                      return suggestions;
                    })()}
                  </div>
          </div>

                {/* Fluency Assessment */}
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <span className="text-xl mr-2">🗣️</span>
                    Fluency Assessment
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-base font-semibold text-gray-700 mb-2">Strengths</h5>
                      <ul className="space-y-1">
                        <li className="text-base text-gray-600 flex items-center">
                          <span className="text-green-500 mr-2">✓</span>
                          Clear communication style
                        </li>
                        <li className="text-base text-gray-600 flex items-center">
                          <span className="text-green-500 mr-2">✓</span>
                          Good attempt at providing examples
                        </li>
                        <li className="text-base text-gray-600 flex items-center">
                          <span className="text-green-500 mr-2">✓</span>
                          Professional tone maintained
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="text-base font-semibold text-gray-700 mb-2">Improvement Areas</h5>
                      <ul className="space-y-1">
                        <li className="text-base text-gray-600 flex items-center">
                          <span className="text-orange-500 mr-2">•</span>
                          More specific examples needed
                        </li>
                        <li className="text-base text-gray-600 flex items-center">
                          <span className="text-orange-500 mr-2">•</span>
                          Better question understanding
                        </li>
                        <li className="text-base text-gray-600 flex items-center">
                          <span className="text-orange-500 mr-2">•</span>
                          Enhanced grammar accuracy
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
            </div>
          </div>
        )}

        {/* Home Button - Show when interview is finished */}
        {isFinished && (
          <div className="flex justify-start mb-6 animate-slideUp">
            <div className="max-w-[80%]">
              <button
                onClick={() => router.push('/dashboard')}
                className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white px-6 py-3 rounded-2xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>Home</span>
              </button>
            </div>
          </div>
        )}

        <div ref={messagesEndRef}></div>
        </div>
      </div>

      {/* Input Area */}
      {!isFinished && (
        <div className="bg-white border-t border-gray-200 px-4 py-3">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-end space-x-3">
              <div className="flex-1 relative">
                <textarea
                  className="w-full border border-gray-300 rounded-2xl px-4 py-3 pr-12 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Type your answer here..."
                  value={inputAnswer}
                  onChange={e => setInputAnswer(e.target.value)}
                  rows={1}
                  style={{ minHeight: '48px', maxHeight: '120px' }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                />
                <button
                  onClick={handleMic}
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                    listening 
                      ? "bg-red-500 text-white animate-pulse" 
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                  title="Speech to text"
                >
                  🎤
                </button>
              </div>
              
              {/* Voice Recorder */}
              <VoiceRecorder
                onRecordingComplete={handleVoiceRecordingComplete}
                onRecordingStart={handleVoiceRecordingStart}
                onRecordingStop={handleVoiceRecordingStop}
                disabled={isTyping || isRecording}
              />
              
              <button 
                onClick={handleSend}
                disabled={!inputAnswer.trim() || isTyping || isRecording}
                className="bg-gradient-to-r from-blue-500 to-green-500 text-white px-6 py-3 rounded-2xl font-medium hover:from-blue-600 hover:to-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
