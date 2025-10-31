"use client";

import { useSearchParams } from "next/navigation";
import FeedbackCard from "../_components/FeedbackCard";

export default function FeedbackPage() {
  const searchParams = useSearchParams();
  const answersParam = searchParams.get("answers");
  const feedbacksParam = searchParams.get("feedbacks");

  let answers: { question: string; answer: string }[] = [];
  let feedbacks: any[] = [];

  try {
    if (answersParam) answers = JSON.parse(answersParam);
    if (feedbacksParam) feedbacks = JSON.parse(feedbacksParam);
  } catch (err) {
    console.error("Failed to parse answers/feedbacks:", err);
  }

  if (answers.length === 0) {
    return <div className="p-4 text-center">No feedback available.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4 text-center">Interview Feedback</h2>
      {answers.map((item, idx) => (
        <FeedbackCard
          key={idx}
          question={item.question}
          answer={item.answer}
          feedback={feedbacks[idx]?.feedback || "No feedback"}
        />
      ))}
    </div>
  );
}
