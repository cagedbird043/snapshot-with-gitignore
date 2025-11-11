import { describe, expect, it } from 'vitest';
import { formatFileSize, getLanguageFromExtension } from '../fileInfo';

describe('fileInfo utils', () => {
  describe('formatFileSize', () => {
    it('formats bytes correctly', () => {
      expect(formatFileSize(0)).toBe('0 B');
      expect(formatFileSize(500)).toBe('500 B');
      expect(formatFileSize(1023)).toBe('1023 B');
    });

    it('formats kilobytes correctly', () => {
      expect(formatFileSize(1024)).toBe('1.0 KB');
      expect(formatFileSize(1536)).toBe('1.5 KB');
      expect(formatFileSize(10240)).toBe('10.0 KB');
    });

    it('formats megabytes correctly', () => {
      expect(formatFileSize(1048576)).toBe('1.00 MB');
      expect(formatFileSize(1572864)).toBe('1.50 MB');
      expect(formatFileSize(10485760)).toBe('10.00 MB');
    });
  });

  describe('getLanguageFromExtension', () => {
    it('identifies JavaScript files', () => {
      expect(getLanguageFromExtension('app.js')).toBe('javascript');
      expect(getLanguageFromExtension('component.jsx')).toBe('javascript');
    });

    it('identifies TypeScript files', () => {
      expect(getLanguageFromExtension('app.ts')).toBe('typescript');
      expect(getLanguageFromExtension('Component.tsx')).toBe('typescript');
    });

    it('identifies Python files', () => {
      expect(getLanguageFromExtension('script.py')).toBe('python');
    });

    it('identifies configuration files', () => {
      expect(getLanguageFromExtension('package.json')).toBe('json');
      expect(getLanguageFromExtension('config.yml')).toBe('yaml');
      expect(getLanguageFromExtension('config.yaml')).toBe('yaml');
    });

    it('identifies markup files', () => {
      expect(getLanguageFromExtension('index.html')).toBe('html');
      expect(getLanguageFromExtension('README.md')).toBe('markdown');
      expect(getLanguageFromExtension('data.xml')).toBe('xml');
    });

    it('identifies style files', () => {
      expect(getLanguageFromExtension('style.css')).toBe('css');
      expect(getLanguageFromExtension('style.scss')).toBe('scss');
      expect(getLanguageFromExtension('style.less')).toBe('less');
    });

    it('returns empty string for unknown extensions', () => {
      expect(getLanguageFromExtension('file.unknown')).toBe('');
      expect(getLanguageFromExtension('no-extension')).toBe('');
    });

    it('handles uppercase extensions', () => {
      expect(getLanguageFromExtension('FILE.JS')).toBe('javascript');
      expect(getLanguageFromExtension('Script.PY')).toBe('python');
    });
  });
});
