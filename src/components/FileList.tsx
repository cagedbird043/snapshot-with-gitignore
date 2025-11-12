import { memo } from 'react';
import type { FilteredFile } from '../types';
import { formatFileSize } from '../utils/fileInfo';
import styles from './FileList.module.css';

interface FileListProps {
    files: FilteredFile[];
}

const MAX_VISIBLE_FILES = 200;

const FileListComponent = ({ files }: FileListProps) => {
    if (!files.length) {
        return null;
    }

    const visibleFiles = files.slice(0, MAX_VISIBLE_FILES);
    const remainingCount = files.length - visibleFiles.length;

    return (
        <section className={styles.container}>
            <h2>Files to be Included ({files.length})</h2>
            <ul className={styles.fileList}>
                {visibleFiles.map((file, index) => (
                    <li key={`${file.webkitRelativePath}-${file.size}-${index}`}>
                        <span className={styles.fileSize}>{formatFileSize(file.size)}</span>
                        {file.webkitRelativePath}
                    </li>
                ))}
                {remainingCount > 0 && (
                    <li className={styles.moreFiles}>... and {remainingCount} more files.</li>
                )}
            </ul>
        </section>
    );
};

// 使用 memo 避免不必要的重新渲染
export const FileList = memo(FileListComponent);
