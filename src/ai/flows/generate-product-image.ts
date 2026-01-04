'use server';
/**
 * @fileOverview A flow for generating product images using AI.
 *
 * - generateProductImage - A function that generates an image based on product name and description.
 * - GenerateProductImageInput - The input type for the function.
 * - GenerateProductImageOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateProductImageInputSchema = z.object({
  name: z.string().describe('The name of the product.'),
  description: z.string().describe('A detailed description of the product.'),
});
export type GenerateProductImageInput = z.infer<typeof GenerateProductImageInputSchema>;

const GenerateProductImageOutputSchema = z.object({
  dataUri: z.string().describe('The generated image as a data URI.'),
});
export type GenerateProductImageOutput = z.infer<typeof GenerateProductImageOutputSchema>;

export async function generateProductImage(input: GenerateProductImageInput): Promise<GenerateProductImageOutput> {
  return generateProductImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateProductImagePrompt',
  input: { schema: GenerateProductImageInputSchema },
  prompt: `Generate a high-quality, photorealistic image of the following product for an e-commerce website. The image should be on a clean, white background.

Product Name: {{{name}}}
Description: {{{description}}}

The image should be visually appealing and accurately represent the product described.`,
});

const generateProductImageFlow = ai.defineFlow(
  {
    name: 'generateProductImageFlow',
    inputSchema: GenerateProductImageInputSchema,
    outputSchema: GenerateProductImageOutputSchema,
  },
  async (input) => {
    const { media } = await ai.generate({
      model: 'googleai/imagen-4.0-fast-generate-001',
      prompt: await prompt(input),
    });

    if (!media.url) {
      throw new Error('Image generation failed to return a media object.');
    }

    return { dataUri: media.url };
  }
);
