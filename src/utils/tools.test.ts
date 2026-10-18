import test from 'node:test';
import assert from 'node:assert/strict';
import { countWords, countCharacters, estimateReadingTime, getRoleDailyLimit, isLimitReached } from './textMetrics.ts';
import { TOOLS, getToolBySlug } from '../lib/toolsConfig.ts';

test('countWords accurately calculates word count', () => {
  assert.equal(countWords(''), 0);
  assert.equal(countWords('   '), 0);
  assert.equal(countWords('Hello world'), 2);
  assert.equal(countWords('  The quick brown fox jumps   over  '), 6);
});

test('countCharacters calculates with and without spaces', () => {
  assert.equal(countCharacters('Hello'), 5);
  assert.equal(countCharacters('Hello World', true), 11);
  assert.equal(countCharacters('Hello World', false), 10);
});

test('estimateReadingTime handles different word lengths', () => {
  assert.equal(estimateReadingTime(0), '0 min read');
  assert.equal(estimateReadingTime(120), '1 min read');
  assert.equal(estimateReadingTime(450), '3 mins read');
});

test('daily limits reflect user roles accurately', () => {
  assert.equal(getRoleDailyLimit('guest'), 5);
  assert.equal(getRoleDailyLimit('user'), 20);
  assert.equal(getRoleDailyLimit('admin'), 9999);

  assert.equal(isLimitReached(4, 'guest'), false);
  assert.equal(isLimitReached(5, 'guest'), true);
  assert.equal(isLimitReached(19, 'user'), false);
  assert.equal(isLimitReached(20, 'user'), true);
});

test('tools configuration contains all 10 tools', () => {
  assert.equal(TOOLS.length, 10);
  const articleWriter = getToolBySlug('article-writer');
  assert.ok(articleWriter);
  assert.equal(articleWriter?.name, 'Article Writer');
  assert.equal(articleWriter?.supportsHighThinking, true);

  const summarizer = getToolBySlug('summarizer');
  assert.ok(summarizer);
  assert.equal(summarizer?.category, 'editing');

  const translator = getToolBySlug('translator');
  assert.ok(translator);
  assert.equal(translator?.languageSelectorEnabled, true);

  const unknown = getToolBySlug('non-existent');
  assert.equal(unknown, undefined);
});

test('all 10 tools match exact Section 13 system prompts', () => {
  const prompts: Record<string, string> = {
    'article-writer': 'You are an expert article writer. Write a well-structured, SEO-friendly article with title, intro, body, and conclusion based on the user\'s topic.',
    'paraphraser': 'You are a professional paraphraser. Rewrite the user\'s text in fresh words while keeping the original meaning. Do not add new information.',
    'summarizer': 'You are a summarization expert. Summarize the user\'s text into 3-5 concise bullet points capturing the key ideas.',
    'grammar-checker': 'You are a grammar expert. Fix all grammar, spelling, and punctuation errors in the user\'s text. Return only the corrected text.',
    'email-writer': 'You are a professional email writer. Write a clear, polite, and professional email based on the user\'s description.',
    'caption-writer': 'You are a social media expert. Write 3 engaging Instagram/Facebook captions with relevant emojis and hashtags for the user\'s topic.',
    'product-description': 'You are an e-commerce copywriter. Write a compelling product description with features and benefits based on the user\'s input.',
    'story-writer': 'You are a creative writer. Write a short, engaging story with a beginning, middle, and end based on the user\'s idea.',
    'translator': 'You are a professional translator. Translate the user\'s text accurately. If the text is in English, translate to Urdu. If in Urdu, translate to English. If another language is specified, translate accordingly.',
    'seo-meta-writer': 'You are an SEO expert. Write an SEO-optimized meta title (under 60 chars) and meta description (under 160 chars) for the user\'s topic.',
  };

  for (const [slug, prompt] of Object.entries(prompts)) {
    const t = getToolBySlug(slug);
    assert.ok(t, `Tool ${slug} exists`);
    assert.equal(t?.systemPrompt, prompt, `System prompt matches reference for ${slug}`);
  }
});

