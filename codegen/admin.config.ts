import type { CodegenConfig } from '@graphql-codegen/cli';
import { sharedConfig } from './shared.config';

const config: CodegenConfig = {
  ...sharedConfig,
  hooks: {
    afterAllFileWrite: 'prettier --write src/generated/admin.types.ts',
  },
  schema: 'schemas/admin-schema.graphql',
  generates: {
    'src/generated/admin.types.ts': {
      plugins: ['typescript'],
    },
  },
};

export default config;
