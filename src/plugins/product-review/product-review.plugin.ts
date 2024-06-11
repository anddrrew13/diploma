import * as path from 'path';
import { Logger, PluginCommonModule, ProcessContext, Type, VendurePlugin } from '@vendure/core';
import { AdminUiExtension } from '@vendure/ui-devkit/compiler';
import { ProductReviewAdminSchema, ProductReviewShopSchema } from './api/api-extensions';
import { ProductReviewAdminResolver } from './api/product-review-admin.resolver';
import { ProductReviewShopResolver } from './api/product-review-shop.resolver';
import { PRODUCT_REVIEW_PLUGIN_OPTIONS, loggerCtx } from './constants';
import { ProductReview } from './entities/product-review.entity';
import { ProductReviewCronService } from './services/product-review-cron.service';
import { ProductReviewQueueService } from './services/product-review-queue.service';
import { ProductReviewService } from './services/product-review.service';
import { PluginInitOptions } from './types';

@VendurePlugin({
  imports: [PluginCommonModule],
  shopApiExtensions: {
    schema: ProductReviewShopSchema,
    resolvers: [ProductReviewShopResolver],
  },
  adminApiExtensions: {
    schema: ProductReviewAdminSchema,
    resolvers: [ProductReviewAdminResolver],
  },
  providers: [
    {
      provide: PRODUCT_REVIEW_PLUGIN_OPTIONS,
      useFactory: () => ProductReviewPlugin.options,
    },
    ProductReviewService,
    ProductReviewQueueService,
    ProductReviewCronService,
  ],
  compatibility: '^2.0.0',
  entities: [ProductReview],
})
export class ProductReviewPlugin {
  static options: PluginInitOptions;

  static init(options: PluginInitOptions): Type<ProductReviewPlugin> {
    this.options = options;
    return ProductReviewPlugin;
  }

  static ui: AdminUiExtension = {
    id: 'product-review-ui',
    extensionPath: path.join(__dirname, 'ui'),
    routes: [{ route: 'product-reviews', filePath: 'routes.ts' }],
    providers: ['providers.ts'],
  };
}
