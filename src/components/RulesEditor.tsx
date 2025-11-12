import { memo, useCallback, useRef } from 'react';
import type { GitignoreFile } from '../types';
import styles from './RulesEditor.module.css';

interface RulesEditorProps {
  rules: GitignoreFile[];
  isDisabled: boolean;
  onChange: (path: string, content: string) => void;
}

const RulesEditorComponent = ({ rules, isDisabled, onChange }: RulesEditorProps) => {
  const debounceRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const debouncedOnChange = useCallback(
    (path: string, content: string) => {
      if (debounceRef.current[path]) {
        clearTimeout(debounceRef.current[path]);
      }
      debounceRef.current[path] = setTimeout(() => {
        onChange(path, content);
      }, 300); // 300ms debounce
    },
    [onChange]
  );

  return (
    <section className={styles.settingsPanel}>
      {rules.map((gitignore, index) => (
        <div className={styles.formGroup} key={gitignore.path}>
          <label htmlFor={`gitignore-${index}`}>
            Rules from: <strong>{gitignore.path}</strong>
          </label>
          <textarea
            id={`gitignore-${index}`}
            className={styles.textareaInput}
            defaultValue={gitignore.content}
            onChange={event => debouncedOnChange(gitignore.path, event.target.value)}
            placeholder={'e.g. build/\n*.log\nsecrets.txt'}
            disabled={isDisabled}
            rows={6}
          />
        </div>
      ))}
    </section>
  );
};

// 使用 memo 避免不必要的重新渲染
export const RulesEditor = memo(RulesEditorComponent);
