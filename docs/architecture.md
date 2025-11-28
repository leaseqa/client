# System Architecture Design

## 1. Overall Architecture

LeaseQA uses a monorepo structure with Next.js 14 at its core, enabling unified deployment of both frontend pages and backend APIs.

```
apps/
  web/              # Next.js application (App Router)
packages/
  config/           # Shared configurations (Tailwind, ESLint, etc.)
  ui/               # Reusable components (Button, Badge, Card, etc.)
docs/               # Documentation
```

### 1.1 Unified Frontend & Backend

- **Next.js App Router** handles page rendering, Server Actions, and data fetching.
- **API Routes** (`app/api/*`) handle REST endpoints, combined with middleware for authentication and access control.
- Uses **Edge/Node runtime**, selected based on performance needs (AI review requires Node runtime).

### 1.2 Data Flow

1. Frontend calls APIs via **React Query** or **SWR**.
2. APIs invoke the **Service layer**, which encapsulates business logic and uses **Mongoose** to access MongoDB.
3. Data models are centrally defined in `packages/config/mongoose` or `apps/web/lib/db`.

### 1.3 Authentication & Roles

- **NextAuth.js** with Credentials Provider (email/password).
- After login, the session contains `role`, `lawyerVerification`, and other relevant fields.
- Frontend controls UI visibility via `useSession`; backend validates access permissions via middleware.

## 2. Module Breakdown

| Module | Description | Key Pages/Endpoints |
| ------ | ----------- | ------------------- |
| Landing | Project introduction, team info, GitHub link | `/` |
| AI Review | Contract upload, progress tracking, results display, export | `/ai-review`, `/api/ai-review` |
| Q&A List | Post list, sidebar filters, statistics dashboard | `/qa` |
| Create Post | Multi-tag support, multi-category selection, rich text editor | `/qa/new`, `/api/posts` |
| Post Details | Lawyer/community answers, nested discussions, resolved status | `/qa/[id]`, `/api/answers`, `/api/discussions` |
| Admin Panel | Category management, statistics, content moderation | `/admin`, `/api/folders` |

## 3. Key Technology Choices

| Category | Technology | Notes |
| -------- | ---------- | ----- |
| **Styling** | Tailwind CSS | Combined with Headless UI / Radix for component behavior (as needed) |
| **Rich Text** | React-Quill | Dynamically loaded; backend stores HTML or Delta format |
| **File Upload** | Next.js Route Handler | Temporary storage to memory/disk, or upload to object storage (TBD); extracted text saved to MongoDB |
| **AI Integration** | `@anthropic-ai/sdk` | Handles long text segmentation, timeouts, and error retries |
| **Form Validation** | Zod + React Hook Form | Ensures frontend-backend validation consistency |
| **Logging & Monitoring** | Sentry / Logtail (optional) | Console + custom logger during development |

## 4. Data Models (Overview)

```ts
// Users
{
    username: string;                // Required: display name
    email: string;                   // Required: used for login
    hashedPassword: string;          // Required: encrypted password
    role: 'tenant' | 'lawyer' | 'admin';  // Required: determines permissions
    lawyerVerification: {            // Optional: only required for lawyers
        barNumber: string;             // Required if lawyer: bar association number
        state: string;                 // Required if lawyer: state of license
        verifiedAt: Date;              // Optional: set when admin approves
    };
    createdAt: Date;                 // Required: auto-generated timestamp
}

// AIReviews
{
    userId: ObjectId;                // Required: reference to user who requested review
    contractType: string;            // Optional: e.g., "residential_lease", "commercial"
    contractFileUrl: string;         // Optional: URL if file was uploaded
    contractText: string;            // Required: extracted or pasted contract text
    aiResponse: {
        summary: string;               // Required: brief overview of the contract
        highRisk: string[];            // Required: critical issues found
        mediumRisk: string[];          // Required: moderate concerns
        lowRisk: string[];             // Required: minor issues
        recommendations: string[];     // Required: suggested actions
    };
    relatedPostId: ObjectId;         // Optional: links to Q&A post if user created one
    createdAt: Date;                 // Required: auto-generated timestamp
}
```

> For additional model details, see `docs/api-design.md`.

## 5. Middleware & Infrastructure

| File | Purpose |
| ---- | ------- |
| `middleware.ts` | Route protection based on NextAuth session (admin routes, lawyer-only features) |
| `lib/auth.ts` | Helper functions for permission validation |
| `lib/db.ts` | Ensures Mongoose connection reuse, preventing duplicate connections during hot reload |
| `lib/ai/claude.ts` | Wraps Claude API calls with error handling and response formatting |

## 6. Development Workflow

1. **Phase 1**: Implement common layout, navigation, and legal disclaimer.
2. **Phase 2**: Integrate NextAuth and MongoDB connection; complete basic CRUD operations.
3. **Phase 3**: Connect AI review and post workflows; gradually refine UI.
4. **Phase 4**: Integrate admin features; complete all Rubric requirements.
5. **Phase 5**: Write tests, prepare deployment scripts, finalize documentation.

## 7. Deployment & Operations

| Service | Purpose | Notes |
| ------- | ------- | ----- |
| **Vercel** | Frontend & API hosting | Environment variables configured in project settings |
| **MongoDB Atlas** | Production database | Configure network access and user permissions |
| **AWS S3 / Cloudflare R2** | File storage (optional) | Required if PDF download feature is supported |
| **GitHub Actions** | CI/CD pipeline | Runs lint, test, and build to ensure code quality |

## 8. Future Extensions

- **Lease Knowledge Base**: Add a searchable repository of lease-related information.
- **Smart Q&A Chatbot**: AI-powered assistant for common tenant questions.
- **Notification System**: Email/SMS alerts to notify lawyers of new questions.
- **Multi-language Support**: English and Chinese localization.