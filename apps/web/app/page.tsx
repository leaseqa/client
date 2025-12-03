"use client";

import { useEffect, useState } from "react";
import { Button, Card, CardBody, CardImg, Col, Row, Stack } from "react-bootstrap";
import { Stat } from "./qa/types";
import * as client from "./qa/client";

export default function LandingPage() {
    const [stats, setStats] = useState<Stat[]>([]);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const response = await client.fetchStats();
            if (response.data) {
                setStats([
                    { label: "Unread items", value: response.data.unreadPosts || 0 },
                    { label: "Open questions", value: response.data.unansweredPosts || 0 },
                    { label: "Attorney replies", value: response.data.lawyerResponses || 0 },
                    // TODO: ai reviews not totalPosts
                    { label: "AI reviews this week", value: response.data.totalPosts || 0 },
                ]);
            }
        } catch (error) {
            console.error("Failed to load stats:", error);
        }
    };

    return (
        <div className="mb-4">
            <Card className="hero-card mb-4">
                <CardBody>
                    <div className="d-flex flex-column flex-lg-row align-items-lg-center">
                        <div className="flex-grow-1">
                            <div className="pill mb-3">Mission</div>
                            <h1 className="display-5 fw-bold">
                                where laws can&apos;t reach
                            </h1>
                            <p className="lead mb-4">
                                LeaseQA pairs AI lease review with a Piazza-style community so
                                Boston renters get clarity on edge cases and rubric-ready
                                answers.
                            </p>
                            <Stack direction="horizontal" gap={3} className="flex-wrap">
                                <Button variant="danger" href="/ai-review">
                                    Start AI review
                                </Button>
                                <Button variant="outline-light" href="/qa">
                                    Explore Q&A
                                </Button>
                            </Stack>
                        </div>
                        <div className="mt-4 mt-lg-0 ms-lg-5 text-center">
                            <div className="bg-white text-dark rounded-4 p-3 shadow-lg">
                                <div className="fw-semibold">NEU · LeaseQA</div>
                                <div className="small text-secondary">
                                    Piazza-inspired | React-Bootstrap | Mongo + Express + Next.js
                                </div>
                            </div>
                        </div>
                    </div>
                </CardBody>
            </Card>

            <Row className="g-4">
                <Col lg={6}>
                    <Card className="h-100">
                        <CardBody className="d-flex flex-column">
                            <div className="d-flex align-items-center mb-3">
                                <div className="pill">AI Review</div>
                                <div className="ms-auto text-secondary small">
                                    Claude / GPT fallback
                                </div>
                            </div>
                            <h3 className="fw-semibold">Drag & drop to generate a review</h3>
                            <p className="text-secondary">
                                Upload a PDF or paste lease text; we return rubric-aligned risks
                                and a summary you can reuse in QA.
                            </p>
                            <div className="mt-auto d-flex gap-2">
                                <Button href="/ai-review" variant="dark">
                                    Go to AI Review
                                </Button>
                                <Button href="/qa/new" variant="outline-secondary">
                                    Post to Q&A
                                </Button>
                            </div>
                        </CardBody>
                        <CardImg
                            src="images/ai-reviews.png"
                            alt="AI Review"
                            style={{ borderBottomLeftRadius: "1rem", borderBottomRightRadius: "1rem" }}
                        />
                    </Card>
                </Col>

                <Col lg={6}>
                    <Card className="h-100">
                        <CardBody className="d-flex flex-column">
                            <div className="d-flex align-items-center mb-3">
                                <div className="pill">QA Community</div>
                                <div className="ms-auto text-secondary small">
                                    Piazza style · Case filters
                                </div>
                            </div>
                            <h3 className="fw-semibold">Solve with tenants and attorneys</h3>
                            <p className="text-secondary">
                                New post, search, and filter by case type. Linked to AI review
                                results with history, resources, and stats.
                            </p>
                            <div className="mt-auto d-flex gap-2">
                                <Button href="/qa" variant="primary">
                                    Open Q&A
                                </Button>
                                <Button href="/qa/resources" variant="outline-primary">
                                    View resources
                                </Button>
                            </div>
                        </CardBody>
                        <CardImg
                            src="images/qa-community.png"
                            alt="QA Community"
                            style={{ borderBottomLeftRadius: "1rem", borderBottomRightRadius: "1rem" }}
                        />
                    </Card>
                </Col>
            </Row>

            <Card className="mt-4">
                <CardBody>
                    <Row className="g-3">
                        {stats.map((stat) => (
                            <Col key={stat.label} md={3} sm={6} xs={12}>
                                <div className="p-3 bg-light rounded-3 border h-100">
                                    <div className="text-secondary small text-uppercase">
                                        {stat.label}
                                    </div>
                                    <div className="fs-3 fw-bold text-dark">{stat.value}</div>
                                </div>
                            </Col>
                        ))}
                    </Row>
                </CardBody>
            </Card>
        </div>
    );
}