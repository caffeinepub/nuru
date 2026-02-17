/**
 * Helper utilities for rendering learning content with target-language-first approach.
 * Provides safe fallbacks when optional fields are missing.
 */

import type { CultureContent } from '../backend';

/**
 * Get the primary display text for culture content, preferring target language.
 */
export function getCultureDisplayText(entry: CultureContent): string {
  return entry.languageText || entry.content || '';
}

/**
 * Get the secondary/translated text for culture content if available.
 */
export function getCultureTranslation(entry: CultureContent): string | null {
  return entry.translatedText || null;
}

/**
 * Get a preview snippet from culture content (first 150 chars).
 */
export function getCulturePreview(entry: CultureContent): string {
  const text = getCultureDisplayText(entry);
  if (text.length <= 150) return text;
  return text.substring(0, 150) + '...';
}

/**
 * Safely extract dialogue step fields with fallbacks.
 */
export function getStepPrompt(step: { prompt?: string; expectedResponse?: string }): string {
  return step.prompt || '';
}

export function getStepResponse(step: { prompt?: string; expectedResponse?: string }): string {
  return step.expectedResponse || '';
}
