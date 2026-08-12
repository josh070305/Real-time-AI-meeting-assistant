export function buildTranscriptBufferKey(socketId) {
  return socketId;
}

export function appendToBuffer(buffer, text) {
  if (!text) {
    return buffer;
  }

  if (!buffer) {
    return text;
  }

  return `${buffer}\n${text}`.trim();
}
