import { PluginCommonModule, Type, VendurePlugin } from '@vendure/core';
import { PERSIST_GRAPHQL_SCHEMAS_PLUGIN_OPTIONS } from './constants';
import { PersistGraphqlSchemaService } from './services/persist-graphql-schema.service';
import { PluginInitOptions } from './types';

@VendurePlugin({
  imports: [PluginCommonModule],
  providers: [
    {
      provide: PERSIST_GRAPHQL_SCHEMAS_PLUGIN_OPTIONS,
      useFactory: () => PersistGraphqlSchemasPlugin.options,
    },
    PersistGraphqlSchemaService,
  ],
  compatibility: '^2.0.0',
})
export class PersistGraphqlSchemasPlugin {
  static options: PluginInitOptions;

  static init(options: PluginInitOptions): Type<PersistGraphqlSchemasPlugin> {
    this.options = options;
    return PersistGraphqlSchemasPlugin;
  }
}
