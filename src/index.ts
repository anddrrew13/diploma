import { bootstrap, runMigrations } from '@vendure/core';
import { PersistGraphqlSchemaService } from './plugins/persist-graphql-schema/services/persist-graphql-schema.service';
import { IS_DEV, config } from './vendure-config';

runMigrations(config)
  .then(() => bootstrap(config))
  .then((app) => {
    if (IS_DEV) {
      app.get(PersistGraphqlSchemaService).persistGraphqlSchema();
    }
  })
  .catch((err) => {
    console.log(err);
  });
