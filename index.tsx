/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, {useState, ChangeEvent, useEffect, useRef, DragEvent} from 'react';
import ReactDOM from 'react-dom/client';

// --- Configuration for file filtering ---

const IGNORED_DIRECTORIES = new Set([
  '.git', 'target', 'build', 'node_modules', '.vscode', '.idea', 'debug', 'release', '.venv'
]);

const IGNORED_FILES = new Set([
  'package-lock.json', 'yarn.lock'
]);

const IGNORED_BINARY_EXTENSIONS = new Set([
  'png', 'jpg', 'jpeg', 'gif', 'bmp', 'ico', 'webp', 'svg',
  'mp3', 'wav', 'ogg', 'mp4', 'mov', 'webm',
  'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
  'zip', 'rar', '7z', 'tar', 'gz',
  'exe', 'dll', 'so', 'a', 'o', 'lib', 'jar', 'class',
  'pdb', 'ds_store'
]);

const MAX_FILE_SIZE_BYTES = 1 * 1024 * 1024; // 1MB

// --- Helper functions for filtering (will be stringified for Web Worker) ---

function isFileIgnoredByGitignore(relativePath: string, gitignoreContent: string): boolean {
    const patterns = gitignoreContent
        .split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('#'));

    const globToRegex = (pattern: string) => {
        return pattern
            .replace(/[.+?^${}()|[\]\\]/g, '\\$&') 
            .replace(/\*\*/g, '.*') 
            .replace(/\*/g, '[^/]*')
            .replace(/\?/g, '[^/]');
    };

    for (const pattern of patterns) {
        const isDirPattern = pattern.endsWith('/');
        let p = isDirPattern ? pattern.slice(0, -1) : pattern;
        
        if (!p.includes('/')) {
            const regexString = `(^|/)${globToRegex(p)}`;
            if (isDirPattern) {
                if (new RegExp(regexString + '/').test(relativePath)) return true;
            } else {
                if (new RegExp(regexString + '(/|$)').test(relativePath)) return true;
            }
        } 
        else {
            if (p.startsWith('/')) {
                p = p.substring(1);
            }
            const regexString = `^${globToRegex(p)}`;
            if (isDirPattern) {
                if (new RegExp(regexString + '/').test(relativePath)) return true;
            } else {
                if (new RegExp(regexString + '(/|$)').test(relativePath)) return true;
            }
        }
    }
    return false;
}

interface GitignoreFile {
    path: string;
    content: string;
}

// NOTE: This function and its dependencies will be executed inside a Web Worker.
function isFileAllowed(
    file: File, 
    gitignores: GitignoreFile[],
    projectName: string,
    IGNORED_DIRECTORIES_WORKER: Set<string>,
    IGNORED_FILES_WORKER: Set<string>,
    IGNORED_BINARY_EXTENSIONS_WORKER: Set<string>,
    MAX_FILE_SIZE_BYTES_WORKER: number,
    isFileIgnoredByGitignore_WORKER: (relativePath: string, gitignoreContent: string) => boolean,
): boolean {
  // 0. Pre-filter by size and binary extension for performance.
  if (file.size > MAX_FILE_SIZE_BYTES_WORKER) {
      return false;
  }
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  if (IGNORED_BINARY_EXTENSIONS_WORKER.has(extension)) {
      return false;
  }

  // 1. Check against globally ignored directories.
  const lowerCasePathParts = file.webkitRelativePath.toLowerCase().split('/');
  for (const part of lowerCasePathParts) {
    if (IGNORED_DIRECTORIES_WORKER.has(part)) {
      return false;
    }
  }

  // 2. Check against globally ignored files.
  const fileName = file.name.toLowerCase();
  if (IGNORED_FILES_WORKER.has(fileName)) {
    return false;
  }
  
  const projectRelativePath = projectName ? file.webkitRelativePath.substring(projectName.length + 1) : file.webkitRelativePath;

  const gitignoreMap = new Map<string, string>();
  gitignores.forEach(g => {
    if (g.path.endsWith('.gitignore')) {
        const dirPath = g.path.substring(0, g.path.lastIndexOf('/'));
        gitignoreMap.set(dirPath, g.content);
    } else {
        gitignoreMap.set(projectName, g.content);
    }
  });
  
  // 3. Check against root .gitignore rules first for efficiency.
  const rootContent = gitignoreMap.get(projectName);
  if (rootContent && isFileIgnoredByGitignore_WORKER(projectRelativePath, rootContent)) {
      return false;
  }
  
  // 4. Check against nested .gitignore files by walking up the directory tree.
  const pathParts = projectRelativePath.split('/');
  for (let i = pathParts.length - 2; i >= 0; i--) {
      const relativeDir = pathParts.slice(0, i + 1).join('/');
      const fullDirPathKey = `${projectName}/${relativeDir}`;
      
      if (gitignoreMap.has(fullDirPathKey)) {
          const nestedContent = gitignoreMap.get(fullDirPathKey)!;
          const pathRelativeToGitignore = pathParts.slice(i + 1).join('/');
          if (isFileIgnoredByGitignore_WORKER(pathRelativeToGitignore, nestedContent)) {
              return false;
          }
      }
  }

  return true;
}


