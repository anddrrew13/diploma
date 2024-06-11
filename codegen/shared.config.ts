import { CodegenConfig } from '@graphql-codegen/cli';

export const sharedConfig: Omit<CodegenConfig, 'generates'> = {
  overwrite: true,
  config: {
    scalars: { Money: 'number' },
    namingConvention: { enumValues: 'keep' },
    strict: true,
  },
};
