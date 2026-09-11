/**
 * Small, purposeful UI sounds. AudioContext must be unlocked by a user
 * gesture (the splash "ENTER PORTFOLIO" button calls unlockAudio()) before
 * any of these will actually produce sound in most browsers.
 */
let actx: AudioContext | null = null;

function ac(): AudioContext {
  if (!actx)
    actx = new (
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext
    )();
  return actx;
}

export function unlockAudio() {
  try {
    void ac().resume();
  } catch {
    /* audio unavailable — sounds are decorative, never required */
  }
}

function tone(f: number, d: number, delay: number, type: OscillatorType, v: number) {
  try {
    const a = ac();
    const t = a.currentTime + delay;
    const o = a.createOscillator();
    const g = a.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f, t);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(v, t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d + 0.02);
    o.connect(g);
    g.connect(a.destination);
    o.start(t);
    o.stop(t + d + 0.02);
  } catch {
    /* audio unavailable — sounds are decorative, never required */
  }
}

export const sClick = () => tone(880, 0.035, 0, "triangle", 0.035);
export const sOpen = () => {
  tone(660, 0.06, 0, "triangle", 0.04);
  tone(990, 0.06, 0.05, "triangle", 0.04);
};
export const sBoot = () =>
  [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.16, i * 0.07, "triangle", 0.05));
export const sKey = () => tone(1500 + Math.random() * 300, 0.012, 0, "square", 0.022);
export const sAlert = () => {
  tone(880, 0.09, 0, "square", 0.045);
  tone(660, 0.09, 0.11, "square", 0.045);
};
// A cheerful, quiet two-note chime a fifth apart — for the desktop-pet boop.
export const sBoop = () => {
  tone(660, 0.08, 0, "triangle", 0.04);
  tone(990, 0.08, 0.07, "triangle", 0.04);
};
export const playTone = tone;
