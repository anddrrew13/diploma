import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Routes } from '@angular/router';
import { SharedModule, TypedBaseListComponent } from '@vendure/admin-ui/core';
import { graphql } from '../gql';
import { ProductReviewMood, ProductReviewStatus } from '../gql/graphql';

export const getReviewListDocument = graphql(`
  query GetReviewList($options: ProductReviewListOptions) {
    productReviews(options: $options) {
      items {
        id
        createdAt
        updatedAt
        rating
        text
        authorName
        productId
        status
        generalMood
        productMood
        priceMood
        deliveryMood
        spamFlagged
        moderationFlagged
        summary
      }
      totalItems
    }
  }
`);

@Component({
  selector: 'review-list',
  templateUrl: './review-list.component.html',
  styleUrls: ['./review-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [SharedModule],
})
export class ReviewListComponent extends TypedBaseListComponent<typeof getReviewListDocument, 'productReviews'> {
  readonly filters = this.createFilterCollection()
    .addDateFilters()
    .addFilter({
      name: 'rating',
      type: {
        kind: 'number',
      },
      label: 'Rating',
      filterField: 'rating',
    })
    .addFilter({
      name: 'authorName',
      type: {
        kind: 'text',
      },
      label: 'Author',
      filterField: 'authorName',
    })
    .addFilter({
      label: 'Status',
      name: 'status',
      type: {
        kind: 'select',
        options: Object.entries(ProductReviewStatus).map(([key, value]) => ({ label: key, value })),
      },
      filterField: 'status',
    })
    .addFilter({
      name: 'generalMood',
      type: {
        kind: 'select',
        options: Object.entries(ProductReviewMood).map(([key, value]) => ({ label: key, value })),
      },
      label: 'General mood',
      filterField: 'generalMood',
    })
    .addFilter({
      name: 'productMood',
      type: {
        kind: 'select',
        options: Object.entries(ProductReviewMood).map(([key, value]) => ({ label: key, value })),
      },
      label: 'Product mood',
      filterField: 'productMood',
    })
    .addFilter({
      name: 'priceMood',
      type: {
        kind: 'select',
        options: Object.entries(ProductReviewMood).map(([key, value]) => ({ label: key, value })),
      },
      label: 'Price mood',
      filterField: 'priceMood',
    })
    .addFilter({
      name: 'deliveryMood',
      type: {
        kind: 'select',
        options: Object.entries(ProductReviewMood).map(([key, value]) => ({ label: key, value })),
      },
      label: 'Delivery mood',
      filterField: 'deliveryMood',
    })
    .addIdFilter()
    .addFilter({
      name: 'Product ID',
      type: {
        kind: 'id',
      },
      label: 'Product ID',
      filterField: 'productId',
    })
    .connectToRoute(this.route);

  readonly sorts = this.createSortCollection()
    .defaultSort('createdAt', 'DESC')
    .addSort({ name: 'createdAt' })
    .addSort({ name: 'updatedAt' })
    // .addSort({ name: 'title' })
    .addSort({ name: 'rating' })
    .addSort({ name: 'authorName' })

    .connectToRoute(this.route);

  constructor() {
    super();
    super.configure({
      document: getReviewListDocument,
      getItems: (data) => data.productReviews,
      setVariables: (skip, take) => ({
        options: {
          skip,
          take,
          filter: {
            // productId: {
            //   eq: this.route.snapshot.parent?.paramMap.get('id'),
            // },
            text: {
              contains: this.searchTermControl.value,
            },
            ...this.filters.createFilterInput(),
          },
          sort: this.sorts.createSortInput(),
        },
      }),
      refreshListOnChanges: [this.filters.valueChanges, this.sorts.valueChanges],
    });
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.listRoutes();
  }

  public listRoutes(): void {
    const routes = this.router.config;
    this.printRoutes(routes, '');
  }

  private printRoutes(routes: Routes, indent: string): void {
    for (const route of routes) {
      // Format route path
      const path = route.path ? `/${route.path}` : 'No path';
      console.log(`${indent}${path}`); // Output the full route path to the console with indentation

      // Handle redirection
      if (route.redirectTo) {
        console.log(`${indent}  Redirects to: ${route.redirectTo}`);
      }

      // Recurse if there are children
      if (route.children) {
        this.printRoutes(route.children, indent + '  ');
      }

      // Handle lazy-loaded routes (if you need to resolve them, which is more complex)
      if (route.loadChildren) {
        console.log(`${indent}  Lazy load: ${route.loadChildren}`);
      }
    }
  }
}
