# Color Lab (Seasonal Color Analysis AI) 项目指南

## 1. 项目核心定位
*   **愿景**: 打造全球最精准、最具美感的 AI 个人色彩分析工具 (AI Seasonal Color Analysis Quiz)。
*   **利基市场**: 针对时尚、美妆及个人形象管理领域（“韩式个人色彩”趋势）。
*   **核心关键词**: `seasonal color analysis`, `color analysis quiz`, `12-season color theory`, `virtual draping`.

## 2. 技术栈 & 架构
*   **前端**: Next.js (App Router), TailwindCSS, TypeScript.
*   **后端/AI**: Google Gemini (图像/色彩分析), Cloudflare R2 (图像存储), Supabase (数据库).
*   **支付与计费**: Creem (Merchant of Record). 采用**双轨制积分 (Dual-Credit System)** 与 **订阅制 (Subscription + Pay-as-you-go Packs)** 混合模式。

## 3. 核心业务与扣费逻辑
*   **新用户福利**: 注册即赠送 4 个永久积分 (Permanent Credits)。
*   **基础分析 (Teaser)**: 每次测验扣除 1 个积分。支持并发生成，无需等待上一份报告解锁。
*   **解锁完整报告**: 扣除 40 个积分。包含 12 季节深度解析、高精度色彩推荐及 AI 虚拟换装 (Virtual Draping)。
*   **重绘换装图 (Regenerate Draping)**: 仅限报告所有者操作，每次重新生成最佳/最差换装图扣除 5 个积分。

## 4. 已完成里程碑 (Milestones)
### ✅ 品牌转型与 SEO (Phase 1)
*   全面从 Sticker 转型至美妆粉色调的 Color Lab，整合高价值 SEO 词汇与 Schema 结构，完成全站多语言部署。

### ✅ 商业化体系升级：Creem 积分与订阅管理 (Phase 2)
*   **双轨制计费引擎**: 数据库重构，支持 `subscription_credits` (周期清零) 与 `permanent_credits` (永久有效)。
*   **智能 Webhook 处理**: 实现 Creem Webhook 防重放、按周期/金额精准发放对应积分，并同步订阅状态 (`active`, `scheduled_cancel` 等)。
*   **无感订阅升级/降级**: 前端基于当前方案与周期，调用内部 API (`proration-charge-immediately`) 实现一键差价扣费升级。
*   **站内订阅管理**: 在个人中心 (Profile) 集成优雅的“计划取消 (Cancel)”与“一键恢复 (Resume)”逻辑，最大限度挽留用户。
*   **UI/UX 防御性交互**: 统一封装 `BaseModal`，所有扣费节点（解锁、重绘）均增加防止连点的 Loading 状态与余额不足的拦截引导。

### ✅ 高转化测验与专属付款页 (Phase 3)
*   **沉浸式测验体验**: 重构 `/quiz` 流程，所有 16 个问题引入高质量配图卡片，并加入男女差异化逻辑（男性展示“职场衬衫色”，女性展示“口红色号”）。
*   **原生级摄像头支持**: 引入 `react-webcam`，在最后一步提供纯净的 "Take Photo"（直接调用 PC/手机前置摄像头）与 "Upload File" 双轨选项。
*   **专属 Paywall 漏斗**: 新增 `/quiz/paywall/[id]` 拦截页。用户上传照片后先不消耗 AI token，而是跳转至此页面。包含动态 Toast 播报、用户痛点解决声明（2x2 网格卡片）与定价套餐。
*   **上下文注入分析 (Context Passing)**: 将用户在 Quiz 中填写的痛点（`quiz_data`）存入数据库，并在触发 `/analyze` 接口时作为核心 Prompt 喂给 Gemini 大模型，生成极致个性化的报告。
*   **边界路由防御**: 在 `/report/[id]` 和 Profile 历史记录中增加严格的拦截器，防止用户在未付款（`draft` 状态）时意外跳入报告页，强制引流回 Paywall。

## 5. 当前阶段与待办事项 (Current Focus)
*   **状态**: 测验与转化漏斗已完全打通，整体 UI/UX 达到高奢美妆水准，商业闭环严密。
*   **下一步计划**:
    1.  **功能拓展**: 开发消耗积分的碎片化工具（如：AI 单品衣服验证器、虚拟发色试穿）。
    2.  **内容与流量**: 在 `blogData.ts` 持续铺设 SEO 文章，监控转化漏斗 (Quiz -> Paywall -> Sub) 数据。

---
*Last Updated: 2026-03-25*