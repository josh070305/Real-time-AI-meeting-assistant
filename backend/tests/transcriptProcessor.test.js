import { describe, it, expect } from 'vitest';
import {
  appendToBuffer,
  buildTranscriptBufferKey,
} from '../services/transcriptProcessor.js';

describe('buildTranscriptBufferKey', () => {
  it('returns the socketId unchanged', () => {
    expect(buildTranscriptBufferKey('abc123')).toBe('abc123');
  });

  it('returns an empty string when socketId is empty', () => {
    expect(buildTranscriptBufferKey('')).toBe('');
  });
});

describe('appendToBuffer', () => {
  it('returns the text when buffer is empty', () => {
    expect(appendToBuffer('', 'Hello world')).toBe('Hello world');
  });

  it('returns the text when buffer is null/undefined', () => {
    expect(appendToBuffer(null, 'Hello')).toBe('Hello');
    expect(appendToBuffer(undefined, 'Hello')).toBe('Hello');
  });

  it('returns the buffer when text is falsy', () => {
    expect(appendToBuffer('existing', '')).toBe('existing');
    expect(appendToBuffer('existing', null)).toBe('existing');
    expect(appendToBuffer('existing', undefined)).toBe('existing');
  });

  it('appends text with a newline separator', () => {
    expect(appendToBuffer('First sentence', 'Second sentence')).toBe(
      'First sentence\nSecond sentence'
    );
  });

  it('trims leading and trailing whitespace from the result', () => {
    expect(appendToBuffer('  hello  ', '  world  ')).toBe('hello\nworld');
  });

  it('handles multi-line existing buffers correctly', () => {
    const buffer = appendToBuffer('line one', 'line two');
    const result = appendToBuffer(buffer, 'line three');
    expect(result).toBe('line one\nline two\nline three');
  });
});
