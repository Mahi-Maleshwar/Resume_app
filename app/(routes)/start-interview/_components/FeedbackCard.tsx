interface FeedbackCardProps {
  question: string;
  answer: string;
  feedback: string;
  fluency?: string;
  pronunciation?: string;
}

export default function FeedbackCard({ question, answer, feedback, fluency, pronunciation }: FeedbackCardProps) {
  return (
    <div className="p-4 border rounded mb-3 bg-gray-50">
      <p><strong>Q:</strong> {question}</p>
      <p><strong>Your Answer:</strong> {answer}</p>
      <p><strong>Feedback:</strong> {feedback}</p>
      {fluency && <p><strong>Fluency:</strong> {fluency}</p>}
      {pronunciation && <p><strong>Pronunciation:</strong> {pronunciation}</p>}
    </div>
  );
}
