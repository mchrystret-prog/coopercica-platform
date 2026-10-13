import { answerSegments } from "@/lib/faq-rich-text";
export function FaqAnswer({ answer, format }: { answer: string; format?: string }) {
  return <>{answerSegments(answer, format).map((segment, index) => {
    let content: React.ReactNode = segment.text;
    if (segment.bold) content = <strong>{content}</strong>;
    if (segment.italic) content = <em>{content}</em>;
    return segment.href ? <a key={index} href={segment.href} target={/^https?:/.test(segment.href) ? "_blank" : undefined} rel={/^https?:/.test(segment.href) ? "noopener noreferrer" : undefined}>{content}</a> : <span key={index}>{content}</span>;
  })}</>;
}
