import { describe, expect, it } from 'vitest';
import {
  IGNORED_BINARY_EXTENSIONS,
  IGNORED_DIRECTORIES,
  IGNORED_FILES,
  MAX_FILE_SIZE_BYTES,
  createDefaultGitignore,
  DEFAULT_GITIGNORE_LABEL,
} from '../constants';

describe('constants', () => {
  describe('IGNORED_DIRECTORIES', () => {
    it('includes common directories to ignore', () => {
      expect(IGNORED_DIRECTORIES.has('.git')).toBe(true);
      expect(IGNORED_DIRECTORIES.has('node_modules')).toBe(true);
      expect(IGNORED_DIRECTORIES.has('.vscode')).toBe(true);
      expect(IGNORED_DIRECTORIES.has('build')).toBe(true);
    });

    it('does not include src or docs directories', () => {
      expect(IGNORED_DIRECTORIES.has('src')).toBe(false);
      expect(IGNORED_DIRECTORIES.has('docs')).toBe(false);
    });
  });

  describe('IGNORED_FILES', () => {
    it('includes lock files', () => {
      expect(IGNORED_FILES.has('package-lock.json')).toBe(true);
      expect(IGNORED_FILES.has('yarn.lock')).toBe(true);
    });
  });

  describe('IGNORED_BINARY_EXTENSIONS', () => {
    it('includes image extensions', () => {
      expect(IGNORED_BINARY_EXTENSIONS.has('png')).toBe(true);
      expect(IGNORED_BINARY_EXTENSIONS.has('jpg')).toBe(true);
      expect(IGNORED_BINARY_EXTENSIONS.has('svg')).toBe(true);
    });

    it('includes executable extensions', () => {
      expect(IGNORED_BINARY_EXTENSIONS.has('exe')).toBe(true);
      expect(IGNORED_BINARY_EXTENSIONS.has('dll')).toBe(true);
      expect(IGNORED_BINARY_EXTENSIONS.has('so')).toBe(true);
    });

    it('includes archive extensions', () => {
      expect(IGNORED_BINARY_EXTENSIONS.has('zip')).toBe(true);
      expect(IGNORED_BINARY_EXTENSIONS.has('tar')).toBe(true);
      expect(IGNORED_BINARY_EXTENSIONS.has('gz')).toBe(true);
    });
  });

  describe('MAX_FILE_SIZE_BYTES', () => {
    it('is set to 1MB', () => {
      expect(MAX_FILE_SIZE_BYTES).toBe(1 * 1024 * 1024);
    });
  });

  describe('createDefaultGitignore', () => {
    it('creates a gitignore with default label', () => {
      const gitignore = createDefaultGitignore();
      expect(gitignore.path).toBe(DEFAULT_GITIGNORE_LABEL);
    });

    it('includes common build artifacts', () => {
      const gitignore = createDefaultGitignore();
      expect(gitignore.content).toContain('*.o');
      expect(gitignore.content).toContain('*.dll');
      expect(gitignore.content).toContain('*.exe');
      expect(gitignore.content).toContain('*.log');
    });

    it('returns an object with path and content', () => {
      const gitignore = createDefaultGitignore();
      expect(gitignore).toHaveProperty('path');
      expect(gitignore).toHaveProperty('content');
      expect(typeof gitignore.path).toBe('string');
      expect(typeof gitignore.content).toBe('string');
    });
  });
});
