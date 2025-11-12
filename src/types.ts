export type ProcessorPhase = 'idle' | 'analyzing' | 'filtering' | 'ready' | 'generating' | 'error';

export interface GitignoreFile {
    path: string;
    content: string;
}

export interface FilteredFile {
    webkitRelativePath: string;
    size: number;
}

export interface FilterWorkerRequest {
    type: 'FILTER_FILES';
    payload: {
        allFiles: Array<{ webkitRelativePath: string; size: number; file: File }>;
        gitignores: GitignoreFile[];
        projectName: string;
    };
}

export interface FilterWorkerResponse {
    type: 'FILTER_RESULT';
    payload: {
        filteredFiles: FilteredFile[];
    };
}

export interface FilterWorkerError {
    type: 'FILTER_ERROR';
    payload: {
        message: string;
    };
}

export type FilterWorkerInboundMessage = FilterWorkerRequest;
export type FilterWorkerOutboundMessage = FilterWorkerResponse | FilterWorkerError;

export interface SnapshotWorkerRequest {
    type: 'GENERATE_SNAPSHOT';
    payload: {
        filesToProcess: File[];
        projectName: string;
    };
}

export interface SnapshotStatusMessage {
    type: 'STATUS_UPDATE';
    payload: {
        message: string;
    };
}

export interface SnapshotResultMessage {
    type: 'SNAPSHOT_RESULT';
    payload: {
        content: string;
    };
}

export interface SnapshotErrorMessage {
    type: 'SNAPSHOT_ERROR';
    payload: {
        message: string;
    };
}

export type SnapshotWorkerInboundMessage = SnapshotWorkerRequest;
export type SnapshotWorkerOutboundMessage =
    | SnapshotStatusMessage
    | SnapshotResultMessage
    | SnapshotErrorMessage;

// ---------------------------------------------------------------------------
// Non-standard DOM API type declarations for drag-and-drop directory support.
// These interfaces provide minimal typing for WebKit directory traversal.
// ---------------------------------------------------------------------------
export interface FileSystemEntry {
    readonly isFile: boolean;
    readonly isDirectory: boolean;
    readonly name: string;
    readonly fullPath: string;
}

export interface FileSystemFileEntry extends FileSystemEntry {
    file(
        successCallback: (file: File) => void,
        errorCallback?: (error: DOMException) => void
    ): void;
}

export interface FileSystemDirectoryReader {
    readEntries(
        successCallback: (entries: FileSystemEntry[]) => void,
        errorCallback?: (error: DOMException) => void
    ): void;
}

export interface FileSystemDirectoryEntry extends FileSystemEntry {
    createReader(): FileSystemDirectoryReader;
}
