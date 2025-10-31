import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const SaveInterviewQuestion = mutation({
  args: {
    qaPairs: v.array(
      v.object({
        question: v.string(),
        answer: v.optional(v.string()),
      })
    ),
    resumeUrl: v.optional(v.string()),
    uid: v.id("UserTable"),
    jobTitle: v.optional(v.string()),
    jobDescription: v.optional(v.string()),
    sessionType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("InterviewSessionTable", {
      interviewQuestions: args.qaPairs, // store question+answer
      resumeUrl: args.resumeUrl ?? "",
      userId: args.uid,
      status: "draft",
      jobTitle: args.jobTitle,
      jobDescription: args.jobDescription,
      sessionType: args.sessionType,
    });

    // ✅ fetch the full saved document and return it
    const savedDoc = await ctx.db.get(id);
    return savedDoc;
  },
});

export const GetInterviewQuestions = query({
  args: {
    interviewRecordId: v.id("InterviewSessionTable"),
  },
  handler: async (ctx, args) => {
    const result = await ctx.db.get(args.interviewRecordId);
    return result;
  },
});

// Save completed interview session
export const SaveCompletedInterview = mutation({
  args: {
    interviewId: v.id("InterviewSessionTable"),
    answers: v.array(v.object({ question: v.string(), answer: v.string() })),
    textFeedbacks: v.optional(v.array(v.object({ 
      relevance: v.string(), 
      grammar: v.string(), 
      feedback: v.string() 
    }))),
    voiceFeedbacks: v.optional(v.array(v.object({ 
      relevance: v.string(), 
      grammar: v.string(), 
      fluency: v.string(),
      pronunciation: v.string(),
      feedback: v.string() 
    }))),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.interviewId, {
      status: "completed",
      answers: args.answers,
      textFeedbacks: args.textFeedbacks || [],
      voiceFeedbacks: args.voiceFeedbacks || [],
      completedAt: Date.now(),
    });
    
    return await ctx.db.get(args.interviewId);
  },
});

// Get all interview sessions for a user
export const GetUserInterviewSessions = query({
  args: {
    userId: v.id("UserTable"),
  },
  handler: async (ctx, args) => {
    const sessions = await ctx.db
      .query("InterviewSessionTable")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .order("desc")
      .collect();
    
    return sessions;
  },
});

// Get completed interview sessions only
export const GetCompletedInterviewSessions = query({
  args: {
    userId: v.id("UserTable"),
  },
  handler: async (ctx, args) => {
    const sessions = await ctx.db
      .query("InterviewSessionTable")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .filter((q) => q.eq(q.field("status"), "completed"))
      .order("desc")
      .collect();
    
    return sessions;
  },
});