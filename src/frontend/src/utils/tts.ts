// Language ID to BCP-47 language code mapping
const LANGUAGE_CODE_MAP: Record<number, string> = {
  1: 'ar', // Arabic
  2: 'sw', // Swahili
  3: 'ha', // Hausa
  4: 'am', // Amharic
  5: 'yo', // Yoruba
  6: 'zu', // Zulu
};

// Language ID to BCP-47 language code mapping for speech recognition (with region codes)
const SPEECH_RECOGNITION_CODE_MAP: Record<number, string> = {
  1: 'ar-SA', // Arabic (Saudi Arabia)
  2: 'sw-KE', // Swahili (Kenya)
  3: 'ha-NG', // Hausa (Nigeria)
  4: 'am-ET', // Amharic (Ethiopia)
  5: 'yo-NG', // Yoruba (Nigeria)
  6: 'zu-ZA', // Zulu (South Africa)
};

/**
 * Get the language code for speech recognition based on language ID
 */
export function getLanguageCodeForSpeech(languageId: bigint): string {
  const id = Number(languageId);
  return SPEECH_RECOGNITION_CODE_MAP[id] || 'en-US';
}

/**
 * Get the best available voice for a given language ID
 */
export function getVoiceForLanguage(languageId: number): SpeechSynthesisVoice | null {
  if (!('speechSynthesis' in window)) {
    return null;
  }

  const voices = speechSynthesis.getVoices();
  const langCode = LANGUAGE_CODE_MAP[languageId];

  if (!langCode) {
    return null;
  }

  // Try to find a voice that matches the language code
  const matchingVoice = voices.find(v => v.lang.startsWith(langCode));
  
  return matchingVoice || null;
}

/**
 * Speak text using the browser's text-to-speech API
 */
export function speak(
  text: string,
  languageId: number,
  onStart?: () => void,
  onEnd?: () => void,
  onError?: (error: string) => void
): void {
  if (!('speechSynthesis' in window)) {
    onError?.('Text-to-speech not supported in your browser');
    return;
  }

  // Cancel any ongoing speech
  speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  
  // Try to set the appropriate voice
  const voice = getVoiceForLanguage(languageId);
  if (voice) {
    utterance.voice = voice;
  }

  utterance.onstart = () => onStart?.();
  utterance.onend = () => onEnd?.();
  utterance.onerror = () => {
    onEnd?.();
    onError?.('Text-to-speech playback failed');
  };

  speechSynthesis.speak(utterance);
}

/**
 * Load voices (some browsers require this to be called after page load)
 */
export function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) {
      resolve([]);
      return;
    }

    const voices = speechSynthesis.getVoices();
    if (voices.length > 0) {
      resolve(voices);
      return;
    }

    speechSynthesis.onvoiceschanged = () => {
      resolve(speechSynthesis.getVoices());
    };
  });
}
