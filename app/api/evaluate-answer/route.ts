import { NextRequest, NextResponse } from "next/server";

type Feedback = { 
  relevance: string; 
  grammar: string; 
  feedback: string; 
};

export async function POST(req: NextRequest) {
  try {
    const { question, answer } = await req.json();
    console.log("Received evaluation request:", { question, answer });

    if (!process.env.GOOGLE_API_KEY) {
      console.error("GOOGLE_API_KEY is not set");
      return NextResponse.json({
        relevance: "Error",
        grammar: "Error",
        feedback: "API key not configured",
      });
    }

    const prompt = `You are an expert interviewer evaluating candidate answers. Please evaluate the following:

Question: ${question}
Answer: ${answer}

Please provide your evaluation in the following JSON format (return ONLY the JSON object, no markdown formatting):
{
  "relevance": "High/Medium/Low",
  "grammar": "Correct/Incorrect", 
  "feedback": "Detailed feedback about the answer's strengths and areas for improvement"
}

Focus on:
- How well the answer addresses the question
- Grammar and language quality
- Specific, constructive feedback for improvement

IMPORTANT: Return ONLY the JSON object without any markdown code blocks or additional text.`;

    // Call Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${process.env.GOOGLE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 1000 },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);
      return NextResponse.json({
        relevance: "Error",
        grammar: "Error",
        feedback: `API Error: ${response.status}`,
      });
    }

    const data = await response.json();
    console.log("Gemini API response:", data);

    const messageText = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    console.log("Extracted text:", messageText);

    let feedback: Feedback;
    let cleanText = ""; // declared here for both try and catch

    try {
      // Clean response text
      cleanText = messageText.trim();
      cleanText = cleanText.replace(/^```(?:json)?\s*/gm, "").replace(/\s*```$/gm, "");
      cleanText = cleanText.replace(/```/g, "");

      // Extract JSON
      const jsonMatch = cleanText.match(/\{[\s\S]*?\}/);
      if (jsonMatch) {
        const jsonString = jsonMatch[0];
        console.log("Extracted JSON string:", jsonString);
        feedback = JSON.parse(jsonString);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse JSON:", parseError);
      console.log("Raw response:", messageText);
      console.log("Cleaned text:", cleanText);

      // Fallback: extract manually
      const relevanceMatch = messageText.match(/"relevance":\s*"([^"]+)"/);
      const grammarMatch = messageText.match(/"grammar":\s*"([^"]+)"/);
      const feedbackMatch = messageText.match(/"feedback":\s*"([^"]+)"/);

      feedback = {
        relevance: relevanceMatch ? relevanceMatch[1] : "Unknown",
        grammar: grammarMatch ? grammarMatch[1] : "Unknown",
        feedback: feedbackMatch ? feedbackMatch[1] : messageText || "Failed to parse response",
      };
    }

    console.log("Final feedback:", feedback);
    return NextResponse.json(feedback);
  } catch (err) {
    console.error("Evaluation error:", err);
    return NextResponse.json({
      relevance: "Error",
      grammar: "Error",
      feedback: "Failed to evaluate",
    });
  }
}
