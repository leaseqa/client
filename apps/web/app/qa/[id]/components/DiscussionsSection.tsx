import React from "react";
import {FaEdit, FaReply, FaTrash} from "react-icons/fa";
import {format} from "date-fns";
import dynamic from "next/dynamic";
import {Discussion, DiscussionsSectionProps} from "../../types";

const ReactQuill = dynamic(() => import("react-quill-new"), {ssr: false});

export default function DiscussionsSection({
                                               discussions,
                                               currentUserId,
                                               currentRole,
                                               isGuest = false,
                                               showFollowBox,
                                               followFocused,
                                               discussionDrafts,
                                               discussionReplying,
                                               discussionEditing,
                                               onShowFollowBox,
                                               onFollowFocus,
                                               onDraftChange,
                                               onSubmit,
                                               onUpdate,
                                               onDelete,
                                               onReply,
                                               onEdit,
                                               onCancelReply,
                                               onCancelEdit,
                                           onClearFollow,
                                       }: DiscussionsSectionProps) {
    const canEdit = (node: Discussion) => !isGuest && (currentRole === "admin" || node.authorId === currentUserId);

    const renderDiscussion = (node: Discussion, depth = 0) => {
        const isReplying = discussionReplying === node._id;
        const isEditing = discussionEditing === node._id;
        const replyKey = `reply_${node._id}`;

        return (
            <div key={node._id} className={`post-discussion-item ${depth > 0 ? "post-discussion-reply" : ""}`}>
                <div className="post-discussion-header">
                    <span className="post-discussion-author">
                        {node.author?.username || node.author?.email || "Unknown"}
                    </span>
                    <span className="post-discussion-date">
                        {node.createdAt ? format(new Date(node.createdAt), "MMM d, yyyy") : ""}
                    </span>
                    {canEdit(node) && (
                        <div className="post-discussion-actions">
                            <button onClick={() => onEdit(node._id, node.content)} type="button">
                                <FaEdit size={12}/>
                            </button>
                            <button onClick={() => onDelete(node._id)} type="button">
                                <FaTrash size={12}/>
                            </button>
                        </div>
                    )}
                </div>

                {isEditing ? (
                    <div className="post-editor-box">
                        <ReactQuill
                            theme="snow"
                            value={discussionDrafts[node._id] || ""}
                            onChange={(val) => onDraftChange(node._id, val)}
                        />
                        <div className="post-editor-actions">
                            <button className="post-btn primary" onClick={() => onUpdate(node._id)} type="button">
                                Save
                            </button>
                            <button className="post-btn secondary" onClick={onCancelEdit} type="button">
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="post-discussion-content" dangerouslySetInnerHTML={{__html: node.content}}/>
                )}

                {!isGuest && !isEditing && (
                    <button className="post-discussion-reply-btn" onClick={() => onReply(node._id)} type="button">
                        <FaReply size={10}/>
                        <span>Reply</span>
                    </button>
                )}

                {isReplying && !isEditing && (
                    <div className="post-editor-box" style={{marginTop: "0.75rem"}}>
                        <ReactQuill
                            theme="snow"
                            value={discussionDrafts[replyKey] || ""}
                            onChange={(val) => onDraftChange(replyKey, val)}
                            placeholder="Write a reply..."
                        />
                        <div className="post-editor-actions">
                            <button className="post-btn primary" onClick={() => onSubmit(node._id)} type="button">
                                Reply
                            </button>
                            <button className="post-btn secondary" onClick={onCancelReply} type="button">
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {node.replies && node.replies.length > 0 && (
                    <div className="post-discussion-replies">
                        {node.replies.map((r) => renderDiscussion(r, depth + 1))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <section className="post-detail-card post-detail-card-secondary qa-v2-panel">
            <div className="post-section-header">
                <div>
                    <div className="post-section-kicker">Thread</div>
                    <h2 className="post-section-title">Follow-up Discussion</h2>
                </div>
            </div>

            {!isGuest && !showFollowBox && (
                <button className="post-btn primary" onClick={onShowFollowBox} type="button">
                    Write follow-up
                </button>
            )}

            {!isGuest && showFollowBox && (
                <div className="post-editor-box">
                    <ReactQuill
                        theme="snow"
                        value={discussionDrafts["root"] || ""}
                        onFocus={onFollowFocus}
                        onChange={(val) => onDraftChange("root", val)}
                        placeholder="Start a discussion..."
                    />
                    <div className="post-editor-actions">
                        <button className="post-btn primary" onClick={() => onSubmit(null)} type="button">
                            Post follow-up
                        </button>
                        <button className="post-btn secondary" onClick={onClearFollow} type="button">
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {discussions.length === 0 && !showFollowBox && (
                <p className="post-empty-note">No follow-up yet. Use this thread to clarify timelines or next steps.</p>
            )}

            {discussions.length > 0 && (
                <div className="post-discussions-list">
                    {discussions.map((d) => renderDiscussion(d))}
                </div>
            )}
        </section>
    );
}
