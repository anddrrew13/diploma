import { DeepPartial, Product } from '@vendure/core';
import { ChatCompletion, ChatCompletionMessageParam, ChatCompletionTool, ModerationCreateResponse } from 'openai/resources';
import { ProductReviewMood } from '../../../generated/admin.types';
import { ProductReview } from '../entities/product-review.entity';

const Prompts = {
  System:
    'You are an advanced tool designed to analyze product reviews. \
  Your tasks include evaluating mood, relevance, spam detection, and assigning a numeric score.',
  Summarize: 'If the review is lengthy, summarize it in a few concise sentences, retaining the main points.',
  Mood: 'Identify the most appropriate mood for each category using the provided enum values. \
  If unsure, label as "unknown".',
  Score:
    "Assign a score between 0 and 100 based on the review's content and relevance to the product. \
  A score of 0 is least helpful, and 100 is most helpful.",
  Spam: 'Determine if the review is spam. Be less strict if the review is already flagged for moderation.',
  Explanation: 'Explain your reasoning for each step in a few sentences.',
};

const FunctionNames = {
  Summarize: 'get_summary',
  Mood: 'get_moods',
  Score: 'get_score',
  Spam: 'get_spam',
  Explanation: 'get_explanation',
};

export function createMessages(
  product: Product,
  review: ProductReview,
  moderationResults: ModerationCreateResponse['results'],
): Array<ChatCompletionMessageParam> {
  const input = JSON.stringify({
    product: {
      name: product.name,
      description: product.description,
      facetValue: product.facetValues?.map((fv) => fv.name) ?? [],
    },
    review: review.text,
    moderationResults,
  });

  return [
    { role: 'system', content: Prompts.System },
    { role: 'user', content: input },
    { role: 'user', content: Prompts.Mood },
    { role: 'user', content: Prompts.Score },
    { role: 'user', content: Prompts.Summarize },
    { role: 'user', content: Prompts.Spam },
    { role: 'user', content: Prompts.Explanation },
  ];
}

export function createTools(): ChatCompletionTool[] {
  return [
    {
      type: 'function',
      function: {
        name: FunctionNames.Mood,
        description: Prompts.Mood,
        parameters: {
          type: 'object',
          properties: {
            generalMood: {
              type: 'string',
              enum: Object.values(ProductReviewMood),
              description: 'Overall mood of the review.',
            },
            productMood: {
              type: 'string',
              enum: Object.values(ProductReviewMood),
              description: 'Mood specifically about the product.',
            },
            priceMood: {
              type: 'string',
              enum: Object.values(ProductReviewMood),
              description: 'Mood regarding the price.',
            },
            deliveryMood: {
              type: 'string',
              enum: Object.values(ProductReviewMood),
              description: 'Mood related to the delivery experience.',
            },
          },
          required: ['generalMood', 'productMood', 'priceMood', 'deliveryMood'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: FunctionNames.Score,
        description: Prompts.Score,
        parameters: {
          type: 'object',
          properties: {
            score: {
              type: 'number',
            },
          },
          required: ['score'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: FunctionNames.Summarize,
        description: Prompts.Summarize,
        parameters: {
          type: 'object',
          properties: {
            summary: {
              type: 'string',
              description: 'A brief summary in English of the review.',
            },
          },
          required: ['summary'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: FunctionNames.Spam,
        description: Prompts.Spam,
        parameters: {
          type: 'object',
          properties: {
            spamFlagged: {
              type: 'boolean',
            },
          },
          required: ['spam'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: FunctionNames.Explanation,
        description: Prompts.Explanation,
        parameters: {
          type: 'object',
          properties: {
            explanation: {
              type: 'string',
              description: 'A brief explanation of the reasoning behind the review analysis.',
            },
          },
          required: ['explanation'],
        },
      },
    },
  ];
}

interface ReviewAnalytics {
  score: number;
  generalMood: ProductReviewMood;
  productMood: ProductReviewMood;
  priceMood: ProductReviewMood;
  deliveryMood: ProductReviewMood;
  spamFlagged: boolean;
  summary?: string | null;
  explanation?: string | null;
}

export function extractAnalyticsFromChatCompletion(completion: ChatCompletion): ReviewAnalytics {
  const scoreResult = extractArguments(completion, FunctionNames.Score);
  const moodResult = extractArguments(completion, FunctionNames.Mood);
  const summaryResult = extractArguments(completion, FunctionNames.Summarize);
  const spamResult = extractArguments(completion, FunctionNames.Spam);
  const explanationResult = extractArguments(completion, FunctionNames.Explanation);

  return {
    score: typeof scoreResult.score === 'number' ? scoreResult.score : 0,
    generalMood: isProductReviewMood(moodResult.generalMood) ? moodResult.generalMood : ProductReviewMood.UNKNOWN,
    productMood: isProductReviewMood(moodResult.productMood) ? moodResult.productMood : ProductReviewMood.UNKNOWN,
    priceMood: isProductReviewMood(moodResult.priceMood) ? moodResult.priceMood : ProductReviewMood.UNKNOWN,
    deliveryMood: isProductReviewMood(moodResult.deliveryMood) ? moodResult.deliveryMood : ProductReviewMood.UNKNOWN,
    summary: summaryResult.summary,
    spamFlagged: !!spamResult.spamFlagged,
    explanation: explanationResult.explanation,
  };
}

function isProductReviewMood(mood?: string | null): mood is ProductReviewMood {
  return Object.values(ProductReviewMood).includes(mood as ProductReviewMood);
}

function extractArguments(completion: ChatCompletion, functionName: string): DeepPartial<ReviewAnalytics> {
  const toolCall = completion.choices[0].message.tool_calls?.find((tc) => tc.function.name === functionName);
  if (!toolCall) return {};
  try {
    return JSON.parse(toolCall.function.arguments);
  } catch {
    console.error('Failed to parse tool function arguments.');
    return {};
  }
}
