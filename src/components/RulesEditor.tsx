import { memo, useCallback, useRef } from 'react';
import type { GitignoreFile } from '../types';
import styles from './RulesEditor.module.css';

interface RulesEditorProps {
    rules: GitignoreFile[];
    isDisabled: boolean;
    onChange: (path: string, content: string) => void;
}

const RulesEditorComponent = ({ rules, isDisabled, onChange }: RulesEditorProps) => {
    const textareaRefs = useRef<Record<string, HTMLTextAreaElement | null>>({});

    const handleBlur = useCallback(
        (path: string) => {
            const textarea = textareaRefs.current[path];
            if (textarea) {
                onChange(path, textarea.value);
            }
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
                        ref={el => {
                            textareaRefs.current[gitignore.path] = el;
                        }}
                        id={`gitignore-${index}`}
                        className={styles.textareaInput}
                        defaultValue={gitignore.content}
                        onBlur={() => handleBlur(gitignore.path)}
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
