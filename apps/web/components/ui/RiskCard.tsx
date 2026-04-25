"use client";
import { RiskCardProps } from "@/app/ai-review/types";

const config = {
  danger: { label: "High", dotClass: "risk-dot-danger" },
  warning: { label: "Medium", dotClass: "risk-dot-warning" },
  success: { label: "Low", dotClass: "risk-dot-success" },
};

export default function RiskCard({ tone, title, items }: RiskCardProps) {
  const { label, dotClass } = config[tone];

  return (
    <div className={`risk-card risk-card-${tone}`}>
      <div className="risk-card-header">
        <span className={`risk-dot ${dotClass}`}/>
        <div>
          <div className="risk-card-label">{label}</div>
          <div className="risk-card-title">{title}</div>
        </div>
        <span className="risk-card-count">
                    {items.length}
                </span>
      </div>
      {items.length > 0 ? (
        <ul className="risk-card-list">
          {items.map((item, index) => (
            <li key={index}>
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <div className="risk-card-empty">No issues found</div>
      )}
    </div>
  );
}
