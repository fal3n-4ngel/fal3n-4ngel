const WORDS_PER_MINUTE = 200;

/** Single source of truth for reading time — used by both the blog list and the article page so they never disagree. */
export function calculateReadingTime(text: string): number {
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE));
}
