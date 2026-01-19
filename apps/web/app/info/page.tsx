"use client";

import {FileText, Scale, Wrench, Info, Github} from "lucide-react";
import IconCircle from "@/components/ui/IconCircle";

const team = [
    {name: "Xintao Hu", role: "Product", focus: "App design & engineering", icon: FileText},
    {name: "Dan Jackson", role: "Legal support", focus: "Policy review, attorney replies", icon: Scale},
    {name: "Eric Lai", role: "Full-stack", focus: "Next.js + Express + Mongo", icon: Wrench},
];

const accentColors = ["purple", "green", "red", "blue"];

export default function InfoPage() {
    return (
        <div className="mb-4">
            <div className="card card-hero mb-4">
                <div className="card-body p-5">
                    <div className="d-inline-flex align-items-center gap-2 pill pill-glass mb-3">
                        <Info size={14} />
                        <span>About</span>
                    </div>
                    <h1 className="display-6 fw-bold mb-3">LeaseQA Team & Credits</h1>
                    <p className="lead mb-0 opacity-75">
                        Helping Boston renters understand their rights.
                    </p>
                </div>
            </div>

            <div className="small text-secondary mb-3 fw-semibold">TEAM</div>
            <div className="row g-4 mb-4">
                {team.map((member, index) => (
                    <div className="col-md-6 col-lg-4" key={member.name}>
                        <div className={`card card-base card-accent-${accentColors[index % accentColors.length]} h-100`}>
                            <div className="card-body p-4">
                                <IconCircle size="lg" variant={accentColors[index % accentColors.length] as "purple" | "green" | "red" | "blue"} icon={member.icon} className="mb-3" />
                                <div className="fw-bold mb-1">{member.name}</div>
                                <span className="pill mb-2">{member.role}</span>
                                <div className="text-muted-light small mt-2">{member.focus}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="d-flex justify-content-center mt-5 mb-5" style={{paddingTop: "2rem"}}>
                <a
                    href="https://github.com/leaseqa"
                    target="_blank"
                    rel="noreferrer"
                    className="text-decoration-none"
                    aria-label="Visit LeaseQA on GitHub"
                >
                    <Github size={48} className="text-secondary" />
                </a>
            </div>
        </div>
    );
}
