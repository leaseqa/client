"use client";

import { useSelector } from "react-redux";
import { Badge, Button, Card, CardBody, Col, Row, Stack } from "react-bootstrap";
import { FaRobot, FaSignInAlt, FaUserPlus, FaHistory, FaShieldAlt, FaFileAlt, FaComments, FaBookmark } from "react-icons/fa";
import { RootState } from "../store";

export default function AccountPage() {
    const user = useSelector((state: RootState) => state.session.user);

    const recentActions = [
        { icon: FaFileAlt, text: "Linked AI review to QA post", time: "2 hours ago" },
        { icon: FaBookmark, text: "Saved draft under Maintenance folder", time: "Yesterday" },
        { icon: FaComments, text: "Followed 2 attorney answers", time: "3 days ago" },
    ];

    return (
        <div className="mb-4">
            <Card
                className="mb-4 border-0 text-white"
                style={{
                    background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
                    borderRadius: "1.5rem",
                    overflow: "hidden"
                }}
            >
                <CardBody className="p-4">
                    <Row className="align-items-center">
                        <Col>
                            <div className="d-flex align-items-center gap-4">
                                <div
                                    className="rounded-circle d-flex align-items-center justify-content-center fw-bold"
                                    style={{
                                        width: 80,
                                        height: 80,
                                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                        fontSize: "1.5rem",
                                        border: "3px solid rgba(255,255,255,0.2)"
                                    }}
                                >
                                    {user?.name?.slice(0, 2).toUpperCase() || "?"}
                                </div>
                                <div>
                                    <h2 className="fw-bold mb-1">{user?.name || "Guest User"}</h2>
                                    <div className="opacity-75 mb-2">{user?.email || "Not signed in"}</div>
                                    {user && (
                                        <Badge
                                            className="px-3 py-2"
                                            style={{
                                                background: "rgba(255,255,255,0.15)",
                                                border: "1px solid rgba(255,255,255,0.2)",
                                                borderRadius: "2rem"
                                            }}
                                        >
                                            {user.role === "lawyer" ? "⚖️" : user.role === "admin" ? "🛡️" : "🏠"} {user.role}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </Col>
                        <Col xs="auto">
                            <Button
                                href="/ai-review"
                                variant="danger"
                                className="d-flex align-items-center gap-2"
                                style={{ borderRadius: "2rem", padding: "0.75rem 1.5rem" }}
                            >
                                <FaRobot />
                                Use AI Review
                            </Button>
                        </Col>
                    </Row>
                </CardBody>
            </Card>

            <Row className="g-4">
                <Col lg={6}>
                    <Card
                        className="h-100 border-0 shadow-sm"
                        style={{
                            borderRadius: "1rem",
                            overflow: "hidden",
                            borderTop: "4px solid #764ba2"
                        }}
                    >
                        <CardBody className="p-4">
                            <div className="d-flex align-items-center gap-3 mb-4">
                                <div
                                    className="d-flex align-items-center justify-content-center rounded-circle"
                                    style={{
                                        width: 48,
                                        height: 48,
                                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                                    }}
                                >
                                    <FaShieldAlt className="text-white" size={20} />
                                </div>
                                <div>
                                    <div className="fw-bold">Access Control</div>
                                    <div className="text-secondary small">Sign in to unlock features</div>
                                </div>
                            </div>

                            <p className="text-secondary mb-4">
                                AI review, posting questions, and attorney replies require authentication.
                            </p>

                            <Stack gap={3}>
                                <Button
                                    variant="dark"
                                    className="d-flex align-items-center justify-content-center gap-2"
                                    style={{ borderRadius: "2rem" }}
                                >
                                    <FaSignInAlt />
                                    Sign In
                                </Button>
                                <Button
                                    variant="outline-secondary"
                                    className="d-flex align-items-center justify-content-center gap-2"
                                    style={{ borderRadius: "2rem" }}
                                >
                                    <FaUserPlus />
                                    Create Account
                                </Button>
                            </Stack>
                        </CardBody>
                    </Card>
                </Col>

                <Col lg={6}>
                    <Card
                        className="h-100 border-0 shadow-sm"
                        style={{
                            borderRadius: "1rem",
                            overflow: "hidden",
                            borderTop: "4px solid #11998e"
                        }}
                    >
                        <CardBody className="p-4">
                            <div className="d-flex align-items-center gap-3 mb-4">
                                <div
                                    className="d-flex align-items-center justify-content-center rounded-circle"
                                    style={{
                                        width: 48,
                                        height: 48,
                                        background: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)"
                                    }}
                                >
                                    <FaHistory className="text-white" size={20} />
                                </div>
                                <div>
                                    <div className="fw-bold">Recent Activity</div>
                                    <div className="text-secondary small">Your latest actions</div>
                                </div>
                            </div>

                            <Stack gap={3}>
                                {recentActions.map((action, index) => (
                                    <div
                                        key={index}
                                        className="d-flex align-items-center gap-3 p-3 rounded-3"
                                        style={{ background: "#f8f9fa" }}
                                    >
                                        <div
                                            className="d-flex align-items-center justify-content-center rounded-circle"
                                            style={{
                                                width: 36,
                                                height: 36,
                                                background: "#e9ecef"
                                            }}
                                        >
                                            <action.icon className="text-secondary" size={14} />
                                        </div>
                                        <div className="flex-grow-1">
                                            <div className="small">{action.text}</div>
                                            <div className="text-secondary small">{action.time}</div>
                                        </div>
                                    </div>
                                ))}
                            </Stack>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        </div>
    );
}