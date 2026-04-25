"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface UseDexVoiceOptions {
  /** Called with the final recognised transcript when listening stops */
  onTranscript: (text: string) => void;
  /** Language for speech recognition (default: en-US) */
  lang?: string;
}

interface UseDexVoiceReturn {
  isListening:     boolean;
  isSpeaking:      boolean;
  isSupported:     boolean;
  startListening:  () => void;
  stopListening:   () => void;
  speak:           (text: string) => void;
  stopSpeaking:    () => void;
}

// ─── Strip markdown from text before speaking ────────────────────────────────

function cleanForSpeech(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "$1")   // bold
    .replace(/\*(.*?)\*/g, "$1")        // italic
    .replace(/`(.*?)`/g, "$1")          // inline code
    .replace(/#+\s/g, "")               // headings
    .replace(/\n+/g, " ")               // newlines
    .replace(/\s{2,}/g, " ")            // extra spaces
    .trim();
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useDexVoice({
  onTranscript,
  lang = "en-US",
}: UseDexVoiceOptions): UseDexVoiceReturn {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking,  setIsSpeaking]  = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  const recognitionRef    = useRef<any>(null);
  const onTranscriptRef   = useRef(onTranscript);
  const speakPollerRef    = useRef<ReturnType<typeof setInterval> | null>(null);

  // Keep transcript callback current without re-creating listeners
  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  // Detect browser support
  useEffect(() => {
    const hasSpeechRec = !!(
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition
    );
    const hasTTS = !!window.speechSynthesis;
    setIsSupported(hasSpeechRec && hasTTS);
  }, []);

  // ── Start listening ─────────────────────────────────────────────────────────
  const startListening = useCallback(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    // Stop any current TTS before listening
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);

    const recognition = new SpeechRecognition();
    recognition.continuous    = false;
    recognition.interimResults = false;
    recognition.lang           = lang;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript || "";
      if (transcript.trim()) {
        onTranscriptRef.current(transcript.trim());
      }
    };

    recognition.onend   = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  }, [lang]);

  // ── Stop listening ──────────────────────────────────────────────────────────
  const stopListening = useCallback(() => {
    try {
      recognitionRef.current?.stop();
    } catch {
      // already stopped
    }
    setIsListening(false);
  }, []);

  // ── Speak ───────────────────────────────────────────────────────────────────
  const speak = useCallback((text: string) => {
    if (!window.speechSynthesis) return;

    // Cancel anything currently speaking
    window.speechSynthesis.cancel();

    const cleanText  = cleanForSpeech(text);
    if (!cleanText) return;

    const utterance  = new SpeechSynthesisUtterance(cleanText);
    utterance.rate   = 0.93;
    utterance.pitch  = 0.98;
    utterance.volume = 1.0;

    // Prefer a natural English voice
    const loadVoice = () => {
      const voices  = window.speechSynthesis.getVoices();
      const voice   =
        voices.find(v => v.name === "Samantha") ||           // macOS
        voices.find(v => v.name === "Daniel")   ||           // macOS UK
        voices.find(v => v.name.includes("Google") && v.lang === "en-US") ||
        voices.find(v => v.lang === "en-US")    ||
        voices[0];
      if (voice) utterance.voice = voice;
    };

    // Voices may not be loaded synchronously on first call
    if (window.speechSynthesis.getVoices().length > 0) {
      loadVoice();
    } else {
      window.speechSynthesis.onvoiceschanged = loadVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend   = () => {
      setIsSpeaking(false);
      if (speakPollerRef.current) {
        clearInterval(speakPollerRef.current);
        speakPollerRef.current = null;
      }
    };
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);

    // Safari sometimes doesn't fire onend — poll as fallback
    speakPollerRef.current = setInterval(() => {
      if (!window.speechSynthesis.speaking) {
        setIsSpeaking(false);
        if (speakPollerRef.current) {
          clearInterval(speakPollerRef.current);
          speakPollerRef.current = null;
        }
      }
    }, 500);
  }, []);

  // ── Stop speaking ───────────────────────────────────────────────────────────
  const stopSpeaking = useCallback(() => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
    if (speakPollerRef.current) {
      clearInterval(speakPollerRef.current);
      speakPollerRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      try { recognitionRef.current?.stop(); } catch { /* ok */ }
      window.speechSynthesis?.cancel();
      if (speakPollerRef.current) clearInterval(speakPollerRef.current);
    };
  }, []);

  return {
    isListening,
    isSpeaking,
    isSupported,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
  };
}
