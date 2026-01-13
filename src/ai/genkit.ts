/**
 * @fileoverview This file initializes and configures the Genkit AI platform.
 *
 * It sets up the necessary plugins, particularly the Google AI plugin for Gemini,
 * and exports a singleton `ai` object to be used throughout the application
 * for defining and running AI flows, prompts, and other generative tasks.
 */
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

// Initialize Genkit with the Google AI plugin.
// The plugin will automatically use the GEMINI_API_KEY from your .env.local file.
export const ai = genkit({
  plugins: [
    googleAI(),
  ],
});
