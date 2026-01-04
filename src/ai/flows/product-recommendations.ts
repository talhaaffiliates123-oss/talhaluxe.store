'use server';

/**
 * @fileOverview Product recommendation AI agent.
 *
 * - getProductRecommendations - A function that returns a list of recommended product ids.
 * - ProductRecommendationsInput - The input type for the getProductRecommendations function.
 * - ProductRecommendationsOutput - The return type for the getProductRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProductRecommendationsInputSchema = z.object({
  browsingHistory: z
    .array(z.string())
    .describe('An array of product IDs representing the user\'s browsing history.'),
  bestSellingProducts: z
    .array(z.string())
    .describe('An array of product IDs representing the best selling products.'),
  numberOfRecommendations: z
    .number()
    .default(3)
    .describe('The number of product recommendations to return.'),
});
export type ProductRecommendationsInput = z.infer<typeof ProductRecommendationsInputSchema>;

const ProductRecommendationsOutputSchema = z.object({
  productIds: z
    .array(z.string())
    .describe('An array of product IDs representing the recommended products.'),
});
export type ProductRecommendationsOutput = z.infer<typeof ProductRecommendationsOutputSchema>;

export async function getProductRecommendations(input: ProductRecommendationsInput): Promise<ProductRecommendationsOutput> {
  return productRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'productRecommendationsPrompt',
  input: {schema: ProductRecommendationsInputSchema},
  output: {schema: ProductRecommendationsOutputSchema},
  prompt: `You are an expert product recommendation engine for an e-commerce website.

  Based on the user's browsing history and the best selling products, you will recommend a list of products that the user might be interested in.

  User Browsing History: {{browsingHistory}}
  Best Selling Products: {{bestSellingProducts}}

  Return {{numberOfRecommendations}} product ids in the productIds field.`,
});

const productRecommendationsFlow = ai.defineFlow(
  {
    name: 'productRecommendationsFlow',
    inputSchema: ProductRecommendationsInputSchema,
    outputSchema: ProductRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
