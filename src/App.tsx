import { DragEvent, useCallback, useState } from 'react';
import { Controls } from './components/Controls';
import { DragDropOverlay } from './components/DragDropOverlay';
import { FileList } from './components/FileList';
import { Header } from './components/Header';
import { RulesEditor } from './components/RulesEditor';
import { SnapshotPreview } from './components/SnapshotPreview';
import { StatusBar } from './components/StatusBar';
import { useFileProcessor } from './hooks/useFileProcessor';
import { extractFilesFromDataTransferItems } from './utils/dnd';
import styles from './App.module.css';

export const App = () => {
  const {
    status,
    gitignores,
    filteredFiles,
    snapshotContent,
    isLoading,
    canGenerateSnapshot,
    processFiles,
    updateGitignore,
    generateSnapshot,
    downloadSnapshot,
    copySnapshotToClipboard,
  } = useFileProcessor();

  const [isDragging, setIsDragging] = useState(false);

  const handleFolderSelect = useCallback(
    (files: File[]) => {
      processFiles(files);
    },
    [processFiles]
  );

  const handleDragOver = useCallback((event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(prev => {
      if (prev) return prev;
      return true;
    });
  }, []);

  const handleDragLeave = useCallback((event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (event.currentTarget === event.target) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback(
    async (event: DragEvent<HTMLElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragging(false);

      if (!event.dataTransfer?.items) {
        return;
      }

      const droppedFiles = await extractFilesFromDataTransferItems(event.dataTransfer.items);
      if (droppedFiles.length) {
        processFiles(droppedFiles);
      }
    },
    [processFiles]
  );

  return (
    <main
      className={`${styles.container} ${isDragging ? styles.dragging : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <DragDropOverlay isDragging={isDragging} />

      <Header
        title="Project Code Snapshotter"
        description="Upload or drop a project folder to generate a single text file of its source code."
      />

      <Controls
        isProcessing={isLoading}
        canGenerate={canGenerateSnapshot}
        onFolderSelect={handleFolderSelect}
        onGenerateSnapshot={generateSnapshot}
      />

      <RulesEditor rules={gitignores} isDisabled={isLoading} onChange={updateGitignore} />

      <StatusBar status={status} />

      <FileList files={filteredFiles} />

      <SnapshotPreview
        content={snapshotContent}
        onCopy={copySnapshotToClipboard}
        onDownload={downloadSnapshot}
      />
    </main>
  );
};
