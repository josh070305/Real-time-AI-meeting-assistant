import { useCallback, useEffect, useRef, useState } from 'react';
import useMeetingStore from '../store/useMeetingStore';

export function useSpeechRecognition(onTranscriptChunk) {
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef(null);
  const listeningRef = useRef(false);

  const appendTranscript = useMeetingStore((state) => state.appendTranscript);
  const setInterimText = useMeetingStore((state) => state.setInterimText);
  const setIsListening = useMeetingStore((state) => state.setIsListening);
  const setError = useMeetingStore((state) => state.setError);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) {
      setSupported(false);
      setError('Speech recognition is not supported in this browser. Please use Chrome for the live transcription experience.');
      return;
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let interim = '';
      let finalText = '';

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        const transcriptText = result[0].transcript.trim();

        if (result.isFinal) {
          finalText += `${transcriptText} `;
        } else {
          interim += `${transcriptText} `;
        }
      }

      if (finalText) {
        const text = finalText.trim();
        const entry = {
          id: Date.now().toString(),
          text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          speaker: 'You',
        };
        appendTranscript(entry);
        onTranscriptChunk?.(text);
      }

      if (interim) {
        setInterimText(interim.trim());
      }
    };

    recognition.onerror = (event) => {
      setError(`Speech error: ${event.error}`);
      listeningRef.current = false;
      setIsListening(false);
    };

    recognition.onend = () => {
      if (listeningRef.current) {
        recognition.start();
      }
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, [appendTranscript, onTranscriptChunk, setError, setInterimText, setIsListening]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      setError('Speech recognition is not available in this browser.');
      return;
    }

    listeningRef.current = true;
    setIsListening(true);
    setError('');
    recognitionRef.current.start();
  }, [setError, setIsListening]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) {
      return;
    }

    listeningRef.current = false;
    setIsListening(false);
    setInterimText('');
    recognitionRef.current.stop();
  }, [setInterimText, setIsListening]);

  return { supported, startListening, stopListening };
}
