import gql from 'graphql-tag';

export const ProductReviewShopSchema = gql`
  extend type Mutation {
    createProductReview(input: CreateProductReviewInput!): Boolean!
  }

  input CreateProductReviewInput {
    productId: ID!
    text: String!
    rating: Float!
    authorName: String!
  }
`;

export const ProductReviewAdminSchema = gql`
  type ProductReview implements Node {
    id: ID!
    createdAt: DateTime!
    updatedAt: DateTime!
    product: Product!
    productId: ID!
    text: String!
    rating: Float!
    authorName: String!
    status: ProductReviewStatus!
    generalMood: ProductReviewMood
    productMood: ProductReviewMood
    priceMood: ProductReviewMood
    deliveryMood: ProductReviewMood
    score: Int
    spamFlagged: Boolean
    moderationFlagged: Boolean
    moderationResult: JSON
    summary: String
    aiExplanation: String
  }

  enum ProductReviewStatus {
    PENDING
    APPROVED
    REJECTED
    WAITING_FOR_MANUAL_CHECK
  }

  enum ProductReviewMood {
    POSITIVE
    NEUTRAL
    NEGATIVE
    UNKNOWN
  }

  extend type Query {
    productReview(id: ID!): ProductReview
    productReviews(options: ProductReviewListOptions): ProductReviewList!
  }

  input ProductReviewListOptions

  type ProductReviewList implements PaginatedList {
    items: [ProductReview!]!
    totalItems: Int!
  }

  extend type Mutation {
    updateProductReview(input: UpdateProductReviewInput!): ProductReview!
    deleteProductReview(id: ID!): DeletionResponse!
  }

  input UpdateProductReviewInput {
    id: ID!
    status: ProductReviewStatus
  }
`;
