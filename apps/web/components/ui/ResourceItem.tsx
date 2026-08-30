"use client";

import Link from "next/link";
import { ExternalLink, type LucideIcon } from "lucide-react";

type ResourceItemProps = {
  icon: LucideIcon;
  title: string;
  summary: string;
  link: string;
};

export default function ResourceItem({ icon: Icon, title, summary, link }: ResourceItemProps) {
  return (
    <div className="resource-item">
      <div className="resource-item-main">
        <div className="resource-icon resource-icon-elevated">
          <Icon className="text-secondary" size={16}/>
        </div>
        <div className="resource-item-copy">
          <div className="resource-item-eyebrow">Official guide</div>
          <div className="resource-item-title">{title}</div>
          <div className="resource-item-summary">{summary}</div>
        </div>
      </div>
      <div className="resource-item-action">
        <Link href={link} target="_blank"
      rel="noopener noreferrer" className="resource-link">
          <span>Open</span>
          <ExternalLink size={12}/>
        </Link>
      </div>
    </div>
  );
}
