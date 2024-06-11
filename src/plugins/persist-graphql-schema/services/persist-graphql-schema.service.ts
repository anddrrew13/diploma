import { exec } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { Inject, Injectable } from '@nestjs/common';
import { Logger } from '@vendure/core';
import { PERSIST_GRAPHQL_SCHEMAS_PLUGIN_OPTIONS, loggerCtx } from '../constants';
import { PluginInitOptions } from '../types';

@Injectable()
export class PersistGraphqlSchemaService {
  constructor(
    @Inject(PERSIST_GRAPHQL_SCHEMAS_PLUGIN_OPTIONS)
    private options: PluginInitOptions,
  ) {}

  async persistGraphqlSchema(): Promise<void> {
    const { adminApiUrl, shopApiUrl, folderPath } = this.options;
    const adminSchemaPath = path.join(folderPath, 'admin-schema.graphql');
    const shopSchemaPath = path.join(folderPath, 'shop-schema.graphql');

    await this.downloadAndWriteSchema(adminApiUrl, adminSchemaPath);
    await this.downloadAndWriteSchema(shopApiUrl, shopSchemaPath);
  }

  async execPromise(command: string): Promise<string> {
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(stdout ? stdout : stderr);
      });
    });
  }

  async downloadAndWriteSchema(url: string, path: string) {
    try {
      const schema = await this.execPromise(`node node_modules/get-graphql-schema/dist/index.js ${url}`);

      if (schema.length) {
        const savedSchema = (await fs.readFile(path)).toString();
        if (savedSchema !== schema) {
          await fs.writeFile(path, schema);
          Logger.warn(`GraphQL schema was updated: ${path}`, loggerCtx);
          Logger.warn(`╔═══════════════════════════════════════════╗`, loggerCtx);
          Logger.warn(`║   !!! Rerun "npm run codegen:types" !!!   ║`, loggerCtx);
          Logger.warn(`╚═══════════════════════════════════════════╝`, loggerCtx);
        } else {
          Logger.info(`GraphQL schema was not updated: ${path}`, loggerCtx);
        }
      } else {
        throw new Error('Schema is empty');
      }
    } catch (e) {
      Logger.error(`FAILED TO WRITE GQL SCHEMA`, loggerCtx);
      Logger.error(String(e), loggerCtx);
      throw e;
    }
  }
}
