"use client";
import { useEffect, useId, useImperativeHandle, useRef, useState, type InputHTMLAttributes, type Ref } from "react";
import { readableCmsError } from "@/lib/cms-feedback";
import { bindCmsUploadFiles } from "@/lib/cms-upload-feedback";

type Props = InputHTMLAttributes<HTMLInputElement> & { ref?: Ref<HTMLInputElement>; fieldError?: string };
export function CmsFileInput({ ref, onChange, onInvalid, fieldError, ...props }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const [localError, setError] = useState("");
  const error = fieldError ? readableCmsError(fieldError) : localError;
  const id = useId();
  useImperativeHandle(ref, () => input.current!);
  useEffect(() => {
    const element = input.current!;
    const showError = (event: Event) => setError((event as CustomEvent<string>).detail);
    const reset = () => { bindCmsUploadFiles(element, null); setError(""); };
    const drop = (event: DragEvent) => { bindCmsUploadFiles(element, event.dataTransfer?.files || null); setError(""); };
    const form = element.form;
    const label = element.closest("label");
    element.addEventListener("cms-upload-error", showError);
    form?.addEventListener("reset", reset);
    label?.addEventListener("drop", drop, true);
    return () => { bindCmsUploadFiles(element, null); element.removeEventListener("cms-upload-error", showError); form?.removeEventListener("reset", reset); label?.removeEventListener("drop", drop, true); };
  }, []);
  return <>
    <input {...props} ref={input} type="file" aria-invalid={error ? true : props["aria-invalid"]}
      aria-describedby={[props["aria-describedby"], error ? id : ""].filter(Boolean).join(" ") || undefined}
      onInvalid={event => { setError("Selecione um arquivo antes de continuar."); onInvalid?.(event); }}
      onChange={event => { setError(""); bindCmsUploadFiles(event.currentTarget, event.currentTarget.files); onChange?.(event); }} />
    {error ? <span id={id} className="cms-field-error" role="alert">{error}</span> : null}
  </>;
}
