# Frequently Asked Questions (FAQ)

## General Questions

### What is Snapshot With Gitignore?
Snapshot With Gitignore is a web-based tool that generates a single Markdown file containing all your project's source code, intelligently respecting `.gitignore` rules. It's specifically optimized for pasting into AI conversations.

### Why would I need this?
When working with AI assistants like ChatGPT, Claude, or Gemini, you often need to share your entire codebase. Manually copying files is tedious and error-prone. This tool automates the process and ensures only relevant files are included.

### Is it free?
Yes! This is an open-source project under the MIT license. You can use it freely for personal or commercial projects.

### Does it require an internet connection?
The tool runs entirely in your browser using local processing. Your code never leaves your computer. However, you need internet to load the initial application.

## Usage Questions

### How do I use it?
1. Click "Select Project Folder" or drag your project folder into the window
2. Review the files that will be included
3. Click "Generate Snapshot"
4. Copy or download the result

See [EXAMPLES.md](./EXAMPLES.md) for detailed usage examples.

### What files are ignored by default?
- Common directories: `node_modules`, `.git`, `build`, `dist`, `.vscode`, `.idea`
- Lock files: `package-lock.json`, `yarn.lock`
- Binary files: images, videos, executables, archives
- Large files: anything over 1MB

### Can I customize the ignore rules?
Yes! You can edit the gitignore rules directly in the application. Changes take effect immediately.

### Does it support nested `.gitignore` files?
Yes! The tool respects all `.gitignore` files in your project, including those in subdirectories.

### What's the maximum file size?
By default, files larger than 1MB are excluded. This prevents the snapshot from becoming too large.

### Can I include binary files?
No, binary files (images, videos, executables) are automatically excluded. The tool is designed for text-based source code.

## Technical Questions

### What browsers are supported?
Modern browsers that support:
- File System Access API (for folder selection)
- Web Workers (for background processing)
- ES2022 JavaScript features

Tested on Chrome 90+, Firefox 90+, Safari 15+, Edge 90+.

### Does it work offline?
After the initial load, the core functionality works offline. However, you need to build and host it locally for full offline use.

### How does it handle large projects?
The tool uses Web Workers to process files in the background without blocking the UI. However, extremely large projects (10,000+ files) may take some time to process.

### Is my code sent to any server?
No! All processing happens locally in your browser. Your code never leaves your computer.

### What about privacy?
This tool does not collect, store, or transmit any data. However, once you paste the snapshot into an AI service, that service's privacy policy applies.

## AI Integration Questions

### Which AI services work with this?
Any AI service that accepts text input:
- ChatGPT (OpenAI)
- Claude (Anthropic)
- Gemini (Google)
- GitHub Copilot Chat
- And many others

### What's the best way to use it with AI?
1. Generate the snapshot
2. Copy to clipboard
3. Paste into your AI conversation
4. Add your specific question or request

### Are there token limits?
Yes, AI services have input token limits. For very large projects, you may need to:
- Split the snapshot into multiple parts
- Ask the AI to focus on specific files
- Use the snapshot as a reference rather than pasting everything at once

### Can I use it for code reviews?
Absolutely! It's great for:
- Getting AI feedback on architecture
- Finding bugs and security issues
- Asking for refactoring suggestions
- Generating documentation

## Troubleshooting

### The folder picker doesn't work
- Make sure you're using a modern browser
- Try using drag-and-drop instead
- Check that you have file system permissions

### Some files are missing
- Check your `.gitignore` rules
- Verify files aren't binary or over 1MB
- Look in the excluded directories list

### The snapshot is too large
- Exclude more directories (test files, docs, etc.)
- Remove large data files
- Split your project into smaller parts

### It's running slowly
- Large projects take longer to process
- Close other browser tabs
- Try a smaller subset of files first

### The page is unresponsive
- The Web Worker is processing files
- Wait a few moments for it to complete
- For very large projects (10k+ files), this is normal

## Development Questions

### Can I contribute?
Yes! See [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.

### How do I run it locally?
```bash
git clone https://github.com/cagedbird043/snapshot-with-gitignore.git
cd snapshot-with-gitignore
npm install
npm run dev
```

### Can I modify it for my needs?
Yes! The code is open source under MIT license. Fork it and customize as needed.

### How do I report bugs?
Open an issue on [GitHub](https://github.com/cagedbird043/snapshot-with-gitignore/issues) with:
- Description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Browser and OS information

### How do I request features?
Open a feature request on [GitHub Issues](https://github.com/cagedbird043/snapshot-with-gitignore/issues/new/choose).

## Security Questions

### Is it safe to use?
Yes, but remember:
- Review the snapshot before sharing
- Never include sensitive data (API keys, passwords, etc.)
- Use `.gitignore` to exclude sensitive files

### What about sensitive files?
Always ensure your `.gitignore` excludes:
- `.env` files
- API keys and secrets
- Database credentials
- Personal information

### Can I audit the code?
Absolutely! The entire codebase is open source. You can review every line.

### What about data privacy?
This tool doesn't collect any data. However, when you paste code into an AI service, you're subject to that service's privacy policy.

## More Questions?

- 📖 [Read the full documentation](../README.md)
- 🐛 [Report an issue](https://github.com/cagedbird043/snapshot-with-gitignore/issues)
- 💬 [Start a discussion](https://github.com/cagedbird043/snapshot-with-gitignore/discussions)
- ⭐ [Star the project](https://github.com/cagedbird043/snapshot-with-gitignore)

---

<div align="center">

**Didn't find your question? [Ask us!](https://github.com/cagedbird043/snapshot-with-gitignore/discussions/new)**

</div>
