import { registerRouteComponent } from '@vendure/admin-ui/core';
import { ReviewDetailComponent, getReviewDetailDocument } from './review-detail/review-detail.component';
import { ReviewListComponent, getReviewListDocument } from './review-list/review-list.component';

export default [
  registerRouteComponent({
    path: '',
    component: ReviewListComponent,
    breadcrumb: 'Product reviews',
  }),
  registerRouteComponent({
    path: ':id',
    component: ReviewDetailComponent,
    query: getReviewDetailDocument,
    entityKey: 'productReview',
    getBreadcrumbs: (entity) => [
      {
        label: `${entity?.product.name}`,
        link: ['catalog', 'products', `${entity?.productId}`],
      },
      {
        label: 'Product reviews',
        link: ['extensions', `product-reviews?filters=Product ID:eq,${entity?.productId}&page=1`],
      },
      {
        label: `#${entity?.id}`,
        link: [],
      },
    ],
  }),
];
