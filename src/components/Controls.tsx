import { ChangeEvent, useRef } from 'react';
import styles from './Controls.module.css';
import { Button } from './common/Button';

interface ControlsProps {
  isProcessing: boolean;
  canGenerate: boolean;
  onFolderSelect: (files: File[]) => void;
  onGenerateSnapshot: () => void;
}

export const Controls = ({
  isProcessing,
  canGenerate,
  onFolderSelect,
  onGenerateSnapshot,
}: ControlsProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleButtonClick = () => {
    if (!isProcessing) {
      inputRef.current?.click();
    }
  };

  const handleFolderSelect = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      if (files.length) {
        onFolderSelect(files);
      }
      event.target.value = '';
    }
  };

  return (
    <section className={styles.controls}>
      <Button onClick={handleButtonClick} disabled={isProcessing}>
        {isProcessing ? 'Processing...' : 'Select Project Folder'}
      </Button>
      <input
        ref={inputRef}
        className={styles.folderInput}
        type="file"
        {
          /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
          ...({ directory: '', webkitdirectory: '' } as any)
        }
        multiple
        onChange={handleFolderSelect}
        disabled={isProcessing}
      />
      <Button
        variant="primary"
        onClick={onGenerateSnapshot}
        disabled={isProcessing || !canGenerate}
        aria-label="Generate Snapshot"
      >
        Generate Snapshot
      </Button>
    </section>
  );
};
