import path from 'path';
import { ScheduleModule } from '@nestjs/schedule';
import { AdminUiPlugin } from '@vendure/admin-ui-plugin';
import { AssetServerPlugin } from '@vendure/asset-server-plugin';
import { DefaultJobQueuePlugin, DefaultLogger, DefaultSearchPlugin, LogLevel, VendureConfig, dummyPaymentHandler } from '@vendure/core';
import { EmailPlugin, defaultEmailHandlers } from '@vendure/email-plugin';
import { UiExtensionCompilerOptions, compileUiExtensions } from '@vendure/ui-devkit/compiler';
import 'dotenv/config';
import { PersistGraphqlSchemasPlugin } from './plugins/persist-graphql-schema/persist-graphql-schema.plugin';
import { ProductReviewPlugin } from './plugins/product-review/product-review.plugin';

export const IS_DEV = process.env.APP_ENV === 'dev';
export const uiExtensionOptions: UiExtensionCompilerOptions = {
  outputPath: path.join(__dirname, '../admin-ui'),
  extensions: [ProductReviewPlugin.ui],
};

export const config: VendureConfig = {
  apiOptions: {
    port: 3000,
    adminApiPath: 'admin-api',
    shopApiPath: 'shop-api',
    // The following options are useful in development mode,
    // but are best turned off for production for security
    // reasons.
    ...(IS_DEV
      ? {
          adminApiPlayground: {
            settings: { 'request.credentials': 'include' },
          },
          adminApiDebug: true,
          shopApiPlayground: {
            settings: { 'request.credentials': 'include' },
          },
          shopApiDebug: true,
        }
      : {}),
  },
  authOptions: {
    tokenMethod: ['bearer', 'cookie'],
    superadminCredentials: {
      identifier: process.env.SUPERADMIN_USERNAME,
      password: process.env.SUPERADMIN_PASSWORD,
    },
    cookieOptions: {
      secret: process.env.COOKIE_SECRET,
    },
  },
  logger: new DefaultLogger({ level: LogLevel.Debug }),
  dbConnectionOptions: {
    type: 'postgres',
    synchronize: IS_DEV,
    migrations: [path.join(__dirname, './migrations/*.+(js|ts)')],
    logging: false,
    database: process.env.DB_NAME,
    schema: process.env.DB_SCHEMA,
    host: process.env.DB_HOST,
    port: +process.env.DB_PORT,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
  },
  paymentOptions: {
    paymentMethodHandlers: [dummyPaymentHandler],
  },
  // When adding or altering custom field definitions, the database will
  // need to be updated. See the "Migrations" section in README.md.
  customFields: {},
  plugins: [
    ScheduleModule.forRoot(),
    AssetServerPlugin.init({
      route: 'assets',
      assetUploadDir: path.join(__dirname, '../static/assets'),
      // For local dev, the correct value for assetUrlPrefix should
      // be guessed correctly, but for production it will usually need
      // to be set manually to match your production url.
      assetUrlPrefix: IS_DEV ? undefined : 'https://www.my-shop.com/assets/',
    }),
    DefaultJobQueuePlugin.init({ useDatabaseForBuffer: true }),
    DefaultSearchPlugin.init({ bufferUpdates: false, indexStockStatus: true }),
    EmailPlugin.init({
      devMode: true,
      outputPath: path.join(__dirname, '../static/email/test-emails'),
      route: 'mailbox',
      handlers: defaultEmailHandlers,
      templatePath: path.join(__dirname, '../static/email/templates'),
      globalTemplateVars: {
        // The following variables will change depending on your storefront implementation.
        // Here we are assuming a storefront running at http://localhost:8080.
        fromAddress: '"example" <noreply@example.com>',
        verifyEmailAddressUrl: 'http://localhost:8080/verify',
        passwordResetUrl: 'http://localhost:8080/password-reset',
        changeEmailAddressUrl: 'http://localhost:8080/verify-email-address-change',
      },
    }),
    AdminUiPlugin.init({
      route: 'admin',
      port: 3002,
      adminUiConfig: {
        apiPort: 3000,
      },
      app: IS_DEV
        ? compileUiExtensions({
            devMode: true,
            ...uiExtensionOptions,
          })
        : {
            path: path.join(__dirname, '../admin-ui/dist'),
          },
    }),
    ProductReviewPlugin.init({
      useFakeData: false,
      openAIKey: process.env.OPENAI_KEY!,
      openAISeed: process.env.OPENAI_SEED ? +process.env.OPENAI_SEED : undefined,
    }),
    PersistGraphqlSchemasPlugin.init({
      isDev: IS_DEV,
      folderPath: path.join(__dirname, '../schemas'),
      adminApiUrl: 'http://localhost:3000/admin-api',
      shopApiUrl: 'http://localhost:3000/shop-api',
    }),
  ],
};
