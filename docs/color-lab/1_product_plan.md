# Color Lab 产品方案 (Product Requirements Document)

## 1. 产品概述
**产品名称**: Color Lab (AI Color Analysis)
**核心价值**: 通过 AI 技术为用户提供专业的个人色彩分析，并基于分析结果提供日常穿搭、美妆决策辅助。
**Slogan**: Your Personal AI Style Decision Engine.
**目标用户**: 关注个人形象、但缺乏专业色彩知识、在购物或穿搭时有选择困难症的群体（以 18-40 岁女性为主，兼顾男性市场）。

## 2. 市场分析与策略 (基于 Semrush 数据)
*   **SEO 机会**: 利用 `seasonal color analysis`, `what season am i`, `ai color analysis` 等高搜索量、中低竞争度的关键词。
*   **差异化**: 从单一的“测肤色”工具转化为高频使用的“穿搭决策助手”。
*   **定价策略**:
    *   **Free**: 基础季节判断 + 简略色盘（引流）。
    *   **Paid ($9.9 - $19.9)**: 完整报告 + 详细色板 + 穿搭裁判功能 (Token 制)。

## 3. 功能模块详解

### 3.1 核心诊断 (The Core Analysis)
*   **入口**: `/color-lab/analysis`
*   **流程**:
    1.  **引导**: 简短说明（光线要求、无妆容建议）。
    2.  **上传**: 支持自拍或上传照片。
    3.  **处理**: 前端压缩 -> 上传 R2 -> 后端 AI 分析。
    4.  **结果**: 
        *   **季节定性**: 例如 "True Autumn" (暖秋型)。
        *   **五维雷达图**: 肤色(Skin)、瞳孔(Eyes)、发色(Hair)、对比度(Contrast)、色温(Temperature)。
        *   **关键色彩**: 你的 "Power Colors" (本命色) 和 "Colors to Avoid" (灾难色)。

### 3.2 穿搭裁判 (Outfit Validator) - *Killer Feature*
*   **入口**: 报告页底部 / 独立工具页
*   **场景**: 用户逛淘宝/商场，想知道这件衣服适不适合自己。
*   **流程**:
    1.  用户上传衣服图片。
    2.  系统结合用户的色彩档案 (Session ID)。
    3.  AI 给出评分 (1-5星) 及具体理由（例：“这件衣服饱和度太高，会压住你的肤色”）。

### 3.3 场景化色板 (Contextual Palettes)
*   **内容**: 针对面试、约会、日常通勤等不同场景的推荐配色方案。

## 4. 用户系统与商业化
*   **访客模式**: 允许未登录用户体验基础分析（结果打码或仅显示部分）。
*   **登录用户**: 保存历史报告，使用“穿搭裁判”需消耗 Credits。
*   **支付**: Stripe 一次性购买或充值 Credits。

## 5. 页面架构 (Sitemap)
*   `/color-lab`: Landing Page (SEO 聚合页)。
*   `/color-lab/analysis`: 上传与分析主流程。
*   `/color-lab/report/[id]`: 报告详情页 (可分享)。
*   `/color-lab/validator`: 穿搭裁判工具页。
