/// <reference lib="webworker" />

import { isFileAllowed } from '../utils/fileFilters';
import type {
    FilterWorkerInboundMessage,
    FilterWorkerOutboundMessage,
    FilteredFile,
} from '../types';

const ctx: DedicatedWorkerGlobalScope = self as unknown as DedicatedWorkerGlobalScope;

// 构建 gitignore 映射表（与 fileFilters.ts 中的函数相同，但在 worker 中独立）
const buildGitignoreMap = (
    gitignores: Array<{ path: string; content: string }>,
    projectName: string
): Map<string, string> => {
    const gitignoreMap = new Map<string, string>();
    for (const entry of gitignores) {
        if (entry.path.endsWith('.gitignore')) {
            const separatorIndex = entry.path.lastIndexOf('/');
            const directoryKey =
                separatorIndex >= 0 ? entry.path.substring(0, separatorIndex) : projectName;
            gitignoreMap.set(directoryKey, entry.content);
        } else {
            gitignoreMap.set(projectName, entry.content);
        }
    }
    return gitignoreMap;
};

ctx.onmessage = (event: MessageEvent<FilterWorkerInboundMessage>) => {
    const message = event.data;
    if (message.type !== 'FILTER_FILES') {
        return;
    }

    try {
        // 一次性构建 gitignoreMap，避免每个文件都重复构建
        const gitignoreMap = buildGitignoreMap(
            message.payload.gitignores,
            message.payload.projectName
        );

        const filteredFiles: FilteredFile[] = message.payload.allFiles
            .filter(item =>
                isFileAllowed(
                    item.file,
                    message.payload.gitignores,
                    message.payload.projectName,
                    gitignoreMap
                )
            )
            .map(item => ({ webkitRelativePath: item.webkitRelativePath, size: item.size }));

        const response: FilterWorkerOutboundMessage = {
            type: 'FILTER_RESULT',
            payload: { filteredFiles },
        };
        ctx.postMessage(response);
    } catch (error) {
        const messageText = error instanceof Error ? error.message : 'Unknown filtering error';
        const response: FilterWorkerOutboundMessage = {
            type: 'FILTER_ERROR',
            payload: { message: `An error occurred during file filtering: ${messageText}` },
        };
        ctx.postMessage(response);
    }
};
