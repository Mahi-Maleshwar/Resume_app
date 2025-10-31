"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Send } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import React, { useState } from "react";

export default function Interview() {
  const { interviewid } = useParams();
  const [email, setEmail] = useState("");

  if (!interviewid) {
    return <div className="p-4 text-red-500">Interview ID missing!</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center mt-24">
      <div className="max-w-3xl w-full">
        <Image
          src="/interview2.jpg"
          alt="interview"
          width={400}
          height={200}
          className="w-full h-[300px] object-cover"
        />
        <div className="p-6 flex flex-col items-center space-y-5">
          <h2 className="font-bold text-3xl text-center">Ready to Start Interview?</h2>
          <p className="text-gray-500 text-center">
            The Interview will last 30 minutes. Are you ready to begin?
          </p>

          <Link href={`/start-interview/${interviewid}/start`}>
            <Button>Start Interview <ArrowRight /></Button>
          </Link>

          <hr className="w-full border-gray-200 my-6" />

          <div className="p-6 bg-gray-50 rounded-2xl w-full">
            <h2 className="font-semibold text-2xl">Send interview link?</h2>
            <div className="flex gap-5 w-full max-w-xl mt-4">
              <Input
                placeholder="Enter email address"
                className="flex-1"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
              <Button onClick={() => alert(`Interview link sent to ${email}`)}>
                <Send />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
