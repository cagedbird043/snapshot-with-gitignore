import { MutableRefObject, useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import { produce } from 'immer';
import {
    FilterWorkerInboundMessage,
    FilterWorkerOutboundMessage,
    FilteredFile,
    GitignoreFile,
    ProcessorPhase,
    SnapshotWorkerInboundMessage,
    SnapshotWorkerOutboundMessage,
} from '../types';
import { createDefaultGitignore } from '../utils/constants';

interface FileProcessorState {
    phase: ProcessorPhase;
    status: string;
    projectName: string;
    allFiles: File[];
    filteredFiles: FilteredFile[];
    gitignores: GitignoreFile[];
    snapshotContent: string;
}

const INITIAL_STATUS = 'Select a project folder or drag it here to begin.';

const createInitialState = (): FileProcessorState => ({
    phase: 'idle',
    status: INITIAL_STATUS,
    projectName: '',
    allFiles: [],
    filteredFiles: [],
    gitignores: [createDefaultGitignore()],
    snapshotContent: '',
});

type Action =
    | { type: 'ANALYZE_START'; payload: { status: string } }
    | {
          type: 'FILES_READY';
          payload: {
              allFiles: File[];
              gitignores: GitignoreFile[];
              projectName: string;
              status: string;
          };
      }
    | { type: 'FILTERING_STARTED' }
    | { type: 'FILTERING_COMPLETED'; payload: { filteredFiles: FilteredFile[]; status: string } }
    | { type: 'FILTERING_FAILED'; payload: { status: string } }
    | { type: 'GITIGNORE_EDIT'; payload: { path: string; content: string } }
    | { type: 'SNAPSHOT_STARTED' }
    | { type: 'SNAPSHOT_STATUS'; payload: { status: string } }
    | { type: 'SNAPSHOT_COMPLETED'; payload: { content: string; status: string } }
    | { type: 'SNAPSHOT_FAILED'; payload: { status: string } }
    | { type: 'SET_STATUS'; payload: { status: string } }
    | { type: 'RESET' };

const reducer = (state: FileProcessorState, action: Action): FileProcessorState =>
    produce(state, draft => {
        switch (action.type) {
            case 'ANALYZE_START':
                draft.phase = 'analyzing';
                draft.status = action.payload.status;
                draft.projectName = '';
                draft.allFiles = [];
                draft.filteredFiles = [];
                draft.snapshotContent = '';
                break;
            case 'FILES_READY':
                draft.phase = 'analyzing';
                draft.status = action.payload.status;
                draft.projectName = action.payload.projectName;
                draft.allFiles = action.payload.allFiles;
                draft.gitignores = action.payload.gitignores;
                draft.filteredFiles = [];
                draft.snapshotContent = '';
                break;
            case 'FILTERING_STARTED':
                draft.phase = 'filtering';
                draft.status = 'Applying ignore rules in the background...';
                draft.filteredFiles = [];
                draft.snapshotContent = '';
                break;
            case 'FILTERING_COMPLETED':
                draft.phase = 'ready';
                draft.status = action.payload.status;
                draft.filteredFiles = action.payload.filteredFiles;
                break;
            case 'FILTERING_FAILED':
                draft.phase = 'error';
                draft.status = action.payload.status;
                break;
            case 'GITIGNORE_EDIT': {
                const entry = draft.gitignores.find(e => e.path === action.payload.path);
                if (entry) {
                    entry.content = action.payload.content;
                }
                draft.snapshotContent = ''; // Clear snapshot when rules change
                break;
            }
            case 'SNAPSHOT_STARTED':
                draft.phase = 'generating';
                draft.status = 'Starting snapshot generation in the background...';
                draft.snapshotContent = '';
                break;
            case 'SNAPSHOT_STATUS':
                draft.status = action.payload.status;
                break;
            case 'SNAPSHOT_COMPLETED':
                draft.phase = 'ready';
                draft.status = action.payload.status;
                draft.snapshotContent = action.payload.content;
                break;
            case 'SNAPSHOT_FAILED':
                draft.phase = 'error';
                draft.status = action.payload.status;
                break;
            case 'SET_STATUS':
                draft.status = action.payload.status;
                break;
            case 'RESET':
                return createInitialState();
        }
    });

const terminateWorker = (workerRef: MutableRefObject<Worker | null>) => {
    if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
    }
};

