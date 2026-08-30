"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Col, Row } from "react-bootstrap";

import { Stat } from "../types";
import * as client from "../client";
import { isApiError } from "@/app/lib/api/client";

import PageLoadingState from "@/components/ui/PageLoadingState";
import RemoteDataState from "@/components/ui/RemoteDataState";
import StatBox from "@/components/ui/StatBox";
import ProgressItem from "@/components/ui/ProgressItem";

type AccessState = "ok" | "signed-out" | "forbidden" | "error";

export default function StatsPage() {
  const [stats, setStats] = useState<Stat[]>([]);
  const [breakdown, setBreakdown] = useState<Stat[]>([]);
  const [loading, setLoading] = useState(true);
  const [access, setAccess] = useState<AccessState>("ok");

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await client.fetchStats();
      if ( response.data ) {
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
      setAccess("ok");
    } catch ( error ) {
      console.error("Failed to load stats:", error);
      if ( isApiError(error) && error.status === 401 ) {
        setAccess("signed-out");
      } else if ( isApiError(error) && error.status === 403 ) {
        setAccess("forbidden");
      } else {
        setAccess("error");
      }
    } finally {
      setLoading(false);
    }
  };

  if ( loading ) {
    return <PageLoadingState message="Loading stats..."/>;
  }

  if ( access !== "ok" ) {
    // Being signed out or lacking the admin role is a permission state, not a
    // failure — only the third case is an error, and they should not look alike.
    const { kind, title, copy } = {
      "signed-out": {
        kind: "permission" as const,
        title: "Sign in to see stats",
        copy: "Community stats are visible to signed-in members.",
      },
      forbidden: {
        kind: "permission" as const,
        title: "Admins only",
        copy: "Stats are limited to administrator accounts.",
      },
      error: {
        kind: "error" as const,
        title: "Couldn’t load stats",
        copy: "The stats service didn’t respond. Retry in a moment.",
      },
    }[access];

    return (
      <div className="qa-page qa-stats-page">
        <section className="page-header-section">
          <h1 className="qa-page-title">Community stats</h1>
        </section>
        <div className="qa-empty-flat">
          <RemoteDataState kind={kind} title={title} description={copy}/>
          {access === "signed-out" && (
            <Link
              className="qa-empty-action"
              href={`/auth/login?next=${encodeURIComponent("/qa/stats")}`}
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    );
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
                  <StatBox label={item.label} value={item.value}/>
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
