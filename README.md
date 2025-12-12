# JobLink

一个专注于连接求职者和企业的在线招聘平台。简单来说，就是让找工作变得更高效，让招人变得更精准。

## 这个项目是做什么的？

JobLink 是一个双端招聘系统，主要解决两个问题：

**对求职者来说**：

- 不用再海投简历了，AI 会帮你匹配合适的职位
- 可以管理多份简历，随时更新
- 追踪所有投递记录，不会错过任何反馈
- 参加线上招聘会，直接和 HR 沟通
- 还能找兼职，学生党友好

**对企业来说**：

- 发布职位很简单，几分钟搞定
- 主动搜索人才，不等人投简历
- 数据看板很直观，知道哪些职位受欢迎
- 管理申请流程，从收到简历到面试安排
- 收藏心仪候选人，方便后续联系

## 技术栈

- **前端**：React 19 + TypeScript + Vite
- **UI 组件**：shadcn/ui + Tailwind CSS
- **后端**：Supabase（数据库 + 认证）
- **状态管理**：TanStack Query
- **路由**：React Router
- **包管理**：Bun

## 快速开始

### 前置要求

需要安装 [Bun](https://bun.sh/docs/installation)，其他依赖会自动处理。

### 安装和运行

```bash
# 克隆项目
git clone <你的仓库地址>
cd JobLink

# 安装依赖
bun install

# 启动开发服务器
bun run dev
```

然后打开浏览器访问 `http://localhost:5173` 就能看到首页了。

### 构建生产版本

```bash
bun run build
```

构建好的文件在 `dist` 目录，可以直接部署。

## 项目结构

```
JobLink/
├── src/
│   ├── components/        # 组件库
│   │   ├── home/         # 首页组件
│   │   ├── jobseeker/    # 求职者相关组件
│   │   ├── layout/       # 布局组件（Header、Footer等）
│   │   └── ui/           # 基础 UI 组件（shadcn/ui）
│   ├── pages/            # 页面组件
│   │   ├── auth/         # 登录注册
│   │   ├── company/      # 企业端页面
│   │   └── jobseeker/    # 求职者端页面
│   ├── hooks/            # 自定义 Hooks
│   ├── integrations/     # 第三方集成（Supabase）
│   └── lib/              # 工具函数
├── supabase/             # Supabase 配置和迁移文件
└── public/               # 静态资源
```

## 主要功能

### 求职者功能

- ✅ 职位搜索和筛选
- ✅ 简历管理和编辑
- ✅ 申请追踪
- ✅ 职位收藏
- ✅ 接收企业邀请
- ✅ 招聘会参与
- ✅ 兼职工作搜索
- ✅ 职业指导

### 企业功能

- ✅ 职位发布和管理
- ✅ 人才搜索
- ✅ 申请管理
- ✅ 数据分析看板
- ✅ 人才收藏
- ✅ 主动邀请候选人
- ✅ 账户设置

## 开发说明

### 环境变量

需要配置 Supabase 的环境变量，在项目根目录创建 `.env.local`：

```env
VITE_SUPABASE_URL=你的_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=你的_supabase_anon_key
```

注意：变量名是 `VITE_SUPABASE_PUBLISHABLE_KEY`，不是 `VITE_SUPABASE_ANON_KEY`。

### 数据库迁移

项目使用 Supabase 作为后端，数据库结构在 `supabase/migrations/` 目录下。如果需要在本地运行 Supabase：

```bash
# 安装 Supabase CLI
npm install -g supabase

# 启动本地 Supabase
supabase start

# 运行迁移
supabase db reset
```

## 一些细节

- 支持深色/浅色主题切换
- 响应式设计，手机端也能用
- 使用 React Query 做数据缓存，减少不必要的请求
- 路由有权限控制，未登录会自动跳转

## 后续计划

- [ ] 增加消息系统，让求职者和企业可以直接沟通
- [ ] 优化 AI 匹配算法
- [ ] 添加更多数据分析维度
- [ ] 支持视频面试预约
- [ ] 多语言支持

## 许可证

MIT License

---

如果有什么问题或者建议，欢迎提 Issue 或者 PR。
