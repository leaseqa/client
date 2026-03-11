"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import { Col, Row } from "react-bootstrap";

import { RootState } from "@/app/store";

import { Folder, Post } from "./types";
import { ComposeState, INITIAL_COMPOSE_STATE } from "./constants";
import * as client from "./client";
import { getTopicLabel } from "@/app/lib/reviewFollowUp";

import ScenarioFilter from "./components/ScenarioFilter";
import QAToolbar from "./components/QAToolbar";
import RecencySidebar from "./components/RecencySidebar";
import FeedHeader from "./components/FeedHeader";
import AnnouncementSection from "./components/AnnouncementSection";
import ComposeForm from "./components/ComposeForm";
import PinPostsSection from "./components/PinPostsSection";
import PostDetailSection from "./components/PostDetailSection";
import PageLoadingState from "@/components/ui/PageLoadingState";

function QAPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const session = useSelector((state: RootState) => state.session);

  const scenario = searchParams.get("scenario") || "all";
  const searchParam = searchParams.get("search") || "";
  const composeParam = searchParams.get("compose") === "1";
  const postIdParam = searchParams.get("post");
  const draftSourceParam = searchParams.get("draftSource") || "";
  const draftSummaryParam = searchParams.get("draftSummary") || "";
  const draftDetailsParam = searchParams.get("draftDetails") || "";
  const draftFoldersParam = searchParams.get("draftFolders") || "";
  const draftUrgencyParam = searchParams.get("draftUrgency") || "";

  const [folders, setFolders] = useState<Folder[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState("");
  const [composeState, setComposeState] = useState<ComposeState>(
    INITIAL_COMPOSE_STATE,
  );
  const [showResolved, setShowResolved] = useState(false);
  const [bucketOpen, setBucketOpen] = useState<Record<string, boolean>>({
    thisWeek: true,
    lastWeek: true,
    thisMonth: true,
    earlier: true,
  });

  useEffect(() => {
    if (session.status === "unauthenticated") {
      const query = searchParams.toString();
      const nextHref = query ? `/qa?${query}` : "/qa";
      router.replace(`/auth/login?next=${encodeURIComponent(nextHref)}`);
    } else if (
      session.status === "authenticated" ||
      session.status === "guest"
    ) {
      loadData();
    }
  }, [session.status, router, searchParams]);

  useEffect(() => {
    setSearch(searchParam);
  }, [searchParam, scenario]);

  useEffect(() => {
    if (!composeParam) {
      return;
    }

    const normalizedUrgency =
      draftUrgencyParam === "high" ||
      draftUrgencyParam === "medium" ||
      draftUrgencyParam === "low"
        ? draftUrgencyParam
        : INITIAL_COMPOSE_STATE.urgency;
    const queryFolders = draftFoldersParam
      .split(",")
      .map((folder) => folder.trim())
      .filter(Boolean);
    const nextFolders = Array.from(
      new Set(
        queryFolders.length > 0
          ? queryFolders
          : scenario !== "all"
            ? [scenario]
            : [],
      ),
    );

    setComposeState({
      ...INITIAL_COMPOSE_STATE,
      summary: draftSummaryParam,
      details: draftDetailsParam,
      folders: nextFolders,
      urgency: normalizedUrgency,
    });
    setPostError("");
  }, [
    composeParam,
    draftDetailsParam,
    draftFoldersParam,
    draftSummaryParam,
    draftUrgencyParam,
    scenario,
  ]);

  const loadData = async () => {
    try {
      setLoading(true);
      const foldersResponse = await client.fetchFolders();
      setFolders(foldersResponse.data || []);
      const postsResponse = await client.fetchPosts({});
      setPosts(postsResponse.data || []);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      if (showResolved && !post.isResolved) {
        return false;
      }
      if (!showResolved && post.isResolved) {
        return false;
      }

      if (search) {
        const query = search.toLowerCase();
        if (
          !post.summary.toLowerCase().includes(query) &&
          !post.details.toLowerCase().includes(query)
        ) {
          return false;
        }
      }

      if (scenario !== "all" && !post.folders.includes(scenario)) {
        return false;
      }

      return true;
    });
  }, [posts, search, scenario, showResolved]);

  const folderDisplayMap = useMemo(() => {
    return folders.reduce<Record<string, string>>((result, folder) => {
      result[folder.name] = folder.displayName || folder.name;
      return result;
    }, {});
  }, [folders]);

  const activeScenarioLabel =
    scenario === "all"
      ? "All topics"
      : folderDisplayMap[scenario] || getTopicLabel(scenario);
  const selectedComposeLabels = composeState.folders.map(
    (folder) => folderDisplayMap[folder] || getTopicLabel(folder),
  );
  const isAiReviewDraft = draftSourceParam === "ai-review";
  const showFeed = !composeParam && !postIdParam;

  const handleSelectPost = (id: string) => {
    router.push(`/qa?post=${id}`);
  };

  const handleClosePost = () => {
    router.push("/qa");
  };

  const resetCompose = () => {
    setComposeState(INITIAL_COMPOSE_STATE);
    setPostError("");
    router.push("/qa");
  };

  const handleSubmitPost = async () => {
    setPostError("");
    if (!composeState.summary.trim()) {
      setPostError("Title is required");
      return;
    }
    if (!composeState.details.trim()) {
      setPostError("Content is required");
      return;
    }
    setPosting(true);
    try {
      const response = await client.createPost({
        summary: composeState.summary,
        details: composeState.details,
        folders:
          composeState.folders.length > 0
            ? composeState.folders
            : ["uncategorized"],
        postType: composeState.postType,
        audience: composeState.audience,
        urgency: composeState.urgency,
        isAnonymous: composeState.isAnonymous,
      });
      const newPost = (response as { data?: Post }).data || (response as Post);
      if (newPost?._id && composeState.files.length > 0) {
        await client
          .uploadPostAttachments(newPost._id, composeState.files)
          .catch(console.error);
      }
      await loadData();
      resetCompose();
      if (newPost?._id) {
        router.push(`/qa?post=${newPost._id}`);
      }
    } catch (error: unknown) {
      const typedError = error as { message?: string };
      setPostError(typedError.message || "Failed to create post");
    } finally {
      setPosting(false);
    }
  };

  if (session.status === "loading" || session.status === "unauthenticated") {
    return (
      <PageLoadingState
        message={
          session.status === "loading" ? "Loading questions..." : "Redirecting to login..."
        }
      />
    );
  }

  if (loading) {
    return <PageLoadingState message="Loading questions..." />;
  }

  if (composeParam) {
    return (
      <div className="qa-compose-page">
        <section className="qa-compose-header">
          <span className="landing-eyebrow">
            {isAiReviewDraft ? "From lease review" : "New question"}
          </span>
          <h1 className="qa-page-title">
            {isAiReviewDraft
              ? "Clean up the draft, then post it."
              : "Ask one clear question."}
          </h1>
          <p className="qa-page-sub">
            {isAiReviewDraft
              ? "This draft includes your review summary and suggested sections."
              : "Keep it short. Add the clause or timeline in the details box."}
          </p>
        </section>

        <Row className="g-4">
          <Col lg={8}>
            <ComposeForm
              composeState={composeState}
              folders={folders}
              prefillSource={draftSourceParam || undefined}
              posting={posting}
              postError={postError}
              onUpdateAction={(updates) =>
                setComposeState((previousState) => ({
                  ...previousState,
                  ...updates,
                }))
              }
              onSubmitAction={handleSubmitPost}
              onCancelAction={resetCompose}
            />
          </Col>

          <Col lg={4}>
            <div className="qa-compose-side-stack">
              <div className="qa-compose-side-panel">
                <div className="qa-sidebar-label">Draft includes</div>
                {selectedComposeLabels.length > 0 && (
                  <div className="qa-side-tag-row">
                    {selectedComposeLabels.map((label) => (
                      <span key={label} className="qa-side-tag">
                        {label}
                      </span>
                    ))}
                  </div>
                )}
                <div className="qa-side-metric">
                  <span className="qa-side-metric-label">Urgency</span>
                  <span className="qa-side-metric-value">
                    {composeState.urgency}
                  </span>
                </div>
              </div>

              <div className="qa-compose-side-panel">
                <div className="qa-sidebar-label">Before posting</div>
                <ul className="qa-side-list">
                  <li>Keep the title to one plain-language question.</li>
                  <li>Include the clause or timeline you want checked.</li>
                </ul>
              </div>
            </div>
          </Col>
        </Row>
      </div>
    );
  }

  return (
    <div className="qa-page">
      <section className="qa-header-section">
        <div className="qa-header-top">
          <div>
            <h1 className="qa-page-title">
              {scenario === "all" ? "Community questions" : activeScenarioLabel}
            </h1>
            <p className="qa-page-sub">
              {scenario === "all"
                ? "Browse by topic, or open a new question."
                : `Filtered to ${activeScenarioLabel}.`}
            </p>
          </div>
          <div className="qa-header-meta">
            <span className="qa-header-count">{filteredPosts.length} open</span>
            <span className="qa-header-count">{folders.length} topics</span>
          </div>
        </div>

        <div className="qa-controls-row">
          <ScenarioFilter />
          <QAToolbar
            initialSearch={searchParam}
            onSearchChangeAction={setSearch}
            showResolved={showResolved}
            onToggleResolvedAction={() =>
              setShowResolved((currentValue) => !currentValue)
            }
          />
        </div>
      </section>

      <Row className="g-4 qa-browse-grid">
        <Col lg={3}>
          <div className="qa-sidebar-flat">
            <div className="qa-sidebar-label">Recent</div>
            <RecencySidebar
              posts={filteredPosts}
              currentPostId={postIdParam}
              onSelectPost={handleSelectPost}
              folderDisplayMap={folderDisplayMap}
              bucketOpen={bucketOpen}
              onToggleBucket={(key) =>
                setBucketOpen((previousState) => ({
                  ...previousState,
                  [key]: !previousState[key],
                }))
              }
            />
          </div>
        </Col>

        <Col lg={9}>
          {showFeed && (
            <div className="qa-feed-stack">
              {filteredPosts.length > 0 ? (
                <>
                  <PinPostsSection posts={filteredPosts} folders={folders} />
                  <AnnouncementSection
                    posts={filteredPosts}
                    folders={folders}
                  />
                  <FeedHeader folders={folders} posts={filteredPosts} />
                </>
              ) : (
                <div className="qa-empty-flat">
                  <div className="qa-empty-title">Nothing here yet</div>
                  <p className="qa-empty-desc">
                    Try another topic, or start the first question.
                  </p>
                </div>
              )}
            </div>
          )}

          {postIdParam && (
            <PostDetailSection
              postId={postIdParam}
              folders={folders}
              onCloseAction={handleClosePost}
              onPostUpdatedAction={loadData}
            />
          )}
        </Col>
      </Row>
    </div>
  );
}

export default function QAPage() {
  return (
    <Suspense fallback={<PageLoadingState message="Loading questions..." />}>
      <QAPageInner />
    </Suspense>
  );
}
