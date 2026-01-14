# Color Lab UI 设计方案 (Design Guidelines)

## 1. 设计风格 (Look & Feel)
*   **关键词**: `Clean` (干净), `Trustworthy` (专业), `Modern` (现代), `Aesthetic` (美学)。
*   **主色调**: 
    *   **背景**: 纯白 (#FFFFFF) 或 极浅灰 (#F9FAFB) 以凸显色彩本身。
    *   **强调色**: 使用柔和的渐变色 (Gradient) 代表“色彩实验室”的科技感与艺术感。
*   **字体**: 使用系统默认无衬线字体 (Inter/San Francisco) 保持现代感，标题可加粗以强调层级。

## 2. 关键页面布局 (Wireframes)

### 2.1 Landing Page (`/color-lab`)
*   **Hero Section**: 
    *   大标题: "Discover Your Perfect Colors with AI"
    *   CTA 按钮: "Analyze My Colors Now (Free)"
    *   背景图: 展示 Before/After 对比（例如：穿错颜色脸色暗沉 vs 穿对颜色容光焕发）。
*   **Features Grid**: 3列布局，介绍 "AI Precision", "Personalized Palette", "Outfit Validator"。
*   **SEO Text**: 底部放置针对 Semrush 关键词优化的长文本。

### 2.2 上传页 (`/color-lab/analysis`)
*   **布局**: 居中卡片式设计。
*   **交互**:
    *   大大的虚线框区域支持拖拽上传。
    *   摄像头图标支持手机直接调起相机。
    *   **Loading 态**: 必须精致。显示 "Scanning skin tone...", "Analyzing eye contrast...", "Generating palette..." 等动态文字，缓解等待焦虑。

### 2.3 报告页 (`/color-lab/report/[id]`)
*   **Header**: 显示用户的头像（圆形剪裁）和所属季节（大字号）。
*   **Color Swatches (色板)**:
    *   **Power Colors**: 大色块展示，点击可全屏查看色值 (Hex)。
    *   **Neutral Colors**: 基础百搭色展示。
*   **Action Bar**: 底部悬浮栏，提供 "Save to Photos" 和 "Check an Outfit" (引导去穿搭裁判)。

### 2.4 穿搭裁判页 (`/color-lab/validator`)
*   **分屏设计 (Mobile)**: 
    *   上半部分: 用户上传的衣服图。
    *   下半部分: AI 的对话框气泡。
    *   **结果展示**: 
        *   ✅ 推荐: 绿色对勾动画 + 正面评价。
        *   ❌ 不推荐: 红色叉号动画 + 改进建议。

## 3. 组件库 (Components)
*   **Button**: 圆角大按钮，主按钮使用黑色背景白字 (高奢感)，次级按钮使用灰色描边。
*   **ColorCard**: 圆角矩形，带阴影，鼠标 Hover 时放大。
*   **RadarChart**: 使用 `recharts` 或类似库绘制五维分析图，线条要细，配色要高级。
