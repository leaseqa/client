"use client";

import { useEffect, useState } from "react";
import { Col, Row } from "react-bootstrap";

import { Stat } from "../types";
import * as client from "../client";

import PageLoadingState from "@/components/ui/PageLoadingState";
import StatBox from "@/components/ui/StatBox";
import ProgressItem from "@/components/ui/ProgressItem";

export default function StatsPage() {
  const [stats, setStats] = useState<Stat[]>([]);
  const [breakdown, setBreakdown] = useState<Stat[]>([]);
  const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
      const response = await client.fetchStats();
      if (response.data) {
        setStats([
          { label: "Total posts", value: response.data.totalPosts || 0 },
          { label: "Open questions", value: response.data.unreadPosts || 0 },
          { label: "Attorney replies", value: response.data.lawyerResponses || 0 },
          { label: "Tenant replies", value: response.data.tenantResponses || 0 },
          { label: "Registered users", value: response.data.enrolledUsers || 0 },
          { label: "Unanswered", value: response.data.unansweredPosts || 0 },
        ]);
        setBreakdown(response.data.breakdown || []);
      }
        } catch (error) {
            console.error("Failed to load stats:", error);
        } finally {
            setLoading(false);
        }
    };

  if (loading) {
    return <PageLoadingState message="Loading stats..." />;
  }

  const maxBreakdown = Math.max(...breakdown.map((b) => b.value), 1);

  return (
    <div className="qa-page qa-stats-page">
      <section className="page-header-section">
        <h1 className="qa-page-title">Community stats</h1>
        <p className="qa-page-sub">
          A quick view of post volume, reply activity, and topic breakdown.
        </p>
      </section>

      <Row className="g-4 qa-stats-grid">
        <Col lg={5}>
          <section className="qa-stats-section">
            <div className="resources-section-head resources-section-head-compact">
              <h2 className="resources-section-title">Overview</h2>
              <p className="resources-section-copy">
                Live counts from the current Q&amp;A board.
              </p>
            </div>

            <Row className="g-3 qa-stats-overview-grid">
              {stats.map((item) => (
                <Col xs={6} md={4} lg={6} key={item.label}>
                  <StatBox label={item.label} value={item.value} />
                </Col>
              ))}
            </Row>
          </section>
        </Col>

        <Col lg={7}>
          <section className="qa-stats-section">
            <div className="resources-section-head resources-section-head-compact">
              <h2 className="resources-section-title">By topic</h2>
              <p className="resources-section-copy">
                Posts grouped by folder.
              </p>
            </div>

            <Row className="g-3 qa-stats-breakdown-grid">
              {breakdown.map((item) => (
                <Col xs={6} key={item.label}>
                  <ProgressItem
                    label={item.label}
                    value={item.value}
                    maxValue={maxBreakdown}
                  />
                </Col>
              ))}
            </Row>
          </section>
        </Col>
      </Row>
    </div>
  );
}
