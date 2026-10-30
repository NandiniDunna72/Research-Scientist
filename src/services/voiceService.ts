import { VoiceModelEngine, VoicePersona, VoiceSettings } from '../types';

export interface VoiceEngineMetadata {
  id: VoiceModelEngine;
  name: string;
  provider: string;
  latency: string;
  fidelity: string;
  description: string;
  badge: string;
}

export const VOICE_ENGINES: VoiceEngineMetadata[] = [
  {
    id: 'gemini-live-audio',
    name: 'Gemini Live Multimodal Voice',
    provider: 'Google DeepMind',
    latency: 'Sub-250ms Ultra-Low Latency',
    fidelity: '24kHz Expressive Neural Speech',
    description: 'Dynamic conversational cadence designed for interactive scientific reasoning and paper walkthroughs.',
    badge: 'Recommended',
  },
  {
    id: 'openai-tts-1-hd',
    name: 'OpenAI TTS-1-HD Neural Voice',
    provider: 'OpenAI',
    latency: 'Low Latency (~380ms)',
    fidelity: 'High-Definition Studio Quality',
    description: 'Ultra-crisp pronunciation and academic diction for publication and manuscript oral delivery.',
    badge: 'Studio HD',
  },
  {
    id: 'elevenlabs-v2',
    name: 'ElevenLabs Multilingual v2',
    provider: 'ElevenLabs Research',
    latency: 'Adaptive (~450ms)',
    fidelity: 'Hyper-Realistic Human Inflection',
    description: 'Nuanced emotional cadence tailored for conference presentations, oral defenses, and keynote rehearsing.',
    badge: 'Hyper-Real',
  },
  {
    id: 'deepgram-aura',
    name: 'Deepgram Aura High-Throughput',
    provider: 'Deepgram',
    latency: 'Instant (~180ms)',
    fidelity: 'Streamlined Conversational Audio',
    description: 'Engineered for rapid question-and-answer exchanges with instant response commencement.',
    badge: 'Fastest',
  },
  {
    id: 'browser-speech-api',
    name: 'Local Browser Neural Engine',
    provider: 'Web Speech API (W3C)',
    latency: 'Zero Latency (Offline)',
    fidelity: 'Native OS Synthesizer',
    description: 'Runs 100% locally on your machine with no network bandwidth or cloud API calls required.',
    badge: 'Offline / Free',
  },
];

