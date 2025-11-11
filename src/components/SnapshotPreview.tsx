import { Button } from './common/Button';
import styles from './SnapshotPreview.module.css';

interface SnapshotPreviewProps {
  content: string;
  onCopy: () => void;
  onDownload: () => void;
}

export const SnapshotPreview = ({ content, onCopy, onDownload }: SnapshotPreviewProps) => {
  if (!content) {
    return null;
  }

  return (
    <section className={styles.container}>
      <h2>Snapshot Preview &amp; Actions</h2>
      <div className={styles.actions}>
        <Button onClick={onCopy}>Copy to Clipboard</Button>
        <Button variant="primary" onClick={onDownload}>
          Download Snapshot File
        </Button>
      </div>
      <pre className={styles.preview}>{content}</pre>
    </section>
  );
};
