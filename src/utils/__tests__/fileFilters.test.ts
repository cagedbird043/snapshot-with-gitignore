import { describe, expect, it } from 'vitest';
import { isFileAllowed, isFileIgnoredByGitignore } from '../fileFilters';
import type { GitignoreFile } from '../../types';

describe('fileFilters', () => {
  describe('isFileIgnoredByGitignore', () => {
    it('ignores paths matching simple patterns', () => {
      const gitignore = 'dist/\n*.log\n*.tmp';
      expect(isFileIgnoredByGitignore('dist/index.js', gitignore)).toBe(true);
      expect(isFileIgnoredByGitignore('application.log', gitignore)).toBe(true);
      expect(isFileIgnoredByGitignore('temp.tmp', gitignore)).toBe(true);
    });

    it('allows paths that do not match patterns', () => {
      const gitignore = 'build/\n*.tmp';
      expect(isFileIgnoredByGitignore('src/index.ts', gitignore)).toBe(false);
      expect(isFileIgnoredByGitignore('docs/readme.md', gitignore)).toBe(false);
    });

    it('ignores paths with directory patterns', () => {
      const gitignore = 'node_modules/\ntest/';
      expect(isFileIgnoredByGitignore('node_modules/package/index.js', gitignore)).toBe(true);
      expect(isFileIgnoredByGitignore('test/unit.spec.ts', gitignore)).toBe(true);
    });

    it('handles wildcard patterns', () => {
      const gitignore = '*.js\n*.map';
      expect(isFileIgnoredByGitignore('bundle.js', gitignore)).toBe(true);
      expect(isFileIgnoredByGitignore('bundle.js.map', gitignore)).toBe(true);
      expect(isFileIgnoredByGitignore('style.css', gitignore)).toBe(false);
    });

    it('ignores comment lines', () => {
      const gitignore = '# This is a comment\n*.log\n# Another comment';
      expect(isFileIgnoredByGitignore('test.log', gitignore)).toBe(true);
      expect(isFileIgnoredByGitignore('# This is a comment', gitignore)).toBe(false);
    });

    it('handles leading slash patterns', () => {
      const gitignore = '/build';
      expect(isFileIgnoredByGitignore('build/index.js', gitignore)).toBe(true);
      expect(isFileIgnoredByGitignore('src/build', gitignore)).toBe(false);
    });
  });

  describe('isFileAllowed', () => {
    const createMockFile = (path: string, size: number, name: string): File => {
      const file = new File([''], name, { type: 'text/plain' });
      Object.defineProperty(file, 'webkitRelativePath', { value: path });
      Object.defineProperty(file, 'size', { value: size });
      return file;
    };

    it('rejects files larger than MAX_FILE_SIZE', () => {
      const largeFile = createMockFile('project/large.txt', 2 * 1024 * 1024, 'large.txt');
      const gitignores: GitignoreFile[] = [];
      expect(isFileAllowed(largeFile, gitignores, 'project')).toBe(false);
    });

    it('rejects binary files', () => {
      const imageFile = createMockFile('project/image.png', 1024, 'image.png');
      const gitignores: GitignoreFile[] = [];
      expect(isFileAllowed(imageFile, gitignores, 'project')).toBe(false);
    });

    it('rejects files in ignored directories', () => {
      const nodeModulesFile = createMockFile(
        'project/node_modules/package/index.js',
        1024,
        'index.js'
      );
      const gitignores: GitignoreFile[] = [];
      expect(isFileAllowed(nodeModulesFile, gitignores, 'project')).toBe(false);
    });

    it('rejects globally ignored files', () => {
      const lockFile = createMockFile('project/package-lock.json', 1024, 'package-lock.json');
      const gitignores: GitignoreFile[] = [];
      expect(isFileAllowed(lockFile, gitignores, 'project')).toBe(false);
    });

    it('rejects files matching gitignore patterns', () => {
      const logFile = createMockFile('project/app.log', 1024, 'app.log');
      const gitignores: GitignoreFile[] = [{ path: 'project/.gitignore', content: '*.log' }];
      expect(isFileAllowed(logFile, gitignores, 'project')).toBe(false);
    });

    it('allows valid text files', () => {
      const textFile = createMockFile('project/src/index.ts', 1024, 'index.ts');
      const gitignores: GitignoreFile[] = [];
      expect(isFileAllowed(textFile, gitignores, 'project')).toBe(true);
    });

    it('handles nested gitignore files', () => {
      const nestedFile = createMockFile('project/src/temp/test.tmp', 1024, 'test.tmp');
      const gitignores: GitignoreFile[] = [{ path: 'project/src/.gitignore', content: 'temp/' }];
      expect(isFileAllowed(nestedFile, gitignores, 'project')).toBe(false);
    });

    it('applies root gitignore to all files', () => {
      const file = createMockFile('project/src/index.js', 1024, 'index.js');
      const gitignores: GitignoreFile[] = [{ path: 'project/.gitignore', content: '*.js' }];
      expect(isFileAllowed(file, gitignores, 'project')).toBe(false);
    });
  });
});
