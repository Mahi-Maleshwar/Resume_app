import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface Feedback {
  relevance: string;
  grammar: string;
  feedback: string;
}

interface VoiceFeedback {
  relevance: string;
  grammar: string;
  fluency: string;
  pronunciation: string;
  feedback: string;
}

interface InterviewFeedbackDialogProps {
  isOpen: boolean;
  onClose: () => void;
  textFeedbacks: Feedback[];
  voiceFeedbacks: VoiceFeedback[];
  title: string;
}

const InterviewFeedbackDialog: React.FC<InterviewFeedbackDialogProps> = ({
  isOpen,
  onClose,
  textFeedbacks,
  voiceFeedbacks,
  title,
}) => {
  // Calculate overall performance metrics
  const allFeedbacks = [...textFeedbacks, ...voiceFeedbacks];
  const highRelevanceCount = allFeedbacks.filter(f => f.relevance === 'High').length;
  const correctGrammarCount = allFeedbacks.filter(f => f.grammar === 'Correct').length;
  const totalFeedbacks = allFeedbacks.length;

  const averageRelevance = totalFeedbacks > 0 ? 
    (highRelevanceCount >= totalFeedbacks / 2 ? 'High' : 
     allFeedbacks.filter(f => f.relevance === 'Medium').length >= totalFeedbacks / 2 ? 'Medium' : 'Low') : 'Unknown';

  const grammarScore = totalFeedbacks > 0 ? Math.round((correctGrammarCount / totalFeedbacks) * 100) : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-semibold">
            Interview Feedback - {title}
          </DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          {/* Overall Performance Analysis */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-200">
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
                  averageRelevance === 'High' ? 'text-green-600' :
                  averageRelevance === 'Medium' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {averageRelevance}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {highRelevanceCount}/{totalFeedbacks} answers highly relevant
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-2">✍️</span>
                  <span className="text-sm font-semibold text-gray-600">Grammar Score</span>
                </div>
                <div className={`text-2xl font-bold ${
                  grammarScore > 70 ? 'text-green-600' : 
                  grammarScore > 50 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {grammarScore}%
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {correctGrammarCount}/{totalFeedbacks} answers grammatically correct
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-2">💬</span>
                  <span className="text-sm font-semibold text-gray-600">Communication</span>
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {(() => {
                    const avgLength = allFeedbacks.reduce((sum, f) => sum + f.feedback.length, 0) / totalFeedbacks;
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
          </div>

          {/* Individual Feedback Items */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-800">Individual Question Feedback</h4>
            
            {/* Text Feedbacks */}
            {textFeedbacks.map((feedback, index) => (
              <div key={`text-${index}`} className="bg-blue-50 rounded-xl p-4 border-l-4 border-blue-400">
                <div className="flex items-center mb-2">
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center mr-2">
                    <span className="text-white text-xs">📝</span>
                  </div>
                  <span className="text-xs font-semibold text-blue-700">Text Response Feedback</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div className="bg-white rounded-lg px-3 py-2">
                    <span className="text-sm text-gray-600">Relevance</span>
                    <div className={`text-base font-semibold ${
                      feedback.relevance === 'High' ? 'text-green-600' : 
                      feedback.relevance === 'Medium' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {feedback.relevance}
                    </div>
                  </div>
                  <div className="bg-white rounded-lg px-3 py-2">
                    <span className="text-sm text-gray-600">Grammar</span>
                    <div className={`text-base font-semibold ${
                      feedback.grammar === 'Correct' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {feedback.grammar}
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg px-3 py-2">
                  <span className="text-sm text-gray-600 mb-1 block">Detailed Feedback</span>
                  <p className="text-base text-gray-700 leading-relaxed">
                    {feedback.feedback}
                  </p>
                </div>
              </div>
            ))}

            {/* Voice Feedbacks */}
            {voiceFeedbacks.map((feedback, index) => (
              <div key={`voice-${index}`} className="bg-green-50 rounded-xl p-4 border-l-4 border-green-400">
                <div className="flex items-center mb-2">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-2">
                    <span className="text-white text-xs">🎤</span>
                  </div>
                  <span className="text-xs font-semibold text-green-700">Voice Response Feedback</span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
                  <div className="bg-white rounded-lg px-3 py-2">
                    <span className="text-sm text-gray-600">Relevance</span>
                    <div className={`text-base font-semibold ${
                      feedback.relevance === 'High' ? 'text-green-600' : 
                      feedback.relevance === 'Medium' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {feedback.relevance}
                    </div>
                  </div>
                  <div className="bg-white rounded-lg px-3 py-2">
                    <span className="text-sm text-gray-600">Grammar</span>
                    <div className={`text-base font-semibold ${
                      feedback.grammar === 'Correct' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {feedback.grammar}
                    </div>
                  </div>
                  <div className="bg-white rounded-lg px-3 py-2">
                    <span className="text-sm text-gray-600">Fluency</span>
                    <div className={`text-base font-semibold ${
                      feedback.fluency === 'Excellent' ? 'text-green-600' : 
                      feedback.fluency === 'Good' ? 'text-blue-600' : 
                      feedback.fluency === 'Fair' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {feedback.fluency}
                    </div>
                  </div>
                  <div className="bg-white rounded-lg px-3 py-2">
                    <span className="text-sm text-gray-600">Pronunciation</span>
                    <div className={`text-base font-semibold ${
                      feedback.pronunciation === 'Clear' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {feedback.pronunciation}
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg px-3 py-2">
                  <span className="text-sm text-gray-600 mb-1 block">Detailed Feedback</span>
                  <p className="text-base text-gray-700 leading-relaxed">
                    {feedback.feedback}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InterviewFeedbackDialog;

