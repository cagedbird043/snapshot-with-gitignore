import styles from './DragDropOverlay.module.css';

interface DragDropOverlayProps {
  isDragging: boolean;
}

export const DragDropOverlay = ({ isDragging }: DragDropOverlayProps) => (
  <div className={`${styles.overlay} ${isDragging ? styles.visible : ''}`}>
    <p>Drop your project folder here</p>
  </div>
);
