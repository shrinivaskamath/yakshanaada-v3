// Web Audio engine replacing react-native-sound.
//
// - One shared AudioContext, resumed on the first user gesture (iOS Safari
//   requires audio to start from a user interaction).
// - Decoded buffers are cached so re-tapping a note is instant.
// - LoopPlayer drives the gapless drone/tanpura loops (a single decoded buffer
//   with `loop = true` has no seam, so we don't need the native two-copy trick).

let ctx: AudioContext | null = null;

export function getAudioContext(): AudioContext {
  if (!ctx) {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    ctx = new Ctor();
  }
  return ctx;
}

// Call from a click/tap handler before playing so iOS unlocks audio.
export async function resumeAudio(): Promise<void> {
  const c = getAudioContext();
  if (c.state === 'suspended') {
    try {
      await c.resume();
    } catch {
      // Ignore: some browsers resume implicitly on the first node start.
    }
  }
}

// Resolve a public asset path against the Vite base (e.g. /yakshanaada-v3/).
export function assetUrl(path: string): string {
  const base = import.meta.env.BASE_URL || '/';
  return base.replace(/\/$/, '') + '/' + path.replace(/^\//, '');
}

const bufferCache = new Map<string, AudioBuffer>();
const inFlight = new Map<string, Promise<AudioBuffer>>();

export async function loadBuffer(url: string): Promise<AudioBuffer> {
  const cached = bufferCache.get(url);
  if (cached) return cached;

  const pending = inFlight.get(url);
  if (pending) return pending;

  const promise = (async () => {
    const res = await fetch(url);
    const arrayBuffer = await res.arrayBuffer();
    const audioBuffer = await getAudioContext().decodeAudioData(arrayBuffer);
    bufferCache.set(url, audioBuffer);
    inFlight.delete(url);
    return audioBuffer;
  })();

  inFlight.set(url, promise);
  return promise;
}

// Continuous looping player for shruthi / tanpura.
export class LoopPlayer {
  private source: AudioBufferSourceNode | null = null;
  private gain: GainNode | null = null;
  private token = 0;

  constructor(private volume = 1) {}

  async play(url: string): Promise<void> {
    // Stop any current playback first, then claim a fresh token. (stop() bumps
    // the token, so the token must be captured AFTER stop, not before.)
    this.stop();
    const myToken = ++this.token;
    await resumeAudio();
    const buffer = await loadBuffer(url);
    // A newer play() was requested while this one was loading.
    if (myToken !== this.token) return;

    const c = getAudioContext();
    const gain = c.createGain();
    gain.gain.value = this.volume;
    gain.connect(c.destination);

    const source = c.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(gain);
    source.start(0);

    this.source = source;
    this.gain = gain;
  }

  setVolume(volume: number): void {
    this.volume = volume;
    if (this.gain) this.gain.gain.value = volume;
  }

  stop(): void {
    this.token++;
    if (this.source) {
      try {
        this.source.stop();
      } catch {
        // Already stopped.
      }
      this.source.disconnect();
      this.source = null;
    }
    if (this.gain) {
      this.gain.disconnect();
      this.gain = null;
    }
  }

  get isPlaying(): boolean {
    return this.source != null;
  }
}

// Plays a buffer once and resolves after `durationMs`, stopping it. Used for
// the Bhagavatha note sequence so each swara sounds for `tempo` milliseconds.
export function playForDuration(
  url: string,
  durationMs: number,
): { done: Promise<void>; cancel: () => void } {
  let cancelled = false;
  let source: AudioBufferSourceNode | null = null;
  let timer: ReturnType<typeof setTimeout> | null = null;

  const done = (async () => {
    await resumeAudio();
    const buffer = await loadBuffer(url);
    if (cancelled) return;
    const c = getAudioContext();
    source = c.createBufferSource();
    source.buffer = buffer;
    source.connect(c.destination);
    source.start(0);
    await new Promise<void>((resolve) => {
      timer = setTimeout(resolve, durationMs);
    });
    if (source) {
      try {
        source.stop();
      } catch {
        // Already finished.
      }
      source.disconnect();
      source = null;
    }
  })();

  const cancel = () => {
    cancelled = true;
    if (timer) clearTimeout(timer);
    if (source) {
      try {
        source.stop();
      } catch {
        // Already stopped.
      }
      source.disconnect();
      source = null;
    }
  };

  return { done, cancel };
}
