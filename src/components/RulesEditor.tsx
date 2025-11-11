import { memo } from 'react';
import type { GitignoreFile } from '../types';
import styles from './RulesEditor.module.css';

interface RulesEditorProps {
  rules: GitignoreFile[];
  isDisabled: boolean;
  onChange: (path: string, content: string) => void;
}

const RulesEditorComponent = ({ rules, isDisabled, onChange }: RulesEditorProps) => (
  <section className={styles.settingsPanel}>
    {rules.map((gitignore, index) => (
      <div className={styles.formGroup} key={gitignore.path}>
        <label htmlFor={`gitignore-${index}`}>
          Rules from: <strong>{gitignore.path}</strong>
        </label>
        <textarea
          id={`gitignore-${index}`}
          className={styles.textareaInput}
          value={gitignore.content}
          onChange={event => onChange(gitignore.path, event.target.value)}
          placeholder={'e.g. build/\n*.log\nsecrets.txt'}
          disabled={isDisabled}
          rows={6}
        />
      </div>
    ))}
  </section>
);

// 使用 memo 避免不必要的重新渲染
export const RulesEditor = memo(RulesEditorComponent);
