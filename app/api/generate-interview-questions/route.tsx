import { aj } from "@/utils/arcjet";
import { currentUser } from "@clerk/nextjs/server";
import axios from "axios";
import ImageKit from "imagekit";
import { NextRequest, NextResponse } from "next/server";

// Initialize ImageKit (backend only)
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_URL_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_URL_PRIVATE_KEY!,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
});


export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const jobTitle = formData.get('jobTitle') as File;
    const jobDescription = formData.get('jobDescription') as File; 

    const decision = await aj.protect(req, {userId: user?.primaryEmailAddress?.emailAddress ?? '', requested: 5})
    console.log("Arcjet decision", decision);

    //@ts-ignore
    if(decision?.reason?.remaining == 0){
      return NextResponse.json({
        status: 429,
        result: 'No Free Credit remaining, Try again after 24 Hours'
      })
    }

    if (file){

    // Determine file extension
    const mimeType = file.type;
    let extension = "dat";

    if (mimeType === "application/pdf") extension = "pdf";
    else if (mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
      extension = "docx";
    else if (mimeType.startsWith("image/")) extension = mimeType.split("/")[1];

    // Convert File to Buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to ImageKit
    const uploadResponse = await imagekit.upload({
      file: buffer,
      fileName: `upload-${Date.now()}.${extension}`,
      folder: "/uploads",
      isPrivateFile: false,
      useUniqueFileName: true,
    });

    const publicUrl = imagekit.url({
      path: uploadResponse.filePath,
      signed: false,
    });

    // Call n8n webhook
    const n8nResponse = await axios.post(
      "http://localhost:5678/webhook/interview-preparation",
      { resumeUrl: publicUrl },
      { headers: { "Content-Type": "application/json" } }
    );

    // Extract full QA pairs from n8n response
    const text = n8nResponse.data?.content?.parts?.[0]?.text;
    console.log("N8N Response text:", text);
    console.log("Full N8N Response:", JSON.stringify(n8nResponse.data, null, 2));
    
    let qaPairs: { question: string; answer: string }[] = [];

    if (text) {
      try {
        const parsed = JSON.parse(text);
        console.log("Parsed N8N data:", parsed);
        
        // Handle the new categorized structure
        if (parsed && parsed.length > 0) {
          const data = parsed[0];
          console.log("Parsed data structure:", data);
          
          // Check if it's the new categorized structure
          if (data['Core Concepts'] || data['Frontend Concepts'] || data['Projects']) {
            console.log("Detected categorized structure");
            const allQuestions: any[] = [];
            
            // Extract questions from each category
            Object.keys(data).forEach(category => {
              if (Array.isArray(data[category])) {
                console.log(`Processing category: ${category}`, data[category]);
                data[category].forEach((item: any) => {
                  if (item && typeof item === 'object') {
                    allQuestions.push({
                      question: item.question || item.text || item.title || `Question from ${category}`,
                      answer: item.answer || "",
                      category: category
                    });
                  }
                });
              }
            });
            
            qaPairs = allQuestions.map(item => ({
              question: item.question,
              answer: item.answer || ""
            }));
            
            console.log("Extracted questions from categories:", qaPairs);
          } else if (data.interview_questions) {
            // Handle the old interview_questions structure
            console.log("Interview questions array:", data.interview_questions);
            qaPairs = data.interview_questions.map((item: any) => ({
              question: item.question || item.text || "No question provided",
              answer: item.answer || "",
            }));
          } else {
            // Fallback to direct mapping if structure is different
            qaPairs = parsed.map((item: any) => ({
              question: item.question || item.text || "No question provided",
              answer: item.answer || "",
            }));
          }
        }
        console.log("Final QA pairs:", qaPairs);
      } catch (err) {
        console.error("Failed to parse n8n response:", err);
        console.error("Raw text that failed to parse:", text);
      }
    }

    // Return public URL and full QA pairs
    return NextResponse.json(
      {
        resumeUrl: publicUrl,
        questions: qaPairs,
      },
      { status: 200 }
    );
  }
  else {
    const n8nResponse = await axios.post(
      "http://localhost:5678/webhook/interview-preparation",
      { resumeUrl: null, jobTitle: jobTitle, jobDescription: jobDescription },
      { headers: { "Content-Type": "application/json" } }
    );
    console.log(n8nResponse.data)

    const text = n8nResponse.data?.content?.parts?.[0]?.text;
    console.log("N8N Response text (no file):", text);
    console.log("Full N8N Response (no file):", JSON.stringify(n8nResponse.data, null, 2));
    
    let qaPairs: { question: string; answer: string }[] = [];

    if (text) {
      try {
        const parsed = JSON.parse(text);
        console.log("Parsed N8N data (no file):", parsed);
        
        // Handle the new categorized structure
        if (parsed && parsed.length > 0) {
          const data = parsed[0];
          console.log("Parsed data structure (no file):", data);
          
          // Check if it's the new categorized structure
          if (data['Core Concepts'] || data['Frontend Concepts'] || data['Projects']) {
            console.log("Detected categorized structure (no file)");
            const allQuestions: any[] = [];
            
            // Extract questions from each category
            Object.keys(data).forEach(category => {
              if (Array.isArray(data[category])) {
                console.log(`Processing category (no file): ${category}`, data[category]);
                data[category].forEach((item: any) => {
                  if (item && typeof item === 'object') {
                    allQuestions.push({
                      question: item.question || item.text || item.title || `Question from ${category}`,
                      answer: item.answer || "",
                      category: category
                    });
                  }
                });
              }
            });
            
            qaPairs = allQuestions.map(item => ({
              question: item.question,
              answer: item.answer || ""
            }));
            
            console.log("Extracted questions from categories (no file):", qaPairs);
          } else if (data.interview_questions) {
            // Handle the old interview_questions structure
            console.log("Interview questions array (no file):", data.interview_questions);
            qaPairs = data.interview_questions.map((item: any) => ({
              question: item.question || item.text || "No question provided",
              answer: item.answer || "",
            }));
          } else {
            // Fallback to direct mapping if structure is different
            qaPairs = parsed.map((item: any) => ({
              question: item.question || item.text || "No question provided",
              answer: item.answer || "",
            }));
          }
        }
        console.log("Final QA pairs (no file):", qaPairs);
      } catch (err) {
        console.error("Failed to parse n8n response:", err);
        console.error("Raw text that failed to parse:", text);
      }
    }

       return NextResponse.json(
      {
        resumeUrl: null,
        questions: qaPairs,
        jobTitle: jobTitle,
        jobDescription: jobDescription
      },
      { status: 200 }
    );
  }

  } catch (error: any) {
    console.error("Upload or n8n error:", error.response?.data || error.message);
    return NextResponse.json(
      { error: error.response?.data || error.message },
      { status: 500 }
    );
  }
}
