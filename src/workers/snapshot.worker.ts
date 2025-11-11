/// <reference lib="webworker" />

import { getLanguageFromExtension } from '../utils/fileInfo';
import { generateProjectTree } from '../utils/projectTree';
import type { SnapshotWorkerInboundMessage, SnapshotWorkerOutboundMessage } from '../types';

const ctx: DedicatedWorkerGlobalScope = self as unknown as DedicatedWorkerGlobalScope;

ctx.onmessage = async (event: MessageEvent<SnapshotWorkerInboundMessage>) => {
  const message = event.data;
  if (message.type !== 'GENERATE_SNAPSHOT') {
    return;
  }

  const { filesToProcess, projectName } = message.payload;

  try {
    ctx.postMessage({
      type: 'STATUS_UPDATE',
      payload: { message: 'Generating project tree...' },
    } satisfies SnapshotWorkerOutboundMessage);

    const sortedFiles = [...filesToProcess].sort((a, b) =>
      a.webkitRelativePath.localeCompare(b.webkitRelativePath)
    );
    const projectTree = generateProjectTree(sortedFiles, projectName);

    let snapshotContent = `# Project Snapshot: ${projectName}\n\n`;
    snapshotContent +=
      'This file contains a snapshot of the project structure and source code, formatted for AI consumption.\n';
    snapshotContent += `Total files included: ${sortedFiles.length}\n\n`;
    snapshotContent += '## Project Structure\n\n';
    snapshotContent += '```\n' + projectTree + '\n```\n\n';
    snapshotContent += '## File Contents\n\n';

    ctx.postMessage({
      type: 'STATUS_UPDATE',
      payload: { message: `Reading contents of ${sortedFiles.length} files...` },
    } satisfies SnapshotWorkerOutboundMessage);

    for (const file of sortedFiles) {
      try {
        const content = await file.text();
        const lang = getLanguageFromExtension(file.name);
        snapshotContent += '```' + `${lang}:${file.webkitRelativePath}` + '\n';
        snapshotContent += content;
        snapshotContent += '\n```\n\n';
      } catch (error) {
        const messageText = error instanceof Error ? error.message : 'Unknown read error';
        snapshotContent += '```' + `error:Could not read ${file.webkitRelativePath}` + '\n';
        snapshotContent += `Error: ${messageText}\n`;
        snapshotContent += '```\n\n';
      }
    }

    ctx.postMessage({
      type: 'SNAPSHOT_RESULT',
      payload: { content: snapshotContent },
    } satisfies SnapshotWorkerOutboundMessage);
  } catch (error) {
    const messageText = error instanceof Error ? error.message : 'Unknown snapshot error';
    ctx.postMessage({
      type: 'SNAPSHOT_ERROR',
      payload: { message: `An error occurred during snapshot generation: ${messageText}` },
    } satisfies SnapshotWorkerOutboundMessage);
  }
};
