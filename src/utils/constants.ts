import type { GitignoreFile } from '../types';

export const IGNORED_DIRECTORIES = new Set([
    '.git',
    'target',
    'build',
    'node_modules',
    '.vscode',
    '.idea',
    'debug',
    'release',
    '.venv',
]);

export const IGNORED_FILES = new Set(['package-lock.json', 'yarn.lock']);

export const IGNORED_BINARY_EXTENSIONS = new Set([
    'png',
    'jpg',
    'jpeg',
    'gif',
    'bmp',
    'ico',
    'webp',
    'svg',
    'mp3',
    'wav',
    'ogg',
    'mp4',
    'mov',
    'webm',
    'pdf',
    'doc',
    'docx',
    'xls',
    'xlsx',
    'ppt',
    'pptx',
    'zip',
    'rar',
    '7z',
    'tar',
    'gz',
    'exe',
    'dll',
    'so',
    'a',
    'o',
    'lib',
    'jar',
    'class',
    'pdb',
    'ds_store',
]);

export const MAX_FILE_SIZE_BYTES = 1 * 1024 * 1024; // 1MB cap

const DEFAULT_GITIGNORE_GLOBS = ['.o', '.a', '.so', '.dll', '.exe', '.lib', 'obj', '.pdb', '.log'];

export const DEFAULT_GITIGNORE_LABEL = 'Default Ignore Rules';

export const DEFAULT_GITIGNORE_TEMPLATE = DEFAULT_GITIGNORE_GLOBS.map(glob => `*${glob}`).join(
    '\n'
);

export const createDefaultGitignore = (): GitignoreFile => ({
    path: DEFAULT_GITIGNORE_LABEL,
    content: DEFAULT_GITIGNORE_TEMPLATE,
});
