"use client";

type TemplateItemProps = {
  label: string;
  description: string;
  index?: number;
  onClick?: () => void;
};

export default function TemplateItem({ label, description, index, onClick }: TemplateItemProps) {
  return (
    <div className={`template-item ${onClick ? "is-clickable" : ""}`} onClick={onClick}>
      <div className="template-item-top">
        <div className="template-item-index">{String(index ?? 0).padStart(2, "0")}</div>
        <div className="template-item-label">{label}</div>
      </div>
      <div className="template-item-description">{description}</div>
      <div className="template-item-note">Template only</div>
    </div>
  );
}