// --- Main App Component ---

interface FilteredFile {
    webkitRelativePath: string;
    size: number;
}

function formatFileSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(2)} MB`;
}

function App() {
  const [allFiles, setAllFiles] = useState<File[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<FilteredFile[]>([]);
  const [status, setStatus] = useState('Select a project folder or drag it here to begin.');
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [snapshotContent, setSnapshotContent] = useState('');
  const workerRef = useRef<Worker | null>(null);

  const defaultIgnored = ['.o', '.a', '.so', '.dll', '.exe', '.lib', 'obj', '.pdb', '.log'];
  const [gitignores, setGitignores] = useState<GitignoreFile[]>([{
      path: 'Default Ignore Rules',
      content: defaultIgnored.map(ext => `*${ext}`).join('\n')
  }]);
  
  const handleGitignoreChange = (event: ChangeEvent<HTMLTextAreaElement>, path: string) => {
    setSnapshotContent(''); // Invalidate old snapshot on rule change
    setGitignores(currentGitignores => 
        currentGitignores.map(g => 
            g.path === path ? { ...g, content: event.target.value } : g
        )
    );
  };
  
  useEffect(() => {
    if (allFiles.length === 0) {
      if(filteredFiles.length > 0) setFilteredFiles([]);
      return;
    }

    setIsLoading(true);
    setStatus('Applying ignore rules in the background...');
    setSnapshotContent('');

    if (workerRef.current) {
        workerRef.current.terminate();
    }

    const filteringWorkerCode = [
      `const IGNORED_DIRECTORIES_WORKER = new Set(${JSON.stringify(Array.from(IGNORED_DIRECTORIES))});`,
      `const IGNORED_FILES_WORKER = new Set(${JSON.stringify(Array.from(IGNORED_FILES))});`,
      `const IGNORED_BINARY_EXTENSIONS_WORKER = new Set(${JSON.stringify(Array.from(IGNORED_BINARY_EXTENSIONS))});`,
      `const MAX_FILE_SIZE_BYTES_WORKER = ${MAX_FILE_SIZE_BYTES};`,
      `const isFileIgnoredByGitignore_WORKER = ${isFileIgnoredByGitignore.toString()};`,
      `const isFileAllowed_WORKER = ${isFileAllowed.toString()};`,
      `self.onmessage = async (event) => {`,
      `    const { allFiles, projectName, gitignores } = event.data;`,
      `    const filteredFiles = allFiles.filter(file => `,
      `        isFileAllowed_WORKER(`,
      `            file, gitignores, projectName, `,
      `            IGNORED_DIRECTORIES_WORKER, IGNORED_FILES_WORKER, IGNORED_BINARY_EXTENSIONS_WORKER, `,
      `            MAX_FILE_SIZE_BYTES_WORKER, isFileIgnoredByGitignore_WORKER`,
      `        )`,
      `    );`,
      `    self.postMessage({ type: 'filtered', files: filteredFiles.map(f => ({ webkitRelativePath: f.webkitRelativePath, size: f.size })) });`,
      `};`,
    ].join('\n');

    const workerBlob = new Blob([filteringWorkerCode], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(workerBlob);
    const newWorker = new Worker(workerUrl);
    workerRef.current = newWorker;

    newWorker.onmessage = (event) => {
        const { type, files } = event.data;
        if (type === 'filtered') {
            setFilteredFiles(files);
            setStatus(`${files.length} files will be included. Ready to generate snapshot.`);
            setIsLoading(false);
            URL.revokeObjectURL(workerUrl);
            workerRef.current = null;
        }
    };
    
    newWorker.onerror = (error) => {
        console.error("Filtering worker error:", error);
        setStatus(`An error occurred during file filtering: ${error.message}`);
        setIsLoading(false);
        URL.revokeObjectURL(workerUrl);
        workerRef.current = null;
    };

    newWorker.postMessage({ allFiles, projectName, gitignores });

    return () => {
        if(workerRef.current) {
            workerRef.current.terminate();
            workerRef.current = null;
        }
    }
  }, [allFiles, gitignores, projectName]);


  const processFiles = async (files: File[]) => {
     if (!files || files.length === 0) {
      return;
    }
    
    setIsLoading(true);
    setSnapshotContent('');
    setFilteredFiles([]);
    setStatus('Analyzing folder structure...');

    const firstPath = files[0].webkitRelativePath;
    const projName = firstPath.split('/')[0];
    setProjectName(projName);
    
    const gitignoreFiles = files.filter(f => f.name === '.gitignore');
    let statusUpdate = '';
    
    if (gitignoreFiles.length > 0) {
        const loadedGitignores: GitignoreFile[] = await Promise.all(
            gitignoreFiles.map(async file => ({
                path: file.webkitRelativePath,
                content: await file.text().catch(e => {
                    console.error(`Error reading .gitignore: ${file.webkitRelativePath}`, e);
                    return '';
                })
            }))
        );
        loadedGitignores.sort((a,b) => a.path.localeCompare(b.path));
        setGitignores(loadedGitignores);
        statusUpdate = `Loaded rules from ${loadedGitignores.length} .gitignore file(s).`;
    } else {
        setGitignores([{
            path: 'Default Ignore Rules',
            content: defaultIgnored.map(ext => `*${ext}`).join('\n')
        }]);
        statusUpdate = 'No .gitignore found. Using default rules.';
    }

    setStatus(`${statusUpdate} Found ${files.length} total files.`);
    setAllFiles(files);
  }

  const handleFolderSelect = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
        processFiles(Array.from(event.target.files));
    }
    event.target.value = ''; // Reset file input
  };
  
  const generateSnapshot = async () => {
    if (filteredFiles.length === 0) {
      setStatus('No files to process after filtering.');
      return;
    }

    setIsLoading(true);
    setStatus('Starting snapshot generation in the background...');
    
    if(workerRef.current) {
        workerRef.current.terminate();
    }

    const filteredPaths = new Set(filteredFiles.map(f => f.webkitRelativePath));
    const filesToProcess = allFiles.filter(f => filteredPaths.has(f.webkitRelativePath));

    const workerCode = [
        "function getLanguageFromExtension(filename) {",
        "    const extension = filename.slice(filename.lastIndexOf('.') + 1).toLowerCase();",
        "    const langMap = {",
        "        'js': 'javascript', 'jsx': 'javascript', 'ts': 'typescript', 'tsx': 'typescript',",
        "        'py': 'python', 'java': 'java', 'c': 'c', 'cpp': 'cpp', 'cs': 'csharp',",
        "        'go': 'go', 'html': 'html', 'css': 'css', 'scss': 'scss', 'less': 'less',",
        "        'json': 'json', 'xml': 'xml', 'yml': 'yaml', 'yaml': 'yaml', 'md': 'markdown',",
        "        'rb': 'ruby', 'php': 'php', 'swift': 'swift', 'kt': 'kotlin', 'rs': 'rust',",
        "        'sh': 'shell', 'bat': 'batch', 'sql': 'sql', 'r': 'r', 'pl': 'perl',",
        "        'vue': 'vue', 'svelte': 'svelte'",
        "    };",
        "    return langMap[extension] || '';",
        "}",
        "",
        "function formatFileSize(bytes) {",
        "    if (bytes < 1024) return `${bytes} B`;",
        "    const kb = bytes / 1024;",
        "    if (kb < 1024) return `${kb.toFixed(1)} KB`;",
        "    const mb = kb / 1024;",
        "    return `${mb.toFixed(2)} MB`;",
        "}",
        "",
        "function generateProjectTree(files, projectName) {",
        "    const fileTree = {};",
        "    files.forEach(file => {",
        "        const relativePath = file.webkitRelativePath.startsWith(`${projectName}/`)",
        "            ? file.webkitRelativePath.substring(projectName.length + 1)",
        "            : file.webkitRelativePath;",
        "        const parts = relativePath.split('/');",
        "        let currentNode = fileTree;",
        "        for (let i = 0; i < parts.length - 1; i++) {",
        "            const part = parts[i];",
        "            if (!currentNode[part]) currentNode[part] = {};",
        "            currentNode = currentNode[part];",
        "        }",
        "        currentNode[parts[parts.length - 1]] = file;",
        "    });",
        "",
        "    function buildTreeString(node, prefix = '') {",
        "        let result = '';",
        "        const entries = Object.keys(node).sort((a, b) => {",
        "            const aIsDir = !(node[a] instanceof File);",
        "            const bIsDir = !(node[b] instanceof File);",
        "            if (aIsDir && !bIsDir) return -1;",
        "            if (!aIsDir && bIsDir) return 1;",
        "            return a.localeCompare(b);",
        "        });",
        "        entries.forEach((entry, index) => {",
        "            const isLast = index === entries.length - 1;",
        "            const connector = isLast ? '└── ' : '├── ';",
        "            const childPrefix = prefix + (isLast ? '    ' : '│   ');",
        "            const item = node[entry];",
        "            if (item instanceof File) {",
        "                const sizeStr = formatFileSize(item.size).padStart(8);",
        "                result += `${prefix}${connector}[${sizeStr}] ${entry}\\n`;",
        "            } else {",
        "                result += `${prefix}${connector}${entry}/\\n`;",
        "                result += buildTreeString(item, childPrefix);",
        "            }",
        "        });",
        "        return result;",
        "    }",
        "    return '.\\n' + buildTreeString(fileTree);",
        "}",
        "",
        "self.onmessage = async (event) => {",
        "    const { filesToProcess, projectName } = event.data;",
        "    ",
        "    self.postMessage({ type: 'status', message: 'Generating project tree...' });",
        "",
        "    const sortedFiles = [...filesToProcess].sort((a, b) => a.webkitRelativePath.localeCompare(b.webkitRelativePath));",
        "    const projectTree = generateProjectTree(sortedFiles, projectName);",
        "",
        "    let snapshotContent = `# Project Snapshot: ${projectName}\\n\\n`;",
        "    snapshotContent += `This file contains a snapshot of the project structure and source code, formatted for AI consumption.\\n`;",
        "    snapshotContent += `Total files included: ${sortedFiles.length}\\n\\n`;",
        "    snapshotContent += '## Project Structure\\n\\n';",
        "    snapshotContent += '```\\n' + projectTree + '\\n```\\n\\n';",
        "    snapshotContent += '## File Contents\\n\\n';",
        "",
        "    self.postMessage({ type: 'status', message: `Reading contents of ${sortedFiles.length} files...` });",
        "",
        "    for (const file of sortedFiles) {",
        "        try {",
        "            const content = await file.text();",
        "            const lang = getLanguageFromExtension(file.name);",
        "            const relativePath = file.webkitRelativePath;",
        "            snapshotContent += '```' + `${lang}:${relativePath}` + '\\n';",
        "            snapshotContent += content;",
        "            snapshotContent += '\\n' + '```' + '\\n\\n';",
        "        } catch (error) {",
        "            snapshotContent += '```' + `error:Could not read ${file.webkitRelativePath}` + '\\n';",
        "            snapshotContent += `Error: ${error.message}\\n`;",
        "            snapshotContent += '```' + '\\n\\n';",
        "        }",
        "    }",
        "    self.postMessage({ type: 'result', content: snapshotContent });",
        "};"
    ].join('\n');
    
    const workerBlob = new Blob([workerCode], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(workerBlob);
    const newWorker = new Worker(workerUrl);
    workerRef.current = newWorker;

    newWorker.onmessage = (event) => {
        const { type, message, content } = event.data;
        if (type === 'status') {
            setStatus(message);
        } else if (type === 'result') {
            setSnapshotContent(content);
            setStatus(`Snapshot for "${projectName}" created successfully! You can preview, copy, or download it below.`);
            setIsLoading(false);
            URL.revokeObjectURL(workerUrl);
            workerRef.current = null;
        }
    };
    
    newWorker.onerror = (error) => {
        console.error("Worker error:", error);
        setStatus(`An error occurred during snapshot generation: ${error.message}`);
        setIsLoading(false);
        URL.revokeObjectURL(workerUrl);
        workerRef.current = null;
    };

    newWorker.postMessage({ filesToProcess, projectName });
  };
  
  const downloadSnapshot = () => {
      if (!snapshotContent) return;
      const blob = new Blob([snapshotContent], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${projectName}-snapshot.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
  };
  
  const copyToClipboard = () => {
      if (!snapshotContent) return;
      navigator.clipboard.writeText(snapshotContent).then(() => {
          setStatus('Snapshot content copied to clipboard!');
          setTimeout(() => setStatus(`Snapshot for "${projectName}" created successfully!`), 3000);
      }).catch(err => {
          setStatus(`Failed to copy: ${err.message}`);
      });
  };

  const handleDragOver = (e: DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };
  const handleDragLeave = (e: DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const handleDrop = async (e: DragEvent<HTMLElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      
      const items = e.dataTransfer.items;
      if (!items) return;

      const droppedFiles: File[] = [];

      const getFile = (entry: FileSystemFileEntry): Promise<File> => {
          return new Promise((resolve, reject) => entry.file(resolve, reject));
      }

      const traverseDirectory = async (dirEntry: FileSystemDirectoryEntry): Promise<void> => {
          const reader = dirEntry.createReader();
          let entries: FileSystemEntry[] = [];
          
          let readEntriesBatch: FileSystemEntry[] = await new Promise((resolve, reject) => reader.readEntries(resolve, reject));
          while (readEntriesBatch.length > 0) {
              entries = entries.concat(readEntriesBatch);
              readEntriesBatch = await new Promise((resolve, reject) => reader.readEntries(resolve, reject));
          }

          for (const entry of entries) {
              if (entry.isDirectory) {
                  if (IGNORED_DIRECTORIES.has(entry.name.toLowerCase())) {
                      continue;
                  }
                  await traverseDirectory(entry as FileSystemDirectoryEntry);
              } else {
                  try {
                      const file = await getFile(entry as FileSystemFileEntry);
                      Object.defineProperty(file, 'webkitRelativePath', {
                          value: entry.fullPath.substring(1),
                      });
                      droppedFiles.push(file);
                  } catch (err) {
                      console.warn(`Could not read file: ${entry.fullPath}`, err);
                  }
              }
          }
      };

      const traversalPromises: Promise<void>[] = [];
      for (const item of items) {
          const entry = item.webkitGetAsEntry();
          if (entry) {
              if (entry.isDirectory) {
                  if (!IGNORED_DIRECTORIES.has(entry.name.toLowerCase())) {
                      traversalPromises.push(traverseDirectory(entry as FileSystemDirectoryEntry));
                  }
              } else {
                  try {
                      const file = await getFile(entry as FileSystemFileEntry);
                       Object.defineProperty(file, 'webkitRelativePath', {
                          value: entry.fullPath.substring(1),
                      });
                      droppedFiles.push(file);
                  } catch(err) {
                       console.warn(`Could not read file: ${entry.fullPath}`, err);
                  }
              }
          }
      }
      
      await Promise.all(traversalPromises);

      if (droppedFiles.length > 0) {
          processFiles(droppedFiles);
      }
  };


  return (
    <main 
      className={`container ${isDragging ? 'dragging' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="drag-overlay">
          <p>Drop your project folder here</p>
      </div>

      <header>
        <h1>Project Code Snapshotter</h1>
        <p>Upload or drop a project folder to generate a single text file of its source code.</p>
      </header>

      <section className="controls">
        <label htmlFor="folder-upload" className={`button ${isLoading ? 'disabled' : ''}`}>
          {isLoading ? 'Processing...' : 'Select Project Folder'}
        </label>
        <input 
          id="folder-upload"
          type="file"
          // @ts-ignore
          directory=""
          webkitdirectory=""
          multiple
          onChange={handleFolderSelect}
          disabled={isLoading}
          style={{ display: 'none' }}
        />
        <button 
          onClick={generateSnapshot} 
          disabled={isLoading || filteredFiles.length === 0}
          className="button primary"
          aria-label="Generate Snapshot"
        >
          Generate Snapshot
        </button>
      </section>

      <section className="settings-panel">
        {gitignores.map((gitignore, index) => (
          <div className="form-group" key={gitignore.path}>
              <label htmlFor={`gitignore-rules-${index}`}>
                Rules from: <strong>{gitignore.path}</strong>
              </label>
              <textarea
                id={`gitignore-rules-${index}`}
                className="textarea-input"
                value={gitignore.content}
                onChange={(e) => handleGitignoreChange(e, gitignore.path)}
                placeholder={"e.g. build/\\n*.log\\nsecrets.txt"}
                disabled={isLoading}
                rows={6}
              />
          </div>
        ))}
      </section>
      
      <section className="status-panel">
        <p aria-live="polite"><strong>Status:</strong> {status}</p>
      </section>
      
      {filteredFiles.length > 0 && (
        <section className="file-list-container">
          <h2>Files to be Included ({filteredFiles.length})</h2>
          <ul className="file-list">
            {filteredFiles.slice(0, 200).map((file) => (
              <li key={file.webkitRelativePath}>
                <span className="file-size">{formatFileSize(file.size)}</span>
                {file.webkitRelativePath}
              </li>
            ))}
            {filteredFiles.length > 200 && (
              <li className="more-files-indicator">... and {filteredFiles.length - 200} more files.</li>
            )}
          </ul>
        </section>
      )}

      {snapshotContent && (
        <section className="snapshot-preview-container">
            <h2>Snapshot Preview & Actions</h2>
             <div className="snapshot-actions">
                <button onClick={copyToClipboard} className="button">Copy to Clipboard</button>
                <button onClick={downloadSnapshot} className="button primary">Download Snapshot File</button>
            </div>
            <pre className="snapshot-preview">{snapshotContent}</pre>
        </section>
      )}
    </main>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);