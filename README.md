<div align="center">

# 📸 Snapshot With Gitignore

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61dafb.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646cff.svg)](https://vitejs.dev/)

**一个智能的项目代码快照生成工具，专为 AI 对话优化**

_An intelligent project code snapshot generator, optimized for AI conversations_

**[🚀 在线试用 / Try it Online](https://cagedbird043.github.io/snapshot-with-gitignore/)**

[English](#english) | [中文](#chinese)

</div>

---

<a name="chinese"></a>

## 🌟 简介

**Snapshot With Gitignore** 是一个轻量级的 Web 应用，可以将整个项目文件夹转换为单个、结构化的 Markdown 文件。该工具智能地遵循 `.gitignore` 规则，过滤掉不必要的文件，生成完美适合粘贴到 AI 对话（如 ChatGPT、Claude、Gemini）中的代码快照。

### 🎯 核心特性

- **🎯 智能过滤**：自动识别并应用所有 `.gitignore` 规则（包括嵌套的）
- **📦 内置忽略规则**：自动过滤 `node_modules`、`build`、`.git` 等常见目录
- **🖱️ 拖放支持**：直接拖放项目文件夹即可开始
- **📊 项目树可视化**：生成带有文件大小的清晰树状结构
- **⚡ Web Worker 加速**：后台处理，不阻塞 UI
- **📋 一键复制**：快速复制到剪贴板，直接粘贴到 AI 对话
- **💾 导出功能**：下载为 `.md` 文件，方便存档
- **🎨 实时预览**：生成前可预览将包含的文件列表
- **🔧 可自定义规则**：在线编辑忽略规则，实时生效

### 🚀 为什么选择它？

当你需要向 AI 助手展示整个项目代码时，手动复制粘贴费时费力。这个工具可以：

- ✅ 自动整理所有源代码文件
- ✅ 保持完整的文件路径和项目结构
- ✅ 过滤掉二进制文件和依赖包
- ✅ 生成 AI 友好的格式化输出
- ✅ **让你的生产力倍增！**

### 📦 快速开始

#### 在线使用

**🌐 直接访问**: [https://cagedbird043.github.io/snapshot-with-gitignore/](https://cagedbird043.github.io/snapshot-with-gitignore/)

无需安装，打开浏览器即可使用！

#### 本地开发

**前置要求**

- Node.js 18+
- npm 或 yarn

**安装步骤**

```bash
# 克隆仓库
git clone https://github.com/cagedbird043/snapshot-with-gitignore.git
cd snapshot-with-gitignore

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

应用将在 `http://localhost:3000` 打开。

#### 构建生产版本

```bash
npm run build
npm run preview
```

### 🎮 使用方法

1. **选择项目文件夹**：
   - 点击 "Select Project Folder" 按钮，或
   - 直接拖放项目文件夹到应用窗口

2. **查看过滤结果**：
   - 应用会自动加载 `.gitignore` 规则
   - 显示将被包含的文件列表
   - 实时显示文件数量和大小统计

3. **调整规则（可选）**：
   - 在文本框中编辑 gitignore 规则
   - 支持标准 gitignore 语法
   - 修改后自动重新过滤

4. **生成快照**：
   - 点击 "Generate Snapshot" 按钮
   - 等待后台处理完成
   - 查看生成的预览

5. **使用快照**：
   - 点击 "Copy to Clipboard" 复制到剪贴板
   - 或点击 "Download Snapshot File" 下载为文件
   - 粘贴到你的 AI 对话中！

### 📋 输出格式

生成的快照包含：

````markdown
# Project Snapshot: your-project-name

## Project Structure

```
.
├── src/
│   ├── components/
│   │   └── App.tsx
│   └── utils/
└── package.json
```

## File Contents

```typescript:src/components/App.tsx
// 完整的文件内容...
```
````

### 🛠️ 技术栈

- **前端框架**: React 19
- **类型系统**: TypeScript 5.8
- **构建工具**: Vite 6.2
- **样式**: 原生 CSS（CSS Variables）
- **并发处理**: Web Workers API

### 🎨 默认过滤规则

#### 目录

- `.git`, `.vscode`, `.idea`
- `node_modules`, `build`, `dist`, `target`
- `.venv`, `debug`, `release`

#### 文件

- `package-lock.json`, `yarn.lock`
- 所有二进制文件（图片、视频、音频）
- 编译产物（`.exe`, `.dll`, `.so`, `.o`, 等）

#### 大小限制

- 单个文件最大 1MB

### 🤝 贡献指南

欢迎贡献！请查看 [CONTRIBUTING.md](./CONTRIBUTING.md) 了解详情。

### 📄 开源协议

本项目采用 [MIT License](./LICENSE) 开源。

### 💡 灵感来源

这个项目由 Google AI Studio 对话生成，是 AI 辅助编程的完美示例。它展示了如何利用 AI 快速构建实用工具，并通过本工具本身来提升 AI 对话的效率。

### 🙏 致谢

- 感谢 Google AI Studio 提供的强大 AI 能力
- 感谢所有开源贡献者

---

<a name="english"></a>

## 🌟 Introduction

**Snapshot With Gitignore** is a lightweight web application that transforms entire project folders into single, structured Markdown files. This tool intelligently respects `.gitignore` rules, filters out unnecessary files, and generates code snapshots perfectly suited for pasting into AI conversations (like ChatGPT, Claude, Gemini).

### 🎯 Key Features

- **🎯 Smart Filtering**: Automatically recognizes and applies all `.gitignore` rules (including nested ones)
- **📦 Built-in Ignore Rules**: Auto-filters common directories like `node_modules`, `build`, `.git`
- **🖱️ Drag & Drop Support**: Simply drag and drop your project folder to start
- **📊 Project Tree Visualization**: Generates clear tree structure with file sizes
- **⚡ Web Worker Acceleration**: Background processing without blocking UI
- **📋 One-Click Copy**: Quick copy to clipboard, paste directly into AI conversations
- **💾 Export Function**: Download as `.md` file for archiving
- **🎨 Real-time Preview**: Preview file list before generation
- **🔧 Customizable Rules**: Edit ignore rules online with instant effect

### 🚀 Why Choose It?

When you need to show your entire project code to an AI assistant, manual copy-pasting is time-consuming and error-prone. This tool:

- ✅ Automatically organizes all source code files
- ✅ Maintains complete file paths and project structure
- ✅ Filters out binary files and dependency packages
- ✅ Generates AI-friendly formatted output
- ✅ **Multiplies your productivity!**

### 📦 Quick Start

#### Online Use

**🌐 Try it now**: [https://cagedbird043.github.io/snapshot-with-gitignore/](https://cagedbird043.github.io/snapshot-with-gitignore/)

No installation required, just open in your browser!

#### Local Development

**Prerequisites**

- Node.js 18+
- npm or yarn

**Installation**

```bash
# Clone the repository
git clone https://github.com/cagedbird043/snapshot-with-gitignore.git
cd snapshot-with-gitignore

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will open at `http://localhost:3000`.

#### Build for Production

```bash
npm run build
npm run preview
```

### 🎮 Usage

1. **Select Project Folder**:
   - Click "Select Project Folder" button, or
   - Drag and drop project folder into the app window

2. **Review Filtering Results**:
   - App automatically loads `.gitignore` rules
   - Displays list of files to be included
   - Shows real-time file count and size statistics

3. **Adjust Rules (Optional)**:
   - Edit gitignore rules in the text box
   - Supports standard gitignore syntax
   - Auto-refilters after modifications

4. **Generate Snapshot**:
   - Click "Generate Snapshot" button
   - Wait for background processing to complete
   - Review the generated preview

5. **Use Snapshot**:
   - Click "Copy to Clipboard" to copy
   - Or click "Download Snapshot File" to download
   - Paste into your AI conversation!

### 📋 Output Format

Generated snapshots contain:

````markdown
# Project Snapshot: your-project-name

## Project Structure

```
.
├── src/
│   ├── components/
│   │   └── App.tsx
│   └── utils/
└── package.json
```

## File Contents

```typescript:src/components/App.tsx
// Complete file contents...
```
````

### 🛠️ Tech Stack

- **Frontend Framework**: React 19
- **Type System**: TypeScript 5.8
- **Build Tool**: Vite 6.2
- **Styling**: Native CSS (CSS Variables)
- **Concurrent Processing**: Web Workers API

### 🎨 Default Filter Rules

#### Directories

- `.git`, `.vscode`, `.idea`
- `node_modules`, `build`, `dist`, `target`
- `.venv`, `debug`, `release`

#### Files

- `package-lock.json`, `yarn.lock`
- All binary files (images, videos, audio)
- Compiled artifacts (`.exe`, `.dll`, `.so`, `.o`, etc.)

#### Size Limit

- Maximum 1MB per file

### 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

### 📄 License

This project is open source under the [MIT License](./LICENSE).

### 💡 Inspiration

This project was generated through conversations with Google AI Studio, serving as a perfect example of AI-assisted programming. It demonstrates how to leverage AI to quickly build practical tools, and uses the tool itself to enhance AI conversation efficiency.

### 🙏 Acknowledgments

- Thanks to Google AI Studio for powerful AI capabilities
- Thanks to all open source contributors

---

<div align="center">

**Made with ❤️ and AI**

**[🚀 Try it Online](https://cagedbird043.github.io/snapshot-with-gitignore/)** | **[⭐ Star on GitHub](https://github.com/cagedbird043/snapshot-with-gitignore)**

If this project helps you, please give it a ⭐️!

</div>
```
