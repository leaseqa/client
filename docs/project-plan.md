# Project Milestones & Task Assignment

## 1. Timeline Overview (October 19 - November 30)

| Week | Date Range | Goals | Responsible |
| ---- | ---------- | ----- | ----------- |
| Week 1 | 10/19 - 10/25 | Initialize project, complete Landing Page wireframe, set up auth & database connection | Frontend/Backend |
| Week 2 | 10/26 - 11/01 | Implement AI Review MVP, prepare 5 test cases | Full Stack |
| Week 3 | 11/02 - 11/08 | Complete Q&A list page (sidebar, filters, statistics) | Frontend |
| Week 4 | 11/09 - 11/15 | Create Post page + Details page (answers, discussions) with corresponding APIs | Frontend/Backend |
| Week 5 | 11/16 - 11/22 | Admin category management, content moderation, data persistence validation | Full Stack |
| Week 6 | 11/23 - 11/30 | UI polish, testing, deployment, documentation, demo recording | Entire Team |

## 2. Weekly Task Breakdown

### Week 1: Infrastructure Setup

| Task | Description |
| ---- | ----------- |
| Project Init | Initialize Next.js 14 project, configure ESLint/Prettier/Turbo Repo (if needed) |
| Styling Setup | Configure Tailwind CSS, global layout, navigation skeleton, legal disclaimer component |
| Auth & Database | Set up NextAuth + MongoDB connection, complete User model |
| Landing Page | Design and build: project highlights, team info, repository link |
| Test Cases | Create 5 Boston rental case descriptions |

### Week 2: AI Review MVP

| Task | Description |
| ---- | ----------- |
| Upload UI | Implement contract upload interface with loading progress and error messages |
| API Route | Build `/api/ai-review` Route Handler: parameter validation, Mock Claude response (if no API key) |
| Results Display | Create risk level card components, support export (placeholder) and link to create post |
| Data Model | Build AIReviews model, complete data persistence and query functionality |

### Week 3: Q&A List Page

| Task | Description |
| ---- | ----------- |
| Navigation | Build fixed navigation bar with category filter (9 default categories) |
| Sidebar | Implement collapsible sidebar with Today/Yesterday/Last Week grouping |
| Post List | Build posts list component, load real data or mock data |
| Statistics | Create "Class at a Glance" statistics card component |
| APIs | Initial version of `GET /api/posts` and `GET /api/stats/overview` |

### Week 4: Create Post & Post Details

| Task | Description |
| ---- | ----------- |
| Post Form | Build form with React Hook Form + Zod, complete validation messages |
| Post APIs | Implement `POST /api/posts`, `PUT/DELETE /api/posts/:id` |
| Details Header | Build top section with metadata, view count, action buttons |
| Answers Section | Split by lawyer/community, support add/edit/delete with rich text |
| Discussions | Nested list, reply form, resolve status button |
| Discussion APIs | Implement `POST /api/answers`, `POST /api/discussions`, etc. |

### Week 5: Admin & Optimization

| Task | Description |
| ---- | ----------- |
| Route Protection | Implement admin route protection and middleware |
| Category Management | Build UI for list, search, add, edit, delete categories |
| Content Moderation | Build panel for hide/delete posts, user statistics |
| Data Persistence | Default category initialization script, index optimization |
| UI Polish | Highlight states, empty states, loading skeletons |

### Week 6: Validation & Delivery

| Task | Description |
| ---- | ----------- |
| Test Planning | Write test plan: unit, integration, end-to-end |
| Automated Testing | Set up Jest + Playwright/Cypress |
| Deployment | Deploy to Vercel, configure environment variables and domain |
| Documentation | User guide, technical docs, Rubric checklist |
| Demo | Record demo video, prepare presentation materials |

## 3. Role Assignments

### Frontend Lead (You)

| Responsibility | Details |
| -------------- | ------- |
| UI/UX | Design and implement Landing, AI Review, Q&A, Admin pages |
| Components | React component library, state management, form validation, interaction details |
| Coordination | Test cases, documentation writing |

### Backend/DevOps Teammate

| Responsibility | Details |
| -------------- | ------- |
| Authentication | NextAuth logic, role permission middleware |
| Data Layer | MongoDB models, API Route Handlers, Claude integration |
| Infrastructure | Deployment, environment variables, security, performance optimization |

## 4. Communication Plan

| Meeting | Frequency | Purpose |
| ------- | --------- | ------- |
| Monday Sync | 30 min | Task planning and risk identification |
| Friday Review | 1 hour | Progress demo, code review, merge |
| Ad-hoc Meetings | As needed | Before major milestones (e.g., AI API launch) |

**Tracking Tools**: Google Docs / Trello for todos and issue tracking

## 5. Deliverables Checklist

| Deliverable | Status |
| ----------- | ------ |
| Product demo site (Vercel) | ⬜ |
| GitHub repository + README + deployment instructions | ⬜ |
| Rubric checklist (completion status) | ⬜ |
| Test report and test cases | ⬜ |
| User guide + technical documentation | ⬜ |
| Demo video and PPT (optional) | ⬜ |

## 6. Risk Management

| Risk | Mitigation Strategy |
| ---- | ------------------- |
| **Claude API Access** | If approval is delayed, use Mock responses + local analysis script to validate the flow |
| **Timeline Delays** | Critical path is AI Review + Q&A Details - prioritize these; Admin features can be trimmed to basic version |
| **Deployment Issues** | Complete pre-deployment testing in Week 5, leave buffer time |
| **Role Permission Complexity** | Write a unified `requireRole` helper function to avoid scattered permission checks |