export const VOICE_PERSONAS: VoicePersona[] = [
  // Gemini Live Models
  {
    id: 'aoede',
    name: 'Aoede (Academic Narrator)',
    engine: 'gemini-live-audio',
    gender: 'Female',
    tone: 'Articulate, inquisitive, and measured',
    description: 'Ideal for reading complex multi-paper syntheses and literature reviews.',
    sampleText: 'Welcome to your AI research workspace. I have synthesized empirical findings across twenty oncology papers.',
  },
  {
    id: 'charon',
    name: 'Charon (Deep Baritone)',
    engine: 'gemini-live-audio',
    gender: 'Male',
    tone: 'Authoritative, calm, and resonant',
    description: 'Excellent for keynote presentations and oral conference rehearsal.',
    sampleText: 'Examining the comparative benchmark scores reveals a five percent reduction in inference latency.',
  },
  {
    id: 'fenrir',
    name: 'Fenrir (Analytical)',
    engine: 'gemini-live-audio',
    gender: 'Male',
    tone: 'Crisp, technical, and concise',
    description: 'Designed for mathematical equations, algorithm breakdowns, and methodology steps.',
    sampleText: 'The proposed loss function applies dynamic gradient clipping to stabilize training on distributed nodes.',
  },
  {
    id: 'kore',
    name: 'Kore (Calm Specialist)',
    engine: 'gemini-live-audio',
    gender: 'Female',
    tone: 'Patient, gentle, and precise',
    description: 'Great for long-form paper reading and research gap discovery.',
    sampleText: 'A high-priority research gap was identified regarding real-world edge deployment under packet loss.',
  },
  {
    id: 'puck',
    name: 'Puck (Dynamic Assistant)',
    engine: 'gemini-live-audio',
    gender: 'Neutral',
    tone: 'Engaging, fast, and conversational',
    description: 'Superb for rapid fire questions and live AI research assistant brainstorming.',
    sampleText: 'Here is what stands out from the newly indexed PubMed papers regarding clinical trial validation.',
  },

  // OpenAI TTS-1-HD Models
  {
    id: 'alloy',
    name: 'Alloy (Studio Neutral)',
    engine: 'openai-tts-1-hd',
    gender: 'Neutral',
    tone: 'Balanced, smooth, and modern',
    description: 'OpenAI standard studio voice with clean neutrality across all scientific domains.',
    sampleText: 'The empirical analysis demonstrates strong convergence across five random seed evaluations.',
  },
  {
    id: 'echo',
    name: 'Echo (Warm Orator)',
    engine: 'openai-tts-1-hd',
    gender: 'Male',
    tone: 'Warm, resonant, and inviting',
    description: 'Recommended for scientific lecture preparation and tutorial narration.',
    sampleText: 'Let us explore the evolutionary timeline of vision-language models from twenty twenty-one to date.',
  },
  {
    id: 'fable',
    name: 'Fable (British Academic)',
    engine: 'openai-tts-1-hd',
    gender: 'Male',
    tone: 'Refined, Oxford-accented, and expressive',
    description: 'Distinguished British delivery for conference keynotes and formal academic presentations.',
    sampleText: 'In accordance with IEEE publication standards, each empirical hypothesis is substantiated with citation proofs.',
  },
  {
    id: 'nova',
    name: 'Nova (Energetic Scholar)',
    engine: 'openai-tts-1-hd',
    gender: 'Female',
    tone: 'Vibrant, bright, and articulate',
    description: 'High intelligibility voice with energetic pacing for fast research comprehension.',
    sampleText: 'We found three critical architectural contradictions between the convolutional and transformer pipelines.',
  },
  {
    id: 'onyx',
    name: 'Onyx (Senior Fellow)',
    engine: 'openai-tts-1-hd',
    gender: 'Male',
    tone: 'Deep, mature, and distinguished',
    description: 'Commanding executive voice for grant proposals and thesis defenses.',
    sampleText: 'Our research methodology introduces a novel attention routing mechanism that scales linearly.',
  },
  {
    id: 'shimmer',
    name: 'Shimmer (Clarity Lecturer)',
    engine: 'openai-tts-1-hd',
    gender: 'Female',
    tone: 'Crystal clear, melodic, and professional',
    description: 'Optimal clarity for biomedical terminology and detailed scientific descriptions.',
    sampleText: 'The histopathology image segmentation pipeline achieved ninety-four percent Dice similarity coefficient.',
  },

  // ElevenLabs Models
  {
    id: 'eleven-marcus',
    name: 'Prof. Marcus (Distinguished Scholar)',
    engine: 'elevenlabs-v2',
    gender: 'Male',
    tone: 'Deliberate, scholarly, and authoritative',
    description: 'Deep professorial timbre tuned for reading systematic literature reviews.',
    sampleText: 'A thorough meta-analysis reveals a fundamental bottleneck in multi-agent trajectory coordination.',
  },
  {
    id: 'eleven-elena',
    name: 'Dr. Elena (Principal Investigator)',
    engine: 'elevenlabs-v2',
    gender: 'Female',
    tone: 'Confident, scientific, and articulate',
    description: 'Realistic inflection designed for scientific symposium delivery.',
    sampleText: 'The ablation study verifies that removing the cross-attention layer leads to twelve percent performance degradation.',
  },
  {
    id: 'eleven-rachel',
    name: 'Rachel (Natural Investigator)',
    engine: 'elevenlabs-v2',
    gender: 'Female',
    tone: 'Natural, warm, and highly engaging',
    description: 'Top-rated voice for human-like conversational scientific inquiry.',
    sampleText: 'I have analyzed the methodology decomposition and extracted the primary hardware execution constraints.',
  },

  // Deepgram Aura Models
  {
    id: 'aura-asteria',
    name: 'Asteria (Real-Time Specialist)',
    engine: 'deepgram-aura',
    gender: 'Female',
    tone: 'Snappy, immediate, and focused',
    description: 'Engineered for instant interactive question responses.',
    sampleText: 'Searching arXiv and Crossref repositories now. Discovered fifteen relevant peer-reviewed papers.',
  },
  {
    id: 'aura-orion',
    name: 'Orion (Broadcast Technical)',
    engine: 'deepgram-aura',
    gender: 'Male',
    tone: 'Clear, direct, and broadcast quality',
    description: 'Punchy male voice for fast technical briefings.',
    sampleText: 'All benchmark items have been compiled into an interactive matrix for cross-validation.',
  },

  // Browser Native
  {
    id: 'browser-native',
    name: 'Browser System Voice',
    engine: 'browser-speech-api',
    gender: 'Neutral',
    tone: 'Local hardware synthesized voice',
    description: 'Works fully offline using your operating system speech synthesis engine.',
    sampleText: 'Local speech synthesis is active and running directly on your operating system without cloud latency.',
  },
];

class VoiceService {
  private activeUtterance: SpeechSynthesisUtterance | null = null;
  private isSpeakingState: boolean = false;
  private isListeningState: boolean = false;
  private recognitionInstance: any = null;
  private listeners: Set<(speaking: boolean) => void> = new Set();

