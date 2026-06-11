"use client";
import { useState, useRef } from "react";

type Status = "idle" | "loading" | "success" | "cadence-select" | "cadence-loading" | "done" | "error";

export function useSignup(source: string = "main") {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const savedEmail = useRef("");

  async function submit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!email || status === "loading") return;

    setStatus("loading");
    setMessage("");
    savedEmail.current = email;

    try {
      const res = await fetch("/tsg/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source }),
      });

      if (res.ok) {
        setStatus("cadence-select");
        setEmail("");
      } else {
        const data = await res.json();
        setStatus("error");
        setMessage(data.error || "Something went wrong.");
      }
    } catch {
      setStatus("error");
      setMessage("Connection failed. Try again.");
    }
  }

  async function submitCadence(cadence: "weekly" | "monthly") {
    setStatus("cadence-loading");
    try {
      await fetch("/tsg/api/signup", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: savedEmail.current, cadence }),
      });
    } catch {
      // Non-blocking — cadence defaults to weekly if patch fails
    }
    setStatus("done");
  }

  return { email, setEmail, status, message, submit, submitCadence };
}
