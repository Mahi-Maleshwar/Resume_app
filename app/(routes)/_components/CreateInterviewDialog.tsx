import React, { useContext, useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ResumeUpload from "./ResumeUpload";
import JobDescription from "./JobDescription";
import axios from "axios";
import { Loader2Icon } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { UserDetailContext } from "@/context/UserDetailContext";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import InterviewSessionGrid from "./InterviewSessionGrid";

interface QAPair {
  question: string;
  answer: string;
}

function CreateInterviewDialog() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { userDetail } = useContext(UserDetailContext);
  const router = useRouter();

  const [formData, setFormData] = useState<{ jobTitle?: string; jobDescription?: string }>({});
  const saveInterviewQuestion = useMutation(api.Interview.SaveInterviewQuestion);
  
  // Get completed interview sessions
  const completedSessions = useQuery(api.Interview.GetCompletedInterviewSessions, 
    userDetail?._id ? { userId: userDetail._id } : "skip"
  );

  const onSubmit = async () => {
    setLoading(true);
    try {
      const data = new FormData();
      if (file) data.append("file", file);
      if (formData.jobTitle) data.append("jobTitle", formData.jobTitle);
      if (formData.jobDescription) data.append("jobDescription", formData.jobDescription);

      // Call your backend to generate questions
      const res = await axios.post("/api/generate-interview-questions", data);

      if(res?.data?.status === 429){
        toast.warning(res.data.result);
        return;
      }

      const qaPairs: QAPair[] = res.data.questions || [];
      
      // Debug: Log the qaPairs to see what we're getting
      console.log("QA Pairs from API:", qaPairs);
      
      // Ensure all qaPairs have both question and answer fields
      const validatedQaPairs = qaPairs.map((qa, index) => ({
        question: qa.question || `Question ${index + 1}`,
        answer: qa.answer || ""
      }));
      
      // If no valid questions were returned, create a fallback
      if (validatedQaPairs.length === 0 || validatedQaPairs.every(qa => !qa.question || qa.question === "")) {
        console.warn("No valid questions received from API, creating fallback questions");
        validatedQaPairs.push({
          question: "Tell me about yourself and your background.",
          answer: ""
        });
      }

      // Determine session type
      const sessionType = file ? "resume" : "jobDescription";
      
      // Save interview in Convex
      const savedInterview = await saveInterviewQuestion({
        qaPairs: validatedQaPairs,
        resumeUrl: res.data.resumeUrl || undefined,
        uid: userDetail._id,
        jobTitle: formData.jobTitle,
        jobDescription: formData.jobDescription,
        sessionType: sessionType,
      });

      // Navigate to the "start interview" page using the _id returned by Convex
      if (savedInterview && "_id" in savedInterview) {
        router.push(`/start-interview/${savedInterview._id}/start`);
      } else {
        toast.error("Failed to create interview");
      }

    } catch (err) {
      console.error("Error submitting interview:", err);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>+ Create Interview</Button>
      </DialogTrigger>

      <DialogContent className="min-w-3xl">
        <DialogHeader>
          <DialogTitle>Interview Management</DialogTitle>
          <DialogDescription asChild>
            <Tabs defaultValue="previous-interviews" className="w-full mt-5">
              <TabsList>
                <TabsTrigger value="previous-interviews">Previous Interviews</TabsTrigger>
                <TabsTrigger value="resume-upload">Resume Upload</TabsTrigger>
                <TabsTrigger value="job-description">Job Description</TabsTrigger>
              </TabsList>

              <TabsContent value="previous-interviews">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Your Interview History</h3>
                    <div className="text-sm text-gray-500">
                      {completedSessions?.length || 0} completed interviews
                    </div>
                  </div>
                  <InterviewSessionGrid sessions={completedSessions || []} />
                </div>
              </TabsContent>

              <TabsContent value="resume-upload">
                <ResumeUpload setFiles={(file: File) => setFile(file)} />
              </TabsContent>

              <TabsContent value="job-description">
                <JobDescription
                  values={formData}
                  onHandleInputChange={(field: string, value: string) =>
                    setFormData((prev) => ({ ...prev, [field]: value }))
                  }
                />
              </TabsContent>
            </Tabs>
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex gap-6">
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <Button onClick={onSubmit} disabled={loading}>
            {loading && <Loader2Icon className="animate-spin mr-2" />}
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CreateInterviewDialog;
