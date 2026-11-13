"use client";
import { useCallback, useState } from "react";
import { readableCmsError, type CmsMessageKind } from "@/lib/cms-feedback";

export function useCmsMessage(initial = "") {
  const [state, setState] = useState<{ message: string; kind: CmsMessageKind }>({ message: initial, kind: "error" });
  const setMessage = useCallback((message: string, kind: CmsMessageKind = "error") => setState({ message, kind }), []);
  return [state.message, setMessage, state.kind] as const;
}

export function CmsFeedback({ message, kind = "error" }: { message: string; kind?: CmsMessageKind }) {
  if (!message) return null;
  return <span className="cms-feedback" data-state={kind} role={kind === "error" ? "alert" : "status"}>
    {kind === "error" ? readableCmsError(message) : message}
  </span>;
}
