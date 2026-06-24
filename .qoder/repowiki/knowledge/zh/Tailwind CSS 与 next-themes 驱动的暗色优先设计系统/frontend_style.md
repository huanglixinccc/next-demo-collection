## 1. 核心样式体系
项目采用 **Tailwind CSS v4** 作为核心原子化 CSS 框架，配合 **PostCSS** 进行构建。样式策略遵循“实用优先（Utility-First）”原则，直接在组件 JSX 中通过 `className` 定义布局、间距、颜色和交互状态。

### 主题管理
- **工具库**：使用 `next-themes` 实现深色/浅色模式切换。
- **实现方式**：通过 `ThemeProvider` 包裹应用，设置 `attribute="class"`，在根元素上动态添加 `.dark` 类名。
- **默认行为**：默认启用暗色主题 (`defaultTheme="dark"`)，且禁用了系统偏好同步 (`enableSystem={false}`)，确保视觉一致性。

## 2. 设计令牌 (Design Tokens)
在 `app/globals.css` 中定义了基础的全局 CSS 变量，用于控制页面背景与前景色：
- **浅色模式**：`--background: #ffffff`, `--foreground: #171717`
- **深色模式**：`--background: #0a0a0a`, `--foreground: #ededed`
- **字体栈**：优先使用 `var(--font-geist-sans)`，回退至 `system-ui`。

## 3. 布局风格与组件规范
项目实现了三种新闻布局原型，最终选定 **“头条 + 列表”混合布局** 以平衡信息密度与阅读体验：

### 混合布局架构
- **头条卡片 (`NewsHeadline`)**：
  - 占据视觉重心，包含大图（16:9 比例）、加粗标题、详细摘要及来源标签。
  - 交互：悬停时边框变蓝 (`hover:border-blue-500`)，图片轻微放大 (`group-hover:scale-105`)。
- **紧凑列表 (`NewsListItem`)**：
  - 采用 Flex 布局，左侧为来源首字母图标，右侧为截断的标题与摘要，最右侧垂直排列来源标签与相对时间。
  - 交互：悬停时整体边框高亮，标题颜色变化。

### 视觉一致性约定
- **边框与圆角**：统一使用 `border-gray-200` (浅) / `border-gray-700` (深) 作为组件边界，圆角多为 `rounded-lg` 或 `rounded-xl`。
- **色彩语义**：
  - 蓝色系 (`blue-500`, `blue-900/30`) 用于强调链接、激活状态及来源标签。
  - 灰色系 (`gray-400` ~ `gray-600`) 用于次要文本和辅助信息。
- **响应式处理**：内容区域限制最大宽度 (`max-w-3xl`) 并居中，确保在大屏下的阅读舒适度。

## 4. 开发者指南
- **样式编写**：禁止编写独立的 `.css` 文件（除全局变量外），所有样式应通过 Tailwind 类名实现。
- **深色适配**：所有涉及颜色的类名必须同时提供 `dark:` 变体，例如 `bg-white dark:bg-gray-950`。
- **交互反馈**：可点击组件必须包含 `transition-colors` 或 `transition-transform` 以确保平滑的悬停效果。