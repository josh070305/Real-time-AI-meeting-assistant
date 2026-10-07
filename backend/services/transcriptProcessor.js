export function buildTranscriptBufferKey(socketId) {
  return socketId;
}

export function appendToBuffer(buffer, text) {
  const cleanText = typeof text === 'string' ? text.trim() : '';
  if (!cleanText) {
    return typeof buffer === 'string' ? buffer.trim() : '';
  }

  const cleanBuffer = typeof buffer === 'string' ? buffer.trim() : '';
  if (!cleanBuffer) {
    return cleanText;
  }

  return `${cleanBuffer}\n${cleanText}`;
}
