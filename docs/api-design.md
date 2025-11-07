# API 设计草案

> 采用 REST 风格，路径基于 `/api`。后续可补充 GraphQL 或 Server Actions 版本。

## 1. 认证相关

### POST `/api/auth/register`
- **描述**：注册新用户（租客或申请律师）。
- **请求体**：
  ```json
  {
    "username": "Alice",
    "email": "alice@example.com",
    "password": "*******",
    "role": "tenant",
    "lawyerVerification": {
      "barNumber": "12345",
      "state": "MA"
    }
  }
  ```
- **响应**：`201 Created`，返回用户基本信息（不含密码）。

### POST `/api/auth/login`
- 交由 NextAuth Credentials Provider 处理，返回 session。

### GET `/api/auth/session`
- 返回当前登录用户信息。

## 2. AI 合同审核

### POST `/api/ai-review`
- **认证**：租客/律师均可调用。
- **请求体**（multipart/form-data）：
  - `file`: PDF 文件（二选一）
  - `contractText`: 文本内容
  - `contractType`: 字符串（可选）
- **流程**：
  1. 校验至少提供文件或文本。
  2. 若上传文件，提取文本（后端 TBD）。
  3. 调用 Claude API 获取分析结果。
  4. 写入 `AIReviews` 集合。
- **响应**：
  ```json
  {
    "reviewId": "6550...",
    "summary": "...",
    "riskLevels": {
      "high": ["..."],
      "medium": ["..."],
      "low": ["..."]
    },
    "recommendations": ["..."]
  }
  ```

### GET `/api/ai-review/:id`
- 返回指定审核结果，包含原始报告。

## 3. 帖子 Posts

### GET `/api/posts`
- **查询参数**：
  - `folder`: 分类
  - `role`: 视角（可选）
  - `search`: 搜索关键词
- **响应**：按时间倒序的帖子列表。

### POST `/api/posts`
- **请求体**：
  ```json
  {
    "summary": "需要确认租约转让条款是否合法",
    "details": "<p>...</p>",
    "postType": "question",
    "visibility": "class",         // class | private
    "folders": ["lease_review", "rent_increase"],
    "fromAIReview": "6550...",     // 可选，关联审核
    "urgency": "high"              // 可选
  }
  ```
- **响应**：`201 Created`，返回新帖详情。
- **验证**：摘要 ≤ 100 字符，至少选择一个分类。

### GET `/api/posts/:id`
- 返回帖子详情，包含回答与讨论（可选整合或拆分查询）。

### PUT `/api/posts/:id`
- 更新摘要、详情、分类、可见性等。

### DELETE `/api/posts/:id`
- 作者/律师/管理员权限；管理员可删除违规内容。

## 4. 回答 Answers

### POST `/api/answers`
- **请求体**：
  ```json
  {
    "postId": "654f...",
    "content": "<p>...</p>",
    "answerType": "lawyer_opinion"  // or community_answer
  }
  ```
- **权限**：`lawyer_opinion` 仅律师，`community_answer` 租客/律师均可。

### PUT `/api/answers/:id`
- 编辑回答，仅作者或管理员。

### DELETE `/api/answers/:id`
- 作者或管理员可删除。

## 5. 讨论 Discussions

### POST `/api/discussions`
- **请求体**：
  ```json
  {
    "postId": "654f...",
    "parentId": "6550...",   // 顶层为空
    "content": "我有类似经历...",
    "isResolved": false
  }
  ```
- 顶层讨论用于“跟进讨论”，子层用于回复。

### PATCH `/api/discussions/:id/resolve`
- **请求体**：`{ "isResolved": true }`
- **权限**：帖子作者、律师或管理员。

### DELETE `/api/discussions/:id`
- 作者或管理员。

## 6. 分类 Folders

### GET `/api/folders`
- 返回所有分类，供前端渲染过滤器。

### POST `/api/folders`
- **权限**：管理员。
- **请求体**：`{ "name": "utilities", "displayName": "水电费" }`

### PUT `/api/folders/:id`
- 更新名称/描述。

### DELETE `/api/folders/:id`
- 删除分类（需处理关联帖子策略）。

## 7. 统计 Statistics

### GET `/api/stats/overview`
- 返回 Rubric 要求的指标：
  ```json
  {
    "unreadPosts": 3,
    "unansweredPosts": 5,
    "totalPosts": 42,
    "lawyerResponses": 18,
    "tenantResponses": 64,
    "enrolledUsers": 137
  }
  ```
- 管理员权限，其他角色按需过滤。

## 8. 管理工具

### POST `/api/moderation/posts/:id/hide`
- 管理员隐藏或恢复帖子。

### POST `/api/moderation/users/:id/ban`
- 管理员停用用户（可选扩展）。

## 9. 错误响应标准

- 统一返回结构：
  ```json
  {
    "error": {
      "code": "VALIDATION_ERROR",
      "message": "摘要不能为空",
      "details": { ... }
    }
  }
  ```
- 常见错误码：`UNAUTHORIZED`、`FORBIDDEN`、`NOT_FOUND`、`VALIDATION_ERROR`、`INTERNAL_ERROR`。

## 10. 未来扩展

- WebSocket/Server-Sent Events 提示实时更新（新回答、讨论）。
- 导出/导入测试数据的管理接口。
- AI 审核结果的版本化与反馈接口。
