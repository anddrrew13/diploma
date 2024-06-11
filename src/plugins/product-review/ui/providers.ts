import { addNavMenuSection } from '@vendure/admin-ui/core';

export default [
  addNavMenuSection(
    {
      id: 'product-reviews-section',
      label: 'Reviews',
      items: [
        {
          id: 'product-reviews',
          label: 'product-reviews',
          routerLink: ['/extensions/product-reviews'],
          icon: 'cursor-hand-open',
        },
      ],
    },
    'settings',
  ),
];
