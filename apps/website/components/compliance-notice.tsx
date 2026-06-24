import { COMPLIANCE_MESSAGE } from "@/lib/content";

type ComplianceNoticeProps = {
  className?: string;
  message?: string;
};

export function ComplianceNotice({
  className,
  message = COMPLIANCE_MESSAGE,
}: ComplianceNoticeProps) {
  return <p className={className ? `compliance ${className}` : "compliance"}>{message}</p>;
}
