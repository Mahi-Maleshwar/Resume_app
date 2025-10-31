import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Briefcase, Calendar, Eye, MessageSquare } from "lucide-react";
import InterviewQuestionsDialog from "./InterviewQuestionsDialog";
import InterviewFeedbackDialog from "./InterviewFeedbackDialog";

interface InterviewSession {
  _id: string;
  _creationTime: number;
  jobTitle?: string;
  jobDescription?: string;
  resumeUrl?: string;
  sessionType?: string;
  completedAt?: number;
  interviewQuestions: { question: string; answer?: string }[];
  answers?: { question: string; answer: string }[];
  textFeedbacks?: { relevance: string; grammar: string; feedback: string }[];
  voiceFeedbacks?: { relevance: string; grammar: string; fluency: string; pronunciation: string; feedback: string }[];
}

interface InterviewSessionGridProps {
  sessions: InterviewSession[];
}

const InterviewSessionGrid: React.FC<InterviewSessionGridProps> = ({ sessions }) => {
  const [selectedSession, setSelectedSession] = useState<InterviewSession | null>(null);
  const [showQuestionsDialog, setShowQuestionsDialog] = useState(false);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewQuestions = (session: InterviewSession) => {
    setSelectedSession(session);
    setShowQuestionsDialog(true);
  };

  const handleViewFeedback = (session: InterviewSession) => {
    setSelectedSession(session);
    setShowFeedbackDialog(true);
  };

  if (sessions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No completed interviews yet</h3>
        <p className="text-gray-500">Complete your first interview to see it here!</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sessions.map((session) => (
          <div key={session._id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            {/* Header */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {session.sessionType === 'resume' ? (
                    <FileText className="w-5 h-5 text-blue-500" />
                  ) : (
                    <Briefcase className="w-5 h-5 text-green-500" />
                  )}
                  <span className="text-sm font-medium text-gray-600">
                    {session.sessionType === 'resume' ? 'Resume-based' : 'Job Description'}
                  </span>
                </div>
                <div className="flex items-center text-xs text-gray-500">
                  <Calendar className="w-3 h-3 mr-1" />
                  {formatDate(session.completedAt || session._creationTime)}
                </div>
              </div>
              
              <h3 className="font-semibold text-gray-900 text-lg mb-1">
                {session.jobTitle || 'Interview Session'}
              </h3>
              
              {session.jobDescription && (
                <p className="text-sm text-gray-600 line-clamp-2">
                  {session.jobDescription}
                </p>
              )}
            </div>

            {/* Stats */}
            <div className="p-4 border-b border-gray-100">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {session.interviewQuestions?.length || 0}
                  </div>
                  <div className="text-xs text-gray-500">Questions</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {session.answers?.length || 0}
                  </div>
                  <div className="text-xs text-gray-500">Answered</div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleViewQuestions(session)}
                className="flex-1 flex items-center justify-center space-x-2"
              >
                <Eye className="w-4 h-4" />
                <span>Questions</span>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleViewFeedback(session)}
                className="flex-1 flex items-center justify-center space-x-2"
                disabled={!session.textFeedbacks?.length && !session.voiceFeedbacks?.length}
              >
                <MessageSquare className="w-4 h-4" />
                <span>Feedback</span>
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Questions Dialog */}
      <InterviewQuestionsDialog
        isOpen={showQuestionsDialog}
        onClose={() => setShowQuestionsDialog(false)}
        questions={selectedSession?.interviewQuestions || []}
        title={selectedSession?.jobTitle || 'Interview Session'}
      />

      {/* Feedback Dialog */}
      <InterviewFeedbackDialog
        isOpen={showFeedbackDialog}
        onClose={() => setShowFeedbackDialog(false)}
        textFeedbacks={selectedSession?.textFeedbacks || []}
        voiceFeedbacks={selectedSession?.voiceFeedbacks || []}
        title={selectedSession?.jobTitle || 'Interview Session'}
      />
    </>
  );
};

export default InterviewSessionGrid;

