import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    UserTable: defineTable({
        name: v.string(),
        imageUrl: v.string(),
        email: v.string(),
    }),

    InterviewSessionTable:defineTable({
        interviewQuestions:v.array(v.object({ question: v.string(), answer: v.optional(v.string()) })),
        resumeUrl: v.optional(v.string()),
        userId: v.id("UserTable"),
        status:v.string(),
        jobTitle: v.optional(v.string()),
        jobDescription:v.optional(v.string()),
        // New fields for session data
        answers: v.optional(v.array(v.object({ question: v.string(), answer: v.string() }))),
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
        completedAt: v.optional(v.number()),
        sessionType: v.optional(v.string()) // "resume" or "jobDescription"
    })
})