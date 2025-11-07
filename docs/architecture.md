# 系统架构设计

## 1. 整体架构

LeaseQA 采用单仓多包结构，以 Next.js 14 为核心，实现前端页面与后端 API 的统一部署。

```
apps/
  web/              # Next.js 应用（App Router）
packages/
  config/           # Tailwind、ESLint 等共享配置
  ui/               # 可复用组件（Button、Badge、Card 等）
docs/               # 文档
```

### 1.1 前后端一体化

- Next.js App Router 负责页面渲染、Server Actions、数据获取。
- API Routes (`app/api/*`) 处理 REST 接口，结合中间件实现鉴权与访问控制。
- 使用 Edge/Node 运行时，根据性能需求选择（AI 审核需 Node 运行时）。

### 1.2 数据流

- 前端通过 React Query/SWR 调用 API。
- API 调用服务层（Service）封装业务逻辑，使用 Mongoose 访问 MongoDB。
- 数据模型统一在 `packages/config/mongoose` 或 `apps/web/lib/db` 中定义。

### 1.3 身份认证与角色

- NextAuth.js 搭配 Credentials Provider（Email/密码）。
- 登录后 session 中包含 `role`、`lawyerVerification` 等字段。
- 前端通过 `useSession` 控制 UI，后端通过中间件校验访问权限。

## 2. 模块划分

| 模块 | 说明 | 关键页面/接口 |
| ---- | ---- | ------------- |
| Landing | 项目介绍、团队信息、GitHub 链接 | `/` |
| AI 审核 | 合同上传、进度、结果展示、导出 | `/ai-review`、`/api/ai-review` |
| Q&A 列表 | 帖子列表、侧栏、统计看板 | `/qa` |
| 发帖 | 多标签、分类多选、富文本 | `/qa/new`、`/api/posts` |
| 详情 | 律师/社区回答、嵌套讨论、解决状态 | `/qa/[id]`、`/api/answers`、`/api/discussions` |
| 管理后台 | 分类管理、统计、内容审核 | `/admin`、`/api/folders` |

## 3. 关键技术选型

- **样式**：Tailwind CSS，结合 Headless UI / Radix 提供组件行为（按需）。
- **富文本**：React-Quill 动态加载；后端存储 HTML 或 delta（择优）。
- **文件上传**：使用 Next.js Route Handler，临时存储到内存/磁盘，或上传到对象存储（待确认）；文本提取后写入 Mongo。
- **AI 调用**：`@anthropic-ai/sdk`；对长文本做分段处理，设置超时与错误重试。
- **表单验证**：Zod + React Hook Form，确保前后端一致。
- **日志与监控**：可选 Sentry/Logtail，调试阶段可用 console + 自定义 logger。

## 4. 数据模型（概览）

```ts
// Users
{
  username: string;
  email: string;
  hashedPassword: string;
  role: 'tenant' | 'lawyer' | 'admin';
  lawyerVerification?: { barNumber: string; state: string; verifiedAt?: Date };
  createdAt: Date;
}

// AIReviews
{
  userId: ObjectId;
  contractType?: string;
  contractFileUrl?: string;
  contractText: string;
  aiResponse: {
    summary: string;
    highRisk: string[];
    mediumRisk: string[];
    lowRisk: string[];
    recommendations: string[];
  };
  relatedPostId?: ObjectId;
  createdAt: Date;
}
```

> 其余模型细节见 `docs/api-design.md`。

## 5. 中间件与基础设施

- `middleware.ts`：基于 NextAuth session 实现路由保护（管理员路径、律师功能）。
- `lib/auth.ts`：封装权限校验辅助函数。
- `lib/db.ts`：保证 Mongoose 连接复用，避免热更新重复连接。
- `lib/ai/claude.ts`：封装 Claude API 调用、错误处理与响应格式化。

## 6. 开发流程

1. 先实现通用布局、导航、法律免责声明。
2. 接入 NextAuth 与 Mongo 连接，完成基础 CRUD。
3. 对接 AI 审核与帖子流程，逐步完善 UI。
4. 集成管理员功能，补齐 Rubric 中的所有条目。
5. 编写测试、准备部署脚本、补充文档。

## 7. 部署与运维

- **Vercel**：前端与 API。环境变量在项目设置中配置。
- **MongoDB Atlas**：部署生产数据库，配置网络访问与用户权限。
- **文件存储**：若支持 PDF 下载，可使用 AWS S3 / Cloudflare R2（可选）。
- **CI/CD**：GitHub Actions（lint + test + build）确保质量。

## 8. 后续扩展

- 增加租约知识库、智能问答机器人。
- 引入通知系统（邮件/短信）提醒律师回答。
- 多语言支持（英文、中文）。