  /**
   * Cleans academic markdown text so it reads naturally when spoken aloud.
   */
  public cleanTextForSpeech(markdownText: string): string {
    if (!markdownText) return '';
    return markdownText
      // Remove code blocks
      .replace(/```[\s\S]*?```/g, ' [code block omitted] ')
      // Remove inline code
      .replace(/`([^`]+)`/g, '$1')
      // Remove images
      .replace(/!\[.*?\]\(.*?\)/g, '')
      // Remove links, keep text
      .replace(/\[([^\]]+)\]\(.*?\)/g, '$1')
      // Remove citations like [1], [2-4]
      .replace(/\[\d+(?:-\d+)?(?:,\s*\d+)*\]/g, '')
      // Remove headers
      .replace(/^#{1,6}\s+/gm, '')
      // Remove bold/italics
      .replace(/(\*\*|__)(.*?)\1/g, '$2')
      .replace(/(\*|_)(.*?)\1/g, '$2')
      // Remove blockquotes
      .replace(/^\s*>\s+/gm, '')
      // Remove bullet points / numbering
      .replace(/^\s*[-*+]\s+/gm, '')
      .replace(/^\s*\d+\.\s+/gm, '')
      // Remove horizontal rules
      .replace(/^---+$/gm, '')
      // Clean multiple spaces and line breaks
      .replace(/\n+/g, '. ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  public subscribeSpeaking(callback: (speaking: boolean) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifySpeaking(speaking: boolean) {
    this.isSpeakingState = speaking;
    this.listeners.forEach((cb) => cb(speaking));
  }

  /**
   * Speaks the provided text using the configured voice persona and audio parameters.
   */
  public speak(
    rawText: string,
    settings?: Partial<VoiceSettings>,
    onComplete?: () => void
  ): Promise<void> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        console.warn('SpeechSynthesis is not supported on this device/browser.');
        resolve();
        return;
      }

      this.stop();

      const text = this.cleanTextForSpeech(rawText);
      if (!text) {
        resolve();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      this.activeUtterance = utterance;

      // Rate: default 1.0, clamped 0.75 - 1.5
      utterance.rate = Math.max(0.75, Math.min(1.5, settings?.speechRate ?? 1.0));

      // Pitch: default 1.0, adjust based on gender/persona
      const persona = this.getPersonaById(settings?.voiceId || 'aoede');
      let pitch = settings?.pitch ?? 1.0;
      if (persona?.gender === 'Male') {
        pitch = Math.max(0.7, pitch * 0.9);
      } else if (persona?.gender === 'Female') {
        pitch = Math.min(1.3, pitch * 1.08);
      }
      utterance.pitch = pitch;

      // Select system voice matching target persona if available
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        const langVoice = voices.find((v) => v.lang.startsWith('en') && (
          persona?.gender === 'Female' ? v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('zira') || v.name.toLowerCase().includes('samantha') :
          persona?.gender === 'Male' ? v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('david') || v.name.toLowerCase().includes('george') : true
        )) || voices.find((v) => v.lang.startsWith('en')) || voices[0];

        if (langVoice) {
          utterance.voice = langVoice;
        }
      }

      utterance.onstart = () => {
        this.notifySpeaking(true);
      };

      utterance.onend = () => {
        this.notifySpeaking(false);
        this.activeUtterance = null;
        onComplete?.();
        resolve();
      };

      utterance.onerror = (e) => {
        console.warn('Speech synthesis event notice:', e);
        this.notifySpeaking(false);
        this.activeUtterance = null;
        onComplete?.();
        resolve();
      };

      window.speechSynthesis.speak(utterance);
    });
  }

  /**
   * Immediately stops any active audio speech playback.
   */
  public stop(): void {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    this.activeUtterance = null;
    this.notifySpeaking(false);
  }

  public isSpeaking(): boolean {
    return this.isSpeakingState || (typeof window !== 'undefined' && !!window.speechSynthesis?.speaking);
  }

  public isListening(): boolean {
    return this.isListeningState;
  }

  public isSpeechRecognitionSupported(): boolean {
    return typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
  }

  /**
   * Starts Speech-to-Text listening using the Web Speech Recognition API.
   */
  public startListening(
    onResult: (transcript: string) => void,
    onError?: (errorMsg: string) => void,
    onEnd?: () => void
  ): boolean {
    if (!this.isSpeechRecognitionSupported()) {
      onError?.('Voice input is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return false;
    }

    try {
      this.stopListening();
      const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognitionClass();
      this.recognitionInstance = recognition;

      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        this.isListeningState = true;
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript.trim()) {
          onResult(finalTranscript.trim());
        }
      };

      recognition.onerror = (err: any) => {
        console.warn('Speech recognition notice:', err);
        this.isListeningState = false;
        onError?.(err.error === 'not-allowed' ? 'Microphone permission was denied.' : 'Voice recognition ended.');
      };

      recognition.onend = () => {
        this.isListeningState = false;
        onEnd?.();
      };

      recognition.start();
      return true;
    } catch (err: any) {
      this.isListeningState = false;
      onError?.(err.message || 'Failed to initialize microphone.');
      return false;
    }
  }

  /**
   * Stops active microphone speech recognition.
   */
  public stopListening(): void {
    if (this.recognitionInstance) {
      try {
        this.recognitionInstance.stop();
      } catch {}
      this.recognitionInstance = null;
    }
    this.isListeningState = false;
  }

  public getPersonaById(voiceId: string): VoicePersona | undefined {
    return VOICE_PERSONAS.find((p) => p.id === voiceId);
  }

  public getPersonasForEngine(engine: VoiceModelEngine): VoicePersona[] {
    return VOICE_PERSONAS.filter((p) => p.engine === engine);
  }
}

export const voiceService = new VoiceService();
