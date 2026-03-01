# Chro-Jarvis - AI 驱动的 Chrome 扩展

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Chrome](https://img.shields.io/badge/Chrome-88%2B-green.svg)
![License](https://img.shields.io/badge/license-MIT-purple.svg)

一个强大的 Chrome 扩展，集成了 AI 问答、翻译和 Token 消耗监控功能，支持多种 AI 提供商。

[功能特性](#功能特性) • [快速开始](#快速开始) • [使用指南](#使用指南) • [开发文档](#开发文档)

</div>

---

## 功能特性

### 🤖 AI 问答
- 基于页面上下文的智能问答
- 支持 5 大 AI 提供商：
  - DeepSeek
  - 智谱 AI
  - 火山引擎
  - OpenAI
  - Claude
- 实时 Token 消耗统计
- 每个标签页独立的对话历史

### 🌍 翻译功能
- 整页翻译，支持大型页面
- 选中文字翻译
- 支持 8 种目标语言：
  - 简体中文、繁体中文
  - 英语、日语、韩语
  - 法语、德语、西班牙语
- 翻译进度实时显示
- 可取消翻译操作

### 📊 Token 监控
- 详细的 Token 消耗分析
- 多维度统计：
  - 按时间段（今天/7天/30天/全部）
  - 按提供商
  - 按模型
- 可视化趋势图表
- 成本计算（基于当前市场价格）
- 数据导出/导入功能

### ✨ 用户体验
- Toast 通知系统
- 优雅的错误处理
- 加载状态指示
- 响应式界面设计
- 暗色主题支持（即将推出）

---

## 快速开始

### 安装方法

#### 方法一：开发者模式安装（推荐用于测试）

1. 下载或克隆本项目
2. 安装依赖并构建：
   ```bash
   npm install
   npm run build
   ```
3. 打开 Chrome 浏览器，访问 `chrome://extensions/`
4. 启用右上角的「开发者模式」
5. 点击「加载已解压的扩展程序」
6. 选择项目的 `dist` 目录

#### 方法二：从 Chrome Web Store 安装（即将推出）

> 搜索「Chro-Jarvis」或访问我们的 Chrome Web Store 页面

---

## 使用指南

### 初次配置

1. **打开扩展**
   - 点击浏览器工具栏中的 Chro-Jarvis 图标

2. **配置 AI 提供商**
   - 切换到「设置」标签
   - 选择 AI 供应商
   - 输入您的 API Key
   - 点击「保存配置」

3. **选择目标语言**（用于翻译功能）
   - 在设置中选择默认翻译语言

### 使用 AI 问答

1. 打开任意网页
2. 点击扩展图标，选择「打开侧边栏」
3. 在侧边栏中输入您的问题
4. AI 将基于当前页面内容回答您的问题

### 使用翻译功能

1. **翻译整页**
   - 点击扩展图标
   - 选择「翻译页面」按钮
   - 等待翻译完成

2. **翻译选中文字**（即将推出）
   - 选中页面上的文字
   - 右键选择「翻译」

### 查看 Token 统计

1. 点击扩展图标
2. 切换到「Token 统计」标签
3. 查看：
   - 总 Token 消耗和成本
   - 按时间段筛选
   - 按提供商/模型查看详情
   - 使用趋势图表

---

## 开发文档

### 技术栈

- **前端框架**: React 19 + TypeScript
- **构建工具**: Vite 7
- **测试框架**: Vitest + Testing Library
- **样式方案**: Tailwind CSS 4
- **Chrome API**: MV3 (Manifest V3)

### 项目结构

```
chro-jarvis/
├── public/
│   └── manifest.json          # 扩展清单文件
├── src/
│   ├── background/            # 后台脚本
│   │   ├── index.ts          # Service Worker 入口
│   │   └── contextManager.ts # 标签页上下文管理
│   ├── content-scripts/       # 内容脚本
│   │   ├── index.ts          # 入口
│   │   └── translator.ts     # 页面翻译器
│   ├── popup/                 # 弹出窗口
│   │   ├── Popup.tsx         # 主容器
│   │   ├── QuickActions.tsx  # 快速操作
│   │   ├── SettingsTab.tsx   # 设置面板
│   │   └── TokenStatsPanel.tsx # Token 统计
│   ├── sidebar/               # 侧边栏
│   │   ├── Sidebar.tsx       # 主容器
│   │   ├── ChatHistory.tsx   # 聊天历史
│   │   └── QuestionInput.tsx # 问题输入
│   ├── types/                 # TypeScript 类型定义
│   ├── utils/                 # 工具函数
│   │   ├── aiApi.ts         # AI 提供商集成
│   │   ├── baseAiProvider.ts # AI 提供商基类
│   │   ├── errorHandler.ts   # 错误处理
│   │   ├── storage.ts       # 存储管理
│   │   ├── toast.ts         # Toast 通知
│   │   ├── tokenTracker.ts  # Token 追踪
│   │   ├── translator.ts    # 翻译器
│   │   └── commonUtils.ts   # 通用工具
│   └── test/                  # 测试配置
├── package.json
├── vite.config.ts
├── tsconfig.json
└── tailwind.config.js
```

### 开发命令

```bash
# 安装依赖
npm install

# 开发模式（支持热重载）
npm run dev

# 构建生产版本
npm run build

# 运行测试
npm test

# 运行测试（监视模式）
npm run test:watch

# 代码检查
npm run lint
```

### 添加新的 AI 提供商

1. 在 `src/utils/aiApi.ts` 中创建新的 Provider 类
2. 继承 `BaseAiProvider`
3. 实现 `getProviderName()` 方法
4. 在 `createAiProvider()` 工厂函数中添加新的 case
5. 在 `src/utils/commonUtils.ts` 中添加成本计算配置
6. 在 `src/popup/SettingsTab.tsx` 中添加 UI 选项

### 测试

```bash
# 运行所有测试
npm test

# 运行特定测试文件
npx vitest src/utils/tokenTracker.test.ts

# 生成覆盖率报告
npx vitest --run --coverage
```

---

## API Key 获取指南

### DeepSeek
1. 访问 [DeepSeek 开放平台](https://platform.deepseek.com/)
2. 注册账号
3. 在「API Keys」页面创建新密钥

### 智谱 AI
1. 访问 [智谱AI 开放平台](https://open.bigmodel.cn/)
2. 注册账号
3. 在「API 密钥」页面创建新密钥

### 火山引擎
1. 访问 [火山引擎 ARK 平台](https://ark.cn-beijing.volces.com/)
2. 创建推理接口
3. 获取 API Key

### OpenAI
1. 访问 [OpenAI Platform](https://platform.openai.com/)
2. 注册账号
3. 在「API keys」页面创建新密钥

### Claude
1. 访问 [Anthropic Console](https://console.anthropic.com/)
2. 注册账号
3. 在「API Keys」页面创建新密钥

---

## 数据安全

- 🔐 **API Key 安全**
  - 使用 Chrome 加密存储
  - 仅存储在本地设备
  - 从不上传到任何服务器

- 🔒 **隐私保护**
  - Token 使用记录仅存储在浏览器本地
  - 不收集任何个人数据
  - 不追踪用户行为

- 🌐 **网络通信**
  - 所有 API 调用使用 HTTPS
  - 直接与 AI 提供商通信
  - 不经过任何中间服务器

---

## 常见问题

### Q: 支持哪些 Chrome 版本？
A: 支持 Chrome 88 及以上版本。

### Q: Token 统计准确吗？
A: Token 统计基于各 AI 提供商返回的准确数据，包括提示词和响应的 Token 数量。

### Q: 可以同时使用多个 AI 提供商吗？
A: 可以在设置中随时切换 AI 提供商，Token 统计会自动按提供商分类。

### Q: 翻译功能消耗多少 Token？
A: 取决于页面内容长度和目标语言，您可以在 Token 统计中查看详细记录。

### Q: 数据可以导出吗？
A: 可以，在 Token 统计面板中点击「导出数据」即可导出 JSON 格式的统计记录。

---

## 贡献指南

我们欢迎各种形式的贡献！

### 报告问题
- 在 [Issues](https://github.com/your-repo/chro-jarvis/issues) 中搜索已有问题
- 如果没有找到，创建新的 Issue，详细描述问题

### 提交代码
1. Fork 本项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

### 代码规范
- 遵循现有的代码风格
- 添加必要的注释
- 为新功能编写测试
- 确保所有测试通过

---

## 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

---

## 致谢

- 感谢所有 AI 提供商（DeepSeek、智谱 AI、火山引擎、OpenAI、Anthropic）
- 感谢开源社区的所有贡献者
- 感谢 React、Vite 和 Chrome Extension 社区

---

## 联系方式

- GitHub Issues: [提交问题](https://github.com/hiyenwong/chro-jarvis/issues)
- Email: hiyenwong@gmail.com

---

<div align="center">

**⭐ 如果这个项目对您有帮助，请给我们一个 Star！**

Made with ❤️ by Chro-Jarvis Team

</div>
