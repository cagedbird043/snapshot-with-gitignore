# 📸 Snapshot With Gitignore - Usage Examples

## Example 1: Basic Usage (基本使用)

### Step 1: Select a Project Folder
Click the "Select Project Folder" button and choose your project directory.

点击"选择项目文件夹"按钮，选择你的项目目录。

![Select Folder](../docs/images/step1-select-folder.png)

---

### Step 2: Review Files to Include
The app will automatically detect `.gitignore` files and show you which files will be included.

应用会自动检测 `.gitignore` 文件并显示将包含的文件列表。

![File List](../docs/images/step2-file-list.png)

---

### Step 3: Generate Snapshot
Click "Generate Snapshot" to create the markdown file.

点击"生成快照"按钮创建 markdown 文件。

![Generate](../docs/images/step3-generate.png)

---

### Step 4: Copy or Download
Copy to clipboard or download the snapshot file.

复制到剪贴板或下载快照文件。

![Result](../docs/images/step4-result.png)

---

## Example 2: Custom Ignore Rules (自定义忽略规则)

You can edit the gitignore rules directly in the app:

你可以直接在应用中编辑 gitignore 规则：

```gitignore
# Ignore all test files
*.test.ts
*.spec.ts

# Ignore specific directories
temp/
cache/

# Ignore by pattern
*-backup.*
```

---

## Example 3: Drag and Drop (拖放操作)

Simply drag your project folder into the application window!

直接将项目文件夹拖入应用窗口即可！

![Drag and Drop](../docs/images/drag-drop.gif)

---

## Example 4: Output Format (输出格式)

The generated snapshot will look like this:

生成的快照格式如下：

```markdown
# Project Snapshot: my-awesome-project

This file contains a snapshot of the project structure and source code, formatted for AI consumption.
Total files included: 42

## Project Structure

```
.
├── [  1.2 KB] package.json
├── [  3.4 KB] README.md
├── src/
│   ├── components/
│   │   ├── [  2.1 KB] App.tsx
│   │   └── [  1.5 KB] Header.tsx
│   └── utils/
│       └── [  890 B] helpers.ts
└── vite.config.ts
```

## File Contents

```typescript:src/components/App.tsx
import React from 'react';
// ... full file content ...
```

```typescript:src/utils/helpers.ts
export function formatDate(date: Date): string {
  // ... full file content ...
}
```
```

---

## Example 5: Use with AI (与 AI 配合使用)

### ChatGPT / Claude / Gemini

1. Generate the snapshot
2. Copy to clipboard
3. Paste into your AI conversation
4. Ask questions like:

```
Here's my project code. Can you:
- Review the architecture
- Find potential bugs
- Suggest improvements
- Add missing features
- Write documentation
```

这是我的项目代码。你能：
- 审查架构
- 找出潜在的 bug
- 建议改进
- 添加缺失的功能
- 编写文档

---

## Example 6: Common Use Cases (常见使用场景)

### Code Review (代码审查)
```
Please review this codebase and identify:
1. Security vulnerabilities
2. Performance issues
3. Code smells
4. Best practice violations
```

### Documentation Generation (文档生成)
```
Generate comprehensive documentation for this project including:
- API reference
- Usage examples
- Architecture overview
```

### Bug Hunting (Bug 查找)
```
Analyze this code and help me find the bug causing [issue description]
```

### Refactoring Suggestions (重构建议)
```
Suggest how to refactor this codebase to:
- Improve maintainability
- Reduce complexity
- Follow SOLID principles
```

---

## Tips & Tricks (提示和技巧)

### 1. Exclude Sensitive Files
Always ensure your `.gitignore` excludes:
- API keys and secrets (`.env` files)
- Database credentials
- Personal information

确保你的 `.gitignore` 排除了：
- API 密钥和秘密（`.env` 文件）
- 数据库凭证
- 个人信息

### 2. File Size Limits
The default limit is 1MB per file. Larger files are automatically excluded.

默认每个文件限制为 1MB。更大的文件会自动排除。

### 3. Binary Files
Binary files (images, videos, executables) are automatically skipped.

二进制文件（图片、视频、可执行文件）会自动跳过。

### 4. Multiple .gitignore Files
The tool respects all `.gitignore` files in your project, including nested ones.

工具会尊重项目中所有的 `.gitignore` 文件，包括嵌套的。

---

## Need Help? (需要帮助？)

- 📖 [Read the full documentation](../README.md)
- 🐛 [Report an issue](https://github.com/cagedbird043/snapshot-with-gitignore/issues)
- 💬 [Ask a question](https://github.com/cagedbird043/snapshot-with-gitignore/discussions)
- ⭐ [Star the project](https://github.com/cagedbird043/snapshot-with-gitignore)

---

<div align="center">

**Happy Coding with AI! 🚀**

**用 AI 愉快编程！🚀**

</div>
