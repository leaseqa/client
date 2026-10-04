"use client";

type ProgressItemProps = {
  label: string;
  value: number;
  maxValue: number;
};

export default function ProgressItem({ label, value, maxValue }: ProgressItemProps) {
  const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;

  return (
    <div className="progress-item">
      <div className="progress-item-head">
        <span>{label}</span>
        <span className="progress-item-value">{value}</span>
      </div>
      <div className="progress-bar-container">
        <div className="progress-bar-fill" style={{ width: `${percentage}%` }}/>
      </div>
    </div>
  );
}
