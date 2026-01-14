# Color Lab 开发方案 (Implementation Plan)

## 1. 技术栈 (Tech Stack)
*   **Frontend**: Next.js 14 (App Router), Tailwind CSS, Framer Motion (动画), Recharts (图表)。
*   **Backend**: Next.js Server Actions / Route Handlers.
*   **Database**: PostgreSQL (现有架构), Prisma / Drizzle (如有), 或原生 SQL (当前项目风格)。
*   **AI Service**: 
    *   **Vision**: OpenAI GPT-4o 或 Google Gemini 1.5 Pro (利用其多模态能力分析图片)。
    *   **Replicate**: 备选，用于更底层的图像处理或特定模型。
*   **Storage**: Cloudflare R2 (用于存储用户上传的图片，成本低)。
*   **Payment**: Stripe (现有集成)。

## 2. 数据库设计 (Schema)
执行 `sql/tables/9_color_lab.sql`，并补充以下字段：

```sql
-- 扩展 color_lab_reports
ALTER TABLE color_lab_reports 
ADD COLUMN IF NOT EXISTS analysis_data JSONB; -- 存储详细的五维数据

-- 新增 outfits 表 (穿搭裁判)
CREATE TABLE IF NOT EXISTS color_lab_outfits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES color_lab_sessions(id),
    image_url VARCHAR NOT NULL,
    ai_result JSONB NOT NULL, -- 存储 AI 的评价和评分
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 3. 开发阶段 (Phases)

### Phase 1: 基础建设 (Infrastructure) - *Day 1*
1.  **数据库**: 执行 SQL 脚本，确认表结构。
2.  **路由**: 创建 `/app/[locale]/color-lab` 目录结构。
3.  **服务层**: 编写 `src/servers/colorLab.ts`，实现 Session 创建、图片 URL 签名 (R2)、报告存取接口。

### Phase 2: AI 核心链路 (The Brain) - *Day 1-2*
1.  **Prompt Engineering**: 调试 GPT-4o 的 Prompt，确保它能稳定输出 JSON 格式的季节分析结果。
    *   *Input*: 图片 URL。
    *   *Output*: `{ season: "Autumn", sub_season: "True Autumn", scores: {...}, palette: [...] }`。
2.  **后端集成**: 实现 `analyzeImage(sessionId, imageUrl)` Action。

### Phase 3: 前端实现 (The Face) - *Day 2-3*
1.  **Landing Page**: 实现响应式布局，SEO Meta 标签配置。
2.  **Upload Flow**: 实现图片压缩、上传、Loading 动画。
3.  **Report UI**: 渲染雷达图、色板组件。

### Phase 4: 穿搭裁判与支付 (The Monetization) - *Day 3-4*
1.  **Validator UI**: 聊天式界面或结果卡片界面。
2.  **Stripe 集成**: 购买流程，支付成功后更新 Session 状态。

## 4. 关键难点与解决方案
*   **AI 准确性**: 
    *   *方案*: 在 Prompt 中加入 "Chain of Thought"，让 AI 先描述皮肤特征再下结论。同时允许用户手动微调（例如：“我觉得我不算黑，我是小麦色”）。
*   **图片色差**: 
    *   *方案*: 前端提示用户“请在自然光下拍摄”。后端可尝试使用 OpenCV (Sharp) 进行自动白平衡（如果 AI 自身校准不够好的话）。
*   **响应速度**: 
    *   *方案*: 使用 Streaming Response (流式输出)，先出文本结论，再出色板，减少用户体感等待时间。
