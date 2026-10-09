import type { ReactNode } from "react";
import { uploadRequirements, type UploadRuleKey } from "@/lib/cms-upload-rules";
export function UploadRequirements({ rule, children }: { rule: UploadRuleKey; children?: ReactNode }) {
  return <small>{uploadRequirements(rule)}{children ? <> {children}</> : null}</small>;
}
