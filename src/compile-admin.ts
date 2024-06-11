import { compileUiExtensions } from '@vendure/ui-devkit/compiler';
import { DEFAULT_BASE_HREF } from '@vendure/ui-devkit/compiler/constants';
import { uiExtensionOptions } from './vendure-config';

compileUiExtensions({
  devMode: false,
  baseHref: process.env.BASE_HREF ?? DEFAULT_BASE_HREF,
  ...uiExtensionOptions,
})
  .compile?.()
  .then(() => {
    process.exit(0);
  });
