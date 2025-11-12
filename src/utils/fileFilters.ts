import {
    IGNORED_BINARY_EXTENSIONS,
    IGNORED_DIRECTORIES,
    IGNORED_FILES,
    MAX_FILE_SIZE_BYTES,
} from './constants';
import type { GitignoreFile } from '../types';

// 正则表达式缓存，避免重复编译
const regexCache = new Map<string, RegExp>();

const getCachedRegex = (pattern: string): RegExp => {
    if (!regexCache.has(pattern)) {
        regexCache.set(pattern, new RegExp(pattern));
    }
    return regexCache.get(pattern)!;
};

const globToRegex = (pattern: string): string =>
    pattern
        .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
        .replace(/\*\*/g, '.*')
        .replace(/\*/g, '[^/]*')
        .replace(/\?/g, '[^/]');

export const isFileIgnoredByGitignore = (
    relativePath: string,
    gitignoreContent: string
): boolean => {
    const patterns = gitignoreContent
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0 && !line.startsWith('#'));

    for (const pattern of patterns) {
        const isDirPattern = pattern.endsWith('/');
        let candidate = isDirPattern ? pattern.slice(0, -1) : pattern;

        if (!candidate.includes('/')) {
            const regexString = `(^|/)${globToRegex(candidate)}`;
            if (isDirPattern) {
                if (getCachedRegex(`${regexString}/`).test(relativePath)) {
                    return true;
                }
            } else if (getCachedRegex(`${regexString}(/|$)`).test(relativePath)) {
                return true;
            }
        } else {
            if (candidate.startsWith('/')) {
                candidate = candidate.substring(1);
            }
            const regexString = `^${globToRegex(candidate)}`;
            if (isDirPattern) {
                if (getCachedRegex(`${regexString}/`).test(relativePath)) {
                    return true;
                }
            } else if (getCachedRegex(`${regexString}(/|$)`).test(relativePath)) {
                return true;
            }
        }
    }

    return false;
};

// 构建 gitignore 映射表（提取为独立函数以便复用）
const buildGitignoreMap = (
    gitignores: GitignoreFile[],
    projectName: string
): Map<string, string> => {
    const gitignoreMap = new Map<string, string>();
    for (const entry of gitignores) {
        if (entry.path.endsWith('.gitignore')) {
            const separatorIndex = entry.path.lastIndexOf('/');
            const directoryKey =
                separatorIndex >= 0 ? entry.path.substring(0, separatorIndex) : projectName;
            gitignoreMap.set(directoryKey, entry.content);
        } else {
            gitignoreMap.set(projectName, entry.content);
        }
    }
    return gitignoreMap;
};

export const isFileAllowed = (
    file: File,
    gitignores: GitignoreFile[],
    projectName: string,
    gitignoreMap?: Map<string, string>
): boolean => {
    // 快速路径检查（最常见的拒绝原因）
    if (file.size > MAX_FILE_SIZE_BYTES) {
        return false;
    }

    const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
    if (IGNORED_BINARY_EXTENSIONS.has(extension)) {
        return false;
    }

    const fileName = file.name.toLowerCase();
    if (IGNORED_FILES.has(fileName)) {
        return false;
    }

    const lowerCasePathParts = file.webkitRelativePath.toLowerCase().split('/');
    for (const segment of lowerCasePathParts) {
        if (IGNORED_DIRECTORIES.has(segment)) {
            return false;
        }
    }

    // 懒加载 gitignoreMap（只在需要时构建）
    const map = gitignoreMap || buildGitignoreMap(gitignores, projectName);

    const projectRelativePath = file.webkitRelativePath.startsWith(`${projectName}/`)
        ? file.webkitRelativePath.substring(projectName.length + 1)
        : file.webkitRelativePath;

    // 检查根目录 gitignore
    const rootContent = map.get(projectName);
    if (rootContent && isFileIgnoredByGitignore(projectRelativePath, rootContent)) {
        return false;
    }

    // 检查嵌套 gitignore
    const pathParts = projectRelativePath.split('/');
    for (let index = pathParts.length - 2; index >= 0; index -= 1) {
        const relativeDir = pathParts.slice(0, index + 1).join('/');
        const directoryKey = projectName ? `${projectName}/${relativeDir}` : relativeDir;

        const nestedContent = map.get(directoryKey);
        if (nestedContent) {
            const relativeToGitignore = pathParts.slice(index + 1).join('/');
            if (isFileIgnoredByGitignore(relativeToGitignore, nestedContent)) {
                return false;
            }
        }
    }

    return true;
};
