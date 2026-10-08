type SoundName = "drop" | "win" | "draw" | "invalid" | "click" | "undo";

interface ToneOptions {
  freq: number;
  duration: number;
  type?: OscillatorType;
  gain?: number;
  delay?: number;
  slideTo?: number;
}

let audioContext: AudioContext | null = null;
let muted = false;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioContext) {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return null;
    audioContext = new Ctor();
  }
  if (audioContext.state === "suspended") void audioContext.resume();
  return audioContext;
}

function tone({
  freq,
  duration,
  type = "sine",
  gain = 0.15,
  delay = 0,
  slideTo,
}: ToneOptions): void {
  const audio = getContext();
  if (!audio) return;

  const start = audio.currentTime + delay;
  const oscillator = audio.createOscillator();
  const amp = audio.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(freq, start);
  if (slideTo)
    oscillator.frequency.exponentialRampToValueAtTime(
      slideTo,
      start + duration,
    );

  amp.gain.setValueAtTime(0.0001, start);
  amp.gain.exponentialRampToValueAtTime(gain, start + 0.01);
  amp.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  oscillator.connect(amp).connect(audio.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.05);
}

export function setMuted(value: boolean): void {
  muted = value;
}

export function playSound(name: SoundName): void {
  if (muted) return;

  switch (name) {
    case "drop":
      tone({ freq: 220, slideTo: 90, duration: 0.16, gain: 0.22 });
      tone({ freq: 1200, duration: 0.04, type: "triangle", gain: 0.05 });
      break;
    case "win":
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, index) =>
        tone({
          freq,
          duration: 0.35,
          type: "triangle",
          gain: 0.12,
          delay: index * 0.11,
        }),
      );
      break;
    case "draw":
      tone({ freq: 392, duration: 0.25, type: "triangle", gain: 0.1 });
      tone({
        freq: 329.63,
        duration: 0.4,
        type: "triangle",
        gain: 0.1,
        delay: 0.2,
      });
      break;
    case "invalid":
      tone({
        freq: 140,
        slideTo: 100,
        duration: 0.18,
        type: "square",
        gain: 0.05,
      });
      break;
    case "click":
      tone({ freq: 660, duration: 0.05, type: "triangle", gain: 0.06 });
      break;
    case "undo":
      tone({
        freq: 440,
        slideTo: 330,
        duration: 0.12,
        type: "triangle",
        gain: 0.08,
      });
      break;
  }
}
