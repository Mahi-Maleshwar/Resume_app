import { NextRequest, NextResponse } from "next/server";

type VoiceFeedback = { 
  relevance: string; 
  grammar: string; 
  fluency: string;
  pronunciation: string;
  feedback: string; 
};

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File;
    const question = formData.get('question') as string;
    
    if (!audioFile) {
      return NextResponse.json({ 
        relevance: "Error", 
        grammar: "Error", 
        fluency: "Error",
        pronunciation: "Error",
        feedback: "No audio file provided" 
      });
    }

    if (!process.env.GOOGLE_API_KEY) {
      return NextResponse.json({ 
        relevance: "Error", 
        grammar: "Error", 
        fluency: "Error",
        pronunciation: "Error",
        feedback: "Google API key not configured" 
      });
    }

    // Convert audio to base64 for Gemini
    const audioBuffer = await audioFile.arrayBuffer();
    const audioBase64 = Buffer.from(audioBuffer).toString('base64');

    const prompt = `You are an expert interviewer evaluating a candidate's voice response. Please evaluate the following:

Question: ${question}
Audio Response: [Voice recording provided]

Please provide your evaluation in the following JSON format (return ONLY the JSON object, no markdown formatting):
{
  "relevance": "High/Medium/Low",
  "grammar": "Correct/Incorrect", 
  "fluency": "Excellent/Good/Fair/Poor",
  "pronunciation": "Clear/Unclear",
  "feedback": "Detailed feedback about the voice response including content, delivery, and areas for improvement"
}

IMPORTANT: Return ONLY the JSON object.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${process.env.GOOGLE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    mimeType: audioFile.type || "audio/webm",
                    data: audioBase64,
                  },
                },
              ],
            },
          ],
          generationConfig: { temperature: 0.2, maxOutputTokens: 1000 },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ 
        relevance: "Error", grammar: "Error", fluency: "Error",
        pronunciation: "Error", feedback: `API Error: ${response.status} ${errorText}` 
      });
    }

    const data = await response.json();
    const messageText = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    
    console.log("Gemini voice response:", data);
    console.log("Extracted message text:", messageText);

    let feedback: VoiceFeedback = {
      relevance: "Unknown",
      grammar: "Unknown",
      fluency: "Unknown",
      pronunciation: "Unknown",
      feedback: messageText
    };

    try {
      // Extract JSON from Gemini response
      const jsonMatch = messageText.match(/\{[\s\S]*?\}/);
      if (jsonMatch) {
        console.log("Found JSON match:", jsonMatch[0]);
        feedback = JSON.parse(jsonMatch[0]);
        console.log("Parsed voice feedback:", feedback);
      } else {
        console.log("No JSON match found in response");
      }
    } catch (err) {
      console.error("Failed to parse Gemini response JSON:", err);
      console.log("Raw message text:", messageText);
    }

    console.log("Final voice feedback being returned:", feedback);
    return NextResponse.json(feedback);

  } catch (err) {
    console.error("Voice evaluation error:", err);
    return NextResponse.json({ 
      relevance: "Error", grammar: "Error", fluency: "Error",
      pronunciation: "Error", feedback: "Failed to evaluate voice response" 
    });
  }
}

