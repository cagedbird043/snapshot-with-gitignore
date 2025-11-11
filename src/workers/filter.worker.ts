/// <reference lib="webworker" />

import { isFileAllowed } from '../utils/fileFilters';
import type {
  FilterWorkerInboundMessage,
  FilterWorkerOutboundMessage,
  FilteredFile,
} from '../types';

const ctx: DedicatedWorkerGlobalScope = self as unknown as DedicatedWorkerGlobalScope;

ctx.onmessage = (event: MessageEvent<FilterWorkerInboundMessage>) => {
  const message = event.data;
  if (message.type !== 'FILTER_FILES') {
    return;
  }

  try {
    const filteredFiles: FilteredFile[] = message.payload.allFiles
      .filter(file => isFileAllowed(file, message.payload.gitignores, message.payload.projectName))
      .map(file => ({ webkitRelativePath: file.webkitRelativePath, size: file.size }));

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
