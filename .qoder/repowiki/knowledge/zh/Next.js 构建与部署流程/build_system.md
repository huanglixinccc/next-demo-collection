该项目基于 Next.js 框架构建，采用标准的 npm 脚本进行生命周期管理。核心构建系统依赖于 `next build` 进行生产环境编译，并通过 `next start` 启动服务。此外，项目引入了 PM2 (`ecosystem.config.js`) 作为进程管理器，用于在生产环境中守护应用并配置端口（3200）。代码质量方面，集成了 ESLint 和 TypeScript 进行静态检查，并使用 Tailwind CSS v4 进行样式处理。

### 核心工具链
- **框架**: Next.js 16.2.9 (React 19)
- **包管理器**: npm
- **语言**: TypeScript 5
- **样式**: Tailwind CSS v4 + PostCSS
- **进程管理**: PM2
- **Node 版本**: 20 (由 `.nvmrc` 指定)

### 关键脚本
- `npm run dev`: 启动开发服务器。
- `npm run build`: 执行生产环境构建，生成 `.next` 目录。
- `npm run start`: 启动生产服务器。
- `npm run lint`: 运行 ESLint 检查。

### 部署约定
生产环境部署建议使用 PM2 加载 `ecosystem.config.js` 配置文件，该配置指定了应用名称为 `next-demo` 并监听 3200 端口。