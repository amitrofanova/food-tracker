import { defineConfig } from 'steiger';
import fsd from '@feature-sliced/steiger-plugin';

export default defineConfig([
  ...fsd.configs.recommended,
  {
    ignores: [
      '**/*.test.ts',
      '**/*.spec.ts',
      '**/__tests__/**',
      '**/auto-imports.d.ts',
      '**/android/**',
      '**/ios/**',
    ],
  },
  {
    files: ['./src/shared/**'],
    rules: {
      'fsd/public-api': 'off',
    },
  },
  {
    rules: {
      // Keep the linter focused on layer/slice boundaries from the FSD audit.
      'fsd/insignificant-slice': 'off',
      'fsd/no-ui-in-app': 'off',
      'fsd/shared-lib-grouping': 'off',
      'fsd/no-layer-public-api': 'off',
      'fsd/no-segmentless-slices': 'off',
      'fsd/segments-by-purpose': 'off',
    },
  },
]);
