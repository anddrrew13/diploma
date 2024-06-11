import type { CodegenConfig } from '@graphql-codegen/cli';
import { sharedConfig } from './shared.config';

const config: CodegenConfig = {
  ...sharedConfig,
  hooks: {
    afterAllFileWrite: 'prettier --write src/**/gql/*.ts',
  },
  schema: 'schemas/admin-schema.graphql',
  documents: ['src/**/*.tsx', 'src/**/*.ts'],
  generates: {
    'src/plugins/product-review/ui/gql/': {
      preset: 'client',
      plugins: [],
      presetConfig: {
        fragmentMasking: false,
      },
    },
  },
};

export default config;
