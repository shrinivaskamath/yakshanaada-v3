import Pitchfinder from 'pitchfinder';

// Microphone pitch detection for the web, replacing react-native-recording.
// Mirrors the math in components/tuner/tuner.js but feeds PCM from a
// getUserMedia stream into pitchfinder's YIN detector.

export interface DetectedNote {
  name: string;
  value: number;
  cents: number;
  octave: number;
  frequency: number;
}

const NOTE_STRINGS = [
  'C',
  'C♯',
  'D',
  'D♯',
  'E',
  'F',
  'F♯',
  'G',
  'G♯',
  'A',
  'A♯',
  'B',
];

export class WebTuner {
  middleA = 440;
  semitone = 69;
  onNoteDetected?: (note: DetectedNote) => void;

  private ctx: AudioContext | null = null;
  private stream: MediaStream | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private processor: ScriptProcessorNode | null = null;
  private detectPitch: ((buf: Float32Array) => number | null) | null = null;

  async start(): Promise<void> {
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        autoGainControl: false,
        noiseSuppression: false,
      },
      video: false,
    });

    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const ctx = new Ctor();
    this.ctx = ctx;
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    this.detectPitch = Pitchfinder.YIN({ sampleRate: ctx.sampleRate });

    this.source = ctx.createMediaStreamSource(this.stream);
    const bufferSize = 2048;
    const processor = ctx.createScriptProcessor(bufferSize, 1, 1);
    processor.onaudioprocess = (e: AudioProcessingEvent) => {
      if (!this.detectPitch) return;
      const input = e.inputBuffer.getChannelData(0);
      const frequency = this.detectPitch(input);
      if (frequency && this.onNoteDetected) {
        const noteValue = this.getNote(frequency);
        this.onNoteDetected({
          name: NOTE_STRINGS[((noteValue % 12) + 12) % 12],
          value: noteValue,
          cents: this.getCents(frequency, noteValue),
          octave: Math.floor(noteValue / 12) - 1,
          frequency,
        });
      }
    };

    // Route through a muted gain so the ScriptProcessor keeps firing without
    // playing the mic back through the speakers (which would cause feedback).
    const mute = ctx.createGain();
    mute.gain.value = 0;
    this.source.connect(processor);
    processor.connect(mute);
    mute.connect(ctx.destination);
    this.processor = processor;
  }

  stop(): void {
    if (this.processor) {
      this.processor.onaudioprocess = null;
      this.processor.disconnect();
      this.processor = null;
    }
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach((t) => t.stop());
      this.stream = null;
    }
    if (this.ctx) {
      this.ctx.close().catch(() => {});
      this.ctx = null;
    }
    this.detectPitch = null;
  }

  getNote(frequency: number): number {
    const note = 12 * (Math.log(frequency / this.middleA) / Math.log(2));
    return Math.round(note) + this.semitone;
  }

  getStandardFrequency(note: number): number {
    return this.middleA * Math.pow(2, (note - this.semitone) / 12);
  }

  getCents(frequency: number, note: number): number {
    return Math.floor(
      (1200 * Math.log(frequency / this.getStandardFrequency(note))) /
        Math.log(2),
    );
  }
}
