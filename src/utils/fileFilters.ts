import {
  IGNORED_BINARY_EXTENSIONS,
  IGNORED_DIRECTORIES,
  IGNORED_FILES,
  MAX_FILE_SIZE_BYTES,
} from './constants';
import type { GitignoreFile } from '../types';

export const isFileIgnoredByGitignore = (
  relativePath: string,
  gitignoreContent: string
): boolean => {
  const patterns = gitignoreContent
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0 && !line.startsWith('#'));

  const globToRegex = (pattern: string) =>
    pattern
      .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
      .replace(/\*\*/g, '.*')
      .replace(/\*/g, '[^/]*')
      .replace(/\?/g, '[^/]');

  for (const pattern of patterns) {
    const isDirPattern = pattern.endsWith('/');
    let candidate = isDirPattern ? pattern.slice(0, -1) : pattern;

    if (!candidate.includes('/')) {
      const regexString = `(^|/)${globToRegex(candidate)}`;
      if (isDirPattern) {
        if (new RegExp(`${regexString}/`).test(relativePath)) {
          return true;
        }
      } else if (new RegExp(`${regexString}(/|$)`).test(relativePath)) {
        return true;
      }
    } else {
      if (candidate.startsWith('/')) {
        candidate = candidate.substring(1);
      }
      const regexString = `^${globToRegex(candidate)}`;
      if (isDirPattern) {
        if (new RegExp(`${regexString}/`).test(relativePath)) {
          return true;
        }
      } else if (new RegExp(`${regexString}(/|$)`).test(relativePath)) {
        return true;
      }
    }
  }

  return false;
};

export const isFileAllowed = (
  file: File,
  gitignores: GitignoreFile[],
  projectName: string
): boolean => {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return false;
  }

  const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
  if (IGNORED_BINARY_EXTENSIONS.has(extension)) {
    return false;
  }

  const lowerCasePathParts = file.webkitRelativePath.toLowerCase().split('/');
  if (lowerCasePathParts.some(segment => IGNORED_DIRECTORIES.has(segment))) {
    return false;
  }

  if (IGNORED_FILES.has(file.name.toLowerCase())) {
    return false;
  }

  const projectRelativePath = projectName
    ? file.webkitRelativePath.substring(projectName.length + 1)
    : file.webkitRelativePath;

  const gitignoreMap = new Map<string, string>();
  gitignores.forEach(entry => {
    if (entry.path.endsWith('.gitignore')) {
      const separatorIndex = entry.path.lastIndexOf('/');
      const directoryKey =
        separatorIndex >= 0 ? entry.path.substring(0, separatorIndex) : projectName;
      gitignoreMap.set(directoryKey, entry.content);
    } else {
      gitignoreMap.set(projectName, entry.content);
    }
  });

  const rootContent = gitignoreMap.get(projectName);
  if (rootContent && isFileIgnoredByGitignore(projectRelativePath, rootContent)) {
    return false;
  }

  const pathParts = projectRelativePath.split('/');
  for (let index = pathParts.length - 2; index >= 0; index -= 1) {
    const relativeDir = pathParts.slice(0, index + 1).join('/');
    const directoryKey = projectName ? `${projectName}/${relativeDir}` : relativeDir;

    if (gitignoreMap.has(directoryKey)) {
      const nestedContent = gitignoreMap.get(directoryKey)!;
      const relativeToGitignore = pathParts.slice(index + 1).join('/');
      if (isFileIgnoredByGitignore(relativeToGitignore, nestedContent)) {
        return false;
      }
    }
  }

  return true;
};
