const LANGUAGE_MAP: Record<string, string> = {
  js: 'javascript',
  jsx: 'javascript',
  ts: 'typescript',
  tsx: 'typescript',
  py: 'python',
  java: 'java',
  c: 'c',
  cpp: 'cpp',
  cs: 'csharp',
  go: 'go',
  html: 'html',
  css: 'css',
  scss: 'scss',
  less: 'less',
  json: 'json',
  xml: 'xml',
  yml: 'yaml',
  yaml: 'yaml',
  md: 'markdown',
  rb: 'ruby',
  php: 'php',
  swift: 'swift',
  kt: 'kotlin',
  rs: 'rust',
  sh: 'shell',
  bat: 'batch',
  sql: 'sql',
  r: 'r',
  pl: 'perl',
  vue: 'vue',
  svelte: 'svelte',
};

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const kb = bytes / 1024;
  if (kb < 1024) {
    return `${kb.toFixed(1)} KB`;
  }

  const mb = kb / 1024;
  return `${mb.toFixed(2)} MB`;
};

export const getLanguageFromExtension = (filename: string): string => {
  const extension = filename.slice(filename.lastIndexOf('.') + 1).toLowerCase();
  return LANGUAGE_MAP[extension] ?? '';
};
