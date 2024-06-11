import type { CodegenConfig } from '@graphql-codegen/cli';
import { sharedConfig } from './shared.config';

const config: CodegenConfig = {
  ...sharedConfig,
  hooks: {
    afterAllFileWrite: 'prettier --write src/generated/shop.types.ts',
  },
  schema: 'schemas/shop-schema.graphql',
  generates: {
    'src/generated/shop.types.ts': {
      plugins: ['typescript'],
    },
  },
};

export default config;
