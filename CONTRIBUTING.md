# Contributing to Snapshot With Gitignore

First off, thank you for considering contributing to Snapshot With Gitignore! 🎉

It's people like you that make this tool better for everyone.

## 📋 Table of Contents

- [Contributing to Snapshot With Gitignore](#contributing-to-snapshot-with-gitignore)
    - [📋 Table of Contents](#-table-of-contents)
    - [Code of Conduct](#code-of-conduct)
    - [How Can I Contribute?](#how-can-i-contribute)
        - [Reporting Bugs](#reporting-bugs)
        - [Suggesting Enhancements](#suggesting-enhancements)
        - [Pull Requests](#pull-requests)
    - [Development Setup](#development-setup)
    - [Style Guidelines](#style-guidelines)
        - [Git Commit Messages](#git-commit-messages)
        - [TypeScript Style Guide](#typescript-style-guide)
        - [CSS Style Guide](#css-style-guide)
    - [Project Structure](#project-structure)
    - [Questions?](#questions)

## Code of Conduct

This project and everyone participating in it is governed by common sense and mutual respect. By participating, you are expected to uphold this standard. Please be respectful, constructive, and kind.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps which reproduce the problem**
- **Provide specific examples to demonstrate the steps**
- **Describe the behavior you observed after following the steps**
- **Explain which behavior you expected to see instead and why**
- **Include screenshots or animated GIFs** if possible
- **Include your environment details** (OS, browser, Node.js version, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

- **Use a clear and descriptive title**
- **Provide a step-by-step description of the suggested enhancement**
- **Provide specific examples to demonstrate the steps**
- **Describe the current behavior** and **explain which behavior you expected to see instead**
- **Explain why this enhancement would be useful**

### Pull Requests

1. Fork the repo and create your branch from `main`
2. If you've added code that should be tested, add tests
3. If you've changed APIs, update the documentation
4. Ensure the test suite passes
5. Make sure your code lints
6. Issue that pull request!

## Development Setup

1. **Clone the repository**

    ```bash
    git clone https://github.com/cagedbird043/snapshot-with-gitignore.git
    cd snapshot-with-gitignore
    ```

2. **Install dependencies**

    ```bash
    npm install
    ```

3. **Set up pre-commit hooks**

    This project uses [husky](https://typicode.github.io/husky/) and [lint-staged](https://github.com/okonet/lint-staged) to run linting and formatting on staged files before each commit.

    ```bash
    npm run prepare
    ```

    This will set up the pre-commit hooks that automatically:
    - Run ESLint and fix issues on TypeScript/TSX files
    - Format code with Prettier on all supported file types
    - Prevent commits if there are unfixable linting errors

4. **Start the development server**

    ```bash
    npm run dev
    ```

5. **Build for production**

    ```bash
    npm run build
    ```

6. **Run type checking**
    ```bash
    npm run type-check
    ```

## Style Guidelines

### Git Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally after the first line
- Consider starting the commit message with an applicable emoji:
    - 🎨 `:art:` when improving the format/structure of the code
    - 🐎 `:racehorse:` when improving performance
    - 📝 `:memo:` when writing docs
    - 🐛 `:bug:` when fixing a bug
    - 🔥 `:fire:` when removing code or files
    - ✅ `:white_check_mark:` when adding tests
    - 🔒 `:lock:` when dealing with security
    - ⬆️ `:arrow_up:` when upgrading dependencies
    - ⬇️ `:arrow_down:` when downgrading dependencies

### TypeScript Style Guide

- Use TypeScript for all new code
- Prefer `const` over `let`, avoid `var`
- Use meaningful variable names
- Add type annotations for function parameters and return values
- Use interfaces for object types
- Prefer functional components with hooks over class components
- Keep functions small and focused on a single task
- Add comments for complex logic

Example:

```typescript
interface FileMetadata {
    path: string;
    size: number;
}

function processFiles(files: File[]): FileMetadata[] {
    return files.map(file => ({
        path: file.webkitRelativePath,
        size: file.size,
    }));
}
```

### CSS Style Guide

- Use CSS Variables for theme colors
- Follow BEM naming convention where applicable
- Keep selectors as simple as possible
- Group related properties together
- Use meaningful class names
- Add comments for complex styles

Example:

```css
/* Component: File List */
.file-list {
    list-style: none;
    padding: 0;
}

.file-list__item {
    padding: 0.5rem 1rem;
    border-bottom: 1px solid var(--border-color);
}

.file-list__item--selected {
    background-color: var(--primary-color);
}
```

## Project Structure

```
snapshot-with-gitignore/
├── index.html          # Main HTML entry point
├── index.tsx           # React application entry
├── index.css           # Global styles
├── package.json        # Project dependencies and scripts
├── tsconfig.json       # TypeScript configuration
├── vite.config.ts      # Vite build configuration
├── README.md           # Project documentation
├── CONTRIBUTING.md     # This file
├── CHANGELOG.md        # Version history
├── LICENSE             # MIT license
└── .gitignore          # Git ignore rules
```

## Questions?

Feel free to open an issue with your question or reach out to the maintainers.

---

**Thank you for your contribution!** 🙏

Every contribution, no matter how small, is valuable and appreciated.
