import { IGNORED_DIRECTORIES } from './constants';
import type {
    FileSystemDirectoryEntry,
    FileSystemDirectoryReader,
    FileSystemEntry,
    FileSystemFileEntry,
} from '../types';

const getFileFromEntry = (entry: FileSystemFileEntry): Promise<File> =>
    new Promise<File>((resolve, reject) => entry.file(resolve, reject));

const readAllEntries = async (reader: FileSystemDirectoryReader): Promise<FileSystemEntry[]> => {
    const entries: FileSystemEntry[] = [];

    const readBatch = (): Promise<FileSystemEntry[]> =>
        new Promise((resolve, reject) => reader.readEntries(resolve, reject));

    let batch = await readBatch();
    while (batch.length > 0) {
        entries.push(...batch);
        batch = await readBatch();
    }

    return entries;
};

const isDirectoryEntry = (entry: FileSystemEntry): entry is FileSystemDirectoryEntry =>
    entry.isDirectory &&
    typeof (entry as Partial<FileSystemDirectoryEntry>).createReader === 'function';

const isFileEntry = (entry: FileSystemEntry): entry is FileSystemFileEntry =>
    entry.isFile && typeof (entry as Partial<FileSystemFileEntry>).file === 'function';

const traverseDirectory = async (
    directory: FileSystemDirectoryEntry,
    accumulator: File[]
): Promise<void> => {
    const entries = await readAllEntries(directory.createReader());

    for (const entry of entries) {
        if (isDirectoryEntry(entry)) {
            if (!IGNORED_DIRECTORIES.has(entry.name.toLowerCase())) {
                await traverseDirectory(entry, accumulator);
            }
        } else if (isFileEntry(entry)) {
            try {
                const file = await getFileFromEntry(entry);
                const relativePath = entry.fullPath.startsWith('/')
                    ? entry.fullPath.substring(1)
                    : entry.fullPath;
                const finalPath =
                    (
                        relativePath ||
                        entry.name ||
                        `unnamed-${Date.now()}-${Math.random()}`
                    ).trim() || `file-${Date.now()}-${Math.random()}`;
                Object.defineProperty(file, 'webkitRelativePath', {
                    value: finalPath,
                });
                accumulator.push(file);
            } catch (error) {
                console.warn(`Could not read file: ${entry.fullPath}`, error);
            }
        }
    }
};

export const extractFilesFromDataTransferItems = async (
    items: DataTransferItemList
): Promise<File[]> => {
    const droppedFiles: File[] = [];
    const traversalTasks: Promise<void>[] = [];

    for (let index = 0; index < items.length; index += 1) {
        const item = items[index] as DataTransferItem & {
            webkitGetAsEntry?: () => FileSystemEntry | null;
        };

        const entry = item.webkitGetAsEntry ? item.webkitGetAsEntry() : null;
        if (!entry) {
            continue;
        }

        if (isDirectoryEntry(entry)) {
            if (!IGNORED_DIRECTORIES.has(entry.name.toLowerCase())) {
                traversalTasks.push(traverseDirectory(entry, droppedFiles));
            }
        } else if (isFileEntry(entry)) {
            try {
                const file = await getFileFromEntry(entry);
                const relativePath = entry.fullPath.startsWith('/')
                    ? entry.fullPath.substring(1)
                    : entry.fullPath;
                const finalPath =
                    (
                        relativePath ||
                        entry.name ||
                        `unnamed-${Date.now()}-${Math.random()}`
                    ).trim() || `file-${Date.now()}-${Math.random()}`;
                Object.defineProperty(file, 'webkitRelativePath', {
                    value: finalPath,
                });
                droppedFiles.push(file);
            } catch (error) {
                console.warn(`Could not read file: ${entry.fullPath}`, error);
            }
        }
    }

    await Promise.all(traversalTasks);
    return droppedFiles;
};