export const useFileProcessor = () => {
    const [state, dispatch] = useReducer(reducer, undefined, createInitialState);
    const filterWorkerRef = useRef<Worker | null>(null);
    const snapshotWorkerRef = useRef<Worker | null>(null);

    useEffect(
        () => () => {
            terminateWorker(filterWorkerRef);
            terminateWorker(snapshotWorkerRef);
        },
        []
    );

    useEffect(() => {
        if (!state.allFiles.length || !state.gitignores.length || !state.projectName) {
            return undefined;
        }

        dispatch({ type: 'FILTERING_STARTED' });

        const worker = new Worker(new URL('../workers/filter.worker.ts', import.meta.url), {
            type: 'module',
        });
        filterWorkerRef.current = worker;

        worker.onmessage = (event: MessageEvent<FilterWorkerOutboundMessage>) => {
            const message = event.data;
            if (message.type === 'FILTER_RESULT') {
                dispatch({
                    type: 'FILTERING_COMPLETED',
                    payload: {
                        filteredFiles: message.payload.filteredFiles,
                        status: `${message.payload.filteredFiles.length} files will be included. Ready to generate snapshot.`,
                    },
                });
            } else if (message.type === 'FILTER_ERROR') {
                dispatch({
                    type: 'FILTERING_FAILED',
                    payload: { status: message.payload.message },
                });
            }
            terminateWorker(filterWorkerRef);
        };

        worker.onerror = error => {
            console.error('Filtering worker error:', error);
            dispatch({
                type: 'FILTERING_FAILED',
                payload: { status: `An error occurred during file filtering: ${error.message}` },
            });
            terminateWorker(filterWorkerRef);
        };

        const request: FilterWorkerInboundMessage = {
            type: 'FILTER_FILES',
            payload: {
                allFiles: state.allFiles.map(file => ({
                    webkitRelativePath: file.webkitRelativePath,
                    size: file.size,
                    file,
                })),
                gitignores: state.gitignores,
                projectName: state.projectName,
            },
        };
        worker.postMessage(request);

        return () => {
            terminateWorker(filterWorkerRef);
        };
    }, [state.allFiles, state.gitignores, state.projectName]);

    const processFiles = useCallback(async (files: File[]) => {
        if (!files.length) {
            return;
        }

        terminateWorker(filterWorkerRef);
        terminateWorker(snapshotWorkerRef);

        dispatch({ type: 'ANALYZE_START', payload: { status: 'Analyzing folder structure...' } });

        const firstPath = files[0].webkitRelativePath;
        const projectName = firstPath ? (firstPath.split('/')[0] ?? 'project') : 'project';

        const gitignoreFiles = files.filter(file => file.name === '.gitignore');

        const loadedGitignores: GitignoreFile[] = gitignoreFiles.length
            ? await Promise.all(
                  gitignoreFiles.map(async file => ({
                      path: file.webkitRelativePath,
                      content: await file.text().catch(error => {
                          console.error(
                              `Error reading .gitignore: ${file.webkitRelativePath}`,
                              error
                          );
                          return '';
                      }),
                  }))
              )
            : [createDefaultGitignore()];

        loadedGitignores.sort((a, b) => a.path.localeCompare(b.path));

        const statusUpdate = gitignoreFiles.length
            ? `Loaded rules from ${loadedGitignores.length} .gitignore file(s).`
            : 'No .gitignore found. Using default rules.';

        dispatch({
            type: 'FILES_READY',
            payload: {
                allFiles: files,
                gitignores: loadedGitignores,
                projectName,
                status: `${statusUpdate} Found ${files.length} total files.`,
            },
        });
    }, []);

    const updateGitignore = useCallback((path: string, content: string) => {
        dispatch({ type: 'GITIGNORE_EDIT', payload: { path, content } });
    }, []);

    const generateSnapshot = useCallback(() => {
        if (!state.filteredFiles.length) {
            dispatch({
                type: 'SET_STATUS',
                payload: { status: 'No files to process after filtering.' },
            });
            return;
        }

        terminateWorker(snapshotWorkerRef);

        dispatch({ type: 'SNAPSHOT_STARTED' });

        const filteredPaths = new Set(state.filteredFiles.map(file => file.webkitRelativePath));
        const filesToProcess = state.allFiles.filter(file =>
            filteredPaths.has(file.webkitRelativePath)
        );

        const worker = new Worker(new URL('../workers/snapshot.worker.ts', import.meta.url), {
            type: 'module',
        });
        snapshotWorkerRef.current = worker;

        worker.onmessage = (event: MessageEvent<SnapshotWorkerOutboundMessage>) => {
            const message = event.data;
            if (message.type === 'STATUS_UPDATE') {
                dispatch({ type: 'SNAPSHOT_STATUS', payload: { status: message.payload.message } });
            } else if (message.type === 'SNAPSHOT_RESULT') {
                dispatch({
                    type: 'SNAPSHOT_COMPLETED',
                    payload: {
                        content: message.payload.content,
                        status: `Snapshot for "${state.projectName}" created successfully! You can preview, copy, or download it below.`,
                    },
                });
                terminateWorker(snapshotWorkerRef);
            } else if (message.type === 'SNAPSHOT_ERROR') {
                dispatch({ type: 'SNAPSHOT_FAILED', payload: { status: message.payload.message } });
                terminateWorker(snapshotWorkerRef);
            }
        };

        worker.onerror = error => {
            console.error('Snapshot worker error:', error);
            dispatch({
                type: 'SNAPSHOT_FAILED',
                payload: {
                    status: `An error occurred during snapshot generation: ${error.message}`,
                },
            });
            terminateWorker(snapshotWorkerRef);
        };

        const request: SnapshotWorkerInboundMessage = {
            type: 'GENERATE_SNAPSHOT',
            payload: {
                filesToProcess,
                projectName: state.projectName,
            },
        };
        worker.postMessage(request);
    }, [state.allFiles, state.filteredFiles, state.projectName]);

    const downloadSnapshot = useCallback(() => {
        if (!state.snapshotContent) {
            return;
        }
        const blob = new Blob([state.snapshotContent], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `${state.projectName || 'project'}-snapshot.md`;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        URL.revokeObjectURL(url);
    }, [state.snapshotContent, state.projectName]);

    const copySnapshotToClipboard = useCallback(async () => {
        if (!state.snapshotContent) {
            return;
        }

        try {
            await navigator.clipboard.writeText(state.snapshotContent);
            dispatch({
                type: 'SET_STATUS',
                payload: { status: 'Snapshot content copied to clipboard!' },
            });
            setTimeout(() => {
                dispatch({
                    type: 'SET_STATUS',
                    payload: {
                        status: `Snapshot for "${state.projectName}" created successfully!`,
                    },
                });
            }, 3000);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown clipboard error';
            dispatch({ type: 'SET_STATUS', payload: { status: `Failed to copy: ${message}` } });
        }
    }, [state.snapshotContent, state.projectName]);

    const reset = useCallback(() => {
        terminateWorker(filterWorkerRef);
        terminateWorker(snapshotWorkerRef);
        dispatch({ type: 'RESET' });
    }, []);

    const isLoading = useMemo(
        () => ['analyzing', 'filtering', 'generating'].includes(state.phase),
        [state.phase]
    );

    const canGenerateSnapshot = state.filteredFiles.length > 0;

    return {
        status: state.status,
        phase: state.phase,
        projectName: state.projectName,
        gitignores: state.gitignores,
        filteredFiles: state.filteredFiles,
        snapshotContent: state.snapshotContent,
        isLoading,
        canGenerateSnapshot,
        processFiles,
        updateGitignore,
        generateSnapshot,
        downloadSnapshot,
        copySnapshotToClipboard,
        reset,
    };
};
