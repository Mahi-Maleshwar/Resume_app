import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface InterviewQuestionsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  questions: { question: string; answer?: string }[];
  title: string;
}

const InterviewQuestionsDialog: React.FC<InterviewQuestionsDialogProps> = ({
  isOpen,
  onClose,
  questions,
  title,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-semibold">
            Interview Questions - {title}
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
        
        <div className="space-y-4 mt-4">
          {questions.map((qa, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-2">
                    {qa.question}
                  </h4>
                  {qa.answer && (
                    <div className="bg-white rounded-md p-3 border-l-4 border-green-400">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium text-green-600">Answer:</span> {qa.answer}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InterviewQuestionsDialog;

