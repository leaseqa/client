"use client";

type StatBoxProps = {
  label: string;
  value: number | string;
};

export default function StatBox({ label, value }: StatBoxProps) {
  return (
    <div className="stat-box">
      <div className="stat-box-label">{label}</div>
      <div className="stat-box-value">{value}</div>
    </div>
  );
}
