"use client";

import {useMemo} from "react";
import useSWR from "swr";
import {Col, Row} from "react-bootstrap";
import {Stat} from "./qa/types";
import * as client from "./client";
import HeroCard from "@/components/ui/HeroCard";
import AccentCard from "@/components/ui/AccentCard";
import IconCircle from "@/components/ui/IconCircle";
import {HomePageIcons} from "@/components/ui/icons";

const statsFetcher = async () => {
    const response = await client.fetchStats();
    if (response && response.data) {
        return [
            {label: "Admin Posts", value: response.data.adminPosts || 0},
            {label: "Open questions", value: response.data.unansweredPosts || 0},
            {label: "Attorney replies", value: response.data.lawyerResponses || 0},
            {label: "AI reviews this week", value: response.data.totalPosts || 0},
        ];
    }
    return [
        {label: "Admin Posts", value: 0},
        {label: "Open questions", value: 0},
        {label: "Attorney replies", value: 0},
        {label: "AI reviews this week", value: 0},
    ];
};

export default function LandingPage() {
    const {data: stats = [
        {label: "Admin Posts", value: 0},
        {label: "Open questions", value: 0},
        {label: "Attorney replies", value: 0},
        {label: "AI reviews this week", value: 0},
    ]} = useSWR("stats/overview", statsFetcher, {
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
        dedupingInterval: 30000, // Cache for 30 seconds
        fallbackData: [
            {label: "Admin Posts", value: 0},
            {label: "Open questions", value: 0},
            {label: "Attorney replies", value: 0},
            {label: "AI reviews this week", value: 0},
        ],
    });

    const statConfig = [
        {icon: HomePageIcons.mail, gradient: "bg-gradient-green"},
        {icon: HomePageIcons.question, gradient: "bg-gradient-red"},
        {icon: HomePageIcons.legal, gradient: "bg-gradient-warning"},
        {icon: HomePageIcons.ai, gradient: "bg-gradient-blue"},
    ];

    return (
        <div className="d-flex flex-column h-100">
            <div className="mb-2 d-flex align-items-center" style={{flex: "0 0 auto", minHeight: "200px"}}>
                <HeroCard className="w-100">
                    <Row className="align-items-center w-100">
                        <Col lg={12}>
                            <div className="d-inline-flex align-items-center gap-2 pill pill-glass mb-3">
                                <HomePageIcons.home size={12} />
                                <span className="small">Boston Renter Protection</span>
                            </div>
                            <h1 className="h2 fw-bold mb-3">
                                <span>We help you understand</span>
                            </h1>
                            <p className="mb-0" style={{fontSize: "0.95rem"}}>
                                LeaseQA pairs AI lease review with a Q&A community so renters get clarity on edge cases and feasible solutions.
                            </p>
                        </Col>
                    </Row>
                </HeroCard>
            </div>

            <Row className="g-3 mb-2 flex-grow-1" style={{flex: "1 1 0"}}>
                <Col lg={6} className="d-flex">
                    <AccentCard accent="purple" className="h-100 shadow w-100 d-flex flex-column">
                        <div className="d-flex align-items-center mb-3">
                            <IconCircle size="lg" variant="purple" icon={HomePageIcons.ai} className="me-3" />
                            <div>
                                <div className="fw-bold">AI Review</div>
                                <div className="text-muted-light small">AI powered</div>
                            </div>
                        </div>
                        <h3 className="h5 fw-bold mb-3">Drag & drop to generate a review</h3>
                        <p className="text-muted-light mb-4 flex-grow-1">
                            Upload a PDF or paste lease text. We return rubric-aligned risks
                            and a summary you can reuse in Q&A.
                        </p>
                        <div className="d-flex gap-2 mt-auto">
                            <a href="/ai-review" className="btn-unified btn-unified-primary btn-unified-md">
                                Go to AI Review →
                            </a>
                        </div>
                    </AccentCard>
                </Col>

                <Col lg={6} className="d-flex">
                    <AccentCard accent="green" className="h-100 shadow w-100 d-flex flex-column">
                        <div className="d-flex align-items-center mb-3">
                            <IconCircle size="lg" variant="green" icon={HomePageIcons.community} className="me-3" />
                            <div>
                                <div className="fw-bold">QA Community</div>
                                <div className="text-muted-light small">Piazza-style forum</div>
                            </div>
                        </div>
                        <h3 className="h5 fw-bold mb-3">Solve with tenants & attorneys</h3>
                        <p className="text-muted-light mb-4 flex-grow-1">
                            Post questions, search answers, and filter by case type.
                            Linked to AI review results with history and resources.
                        </p>
                        <div className="d-flex gap-2 mt-auto">
                            <a href="/qa" className="btn-unified btn-unified-success btn-unified-md">
                                Open Q&A →
                            </a>
                        </div>
                    </AccentCard>
                </Col>
            </Row>

            <div className="flex-grow-1 d-flex flex-column" style={{flex: "1 1 0"}}>
                <AccentCard accent="blue" className="shadow h-100 d-flex flex-column">
                    <div className="text-center mb-4">
                        <div className="d-inline-flex align-items-center gap-2 pill mb-2">
                            <HomePageIcons.stats size={16} />
                            <span>Live Stats</span>
                        </div>
                        <h2 className="h5 fw-bold mb-0">Community Activity</h2>
                    </div>
                    <Row className="g-3 flex-grow-1 align-items-stretch">
                        {stats.map((stat, index) => {
                            const StatIcon = statConfig[index].icon;
                            return (
                                <Col key={stat.label} md={3} sm={6} xs={12} className="d-flex">
                                    <div className={`p-4 rounded-4 text-white w-100 d-flex flex-column justify-content-between ${statConfig[index].gradient}`}>
                                        <div className="d-flex justify-content-between align-items-start mb-3">
                                            <StatIcon size={32} strokeWidth={1.5} />
                                        </div>
                                        <div>
                                            <div className="display-5 fw-bold mb-2">{stat.value}</div>
                                            <div className="small opacity-75 text-uppercase">{stat.label}</div>
                                        </div>
                                    </div>
                                </Col>
                            );
                        })}
                    </Row>
                </AccentCard>
            </div>
        </div>
    );
}