let ctx: AudioContext | null = null;

function tone(
  freq: number,
  dur: number,
  type: OscillatorType = "sine",
  vol = 0.08,
  delay = 0,
) {
  ctx ??= new AudioContext();
  const t = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(vol, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + dur);
}

export const sfx = {
  drop(muted: boolean) {
    if (!muted) tone(320, 0.12, "triangle");
  },
  error(muted: boolean) {
    if (!muted) tone(120, 0.2, "sawtooth", 0.05);
  },
  win(muted: boolean) {
    if (!muted)
      [523, 659, 784, 1047].forEach((f, i) =>
        tone(f, 0.28, "sine", 0.08, i * 0.11),
      );
  },
};
