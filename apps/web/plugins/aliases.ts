import path from 'node:path';
import type { Plugin } from 'vite';
import { existsSync } from 'node:fs';

// Absolute path to the shared/design-mode stub (works for SSR + client)
const SHARED_DESIGN_MODE_STUB = path.resolve(
  __dirname,
  '../../../shared/design-mode/index.ts'
);

export function aliases(): Plugin {
  return {
    enforce: 'pre', // run as early as possible
    name: 'api-aware-alias',
    resolveId(source: string, importer?: string) {
      // Redirect any import that resolves to shared/design-mode to our stub.
      // This covers the relative '../../../../shared/design-mode' used in
      // design-mode.ts and works for both client and SSR (unlike resolve.alias).
      if (
        source.includes('shared/design-mode') ||
        (importer &&
          source.startsWith('..') &&
          path
            .resolve(path.dirname(importer), source)
            .includes('shared/design-mode'))
      ) {
        return SHARED_DESIGN_MODE_STUB;
      }

      if (!source.startsWith('@/')) return;
      const sourcePath = source.slice('@/'.length);
      const extensions = ['.ts', '.js', '.tsx', '.jsx'];

      for (const ext of extensions) {
        const filePath = path.resolve(__dirname, '../', 'src', `./${sourcePath}${ext}`);

        if (existsSync(filePath)) {
          return filePath;
        }
      }
      return;
    },
  };
}
