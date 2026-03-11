# Color Lab (Seasonal Color Analysis AI) 项目指南

## 1. 项目核心定位
*   **愿景**: 打造全球最精准、最具美感的 AI 个人色彩分析工具 (AI Seasonal Color Analysis Quiz)。
*   **利基市场**: 针对时尚、美妆及个人形象管理领域（尤其是“韩式个人色彩”趋势）。
*   **核心关键词**: `seasonal color analysis`, `color analysis quiz`, `12-season color theory`, `ai stylist`, `virtual draping`.
*   **竞争对标**: `mycoloranalysis.ai`, `color-analysis.app`.

## 2. 技术栈 & 架构
*   **前端**: Next.js (App Router), TailwindCSS, TypeScript.
*   **多语言**: Next-intl (支持 EN/ZH，en 为默认语言).
*   **UI 风格**: 美妆/时尚高级感 (Soft Pinks, Beiges, Serif Fonts - Playfair Display).
*   **后端/AI**: 
    *   **分析引擎**: Google Gemini / OpenAI (用于肤色、对比度分析及色彩季节判定).
    *   **图像存储**: Cloudflare R2 (用于存储用户上传的照片及生成的虚拟试穿图片).
    *   **数据库**: Supabase (用户会话、报告记录、支付状态).
*   **支付**: Stripe (当前定价策略: **$19.90** 用于完整报告解锁).

## 3. 已完成里程碑 (Milestones)
### ✅ 品牌重塑与架构转型 (Pivoted from StickerShow)
*   **导航与内容**: 全面移除所有 "Sticker" 相关链接，替换为 Color Lab (Analysis, Validator, Reports, Pricing).
*   **视觉升级**: 完成了从“SaaS 蓝色调”到“美妆粉色调”的转换。
*   **核心资源**: 已上传并配置 `seasonal_color_analysis.jpg` 作为 Hero Section 的核心视觉图。

### ✅ 商业化策略落地
*   **提价策略**: 定价已从 $4.90 成功上调至 **$19.90**。
*   **付费点设置**: 
    *   免费用户: 可上传照片并获得初步分析（隐藏具体季节名，如显示 "You are a..."）。
    *   付费用户: 解锁 12 季节具体名称、30+ Power Palette 色板、虚拟试穿 (Virtual Draping) 以及穿搭指导。

### ✅ SEO 增长三步走战略 (已落地)
1.  **技术 SEO**: 
    *   修复了多语言 `hreflang` 标签及动态 `canonical` URL。
    *   更新了 JSON-LD 结构化数据 (WebApplication, FAQ, WebSite)，价格同步为 $19.90。
    *   完善了 `sitemap.xml`，新增了 Blog 和 Examples 路径。
2.  **内容 SEO**: 
    *   在 `en.json` 中嵌入了大量高价值 SEO 词汇。
    *   优化了首页 H1 (Free AI Seasonal Color Analysis Quiz) 和图片 Alt 标签。
3.  **用户体验 (UX)**: 
    *   修复了数据加载时的布局偏移 (CLS)。
    *   增强了首页 Sample Cards 的 CTA 引导和信任度组件。

## 4. 核心功能逻辑
*   **Analysis 流程**: 用户上传 -> AI 分析 (api/color-lab/analyze) -> 渲染模糊/隐藏结果页 -> 点击支付 -> Stripe 回调 -> 解锁完整 R2 图片报告。
*   **Style Validator**: 允许用户上传单品衣服，AI 判定该颜色是否符合其个人季节特征。

## 5. 当前阶段与待办事项 (Current Focus)
*   **状态**: 核心转化路径已打通，SEO 结构已就绪。
*   **下一步计划**:
    1.  **内容产出**: 继续在 `blogData.ts` 中增加关于“12 季节详细对比”的高流量文章。
    2.  **R2 稳定性**: 确保大规模并发下的图片处理逻辑鲁棒性。
    3.  **广告投放**: 根据 Google Ads 脚本监控初步转化数据。

## 6. 会话唤醒建议
*   **上下文加载**: 当开启新会话时，只需提及“接续 Color Lab 项目”，Gemini 即可通过此文件快速读取所有背景。
*   **开发指令**: “执行 Phase 2 开发任务”、“优化 SEO 排名”或“调整定价策略”。

---
*Last Updated: 2026-03-10*
