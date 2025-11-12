import { formatFileSize } from './fileInfo';

export const generateProjectTree = (files: File[], projectName: string): string => {
    const fileTree: Record<string, unknown> = {};

    files.forEach(file => {
        const relativePath = file.webkitRelativePath.startsWith(`${projectName}/`)
            ? file.webkitRelativePath.substring(projectName.length + 1)
            : file.webkitRelativePath;

        const parts = relativePath.split('/');
        let currentNode: Record<string, unknown> = fileTree;

        for (let index = 0; index < parts.length - 1; index += 1) {
            const part = parts[index];
            if (!currentNode[part] || typeof currentNode[part] !== 'object') {
                currentNode[part] = {};
            }
            currentNode = currentNode[part] as Record<string, unknown>;
        }

        currentNode[parts[parts.length - 1]] = file;
    });

    const buildTreeString = (node: Record<string, unknown>, prefix = ''): string => {
        let result = '';
        const entries = Object.keys(node).sort((a, b) => {
            const aIsDir = !(node[a] instanceof File);
            const bIsDir = !(node[b] instanceof File);

            if (aIsDir && !bIsDir) return -1;
            if (!aIsDir && bIsDir) return 1;
            return a.localeCompare(b);
        });

        entries.forEach((entry, index) => {
            const isLast = index === entries.length - 1;
            const connector = isLast ? '└── ' : '├── ';
            const childPrefix = prefix + (isLast ? '    ' : '│   ');
            const item = node[entry];

            if (item instanceof File) {
                const sizeStr = formatFileSize(item.size).padStart(8);
                result += `${prefix}${connector}[${sizeStr}] ${entry}\n`;
            } else {
                result += `${prefix}${connector}${entry}/\n`;
                result += buildTreeString(item as Record<string, unknown>, childPrefix);
            }
        });

        return result;
    };

    return '.\n' + buildTreeString(fileTree);
};
