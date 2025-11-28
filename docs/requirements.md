# LeaseQA Requirements Specification

## 1. Product Goals

| Goal | Description |
| ---- | ----------- |
| **User Value** | Help Boston tenants quickly identify lease contract risks, provide community discussion and lawyer Q&A channels |
| **Academic** | Meet all Piazza Rubric requirements to ensure project passes final evaluation |
| **Differentiation** | Combine AI contract review with traditional Q&A module to create a unique value proposition |

## 2. Target Users & Roles

| Role | Description | Core Needs |
| ---- | ----------- | ---------- |
| **Tenant** | Primary platform users | Upload contracts, view risks, create posts and discussions, receive lawyer responses |
| **Certified Lawyer** | Licensed legal advisors | Answer legal questions, post official opinions, maintain professional image |
| **Admin** | Platform operators | Manage categories, moderate content, view statistics, ensure compliance |

> **Note**: Lawyer and Admin permissions are mutually exclusive. Lawyers can answer questions but cannot manage categories. Admins can operate the platform but cannot post legal opinions.

## 3. Core Features

### 3.1 AI Contract Review

| Feature | Description |
| ------- | ----------- |
| Input Methods | PDF upload or text paste |
| AI Analysis | Call Claude API to generate risk report (High/Medium/Low) |
| Output Options | Download review results or one-click redirect to create post |

### 3.2 Q&A Community

| Page | Features |
| ---- | -------- |
| **List Page** | Fixed navigation, category filters, post sidebar, statistics panel |
| **Create Post** | Multi-category selection, summary character limit, rich text details, form validation |
| **Post Details** | Lawyer section ⚖️, Community section 🏠, nested discussions, resolved status, action menu |
| **Data Persistence** | Posts, answers, discussions, view counts, categories |

### 3.3 Admin Dashboard

| Feature | Description |
| ------- | ----------- |
| Category Management | Add, edit, delete categories (9 default rental topics) |
| Platform KPIs | Unread posts, unanswered posts, total posts, lawyer/tenant response counts, user count |
| Content Moderation | Delete inappropriate posts/discussions |

### 3.4 General Requirements

| Requirement | Description |
| ----------- | ----------- |
| Legal Disclaimer | Site-wide legal disclaimer visible on all pages |
| Form UX | Clear field labels, appropriate input types, selected state highlighting, empty/error prompts |
| Responsive Design | Support for various screen sizes with basic accessibility |
| Deployment | Live deployment accessible online |

## 4. Non-Functional Requirements

| Category | Requirements |
| -------- | ------------ |
| **Performance** | Claude API calls may take 30-60s; must provide loading indicator, cancel option, and retry on failure |
| **Security** | Authentication, role-based permissions, API input validation, prevent unauthorized access |
| **Maintainability** | Modular code, clear file structure, documentation and tests |
| **Observability** | Error logging, API call monitoring (optional: Sentry/Logflare) |

## 5. Rubric Alignment Overview

| Rubric Section | Requirements |
| -------------- | ------------ |
| **Q&A Screen** | Course navigation, default Q&A view, fixed navbar, category filters, two-column layout |
| **Posts Sidebar** | Collapse button, time-based grouping, reverse chronological list, summary and metadata display |
| **Posting** | Multi-tag, multi-category, rich text, validation, prompts, create success/cancel |
| **Viewing & Replying** | Highlight current post, view count, action menu, answer sections, nested discussions, resolved status |
| **Class at a Glance** | Statistics cards |
| **Manage Class/Folders** | Admin-only view, category management |
| **General Requirements** | UI standards, data persistence, deployment |

## 6. External Dependencies

| Dependency | Purpose |
| ---------- | ------- |
| MongoDB Atlas | Database for storing all application data |
| Anthropic Claude API | AI-powered contract analysis |
| Email Service | Optional: If NextAuth uses Email Provider for authentication |

## 7. Risks & Assumptions

| Risk | Mitigation |
| ---- | ---------- |
| Claude API Key access and quota limits | Prepare mock responses for development/testing |
| PDF upload storage and parsing strategy | Confirm approach early in development |
| Course deployment requirements (Netlify/Render) | Verify compatibility with Vercel |

## 8. Acceptance Criteria

| Criteria | Description |
| -------- | ----------- |
| **Rubric Compliance** | All Rubric checklist items can be demonstrated and verified |
| **AI Review Flow** | Produces complete risk report that can be reused when creating posts |
| **Role Differentiation** | Three roles have clear permission differences reflected in UI |
| **Deployment** | Project is deployed online with complete documentation and demo materials |