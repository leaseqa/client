# Rubric Checklist

> Use checkboxes for self-review during development.

## Q&A Screen (33 points)

| Status | Requirement |
| ------ | ----------- |
| ⬜ | Clicking Piazza / LeaseQA navigation enters Q&A page |
| ⬜ | Q&A is the default selected tab |
| ⬜ | Fixed navbar displays project/course name |
| ⬜ | Each course/space has its own instance (mapped to rental categories) |
| ⬜ | Q&A tab links to question list |
| ⬜ | Manage Class tab links to admin page |
| ⬜ | Fixed category filter bar (lease_review, deposit, maintenance, etc.) |
| ⬜ | Category filtering works correctly |
| ⬜ | List area maintains two-column layout (sidebar + content) |

## Posts Sidebar (15 points)

| Status | Requirement |
| ------ | ----------- |
| ⬜ | Collapse button provided (expanded by default) |
| ⬜ | Expand/collapse state persists |
| ⬜ | Posts sorted in reverse chronological order |
| ⬜ | List items display summary, role, timestamp |
| ⬜ | Accordion groups by Today / Yesterday / Last Week |

## Posting New Questions (27 points)

| Status | Requirement |
| ------ | ----------- |
| ⬜ | Clicking "New Post" enters posting interface |
| ⬜ | Post type tabs: Question (default), Note (reserved), Poll (placeholder) |
| ⬜ | Send to: Entire Class (default), Specific users (optional) |
| ⬜ | Multi-select categories (at least 1 required) |
| ⬜ | Summary field required, ≤ 100 characters |
| ⬜ | Details use rich text editor, required |
| ⬜ | Email notification settings ignored |
| ⬜ | "Post" creates the post, "Cancel" returns to list |
| ⬜ | Missing required fields show validation prompts |

## Viewing & Replying (33 points)

| Status | Requirement |
| ------ | ----------- |
| ⬜ | Current post highlighted in sidebar |
| ⬜ | Post details show view count, categories, author, edit button, action dropdown |
| ⬜ | Lawyer section (student answers) displays author, time, edit, actions |
| ⬜ | Tenant section (instructor answers) displays author, time, edit, actions |
| ⬜ | Nested discussions support multi-level replies |
| ⬜ | Input box for starting new follow-up discussion |
| ⬜ | Discussion items include resolved/unresolved button, author, time, content, actions, reply box |
| ⬜ | Replies include author, time, content, actions, reply box |

## Class at a Glance (3 points)

| Status | Requirement |
| ------ | ----------- |
| ⬜ | Display: unread, unanswered, total posts, lawyer responses, tenant responses, user count |

## Manage Class (6 points)

| Status | Requirement |
| ------ | ----------- |
| ⬜ | Only admins can access Manage tab |
| ⬜ | Management interface shows category management tab |

## Manage Folders (18 points)

| Status | Requirement |
| ------ | ----------- |
| ⬜ | Clicking category management enters corresponding interface |
| ⬜ | Display title "Manage Folders" |
| ⬜ | Default categories initialized (9 rental topics) |
| ⬜ | Can add single category with real-time update |
| ⬜ | Can delete selected category |
| ⬜ | Can edit category name with save/cancel options |

## General Requirements (12 points) + Deployment (15 points)

| Status | Requirement |
| ------ | ----------- |
| ⬜ | Field labels clear, placeholders user-friendly |
| ⬜ | Input types match field requirements |
| ⬜ | UI style consistent with target (no need for 1:1 recreation) |
| ⬜ | Selected/active states highlighted |
| ⬜ | Settings and data persist and re-render correctly |
| ⬜ | Deployed on Netlify/Vercel + Render + MongoDB Atlas |
| ⬜ | (Bonus) Provide live demo link |

## Additional Extensions

| Status | Requirement |
| ------ | ----------- |
| ⬜ | AI contract review flow completed |
| ⬜ | Risk report supports export/print |
| ⬜ | Posts can reference AI review results |
| ⬜ | Admin content moderation tools |

---

## Progress Summary

| Section | Points | Completed | Remaining |
| ------- | ------ | --------- | --------- |
| Q&A Screen | 33 | 0 | 9 items |
| Posts Sidebar | 15 | 0 | 5 items |
| Posting New Questions | 27 | 0 | 9 items |
| Viewing & Replying | 33 | 0 | 8 items |
| Class at a Glance | 3 | 0 | 1 item |
| Manage Class | 6 | 0 | 2 items |
| Manage Folders | 18 | 0 | 6 items |
| General + Deployment | 27 | 0 | 7 items |
| **Total** | **162** | **0** | **47 items** |

> **Tip**: Check off each item immediately after completion and reference it in your MR/Commit message for easier final review.