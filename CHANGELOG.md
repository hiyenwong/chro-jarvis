# Changelog

All notable changes to Chro-Jarvis will be documented in this file.

## [1.0.0] - 2026-03-01

### Added
- 🎉 **Initial Release**
- 🤖 AI 问答功能
  - 支持基于页面上下文的智能问答
  - 支持多个 AI 提供商（DeepSeek、智谱 AI、火山引擎、OpenAI、Claude）
  - 每个标签页独立的对话历史

- 🌍 翻译功能
  - 整页翻译
  - 支持多种目标语言（中文、英语、日语、韩语、法语、德语、西班牙语）
  - 翻译进度显示

- 📊 Token 消耗监控
  - 实时 Token 使用统计
  - 按时间段统计（今天/7天/30天/全部）
  - 按提供商和模型的详细分析
  - Token 使用趋势图表
  - 成本计算
  - 数据导出/导入功能

- 🔧 配置管理
  - 多 AI 提供商切换
  - API Key 安全存储
  - 目标语言选择

- ✨ 用户体验优化
  - Toast 通知系统
  - 优雅的错误处理
  - 加载状态指示
  - 响应式界面设计

### Technical
- React 19 + TypeScript + Vite
- Chrome MV3 扩展架构
- 完整的单元测试覆盖
- 自动化构建流程

### Security
- API Key 本地加密存储
- HTTPS 通信
- 无数据上传到第三方服务器

---

## 版本说明

版本号格式：`主版本.次版本.修订版本`

- **主版本**：不兼容的 API 变更
- **次版本**：向下兼容的功能新增
- **修订版本**：向下兼容的问题修复
