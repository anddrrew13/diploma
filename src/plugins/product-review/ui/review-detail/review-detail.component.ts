import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ResultOf } from '@graphql-typed-document-node/core';
import { LanguageCode, NotificationService, SharedModule, TypedBaseDetailComponent } from '@vendure/admin-ui/core';
import { graphql } from '../gql';
import { ProductReviewMood, ProductReviewStatus } from '../gql/graphql';

export const reviewDetailFragment = graphql(`
  fragment ReviewDetail on ProductReview {
    id
    createdAt
    updatedAt
    rating
    text
    authorName
    productId
    status
    generalMood
    priceMood
    deliveryMood
    productMood
    summary
    spamFlagged
    moderationFlagged
    moderationResult
    aiExplanation
    score
    product {
      name
    }
  }
`);

export const getReviewDetailDocument = graphql(`
  query GetReviewDetail($id: ID!) {
    productReview(id: $id) {
      ...ReviewDetail
    }
  }
`);

export const updateReviewDocument = graphql(`
  mutation UpdateReview($input: UpdateProductReviewInput!) {
    updateProductReview(input: $input) {
      ...ReviewDetail
    }
  }
`);

@Component({
  selector: 'review-detail',
  templateUrl: './review-detail.component.html',
  // styleUrls: ['./review-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [SharedModule],
})
export class ReviewDetailComponent extends TypedBaseDetailComponent<typeof getReviewDetailDocument, 'productReview'> implements OnInit, OnDestroy {
  detailForm = this.formBuilder.group({
    status: [ProductReviewStatus.PENDING],
    generalMood: [ProductReviewMood.UNKNOWN],
    productMood: [ProductReviewMood.UNKNOWN],
    priceMood: [ProductReviewMood.UNKNOWN],
    deliveryMood: [ProductReviewMood.UNKNOWN],
    summary: [''],
  });

  constructor(
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
  ) {
    super();
  }

  ngOnInit() {
    this.init();

    this.entity$.subscribe((entity) => {
      console.log(entity);
    });
  }

  ngOnDestroy() {
    this.destroy();
  }

  update() {
    const { status } = this.detailForm.value;

    if (!status) {
      return;
    }

    this.dataService
      .mutate(updateReviewDocument, {
        input: { id: this.id, status },
      })
      .subscribe(() => {
        this.notificationService.success('Review updated');
      });
  }

  protected setFormValues(entity: NonNullable<ResultOf<typeof getReviewDetailDocument>['productReview']>, languageCode: LanguageCode): void {
    this.detailForm.patchValue({
      status: entity.status,
      generalMood: entity.generalMood,
      productMood: entity.productMood,
      priceMood: entity.priceMood,
      deliveryMood: entity.deliveryMood,
      summary: entity.summary,
    });
  }
}
